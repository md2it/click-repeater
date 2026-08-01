function appendStaticSvg(parent, svgHtml) {
  if (!svgHtml) {
    return;
  }

  const parsed = new DOMParser().parseFromString(svgHtml, "image/svg+xml");
  const svg = parsed.documentElement;
  if (svg?.localName === "svg" && !parsed.querySelector("parsererror")) {
    parent.append(document.importNode(svg, true));
  }
}

function createIconButton({ className, action, id, tooltip, ariaLabel, ariaPressed, svgHtml }) {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = id;
  button.dataset.tooltip = tooltip;
  button.setAttribute("aria-label", ariaLabel);
  if (ariaPressed !== undefined) {
    button.setAttribute("aria-pressed", String(ariaPressed));
  }
  appendStaticSvg(button, svgHtml);
  return button;
}

function render() {
  clearDeleteConfirmation();
  refs.list.replaceChildren();

  if (clicks.length === 0) {
    const emptyRow = document.createElement("li");
    emptyRow.className = "click-row";
    emptyRow.textContent = t("emptyList");
    refs.list.append(emptyRow);
    syncPopupHeight();
    return;
  }

  for (const macro of clicks) {
    const displayMovesEnabled = getDisplayMovesValue(macro);
    const isElementMode = (macro.mode ?? "position") === "element";
    const isDefault = macro.id === defaultClickId;
    const defaultTitle = t("makeDefault");
    const runLabel = t("run");
    const checkLabel = t("check");
    const editLabel = t("edit");
    const deleteLabel = t("delete");
    const repeatLabel = t("repeat");

    const row = document.createElement("li");
    row.className = "click-item";
    row.dataset.clickId = macro.id;

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.dataset.action = "drag-handle";
    dragHandle.setAttribute("aria-hidden", "true");
    appendStaticSvg(dragHandle, iconSet.gripVertical);

    const clickRow = document.createElement("div");
    clickRow.className = "click-row";

    const clickMain = document.createElement("div");
    clickMain.className = "click-main";
    clickMain.append(
      createIconButton({
        className: "icon-btn run-btn",
        action: "run",
        id: macro.id,
        tooltip: runLabel,
        ariaLabel: runLabel,
        svgHtml: iconSet.play
      }),
      createIconButton({
        className: `icon-btn check-btn${state.activeCheckClickId === macro.id ? " active" : ""}`,
        action: "check",
        id: macro.id,
        tooltip: checkLabel,
        ariaLabel: checkLabel,
        ariaPressed: state.activeCheckClickId === macro.id,
        svgHtml: iconSet.check
      })
    );

    if (isElementMode) {
      const modeIndicator = document.createElement("span");
      modeIndicator.className = "click-mode-icon";
      modeIndicator.setAttribute("aria-hidden", "true");
      modeIndicator.dataset.tooltip = t("modeElement");
      appendStaticSvg(modeIndicator, iconSet.code);
      clickMain.append(modeIndicator);
    }

    if (!displayMovesEnabled) {
      const displayMovesIndicator = document.createElement("span");
      displayMovesIndicator.className = "click-display-moves-icon display-moves-off";
      displayMovesIndicator.setAttribute("aria-hidden", "true");
      displayMovesIndicator.dataset.tooltip = t("displayMovesOff");
      appendStaticSvg(displayMovesIndicator, iconSet.eyeOff);
      clickMain.append(displayMovesIndicator);
    }

    const name = document.createElement("span");
    name.className = "click-name";
    name.textContent = macro.name;
    clickMain.append(name);

    const clickActions = document.createElement("div");
    clickActions.className = "click-actions";

    const defaultBtn = createIconButton({
      className: `icon-btn default-btn${isDefault ? " active" : ""}`,
      action: "set-default",
      id: macro.id,
      tooltip: defaultTitle,
      ariaLabel: defaultTitle,
      ariaPressed: isDefault,
      svgHtml: iconSet.star
    });

    const repeatField = document.createElement("span");
    repeatField.className = "repeat-field";
    repeatField.dataset.tooltip = repeatLabel;
    const repeatInput = document.createElement("input");
    repeatInput.className = "click-repeats repeat-input";
    repeatInput.type = "number";
    repeatInput.min = "1";
    repeatInput.max = "999";
    repeatInput.step = "1";
    repeatInput.inputMode = "numeric";
    repeatInput.value = String(normalizeRepeats(macro.repeats));
    repeatInput.dataset.action = "set-repeats";
    repeatInput.dataset.id = macro.id;
    repeatInput.setAttribute("aria-label", repeatLabel);
    repeatField.append(repeatInput);

    clickActions.append(
      defaultBtn,
      repeatField,
      createIconButton({
        className: "icon-btn",
        action: "edit",
        id: macro.id,
        tooltip: editLabel,
        ariaLabel: editLabel,
        svgHtml: iconSet.squarePen
      }),
      createIconButton({
        className: "icon-btn delete-btn",
        action: "delete",
        id: macro.id,
        tooltip: deleteLabel,
        ariaLabel: deleteLabel,
        svgHtml: iconSet.trash
      })
    );

    clickRow.append(clickMain, clickActions);
    row.append(dragHandle, clickRow);
    refs.list.append(row);
  }

  syncPopupHeight();
}

