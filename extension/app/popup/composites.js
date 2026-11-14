const COMPOSITES_KEY = "composite_scenarios";
const composites = [];
const expandedComposites = new Set();
let expandedPauseId = null;
const createCompositeBtn = document.getElementById("create-composite-btn");

async function loadComposites() {
  const data = await ext.storage.local.get(COMPOSITES_KEY);
  if (Array.isArray(data[COMPOSITES_KEY])) {
    composites.push(...data[COMPOSITES_KEY]);
  }
}

let compositeWriteQueue = Promise.resolve();

function persistCompositeOperation(operation) {
  const operations = [structuredClone(operation)];
  const result = compositeWriteQueue.catch(() => {}).then(async () => {
    const response = await sendRuntimeMessage({ type: "composite-update", operations });
    if (!response?.ok) setStatus(t("compositeSaveFailed"), { error: true });
    return response;
  });
  compositeWriteQueue = result;
  return result;
}

function appendCompositeItem(composite, entry) {
  composite.items.push(entry);
  return persistCompositeOperation({
    type: "append", compositeId: composite.id, itemId: entry.id, entry,
  }).then((response) => Boolean(response?.ok));
}

async function duplicateCompositeItem(composite, itemId) {
  const response = await persistCompositeOperation({
    type: "duplicate-item", compositeId: composite.id, itemId, copyId: createClickId(),
  });
  const sourceIndex = composite.items.findIndex((item) => item.id === itemId);
  if (response?.duplicatedItem && sourceIndex >= 0) {
    composite.items.splice(sourceIndex + 1, 0, response.duplicatedItem);
    render();
  }
}

function deleteCompositeItem(composite, itemId) {
  const index = composite.items.findIndex((item) => item.id === itemId);
  if (index >= 0) composite.items.splice(index, 1);
  return persistCompositeOperation({ type: "delete-item", compositeId: composite.id, itemId });
}

function findCompositeWithItem(id) {
  return composites.find((entry) => entry.items.some((item) => item.id === id));
}

function findSimpleScenario(id) {
  return clicks.find((item) => item.id === id)
    ?? findCompositeWithItem(id)?.items.find((item) => item.id === id && item.kind !== "pause");
}

function persistSimpleScenario(id, fields) {
  const parent = findCompositeWithItem(id);
  return parent ? persistCompositeOperation({
    type: "edit-item", compositeId: parent.id, itemId: id, fields,
  }) : persistClicks();
}

function copySimpleScenario(item) {
  return { ...structuredClone(item), id: createClickId() };
}

