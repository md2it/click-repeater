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
  if (id !== undefined && id !== "") {
    button.dataset.id = id;
  }
  button.dataset.tooltip = tooltip;
  button.setAttribute("aria-label", ariaLabel);
  if (ariaPressed !== undefined) {
    button.setAttribute("aria-pressed", String(ariaPressed));
  }
  appendStaticSvg(button, svgHtml);
  return button;
}

function render() {
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
    const runLabel = t("run");
    const manageLabel = t("manage");
    const isManageOpen = state.manageMenuClickId === macro.id;

    const row = document.createElement("li");
    row.className = "click-item";
    row.dataset.clickId = macro.id;

    const itemRow = document.createElement("div");
    itemRow.className = "click-item-row";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.dataset.action = "drag-handle";
    dragHandle.setAttribute("aria-hidden", "true");
    appendStaticSvg(dragHandle, iconSet.gripVertical);

    const card = document.createElement("div");
    card.className = "click-card";

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
      })
    );

    const name = document.createElement("span");
    name.className = "click-name";
    name.textContent = macro.name;
    clickMain.append(name);

    const clickActions = document.createElement("div");
    clickActions.className = "click-actions";
    clickActions.append(
      createIconButton({
        className: "icon-btn manage-btn",
        action: "manage",
        id: macro.id,
        tooltip: manageLabel,
        ariaLabel: manageLabel,
        ariaPressed: isManageOpen,
        svgHtml: iconSet.ellipsisVertical
      })
    );

    clickRow.append(clickMain, clickActions);

    const accordion = buildManageMenuAccordion(macro);
    accordion.classList.toggle("is-open", isManageOpen);
    card.append(clickRow, accordion);
    itemRow.append(dragHandle, card);
    row.append(itemRow);

    if (isManageOpen) {
      const panel = accordion.querySelector(".manage-menu");
      wireManageMenu(panel, macro);
      state.manageMenuEl = panel;
    }

    refs.list.append(row);
  }

  syncPopupHeight();
}

function setStatus(text, { error = false } = {}) {
  refs.status.textContent = text;
  refs.status.classList.toggle("status-line--error", Boolean(error));
  syncPopupHeight();
}

function playSaveAnimation(macroId) {
  const row = refs.list.querySelector(`li[data-click-id="${CSS.escape(macroId)}"] .click-row`);
  if (!row) {
    return;
  }

  row.classList.remove("save-flash");
  // Force reflow so the animation restarts if it was already applied.
  void row.offsetWidth;
  row.classList.add("save-flash");

  let fallbackTimer;
  const finish = () => {
    row.removeEventListener("animationend", finish);
    clearTimeout(fallbackTimer);
    row.classList.remove("save-flash");
  };
  row.addEventListener("animationend", finish);
  fallbackTimer = setTimeout(finish, 3400);
}

// ---------------------------------------------------------------------------
// Manage menu
// ---------------------------------------------------------------------------

function setIconButtonContent(button, { svgHtml, tooltip, ariaPressed }) {
  button.replaceChildren();
  appendStaticSvg(button, svgHtml);
  button.dataset.tooltip = tooltip;
  button.setAttribute("aria-label", tooltip);
  if (ariaPressed !== undefined) {
    button.setAttribute("aria-pressed", String(ariaPressed));
  } else {
    button.removeAttribute("aria-pressed");
  }
}

function createManageMenuIconButton({ className, action, tooltip, ariaPressed, svgHtml }) {
  return createIconButton({
    className,
    action,
    tooltip,
    ariaLabel: tooltip,
    ariaPressed,
    svgHtml
  });
}

function createManageMenuField({ label, control, ariaLabel }) {
  const field = document.createElement("label");
  field.className = "manage-menu-field";
  const labelEl = document.createElement("span");
  labelEl.className = "manage-menu-field-label";
  labelEl.textContent = label;
  labelEl.setAttribute("aria-hidden", "true");
  if (ariaLabel) {
    field.setAttribute("aria-label", ariaLabel);
  }
  field.append(labelEl, control);
  return field;
}