function setStatus(text, { error = false } = {}) {
  refs.status.textContent = text;
  refs.status.classList.toggle("status-line--error", Boolean(error));
  syncPopupHeight();
}

function clearDeleteConfirmation() {
  for (const button of refs.list.querySelectorAll(".delete-btn-armed")) {
    const label = button.querySelector(".delete-btn-label");
    button.classList.remove("delete-btn-armed");
    button.style.width = "28px";
    button.dataset.tooltip = t("delete");
    button.setAttribute("aria-label", t("delete"));

    if (label) {
      let collapseFallback;
      const finishCollapse = () => {
        button.removeEventListener("transitionend", handleCollapseTransitionEnd);
        clearTimeout(collapseFallback);
        if (!button.classList.contains("delete-btn-armed") && label.isConnected) {
          label.remove();
          button.style.width = "";
        }
      };
      const handleCollapseTransitionEnd = (event) => {
        if (event.propertyName !== "width") {
          return;
        }

        finishCollapse();
      };
      button.addEventListener("transitionend", handleCollapseTransitionEnd);
      collapseFallback = setTimeout(finishCollapse, 200);
    }
  }

  state.pendingDeleteClickId = null;
}

function armDeleteButton(button, macroId) {
  clearDeleteConfirmation();
  state.pendingDeleteClickId = macroId;
  button.dataset.tooltip = t("confirmDelete");
  button.setAttribute("aria-label", t("confirmDelete"));
  for (const existingLabel of button.querySelectorAll(".delete-btn-label")) {
    existingLabel.remove();
  }

  const label = document.createElement("span");
  label.className = "delete-btn-label";
  label.setAttribute("aria-hidden", "true");
  label.textContent = t("confirmDelete");
  button.append(label);
  button.style.width = "max-content";
  const expandedWidth = Math.ceil(button.getBoundingClientRect().width);
  button.style.width = "28px";
  button.getBoundingClientRect();
  button.classList.add("delete-btn-armed");
  button.style.width = `${expandedWidth}px`;
  button.focus();
  syncPopupHeight();
}

async function deleteClick(macroId) {
  const index = clicks.findIndex((item) => item.id === macroId);
  if (index < 0) {
    clearDeleteConfirmation();
    setStatus(t("notFound"));
    return;
  }

  const [deletedClick] = clicks.splice(index, 1);
  if (deletedClick.id === defaultClickId) {
    defaultClickId = null;
    await persistDefaultClickId();
  }

  clearDeleteConfirmation();
  await persistClicks();
  render();
  setStatus(t("deleted"));
}

function openEditModal(macroId, { selectAll = false } = {}) {
  if (macroId !== null) {
    const macro = clicks.find((item) => item.id === macroId);
    if (!macro) {
      setStatus(t("notFound"));
      return;
    }

    state.modalMode = "edit";
    state.editClickId = macro.id;
    refs.deleteEditBtn.classList.remove("hidden");
    refs.editModalTitle.textContent = t("editTitle");
    refs.editName.value = macro.name;
    refs.editRepeats.value = String(macro.repeats ?? 1);
    refs.editSpeed.value = String(normalizeScenarioSpeed(macro.speed));
    setEditDisplayMoves(getDisplayMovesValue(macro));
    setEditMode(macro.mode ?? "position");
    state.showDetailedSteps = false;
    refs.editStepsDetail.checked = false;
    renderEditSteps(Array.isArray(macro.steps) ? macro.steps : []);
    refs.editModal.classList.remove("hidden");
    if (selectAll) {
      focusEditNameSelectAll();
    } else {
      focusEditNameAtEnd();
    }
    syncPopupHeight();
    return;
  }

  state.modalMode = "create";
  state.editClickId = null;
  refs.deleteEditBtn.classList.add("hidden");
  refs.editModalTitle.textContent = t("createTitle");
  refs.editName.value = buildDefaultClickName();
  refs.editRepeats.value = "1";
  refs.editSpeed.value = "1";
  setEditDisplayMoves(true);
  setEditMode("position");
  state.showDetailedSteps = false;
  refs.editStepsDetail.checked = false;
  renderEditSteps([]);
  refs.editModal.classList.remove("hidden");
  focusEditNameSelectAll();
  syncPopupHeight();
}