function scenarioPickerEntries(composite) {
  const entries = [
    ...clicks,
    ...composites.filter((entry) => entry !== composite).flatMap((entry) => entry.items),
  ];
  const seen = new Set();
  return entries.filter((item) => {
    if (item.kind === "pause") return false;
    const key = JSON.stringify([
      item.name,
      normalizeRepeats(item.repeats),
      normalizeScenarioSpeed(item.speed),
      item.mode === "element" ? "element" : "position",
      getDisplayMovesValue(item),
      item.steps?.map((step) => typeof step === "string" ? step : normalizeRecordedStep(step)) ?? [],
    ]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compositeTextButton(key, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn";
  button.textContent = t(key);
  button.addEventListener("click", onClick);
  return button;
}

function saveCompositeItem(composite, item) {
  void appendCompositeItem(composite, item);
  render();
}

function buildCompositeActions(composite) {
  const actions = document.createElement("div");
  actions.className = "composite-actions";
  const label = document.createElement("span");
  label.className = "composite-explanation composite-add-label";
  label.textContent = t("addCompositeItem");
  const record = compositeTextButton("newSimpleScenario", () => {
    state.recordingCompositeId = composite.id;
    if (settings.skipNewClickExplanation) {
      void startCreateMode();
    } else {
      openRecordModal();
    }
  });
  record.disabled = state.isCompositeRunning;
  const picker = document.createElement("select");
  picker.className = "btn composite-picker";
  picker.setAttribute("aria-label", t("chooseScenario"));
  const entries = scenarioPickerEntries(composite);
  const placeholder = new Option(t("chooseScenario"), "", true, true);
  placeholder.disabled = true;
  picker.append(placeholder);
  for (const entry of entries) picker.append(new Option(entry.name, entry.id));
  picker.disabled = !entries.length;
  picker.addEventListener("change", () => {
    const source = entries.find((entry) => entry.id === picker.value);
    picker.value = "";
    if (source) saveCompositeItem(composite, copySimpleScenario(source));
  });
  const pause = compositeTextButton("addPause", () => {
    saveCompositeItem(composite, { kind: "pause", id: createClickId(), seconds: 1 });
  });
  actions.append(label, record, picker, pause);
  return actions;
}

function deleteCompositeEntryButton(onDelete) {
  const button = createManageMenuIconButton({
    className: "icon-btn manage-menu-delete",
    action: "delete-composite-entry",
    tooltip: t("delete"),
    svgHtml: iconSet.trash2,
  });
  const reset = () => {
    button.classList.remove("manage-menu-delete--armed");
    setIconButtonContent(button, { svgHtml: iconSet.trash2, tooltip: t("delete") });
  };
  button.addEventListener("click", () => {
    if (button.classList.contains("manage-menu-delete--armed")) {
      onDelete();
      return;
    }
    button.classList.add("manage-menu-delete--armed");
    setIconButtonContent(button, { svgHtml: iconSet.trash2, tooltip: t("confirmDelete") });
  });
  button.addEventListener("pointerleave", reset);
  button.addEventListener("blur", reset);
  return button;
}

function buildPauseCard(composite, item) {
  const row = document.createElement("li");
  row.className = "click-item";
  row.dataset.clickId = item.id;
  const shell = document.createElement("div");
  shell.className = "click-item-row";
  const dragHandle = document.createElement("span");
  dragHandle.className = "drag-handle";
  dragHandle.dataset.action = "drag-handle";
  dragHandle.setAttribute("aria-hidden", "true");
  appendStaticSvg(dragHandle, iconSet.gripVertical);
  const card = document.createElement("div");
  card.className = "click-card";
  const body = document.createElement("div");
  body.className = "click-row composite-pause";
  const label = document.createElement("label");
  label.className = "repeat-field composite-pause-field";
  const caption = document.createElement("span");
  caption.className = "repeat-field-label";
  caption.textContent = t("pauseSeconds");
  const seconds = document.createElement("input");
  seconds.className = "repeat-input";
  seconds.type = "number";
  seconds.inputMode = "numeric";
  seconds.min = "1";
  seconds.step = "1";
  seconds.value = String(item.seconds);
  seconds.addEventListener("change", () => {
    const value = seconds.valueAsNumber;
    if (Number.isSafeInteger(value) && value > 0 && Number.isSafeInteger(value * 1000 + Date.now())) {
      item.seconds = value;
      void persistSimpleScenario(item.id, { seconds: value });
    }
    seconds.value = String(item.seconds);
  });
  const clock = document.createElement("span");
  clock.className = "pause-icon";
  clock.setAttribute("aria-hidden", "true");
  appendStaticSvg(clock, globalThis.clickRepeaterProjectIcons.clock3);
  label.append(caption, seconds);
  const expand = createIconButton({
    className: "icon-btn manage-btn",
    action: "expand-pause",
    tooltip: t("manage"),
    ariaLabel: t("manage"),
    svgHtml: iconSet.ellipsisVertical,
  });
  const actions = document.createElement("div");
  actions.className = "pause-actions";
  const duplicate = createManageMenuIconButton({
    className: "icon-btn manage-menu-icon-btn",
    action: "duplicate-pause",
    tooltip: t("duplicatePause"),
    svgHtml: iconSet.copy,
  });
  duplicate.addEventListener("click", () => void duplicateCompositeItem(composite, item.id));
  actions.append(duplicate, deleteCompositeEntryButton(() => {
    void deleteCompositeItem(composite, item.id);
    render();
  }));
  const syncActions = () => {
    const expanded = expandedPauseId === item.id;
    expand.setAttribute("aria-expanded", String(expanded));
    actions.hidden = !expanded;
  };
  expand.addEventListener("click", () => {
    const previous = refs.compositeList.querySelector('[data-action="expand-pause"][aria-expanded="true"]');
    if (previous && previous !== expand) {
      previous.setAttribute("aria-expanded", "false");
      previous.closest(".click-card").querySelector(".pause-actions").hidden = true;
    }
    expandedPauseId = expandedPauseId === item.id ? null : item.id;
    syncActions();
    syncPopupHeight();
  });
  syncActions();
  body.append(clock, label, expand);
  card.append(body, actions);
  shell.append(dragHandle, card);
  row.append(shell);
  return row;
}

async function runComposite(composite) {
  const tab = await getActiveTab();
  if (!Number.isInteger(tab?.id)) {
    setStatus(t("activeTabNotFound"));
    return;
  }
  await compositeWriteQueue;
  const response = await sendRuntimeMessage({
    type: "composite-start",
    compositeId: composite.id,
    tabId: tab.id,
    soundVolume: settings.soundVolume,
  });
  if (response?.ok) {
    window.close();
  } else if (response?.error === "page_blocked") {
    window.close();
  } else if (response?.error === "already_running") {
    renderExecutionStatus(response.state);
  } else {
    setStatus(t(response?.error === "empty_steps" ? "hasNoSteps" : "executionFailed"), { error: true });
  }
}

function buildCompositeCard(composite) {
  const entry = document.createElement("li");
  entry.className = "click-item-row composite-entry";
  entry.dataset.compositeEntryId = composite.id;
  const dragHandle = document.createElement("span");
  dragHandle.className = "drag-handle";
  dragHandle.dataset.action = "drag-handle";
  dragHandle.setAttribute("aria-hidden", "true");
  appendStaticSvg(dragHandle, iconSet.gripVertical);
  const card = document.createElement("div");
  card.className = "click-card";
  const row = document.createElement("div");
  row.className = "click-row";
  const expanded = expandedComposites.has(composite.id);
  const running = state.activeExecutionClickId === composite.id;
  card.classList.toggle("click-card--running", running);
  const play = createIconButton({
    className: `icon-btn run-btn${running ? " run-btn--stop" : ""}`,
    action: "run-composite",
    tooltip: t(running ? "stop" : "run"),
    ariaLabel: t(running ? "stop" : "run"),
    svgHtml: running ? iconSet.square : iconSet.play,
  });
  play.disabled = !running && (!composite.items.length || state.activeExecutionClickId !== null);
  play.addEventListener("click", () => void (running ? stopExecution() : runComposite(composite)));

  const name = document.createElement("span");
  name.className = "click-name";
  name.textContent = composite.name;
  const expand = createIconButton({
    className: "icon-btn manage-btn",
    action: "expand-composite",
    tooltip: t("manage"),
    ariaLabel: t("manage"),
    svgHtml: iconSet.ellipsisVertical,
  });
  expand.setAttribute("aria-expanded", String(expanded));
  expand.addEventListener("click", () => {
    if (expanded) {
      expandedComposites.delete(composite.id);
      if (findCompositeWithItem(state.manageMenuClickId) === composite) closeManageMenu({ instant: true });
    } else {
      expandedComposites.add(composite.id);
    }
    render();
    refs.compositeList.querySelector(`[data-composite-id="${CSS.escape(composite.id)}"] [data-action="expand-composite"]`)?.focus();
  });
  card.dataset.compositeId = composite.id;
  row.append(play, name, expand);
  card.append(row);
  entry.append(dragHandle, card);
  if (!expanded) return entry;

  const details = document.createElement("div");
  details.className = "composite-details";
  const explanation = document.createElement("p");
  explanation.className = "composite-explanation";
  const syncExplanation = () => {
    if (!composite.items.length) {
      explanation.textContent = t("compositeEmptyHint");
      return;
    }
    const [before, after] = t("compositeItemsHint", { name: "\u0000" }).split("\u0000");
    const scenarioName = document.createElement("bdi");
    scenarioName.textContent = composite.name;
    explanation.replaceChildren(before, scenarioName, after);
  };
  syncExplanation();
  const nameField = createManageMenuNameField(composite);
  const nameInput = nameField.querySelector("input");
  nameInput.addEventListener("input", () => {
    if (!nameInput.value.trim()) return;
    composite.name = nameInput.value;
    name.textContent = composite.name;
    syncExplanation();
    void persistCompositeOperation({ type: "edit", compositeId: composite.id, fields: { name: composite.name } });
  });
  nameInput.addEventListener("change", () => {
    nameInput.value = composite.name;
  });
  const editRow = document.createElement("div");
  editRow.className = "composite-edit-row";
  editRow.append(nameField, deleteCompositeEntryButton(() => {
    if (findCompositeWithItem(state.manageMenuClickId) === composite) closeManageMenu({ instant: true });
    expandedComposites.delete(composite.id);
    composites.splice(composites.indexOf(composite), 1);
    void persistCompositeOperation({ type: "delete", compositeId: composite.id });
    render();
  }));
  const items = document.createElement("ul");
  items.className = "clicks-list composite-items";
  for (const item of composite.items) {
    items.append(item.kind === "pause" ? buildPauseCard(composite, item) : buildSimpleCard(item, composite));
  }
  const itemSection = document.createElement("div");
  itemSection.className = "composite-item-section";
  itemSection.append(explanation, items);
  details.append(editRow, itemSection, buildCompositeActions(composite));
  card.append(details);
  return entry;
}

function renderComposites() {
  if (expandedPauseId && !expandedComposites.has(findCompositeWithItem(expandedPauseId)?.id)) {
    expandedPauseId = null;
  }
  refs.compositeList.setAttribute("aria-label", t("navComposites"));
  refs.compositeList.replaceChildren(...composites.map(buildCompositeCard));
}

createCompositeBtn.addEventListener("click", () => {
  if (findCompositeWithItem(state.manageMenuClickId)) closeManageMenu({ instant: true });
  expandedComposites.clear();
  const composite = { id: createClickId(), name: t("newCompositeName"), items: [] };
  composites.unshift(composite);
  expandedComposites.add(composite.id);
  void persistCompositeOperation({ type: "create", compositeId: composite.id, entry: composite });
  render();
  const input = refs.compositeList.querySelector(`[data-composite-id="${CSS.escape(composite.id)}"] [data-action="manage-name"]`);
  input?.focus();
  input?.select();
});

document.addEventListener("click", (event) => {
  if (!expandedComposites.size) return;

  const path = event.composedPath();
  const card = path.find((node) => node instanceof HTMLElement && node.hasAttribute("data-composite-id"));
  const insideId = card?.dataset.compositeId;
  if (path.includes(createCompositeBtn)) return;

  let changed = false;
  for (const id of expandedComposites) {
    if (id === insideId) continue;
    if (findCompositeWithItem(state.manageMenuClickId)?.id === id) {
      closeManageMenu({ instant: true });
    }
    expandedComposites.delete(id);
    changed = true;
  }
  if (changed) render();
});
