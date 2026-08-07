let drag = null;

function getDragSlot(clientY) {
  const { rects, dragIndex } = drag;
  let newSlot = dragIndex;

  for (let i = 0; i < dragIndex; i++) {
    const mid = rects[i].top + rects[i].height / 2;
    if (clientY < mid) {
      newSlot = i;
      break;
    }
  }

  for (let i = dragIndex + 1; i < rects.length; i++) {
    const mid = rects[i].top + rects[i].height / 2;
    if (clientY > mid) {
      newSlot = i;
    }
  }

  return newSlot;
}

function onDragMove(event) {
  if (!drag) {
    return;
  }

  const deltaY = event.clientY - drag.startY;
  drag.item.style.transform = `translateY(${deltaY}px)`;

  const newSlot = getDragSlot(event.clientY);
  drag.currentSlot = newSlot;

  for (let i = 0; i < drag.items.length; i++) {
    if (i === drag.dragIndex) {
      continue;
    }
    let shift = 0;
    if (newSlot > drag.dragIndex && i > drag.dragIndex && i <= newSlot) {
      shift = -drag.slotHeight;
    } else if (newSlot < drag.dragIndex && i >= newSlot && i < drag.dragIndex) {
      shift = drag.slotHeight;
    }
    drag.items[i].style.transform = shift ? `translateY(${shift}px)` : "";
  }
}

function onDragEnd() {
  document.removeEventListener("pointermove", onDragMove);
  document.removeEventListener("pointerup", onDragEnd);
  document.removeEventListener("pointercancel", onDragEnd);
  document.body.style.cursor = "";

  if (!drag) {
    return;
  }

  const { dragIndex, currentSlot, clickId, items, item } = drag;
  drag = null;

  for (const el of items) {
    el.style.transform = "";
    el.style.transition = "";
    el.style.position = "";
    el.style.zIndex = "";
  }

  const card = item.querySelector(".click-row");
  if (card) {
    card.style.boxShadow = "";
  }

  if (dragIndex !== currentSlot) {
    const srcIndex = clicks.findIndex((m) => m.id === clickId);
    if (srcIndex >= 0) {
      const [moved] = clicks.splice(srcIndex, 1);
      clicks.splice(currentSlot, 0, moved);
      void persistClicks();
    }
  }

  render();
}

refs.list.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest("[data-action='drag-handle']");
  if (!handle) {
    return;
  }

  const dragItem = handle.closest("li[data-click-id]");
  if (!dragItem) {
    return;
  }

  event.preventDefault();

  // Collapse any open manage panel instantly so item heights stay stable while sorting.
  if (state.manageMenuClickId) {
    closeManageMenu({ instant: true });
  }

  const items = [...refs.list.querySelectorAll("li[data-click-id]")];
  const dragIndex = items.indexOf(dragItem);
  const rects = items.map((el) => el.getBoundingClientRect());
  const gap = items.length > 1 ? rects[1].top - rects[0].bottom : 8;
  const slotHeight = rects[dragIndex].height + gap;

  dragItem.style.position = "relative";
  dragItem.style.zIndex = "100";

  const card = dragItem.querySelector(".click-row");
  if (card) {
    card.style.boxShadow = "0 8px 24px rgba(19, 25, 48, 0.18)";
  }

  for (let i = 0; i < items.length; i++) {
    if (i !== dragIndex) {
      items[i].style.transition = "transform 150ms ease";
    }
  }

  document.body.style.cursor = "grabbing";

  drag = {
    item: dragItem,
    items,
    rects,
    startY: event.clientY,
    dragIndex,
    currentSlot: dragIndex,
    slotHeight,
    clickId: dragItem.dataset.clickId,
  };

  document.addEventListener("pointermove", onDragMove);
  document.addEventListener("pointerup", onDragEnd);
  document.addEventListener("pointercancel", onDragEnd);
});

refs.list.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  const macroId = target.dataset.id;
  const action = target.dataset.action;
  if (!macroId || !action) {
    return;
  }

  if (action === "run") {
    void startExecution(macroId);
    return;
  }

  if (action === "manage") {
    if (state.manageMenuClickId === macroId) {
      closeManageMenu();
    } else {
      openManageMenu(macroId, target);
    }
  }
});

refs.list.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-action='set-repeats']");
  if (!input) {
    return;
  }

  const macro = clicks.find((item) => item.id === input.dataset.id);
  if (!macro) {
    setStatus(t("notFound"));
    return;
  }

  normalizeRepeatInput(input);
  macro.repeats = Number(input.value);
  void persistClicks().then(() => {
    setStatus(t("repeatChanged", { name: macro.name, repeats: macro.repeats }));
  });
});

refs.recordBtn.addEventListener("click", () => {
  if (settings.skipNewClickExplanation) {
    void startCreateMode();
  } else {
    openRecordModal();
  }
});

refs.stopExecutionBtn.addEventListener("click", () => {
  void stopExecution();
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches(".repeat-input") && ["e", "E", "+", "-", ".", ","].includes(event.key)) {
    event.preventDefault();
  }
});

refs.actionListDetail.addEventListener("change", () => {
  state.showDetailedSteps = refs.actionListDetail.checked;
  const macro = clicks.find((item) => item.id === state.actionListClickId);
  renderActionListSteps(getStepsForClick(state.actionListClickId), macro?.mode ?? "position");
});

refs.closeActionListModalBtn.addEventListener("click", () => {
  closeActionListModal();
});