function createManageMenuRepeatField(macro) {
  const repeatLabel = t("repeat");
  const repeatInput = document.createElement("input");
  repeatInput.className = "manage-menu-field-input repeat-input click-repeats";
  repeatInput.type = "number";
  repeatInput.min = "1";
  repeatInput.max = "999";
  repeatInput.step = "1";
  repeatInput.inputMode = "numeric";
  repeatInput.value = String(normalizeRepeats(macro.repeats));
  repeatInput.dataset.action = "set-repeats";
  repeatInput.dataset.id = macro.id;
  repeatInput.setAttribute("aria-label", repeatLabel);
  return createManageMenuField({ label: repeatLabel, control: repeatInput, ariaLabel: repeatLabel });
}

function createManageMenuSpeedSelect(macro) {
  const speedLabel = t("speed");
  const speedSelect = document.createElement("select");
  speedSelect.className = "manage-menu-select";
  speedSelect.dataset.action = "manage-speed";
  speedSelect.setAttribute("aria-label", speedLabel);
  for (const value of SCENARIO_SPEED_VALUES) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = String(value);
    speedSelect.append(option);
  }
  speedSelect.value = String(normalizeScenarioSpeed(macro.speed));
  return createManageMenuField({ label: speedLabel, control: speedSelect, ariaLabel: speedLabel });
}

function createManageMenuNameField(macro) {
  const nameLabel = t("name");
  const nameInput = document.createElement("input");
  nameInput.className = "manage-menu-field-input manage-menu-name-input";
  nameInput.type = "text";
  nameInput.value = macro.name;
  nameInput.dataset.action = "manage-name";
  nameInput.setAttribute("aria-label", nameLabel);
  return createManageMenuField({ label: nameLabel, control: nameInput, ariaLabel: nameLabel });
}

function buildManageMenuAccordion(macro) {
  const accordion = document.createElement("div");
  accordion.className = "manage-menu-accordion";

  const inner = document.createElement("div");
  inner.className = "manage-menu-accordion-inner";

  const divider = document.createElement("div");
  divider.className = "manage-menu-divider";
  divider.setAttribute("aria-hidden", "true");

  const menu = document.createElement("div");
  menu.className = "manage-menu";

  const nameField = createManageMenuNameField(macro);
  nameField.classList.add("manage-menu-name-field");

  const isVisible = getDisplayMovesValue(macro);
  const isElement = (macro.mode ?? "position") === "element";
  const lookActive = state.activeCheckClickId === macro.id;

  const iconGroup = document.createElement("div");
  iconGroup.className = "manage-menu-icon-group";
  iconGroup.append(
    createManageMenuIconButton({
      className: "icon-btn manage-menu-icon-btn",
      action: "manage-look",
      tooltip: t("lookWithoutRun"),
      ariaPressed: lookActive,
      svgHtml: iconSet.waypoints
    }),
    createManageMenuIconButton({
      className: "icon-btn manage-menu-icon-btn",
      action: "manage-actions",
      tooltip: t("actionList"),
      svgHtml: iconSet.listOrdered
    }),
    createManageMenuIconButton({
      className: "icon-btn manage-menu-icon-btn",
      action: "manage-visibility",
      tooltip: t(isVisible ? "visible" : "stealth"),
      ariaPressed: isVisible,
      svgHtml: isVisible ? iconSet.eye : iconSet.eyeOff
    }),
    createManageMenuIconButton({
      className: "icon-btn manage-menu-icon-btn",
      action: "manage-mode",
      tooltip: t(isElement ? "element" : "position"),
      ariaPressed: isElement,
      svgHtml: isElement ? iconSet.searchCode : iconSet.locate
    })
  );

  const lookBtn = iconGroup.querySelector('[data-action="manage-look"]');
  lookBtn?.classList.toggle("manage-menu-icon-btn--active", lookActive);

  const deleteBtn = createManageMenuIconButton({
    className: "icon-btn manage-menu-delete",
    action: "manage-delete",
    tooltip: t("delete"),
    svgHtml: iconSet.trash2
  });

  const iconRow = document.createElement("div");
  iconRow.className = "manage-menu-icon-row";
  iconRow.append(iconGroup, deleteBtn);

  menu.append(
    nameField,
    createManageMenuRepeatField(macro),
    createManageMenuSpeedSelect(macro),
    iconRow
  );
  inner.append(divider, menu);
  accordion.append(inner);
  return accordion;
}

