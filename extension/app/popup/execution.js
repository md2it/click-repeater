
function syncPopupHeight() {
  const minHeightPx = parseFloat(window.getComputedStyle(document.body).minHeight) || 0;
  const popupHeight = refs.popup ? refs.popup.scrollHeight : 0;
  const editModalHeight = refs.editModal.classList.contains("hidden") ? 0 : refs.editModal.scrollHeight;
  const modeModalHeight = refs.modeModal.classList.contains("hidden") ? 0 : refs.modeModal.scrollHeight;
  const surveyModalHeight = refs.supportSurveyModal.classList.contains("hidden") ? 0 : refs.supportSurveyModal.scrollHeight;
  const targetHeight = Math.max(
    minHeightPx,
    popupHeight,
    editModalHeight,
    modeModalHeight,
    surveyModalHeight
  );

  if (!targetHeight) {
    return;
  }

  document.documentElement.style.height = `${targetHeight}px`;
  document.body.style.height = `${targetHeight}px`;
}

const STOP_BUTTON_SHOW_DELAY_MS = 500;

function clearExecutionPolling() {
  if (state.executionPollTimer !== null) {
    window.clearInterval(state.executionPollTimer);
    state.executionPollTimer = null;
  }
}

function clearStopButtonShowTimer() {
  if (state.stopButtonShowTimer !== null) {
    window.clearTimeout(state.stopButtonShowTimer);
    state.stopButtonShowTimer = null;
  }
}

function hideStopExecutionButton() {
  clearStopButtonShowTimer();
  refs.stopExecutionBtn.classList.add("hidden");
}

function showStopExecutionButton() {
  clearStopButtonShowTimer();
  refs.stopExecutionBtn.classList.remove("hidden");
  syncPopupHeight();
}

