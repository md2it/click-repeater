
function syncPopupHeight() {
  const minHeightPx = parseFloat(window.getComputedStyle(document.body).minHeight) || 0;
  const popupHeight = refs.popup ? refs.popup.scrollHeight : 0;
  const actionListModalHeight = refs.actionListModal.classList.contains("hidden") ? 0 : refs.actionListModal.scrollHeight;
  const modeModalHeight = refs.modeModal.classList.contains("hidden") ? 0 : refs.modeModal.scrollHeight;
  const surveyModalHeight = refs.supportSurveyModal.classList.contains("hidden") ? 0 : refs.supportSurveyModal.scrollHeight;
  const targetHeight = Math.max(
    minHeightPx,
    popupHeight,
    actionListModalHeight,
    modeModalHeight,
    surveyModalHeight
  );

  if (!targetHeight) {
    return;
  }

  document.documentElement.style.height = `${targetHeight}px`;
  document.body.style.height = `${targetHeight}px`;
}

function clearExecutionPolling() {
  if (state.executionPollTimer !== null) {
    window.clearInterval(state.executionPollTimer);
    state.executionPollTimer = null;
  }
}

function hideStopExecutionButton() {
  refs.stopExecutionBtn.classList.add("hidden");
  refs.recordBtn.classList.remove("hidden");
  createCompositeBtn.classList.remove("hidden");
}

function showStopExecutionButton() {
  refs.recordBtn.classList.add("hidden");
  createCompositeBtn.classList.add("hidden");
  refs.stopExecutionBtn.classList.remove("hidden");
  syncPopupHeight();
}

function syncPlaybackStatusVisibility() {
  const pageName = refs.menu.querySelector(".active")?.dataset.page;
  document.getElementById("playback-status").classList.toggle("hidden",
    !state.isCompositeRunning && pageName !== "clicks" && pageName !== "composites");
}

function setActiveExecutionClickId(executionState) {
  const nextClickId = executionState?.isRunning && typeof executionState.clickId === "string"
    ? executionState.clickId
    : null;
  const isComposite = Boolean(executionState?.isComposite);
  const nextItemId = isComposite ? executionState.activeItemId ?? null : null;
  if (state.activeCompositeItemId !== nextItemId) {
    const previousItemId = state.activeCompositeItemId;
    state.activeCompositeItemId = nextItemId;
    for (const id of [previousItemId, nextItemId]) {
      if (!id) continue;
      refs.compositeList.querySelector(`[data-click-id="${CSS.escape(id)}"] > .click-item-row > .click-card`)
        ?.classList.toggle("click-card--running", id === nextItemId);
    }
  }
  if (state.activeExecutionClickId === nextClickId && state.isCompositeRunning === isComposite) {
    return;
  }

  state.activeExecutionClickId = nextClickId;
  state.isCompositeRunning = isComposite;
  syncPlaybackStatusVisibility();
  render();
}

function formatRemainingMs(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getExecutionCycleCounts(executionState) {
  if (executionState.isComposite) {
    return { remainingCycles: executionState.remainingCycles, totalRepeats: executionState.totalRepeats };
  }
  const totalRepeats = Math.min(999, Math.max(1, Number(executionState.repeats) || 1));
  const stepsPerCycleRaw = Number(executionState.stepsPerCycle);
  const stepsPerCycle = Number.isFinite(stepsPerCycleRaw) && stepsPerCycleRaw > 0
    ? stepsPerCycleRaw
    : (Number(executionState.totalSteps) > 0
      ? Math.max(1, Math.floor(Number(executionState.totalSteps) / totalRepeats))
      : 1);
  const completedSteps = Math.max(0, Number(executionState.completedSteps) || 0);
  const completedCycles = Math.min(totalRepeats, Math.floor(completedSteps / stepsPerCycle));
  const remainingCycles = Math.max(0, totalRepeats - completedCycles);
  return { remainingCycles, totalRepeats };
}

function formatCycleCounter(executionState) {
  const { remainingCycles, totalRepeats } = getExecutionCycleCounts(executionState);
  return `${remainingCycles}/${totalRepeats}`;
}

function renderExecutionStatus(executionState) {
  if (!executionState?.isRunning) {
    setActiveExecutionClickId(null);
    hideStopExecutionButton();
    syncPopupHeight();
    return;
  }

  setActiveExecutionClickId(executionState);
  const cycles = formatCycleCounter(executionState);
  const time = formatRemainingMs(executionState.remainingMs ?? 0);
  setStatus(t("running", { cycles, time }));
  showStopExecutionButton();
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

  const wasRunning = state.activeExecutionClickId !== null;
  clearExecutionPolling();
  setActiveExecutionClickId(null);
  hideStopExecutionButton();
  if (!silent || response?.lastEvent) {
    const description = describeExecutionEvent(response?.lastEvent);
    if (description) {
      setStatus(description.text, { error: description.error });
    } else if (wasRunning) {
      setStatus("");
    }
  } else if (wasRunning) {
    setStatus("");
  } else {
    syncPopupHeight();
  }

  return response;
}

async function stopActiveCheckMode() {
  await sendRuntimeMessage({ type: "check-stop" });
  state.activeCheckClickId = null;
}

async function toggleCheckMode(macroId) {
  const macro = findSimpleScenario(macroId);
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
  if (response.isActive) {
    window.close();
    return;
  }

  render();
  setStatus(t("checkStopped", { name: macro.name }));
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
  const macro = findSimpleScenario(macroId);
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
  setActiveExecutionClickId(null);
  hideStopExecutionButton();
  if (response.wasRunning) {
    setStatus(t("stopped"), { error: true });
  } else {
    setStatus(t("noActiveExecution"));
  }
}