function onManageMenuOutsideClick(event) {
  if (!state.manageMenuEl) {
    return;
  }
  if (state.manageMenuEl.contains(event.target)) {
    return;
  }
  if (event.target.closest?.('[data-action="manage"]')) {
    return;
  }
  // Drag reordering collapses the panel itself; don't animate-close underneath it.
  if (event.target.closest?.('[data-action="drag-handle"]')) {
    return;
  }
  // Explanation modals (Visible/Stealth, Position/Element) can open on top of
  // the menu without dismissing it; only a genuine outside click closes it.
  if (event.target.closest?.(".modal-overlay")) {
    return;
  }
  closeManageMenu();
}

const MANAGE_MENU_ACCORDION_MS = 220;
let manageMenuHeightFrame = null;

function watchAccordionHeight() {
  if (manageMenuHeightFrame !== null) {
    cancelAnimationFrame(manageMenuHeightFrame);
    manageMenuHeightFrame = null;
  }

  const startedAt = performance.now();

  const tick = (now) => {
    syncPopupHeight();
    if (now - startedAt < MANAGE_MENU_ACCORDION_MS + 40) {
      manageMenuHeightFrame = requestAnimationFrame(tick);
      return;
    }
    manageMenuHeightFrame = null;
  };

  manageMenuHeightFrame = requestAnimationFrame(tick);
}

function closeManageMenu({ instant = false } = {}) {
  const previousMacroId = state.manageMenuClickId;
  const accordion = state.manageMenuEl?.closest(".manage-menu-accordion");
  const inner = accordion?.querySelector(".manage-menu-accordion-inner");
  if (state.manageMenuEl) {
    if (instant && inner) {
      const previousTransition = inner.style.transition;
      inner.style.transition = "none";
      accordion.classList.remove("is-open");
      void inner.offsetHeight;
      inner.style.transition = previousTransition;
    } else {
      accordion?.classList.remove("is-open");
    }
    delete state.manageMenuEl.dataset.wired;
  }
  state.manageMenuEl = null;
  state.manageMenuClickId = null;
  state.manageMenuDeleteArmed = false;
  document.removeEventListener("pointerdown", onManageMenuOutsideClick, true);

  if (previousMacroId) {
    const button = refs.list.querySelector(`.manage-btn[data-id="${CSS.escape(previousMacroId)}"]`);
    button?.setAttribute("aria-pressed", "false");
  }

  if (instant) {
    syncPopupHeight();
  } else {
    watchAccordionHeight();
  }
}

function wireManageMenu(panel, macro) {
  if (panel.dataset.wired === macro.id) {
    return;
  }
  panel.dataset.wired = macro.id;
  panel.addEventListener("click", (event) => onManageMenuClick(event, macro));
  panel.addEventListener("input", (event) => onManageMenuInput(event, macro));
  panel.addEventListener("change", (event) => onManageMenuChange(event, macro));
  panel.addEventListener("keydown", (event) => onManageMenuKeydown(event));
  panel.addEventListener("pointerout", (event) => {
    const deleteButton = event.target.closest(".manage-menu-delete");
    if (!deleteButton || deleteButton.contains(event.relatedTarget)) {
      return;
    }
    resetManageMenuDelete(panel);
  });
}

function updateManageMenuIconStates(macro) {
  if (!state.manageMenuEl || state.manageMenuClickId !== macro.id) {
    return;
  }

  const isVisible = getDisplayMovesValue(macro);
  const visibilityBtn = state.manageMenuEl.querySelector('[data-action="manage-visibility"]');
  if (visibilityBtn) {
    setIconButtonContent(visibilityBtn, {
      svgHtml: isVisible ? iconSet.eye : iconSet.eyeOff,
      tooltip: t(isVisible ? "visible" : "stealth"),
      ariaPressed: isVisible
    });
  }

  const isElement = (macro.mode ?? "position") === "element";
  const modeBtn = state.manageMenuEl.querySelector('[data-action="manage-mode"]');
  if (modeBtn) {
    setIconButtonContent(modeBtn, {
      svgHtml: isElement ? iconSet.searchCode : iconSet.locate,
      tooltip: t(isElement ? "element" : "position"),
      ariaPressed: isElement
    });
  }
}