refs.actionListModal.addEventListener("click", (event) => {
  if (event.target === refs.actionListModal) {
    closeActionListModal();
  }
});

refs.closeRecordModalBtn.addEventListener("click", () => {
  closeRecordModal();
});

refs.recordModal.addEventListener("click", (event) => {
  if (event.target === refs.recordModal) {
    closeRecordModal();
  }
});

refs.recordStartBtn.addEventListener("click", async () => {
  if (refs.recordDontShow.checked) {
    settings.skipNewClickExplanation = true;
    syncSettingsUI();
    await persistSettings();
  }
  closeRecordModal();
  void startCreateMode();
});

refs.recordCancelBtn.addEventListener("click", () => {
  closeRecordModal();
});

refs.closeDisplayMovesModalBtn.addEventListener("click", () => {
  closeDisplayMovesModal();
});

refs.displayMovesModal.addEventListener("click", (event) => {
  if (event.target === refs.displayMovesModal) {
    closeDisplayMovesModal();
  }
});

refs.displayMovesVisibleBtn.addEventListener("click", async () => {
  if (refs.displayMovesDontShow.checked) {
    settings.skipDisplayMovesExplanation = true;
    syncSettingsUI();
    await persistSettings();
  }
  const macro = clicks.find((item) => item.id === state.pendingDisplayMovesClickId);
  closeDisplayMovesModal();
  if (macro) {
    await applyDisplayMoves(macro, true);
  }
});

refs.displayMovesStealthBtn.addEventListener("click", async () => {
  if (refs.displayMovesDontShow.checked) {
    settings.skipDisplayMovesExplanation = true;
    syncSettingsUI();
    await persistSettings();
  }
  const macro = clicks.find((item) => item.id === state.pendingDisplayMovesClickId);
  closeDisplayMovesModal();
  if (macro) {
    await applyDisplayMoves(macro, false);
  }
});

refs.closeModeModalBtn.addEventListener("click", () => {
  closeModeModal();
});

refs.modeModal.addEventListener("click", (event) => {
  if (event.target === refs.modeModal) {
    closeModeModal();
  }
});

refs.modePositionBtn.addEventListener("click", async () => {
  if (refs.modeDontShow.checked) {
    settings.skipModeExplanation = true;
    syncSettingsUI();
    await persistSettings();
  }
  const macro = clicks.find((item) => item.id === state.pendingModeClickId);
  closeModeModal();
  if (macro) {
    await applyMode(macro, "position");
  }
});

refs.modeElementBtn.addEventListener("click", async () => {
  if (refs.modeDontShow.checked) {
    settings.skipModeExplanation = true;
    syncSettingsUI();
    await persistSettings();
  }
  const macro = clicks.find((item) => item.id === state.pendingModeClickId);
  closeModeModal();
  if (macro) {
    await applyMode(macro, "element");
  }
});

refs.settingClickSound.addEventListener("click", async () => {
  const currentIndex = SOUND_VOLUME_LEVELS.indexOf(settings.soundVolume);
  const nextIndex = (Math.max(currentIndex, 0) + 1) % SOUND_VOLUME_LEVELS.length;
  settings.soundVolume = SOUND_VOLUME_LEVELS[nextIndex];
  syncSettingsUI();
  if (state.soundPreviewReleaseTimer) {
    window.clearTimeout(state.soundPreviewReleaseTimer);
  }
  if (state.soundPreviewClickTimer) {
    window.clearTimeout(state.soundPreviewClickTimer);
  }
  if (settings.soundVolume !== "volume") {
    prepareSoundEffects();
    state.soundPreviewClickTimer = window.setTimeout(() => {
      state.soundPreviewClickTimer = null;
      playClickSound(settings.soundVolume);
    }, 200);
  }
  state.soundPreviewReleaseTimer = window.setTimeout(() => {
    if (state.soundPreviewClickTimer) {
      window.clearTimeout(state.soundPreviewClickTimer);
      state.soundPreviewClickTimer = null;
    }
    state.soundPreviewReleaseTimer = null;
    releaseSoundEffects();
  }, 1000);
  await persistSettings();
});

refs.settingSkipNewRecording.addEventListener("change", async () => {
  settings.skipNewClickExplanation = refs.settingSkipNewRecording.checked;
  await persistSettings();
});

refs.settingSkipDisplayMoves.addEventListener("change", async () => {
  settings.skipDisplayMovesExplanation = refs.settingSkipDisplayMoves.checked;
  await persistSettings();
});

refs.settingSkipMode.addEventListener("change", async () => {
  settings.skipModeExplanation = refs.settingSkipMode.checked;
  await persistSettings();
});

refs.settingDarkTheme.addEventListener("change", async () => {
  settings.darkTheme = refs.settingDarkTheme.checked;
  syncSettingsUI();
  await persistSettings();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const didClose = closeModalByEscape();
  if (didClose) {
    event.preventDefault();
    event.stopPropagation();
  }
});

function closeModalByEscape() {
  if (isSupportSurveyOpen()) {
    return false;
  }

  if (state.manageMenuEl) {
    closeManageMenu();
    return true;
  }

  if (!refs.modeModal.classList.contains("hidden")) {
    closeModeModal();
    return true;
  }

  if (!refs.displayMovesModal.classList.contains("hidden")) {
    closeDisplayMovesModal();
    return true;
  }

  if (!refs.recordModal.classList.contains("hidden")) {
    closeRecordModal();
    return true;
  }

  if (!refs.actionListModal.classList.contains("hidden")) {
    closeActionListModal();
    return true;
  }

  return false;
}
