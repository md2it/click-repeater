import { ext } from "../api.js";
import { canOperateOnTab } from "../page-operability/can-operate.js";
import { showRestrictedNotice } from "../page-operability/notice.js";
import { ensureContentScripts } from "./inject.js";
import { normalizeExecutionSpeed } from "./state.js";
import { getOriginFromUrl, readExecutionState, normalizeStepForExecution, writeExecutionState } from "./storage.js";
import { openMainPopup, sendExecutionRunMessage, stopExecutionWithEvent } from "./execution.js";
import { syncActionBadge } from "./badge.js";
import { recordSuccessfulScenario } from "../support-survey/state.js";

export function compositeProgress(state) {
  const { items, index } = state.composite;
  const current = items[index];
  const remainingCycles = items.slice(index + 1).reduce((sum, item) => sum + (item.repeats ?? 0), 0);
  const remainingMs = items.slice(index + 1).reduce((sum, item) => sum + item.estimatedMs, 0);
  return {
    remainingCycles: remainingCycles + (current?.repeats
      ? Math.max(0, current.repeats - Math.floor(state.completedSteps / Math.max(1, state.stepsPerCycle)))
      : 0),
    activeItemId: current?.steps?.length ? current.id ?? null : null,
    totalRepeats: state.composite.totalRepeats,
    remainingMs: remainingMs + (state.pauseUntil
      ? Math.max(0, state.pauseUntil - Date.now())
      : state.remainingMs ?? 0),
  };
}

function executionItem(item) {
  if (item.kind === "pause") {
    const seconds = Number(item.seconds);
    if (!Number.isSafeInteger(seconds) || seconds <= 0 || !Number.isSafeInteger(seconds * 1000 + Date.now())) {
      return null;
    }
    return { estimatedMs: seconds * 1000 };
  }
  const mode = item.mode === "element" ? "element" : "position";
  const steps = Array.isArray(item.steps)
    ? item.steps.map((step) => normalizeStepForExecution(step, mode)).filter(Boolean)
    : [];
  const repeats = Math.max(1, Math.min(999, Math.floor(Number(item.repeats)) || 1));
  const executionSpeed = normalizeExecutionSpeed(item.speed);
  return {
    id: item.id,
    steps,
    repeats,
    executionSpeed,
    trackMoves: Boolean(item.displayMoves ?? item.trackMoves),
    estimatedMs: steps.length * repeats * 1000 / executionSpeed,
  };
}

export async function startCompositeExecution({ compositeId, tabId, soundVolume }) {
  if (!Number.isInteger(tabId)) return { ok: false, error: "tab_id_required" };
  if (!(await canOperateOnTab(tabId))) {
    await showRestrictedNotice(tabId);
    return { ok: false, error: "page_blocked" };
  }
  const { composite_scenarios: composites } = await ext.storage.local.get("composite_scenarios");
  const scenario = composites?.find((entry) => entry.id === compositeId);
  if (!scenario?.items.length) return { ok: false, error: "empty_steps" };
  const items = scenario.items.map(executionItem);
  if (items.some((item) => !item)) return { ok: false, error: "empty_steps" };

  const tab = await ext.tabs.get(tabId);
  const state = {
    isRunning: true,
    clickId: scenario.id,
    clickName: scenario.name,
    tabId,
    origin: getOriginFromUrl(tab.url),
    startedAt: Date.now(),
    soundVolume,
    composite: {
      id: crypto.randomUUID(),
      index: 0,
      cursor: null,
      items,
      totalRepeats: items.reduce((sum, item) => sum + (item.repeats ?? 0), 0),
    },
  };
  return runCompositeItem(state);
}

async function runCompositeItem(state) {
  const { composite } = state;
  const item = composite.items[composite.index];
  if (item.steps?.length && !item.trackMoves) state.composite = { ...composite, cursor: null };
  const itemState = {
    ...state,
    ...item,
    steps: item.steps ?? [],
    repeats: item.repeats ?? 0,
    stepsPerCycle: item.steps?.length ?? 1,
    completedSteps: 0,
    totalSteps: (item.steps?.length ?? 0) * (item.repeats ?? 0),
    remainingMs: item.estimatedMs,
    pauseUntil: item.steps ? null : Date.now() + item.estimatedMs,
    runToken: `${composite.id}:${composite.index}`,
  };
  await writeExecutionState(itemState);
  await syncActionBadge();
  if (item.steps?.length === 0) return completeCompositeItem(itemState);
  return resumeCompositeItem(itemState);
}

export async function resumeCompositeItem(state) {
  try {
    if (await ensureContentScripts(state.tabId)) {
      const current = await readExecutionState();
      if (current?.runToken !== state.runToken) return { ok: false, error: "inactive" };
      const response = state.pauseUntil
        ? await sendCompositePause(state)
        : await sendExecutionRunMessage(state.tabId, {
          ...state,
          startAtCompletedSteps: state.completedSteps,
        });
      if (response?.ok) return { ok: true };
    }
  } catch {
    // The tab may close or lose its origin while switching items.
  }
  const current = await readExecutionState();
  if (current?.runToken === state.runToken) {
    await stopExecutionWithEvent({ kind: "failed", clickName: state.clickName });
  }
  return { ok: false, error: "tab_unreachable" };
}

async function sendCompositePause(state) {
  const cursor = state.composite.cursor;
  const message = { type: "composite-pause", runToken: state.runToken, until: state.pauseUntil };
  if (cursor) {
    try {
      const result = await ext.tabs.sendMessage(state.tabId, { ...message, point: cursor.point }, { frameId: cursor.frameId });
      if (result?.ok) return result;
    } catch {
      // Navigation can remove the frame that displayed the cursor.
    }
  }
  return ext.tabs.sendMessage(state.tabId, message, { frameId: 0 });
}

export function withCompositeCursor(state, point, frameId) {
  if (!state.trackMoves || !Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return state;
  return {
    ...state,
    composite: { ...state.composite, cursor: { point: { x: point.x, y: point.y }, frameId: frameId ?? 0 } },
  };
}

export async function completeCompositeItem(state) {
  const index = state.composite.index + 1;
  if (index < state.composite.items.length) {
    return runCompositeItem({ ...state, composite: { ...state.composite, index } });
  }
  await stopExecutionWithEvent({ kind: "completed", clickName: state.clickName });
  await recordSuccessfulScenario();
  await openMainPopup(state.tabId, undefined, "composites");
  return { ok: true };
}