function openManageMenu(macroId, buttonEl, { focusName = false } = {}) {
  const macro = clicks.find((item) => item.id === macroId);
  if (!macro) {
    setStatus(t("notFound"));
    return;
  }

  const row = buttonEl.closest("li[data-click-id]");
  if (!row) {
    return;
  }

  closeManageMenu();

  const accordion = row.querySelector(".manage-menu-accordion");
  const panel = accordion?.querySelector(".manage-menu");
  if (!accordion || !panel) {
    return;
  }

  accordion.classList.add("is-open");
  wireManageMenu(panel, macro);

  state.manageMenuEl = panel;
  state.manageMenuClickId = macroId;
  state.manageMenuDeleteArmed = false;
  buttonEl.setAttribute("aria-pressed", "true");

  document.addEventListener("pointerdown", onManageMenuOutsideClick, true);
  watchAccordionHeight();

  if (focusName) {
    requestAnimationFrame(() => {
      const nameInput = panel.querySelector('[data-action="manage-name"]');
      nameInput?.focus();
      nameInput?.select();
    });
  }
}

function resetManageMenuDelete(menu) {
  const deleteBtn = menu.querySelector('[data-action="manage-delete"]');
  if (!deleteBtn) {
    return;
  }
  state.manageMenuDeleteArmed = false;
  setIconButtonContent(deleteBtn, {
    svgHtml: iconSet.trash2,
    tooltip: t("delete")
  });
  deleteBtn.classList.remove("manage-menu-delete--armed");
}

async function onManageMenuChange(event, macro) {
  const nameInput = event.target.closest('[data-action="manage-name"]');
  if (nameInput) {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.value = macro.name;
      refs.list.querySelector(`li[data-click-id="${CSS.escape(macro.id)}"] .click-name`).textContent = macro.name;
      nameInput.closest(".manage-menu-field")?.classList.add("invalid");
      setStatus(t("enterName"), { error: true });
      return;
    }
    return;
  }

  const speedSelect = event.target.closest('[data-action="manage-speed"]');
  if (speedSelect) {
    macro.speed = normalizeScenarioSpeed(speedSelect.value);
    await persistClicks();
    setStatus(t("updated"));
  }
}

async function onManageMenuClick(event, macro) {
  const lookBtn = event.target.closest('[data-action="manage-look"]');
  if (lookBtn) {
    closeManageMenu();
    await toggleCheckMode(macro.id);
    return;
  }

  const actionsBtn = event.target.closest('[data-action="manage-actions"]');
  if (actionsBtn) {
    closeManageMenu();
    openActionListModal(macro.id);
    return;
  }

  const visibilityBtn = event.target.closest('[data-action="manage-visibility"]');
  if (visibilityBtn) {
    if (settings.skipDisplayMovesExplanation) {
      await applyDisplayMoves(macro, !getDisplayMovesValue(macro));
    } else {
      state.pendingDisplayMovesClickId = macro.id;
      openDisplayMovesModal();
    }
    return;
  }

  const modeBtn = event.target.closest('[data-action="manage-mode"]');
  if (modeBtn) {
    if (settings.skipModeExplanation) {
      const nextMode = (macro.mode ?? "position") === "element" ? "position" : "element";
      await applyMode(macro, nextMode);
    } else {
      state.pendingModeClickId = macro.id;
      openModeModal();
    }
    return;
  }

  const deleteBtn = event.target.closest('[data-action="manage-delete"]');
  if (deleteBtn) {
    if (state.manageMenuDeleteArmed) {
      const macroId = macro.id;
      closeManageMenu();
      await deleteClick(macroId);
      return;
    }

    state.manageMenuDeleteArmed = true;
    setIconButtonContent(deleteBtn, {
      svgHtml: iconSet.trash2,
      tooltip: t("confirmDelete")
    });
    deleteBtn.classList.add("manage-menu-delete--armed");
  }
}