function formatRemainingMs(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderExecutionStatus(executionState) {
  if (!executionState?.isRunning) {
    hideStopExecutionButton();
    syncPopupHeight();
    return;
  }

  const remaining = formatRemainingMs(executionState.remainingMs ?? 0);
  setStatus(t("running", { name: executionState.clickName, remaining }));

  const startedAt = Number(executionState.startedAt) || Date.now();
  const elapsedMs = Date.now() - startedAt;
  if (elapsedMs >= STOP_BUTTON_SHOW_DELAY_MS) {
    showStopExecutionButton();
    return;
  }

  refs.stopExecutionBtn.classList.add("hidden");
  clearStopButtonShowTimer();
  state.stopButtonShowTimer = window.setTimeout(() => {
    state.stopButtonShowTimer = null;
    refs.stopExecutionBtn.classList.remove("hidden");
    syncPopupHeight();
  }, STOP_BUTTON_SHOW_DELAY_MS - elapsedMs);
}

async function refreshExecutionStatus({ silent = false } = {}) {
  const response = await sendRuntimeMessage({ type: "execution-status" });
  const executionState = response?.state ?? null;

  if (executionState?.isRunning) {
    renderExecutionStatus(executionState);
    if (state.executionPollTimer === null) {
      state.executionPollTimer = window.setInterval(() => {
        void refreshExecutionStatus({ silent: true });
      }, 1000);
    }
    return response;
  }

  clearExecutionPolling();
  hideStopExecutionButton();
  if (!silent) {
    const description = describeExecutionEvent(response?.lastEvent);
    if (description) {
      setStatus(description.text, { error: description.error });
    }
  } else {
    syncPopupHeight();
  }

  return response;
}

async function refreshCheckStatus() {
  const activeTab = await getActiveTab();
  const response = await sendRuntimeMessage({ type: "check-status" });
  const checkState = response?.state;
  state.activeCheckClickId = checkState?.isActive && Number.isInteger(activeTab?.id) && activeTab.id === checkState.tabId
    ? checkState.clickId
    : null;
  return response;
}

async function toggleCheckMode(macroId) {
  const macro = clicks.find((item) => item.id === macroId);
  if (!macro) {
    setStatus(t("notFound"));
    return;
  }

  const activeTab = await getActiveTab();
  if (!activeTab || !Number.isInteger(activeTab.id)) {
    setStatus(t("activeTabNotFound"));
    return;
  }

  const clickMode = macro.mode === "element" ? "element" : "position";
  const steps = Array.isArray(macro.steps)
    ? macro.steps
      .map((step) => normalizeStepForExecution(step, clickMode))
      .filter(Boolean)
    : [];

  const response = await sendRuntimeMessage({
    type: "check-start",
    clickId: macro.id,
    clickName: macro.name,
    tabId: activeTab.id,
    steps
  });

  if (!response?.ok) {
    if (response?.error === "page_blocked") {
      window.close();
      return;
    }
    setStatus(t("checkFailed"), { error: true });
    return;
  }

  state.activeCheckClickId = response.isActive ? macro.id : null;
  render();
  setStatus(response.isActive
    ? t("checkStarted", { name: macro.name })
    : t("checkStopped", { name: macro.name }));
}

function describeExecutionEvent(event) {
  if (!event?.kind) {
    return null;
  }

  const name = event.clickName || t("clickNoun");
  switch (event.kind) {
    case "completed":
      return { text: t("executionCompleted", { name }), error: false };
    case "stopped":
      return { text: t("stopped"), error: true };
    case "user-click":
      return { text: t("stoppedByUser"), error: true };
    case "element-not-found":
      return {
        text: t("elementNotFound"),
        error: true
      };
    case "position-not-found":
      return { text: t("positionNotFound"), error: true };
    case "target-not-found":
      return { text: t("targetNotFound"), error: true };
    case "empty-steps":
      return { text: t("hasNoSteps"), error: true };
    case "failed":
      return { text: t("executionFailed"), error: true };
    default:
      return null;
  }
}

async function startExecution(macroId) {
  const macro = clicks.find((item) => item.id === macroId);
  if (!macro) {
    setStatus(t("notFound"));
    return;
  }

  const activeTab = await getActiveTab();
  if (!activeTab || !Number.isInteger(activeTab.id)) {
    setStatus(t("activeTabNotFound"));
    return;
  }

  const clickMode = macro.mode === "element" ? "element" : "position";
  const steps = Array.isArray(macro.steps)
    ? macro.steps
      .map((step) => normalizeStepForExecution(step, clickMode))
      .filter(Boolean)
    : [];
  if (steps.length === 0) {
    setStatus(t("hasNoSteps"), { error: true });
    return;
  }

  const response = await sendRuntimeMessage({
    type: "execution-start",
    clickId: macro.id,
    clickName: macro.name,
    repeats: macro.repeats,
    tabId: activeTab.id,
    steps,
    trackMoves: getDisplayMovesValue(macro),
    executionSpeed: normalizeScenarioSpeed(macro.speed),
    soundVolume: settings.soundVolume
  });

  if (!response?.ok) {
    if (response?.error === "already_running") {
      renderExecutionStatus(response.state);
      setStatus(t("alreadyRunning", { name: response.state?.clickName ?? t("clickNoun") }));
      return;
    }

    if (response?.error === "empty_steps") {
      setStatus(t("hasNoSteps"), { error: true });
      return;
    }

    if (response?.error === "page_blocked") {
      // The background script already opened the restricted-page notice.
      window.close();
      return;
    }

    if (response?.error === "tab_unreachable") {
      setStatus(t("executionFailed"), { error: true });
      return;
    }

    setStatus(t("executionFailed"), { error: true });
    return;
  }

  renderExecutionStatus(response.state);
  setStatus(t("executionStarted", { name: macro.name }));
  window.close();
}

async function stopExecution() {
  const response = await sendRuntimeMessage({ type: "execution-stop" });
  if (!response?.ok) {
    setStatus(t("stopFailed"));
    return;
  }

  clearExecutionPolling();
  hideStopExecutionButton();
  if (response.wasRunning) {
    setStatus(t("stopped"), { error: true });
  } else {
    setStatus(t("noActiveExecution"));
  }
}