function focusEditNameAtEnd() {
  refs.editNameField.classList.remove("invalid");
  refs.editName.focus();
  const end = refs.editName.value.length;
  refs.editName.setSelectionRange(end, end);
}

function focusEditNameSelectAll() {
  refs.editNameField.classList.remove("invalid");
  refs.editName.focus();
  refs.editName.select();
}

function validateEditName() {
  const isValid = Boolean(refs.editName.value.trim());
  refs.editNameField.classList.toggle("invalid", !isValid);
  if (!isValid) {
    refs.editName.focus();
    setStatus(t("enterName"));
  }
  return isValid;
}

function requestCloseEditModal() {
  if (!validateEditName()) {
    return false;
  }

  closeEditModal();
  setStatus(t("editCanceled"));
  return true;
}

function closeEditModal() {
  state.modalMode = null;
  state.editClickId = null;
  refs.editNameField.classList.remove("invalid");
  refs.editModal.classList.add("hidden");
  syncPopupHeight();
}

function openRecordModal() {
  refs.recordDontShow.checked = false;
  refs.recordModal.classList.remove("hidden");
  syncPopupHeight();
}

function closeRecordModal() {
  refs.recordModal.classList.add("hidden");
  syncPopupHeight();
}

function openDisplayMovesModal() {
  refs.displayMovesDontShow.checked = false;
  refs.displayMovesModal.classList.remove("hidden");
  syncPopupHeight();
}

function closeDisplayMovesModal() {
  refs.displayMovesModal.classList.add("hidden");
  syncPopupHeight();
}

function openModeModal() {
  refs.modeDontShow.checked = false;
  refs.modeModal.classList.remove("hidden");
  syncPopupHeight();
}

function closeModeModal() {
  refs.modeModal.classList.add("hidden");
  syncPopupHeight();
}

async function startCreateMode() {
  const activeTab = await getActiveTab();
  if (!activeTab || !Number.isInteger(activeTab.id)) {
    setStatus(t("activeTabNotFound"));
    return;
  }

  const response = await sendRuntimeMessage({
    type: "recording-start",
    tabId: activeTab.id,
    url: activeTab.url
  });

  if (!response?.ok) {
    if (response?.error === "page_blocked") {
      // The background script already opened the restricted-page notice.
      window.close();
      return;
    }
    setStatus(t("createFailed"), { error: true });
    return;
  }

  window.close();
}

async function completeCreateModeIfNeeded() {
  const response = await sendRuntimeMessage({ type: "recording-stop" });
  if (!response?.ok || !response.hasSession) {
    return null;
  }

  const steps = Array.isArray(response.steps)
    ? response.steps.map(normalizeRecordedStep).filter(Boolean)
    : [];

  const createdClick = {
    id: createClickId(),
    name: typeof response.clickName === "string" && response.clickName.trim() ? response.clickName : buildDefaultClickName(),
    repeats: 1,
    displayMoves: true,
    trackMoves: true,
    speed: 1,
    mode: "position",
    steps
  };

  clicks.unshift(createdClick);
  await persistClicks();
  return createdClick;
}

function getCurrentEditSteps() {
  if (!state.editClickId) {
    return [];
  }

  const macro = clicks.find((item) => item.id === state.editClickId);
  return Array.isArray(macro?.steps) ? macro.steps : [];
}

function renderEditSteps(steps) {
  refs.editSteps.replaceChildren();
  refs.editStepsDetailRow.classList.toggle("hidden", steps.length === 0);
  refs.editStepsDetail.checked = state.showDetailedSteps;
  refs.editStepsDetailLabel.textContent = t(state.showDetailedSteps ? "hideDetailedSteps" : "showDetailedSteps");

  if (steps.length === 0) {
    const li = document.createElement("li");
    li.className = "step-row step-row-empty";
    li.textContent = t("noSteps");
    refs.editSteps.append(li);
    syncPopupHeight();
    return;
  }

  createStepDisplayRows(steps, state.editMode, state.showDetailedSteps).forEach((label) => {
    const li = document.createElement("li");
    li.className = "step-row";
    li.textContent = label;
    refs.editSteps.append(li);
  });

  syncPopupHeight();
}