function onManageMenuInput(event, macro) {
  const nameInput = event.target.closest('[data-action="manage-name"]');
  if (!nameInput) {
    return;
  }

  const name = nameInput.value;
  refs.list.querySelector(`li[data-click-id="${CSS.escape(macro.id)}"] .click-name`).textContent = name;
  if (!name.trim()) {
    return;
  }

  nameInput.closest(".manage-menu-field")?.classList.remove("invalid");
  macro.name = name;
  state.nameSavePromise = state.nameSavePromise
    .catch(() => {})
    .then(() => persistClicks());
}

function onManageMenuKeydown(event) {
  if (event.key !== "Enter" || !event.target.matches('[data-action="manage-name"]')) {
    return;
  }
  event.preventDefault();
  event.target.blur();
}

async function applyDisplayMoves(macro, enabled) {
  macro.displayMoves = enabled;
  macro.trackMoves = enabled;
  await persistClicks();
  updateManageMenuIconStates(macro);
  setStatus(t("displayMovesChanged", {
    state: t(enabled ? "enabled" : "disabled"),
    name: macro.name
  }));
}

async function applyMode(macro, mode) {
  macro.mode = mode;
  await persistClicks();
  updateManageMenuIconStates(macro);
  setStatus(t("updated"));
}

async function deleteClick(macroId) {
  const index = clicks.findIndex((item) => item.id === macroId);
  if (index < 0) {
    setStatus(t("notFound"));
    return;
  }

  const [deletedClick] = clicks.splice(index, 1);
  if (deletedClick.id === defaultClickId) {
    defaultClickId = null;
    await persistDefaultClickId();
  }

  await persistClicks();
  render();
  setStatus(t("deleted"));
}

// ---------------------------------------------------------------------------
// Action list modal
// ---------------------------------------------------------------------------

function getStepsForClick(macroId) {
  const macro = clicks.find((item) => item.id === macroId);
  return Array.isArray(macro?.steps) ? macro.steps : [];
}

function openActionListModal(macroId) {
  const macro = clicks.find((item) => item.id === macroId);
  if (!macro) {
    setStatus(t("notFound"));
    return;
  }

  state.actionListClickId = macroId;
  state.showDetailedSteps = false;
  refs.actionListModalTitle.textContent = macro.name;
  refs.actionListDetail.checked = false;
  renderActionListSteps(macro.steps, macro.mode ?? "position");
  refs.actionListModal.classList.remove("hidden");
  syncPopupHeight();
}

function closeActionListModal() {
  state.actionListClickId = null;
  refs.actionListModal.classList.add("hidden");
  syncPopupHeight();
}

function renderActionListSteps(steps, clickMode) {
  const normalizedSteps = Array.isArray(steps) ? steps : [];
  refs.actionListSteps.replaceChildren();
  refs.actionListDetailRow.classList.toggle("hidden", normalizedSteps.length === 0);
  refs.actionListDetail.checked = state.showDetailedSteps;
  refs.actionListDetailLabel.textContent = t(state.showDetailedSteps ? "hideDetailedSteps" : "showDetailedSteps");

  if (normalizedSteps.length === 0) {
    const li = document.createElement("li");
    li.className = "step-row step-row-empty";
    li.textContent = t("noSteps");
    refs.actionListSteps.append(li);
    syncPopupHeight();
    return;
  }

  createStepDisplayRows(normalizedSteps, clickMode, state.showDetailedSteps).forEach((label) => {
    const li = document.createElement("li");
    li.className = "step-row";
    li.textContent = label;
    refs.actionListSteps.append(li);
  });

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
  state.pendingDisplayMovesClickId = null;
  syncPopupHeight();
}

function openModeModal() {
  refs.modeDontShow.checked = false;
  refs.modeModal.classList.remove("hidden");
  syncPopupHeight();
}

function closeModeModal() {
  refs.modeModal.classList.add("hidden");
  state.pendingModeClickId = null;
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
