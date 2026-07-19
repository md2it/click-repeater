import { writeExecutionState, clearExecutionState, readExecutionState, writeExecutionLastEvent } from "./storage.js";
import { shortcutHintTimer, BADGE_BACKGROUND_COLOR, BADGE_TEXT_COLOR } from "./state.js";
import { canOperateOnTab } from "../../lib/our/page-operability/can-operate.js";
import { showRestrictedNotice } from "../page-operability/notice.js";
import { ext } from "../../lib/our/api.js";
import { CONTENT_SCRIPT_FILES } from "./content-script-files.js";
// Circular with badge.js (badge.js also imports from this file); safe because
// syncActionBadge is only referenced inside function bodies below, never at
// module-evaluation time.
import { syncActionBadge } from "./badge.js";

export async function startExecutionOnTab({ tabId, clickId, clickName, repeats, trackMoves, executionSpeed, soundVolume = "volume-1", clickSound = true, steps }) {
  const currentState = await getRuntimeExecutionState();
  if (currentState?.isRunning) {
    return { ok: false, error: "already_running", state: currentState };
  }

  if (!Number.isInteger(tabId)) {
    return { ok: false, error: "tab_id_required" };
  }

  // Recheck immediately before execution because the tab may have navigated.
  if (!(await canOperateOnTab(tabId))) {
    await showRestrictedNotice(tabId);
    return { ok: false, error: "page_blocked" };
  }

  if (!Array.isArray(steps) || !steps.length) {
    return { ok: false, error: "empty_steps" };
  }

  const stepsPerCycle = steps.length;
  const totalSteps = stepsPerCycle * repeats;
  const state = {
    isRunning: true,
    clickId,
    clickName,
    tabId,
    repeats,
    stepsPerCycle,
    startedAt: Date.now(),
    completedSteps: 0,
    totalSteps,
    remainingMs: totalSteps * 1000
  };
  await writeExecutionState(state);
  await syncActionBadge();

  try {
    const targetFrameId = getExecutionFrameId(steps);
    const executionMessage = {
      type: "execution-run",
      clickId,
      clickName,
      repeats,
      steps,
      trackMoves,
      executionSpeed: executionSpeed ?? 1,
      soundVolume,
      clickSound
    };
    const tabResponse = Number.isInteger(targetFrameId)
      ? await ext.tabs.sendMessage(tabId, executionMessage, { frameId: targetFrameId })
      : await ext.tabs.sendMessage(tabId, executionMessage);
    if (!tabResponse?.ok) {
      await clearExecutionState();
      await syncActionBadge();
      return { ok: false, error: tabResponse?.error ?? "execution_run_failed" };
    }
  } catch {
    await clearExecutionState();
    await syncActionBadge();
    return { ok: false, error: "tab_unreachable" };
  }

  return {
    ok: true,
    state: {
      isRunning: true,
      clickId: state.clickId,
      clickName: state.clickName,
      tabId: state.tabId,
      repeats: state.repeats,
      startedAt: state.startedAt,
      completedSteps: state.completedSteps,
      totalSteps: state.totalSteps,
      remainingMs: state.remainingMs
    }
  };
}

export function getExecutionFrameId(steps) {
  if (!Array.isArray(steps)) {
    return null;
  }

  const frameIds = steps
    .map((step) => Number.isInteger(step?.frameId) ? step.frameId : null)
    .filter((frameId) => Number.isInteger(frameId));
  if (!frameIds.length) {
    return null;
  }

  const firstFrameId = frameIds[0];
  return frameIds.every((frameId) => frameId === firstFrameId) ? firstFrameId : null;
}

export async function setActionBadgeText(text) {
  await ext.action.setBadgeText({ text });
  if (text) {
    await ext.action.setBadgeBackgroundColor({ color: BADGE_BACKGROUND_COLOR });
    if (typeof ext.action.setBadgeTextColor === "function") {
      await ext.action.setBadgeTextColor({ color: BADGE_TEXT_COLOR });
    }
  }
}

export function clearShortcutHintTimer() {
  if (shortcutHintTimer.id !== null) {
    clearTimeout(shortcutHintTimer.id);
    shortcutHintTimer.id = null;
  }
}

export async function getRuntimeExecutionState() {
  const state = await readExecutionState();
  if (!state?.isRunning) {
    return null;
  }

  return {
    isRunning: true,
    clickId: state.clickId ?? null,
    clickName: typeof state.clickName === "string" ? state.clickName : "clicks",
    tabId: Number.isInteger(state.tabId) ? state.tabId : null,
    repeats: Number.isFinite(Number(state.repeats)) ? Number(state.repeats) : 1,
    startedAt: Number(state.startedAt) || Date.now(),
    stepsPerCycle: Number.isFinite(Number(state.stepsPerCycle)) && Number(state.stepsPerCycle) > 0 ? Number(state.stepsPerCycle) : 1,
    completedSteps: Number.isFinite(Number(state.completedSteps)) ? Number(state.completedSteps) : 0,
    totalSteps: Number.isFinite(Number(state.totalSteps)) ? Number(state.totalSteps) : 0,
    remainingMs: Number.isFinite(Number(state.remainingMs)) ? Number(state.remainingMs) : 0
  };
}

export function resolveStopEventKind(message) {
  if (message?.type === "execution-user-click-interrupt") {
    return "user-click";
  }
  switch (message?.reason) {
    case "element_target_not_found":
      return "element-not-found";
    case "position_target_not_found":
      return "position-not-found";
    case "target_not_found":
      return "target-not-found";
    case "user_stop":
      return "stopped";
    default:
      return "failed";
  }
}

export async function stopExecutionWithEvent(event) {
  await clearExecutionState();
  await writeExecutionLastEvent(event);
  await syncActionBadge();
}

export async function sendRecordingListenerMessage(tabId, message) {
  if (!Number.isInteger(tabId)) {
    return { ok: false, error: "tab_id_required" };
  }

  const send = async () => {
    try {
      const response = await ext.tabs.sendMessage(tabId, message);
      return response?.ok ? { ok: true } : { ok: false, error: response?.error ?? "listener_message_failed" };
    } catch {
      return { ok: false, error: "tab_unreachable" };
    }
  };

  const initial = await send();
  if (initial.ok) return initial;

  try {
    await ext.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: CONTENT_SCRIPT_FILES,
    });
  } catch {
    return initial;
  }

  return send();
}

// Scope the temporary popup override to this tab and clear it after opening.
export async function openMainPopup(tabId, windowId, page) {
  if (!ext.action || typeof ext.action.openPopup !== "function") {
    return false;
  }

  let winId = windowId;
  if (winId === void 0 && Number.isInteger(tabId)) {
    try {
      const tab = await ext.tabs.get(tabId);
      winId = tab.windowId;
    } catch {}
  }

  const popupUrl = page ? `popup.html?page=${encodeURIComponent(page)}` : "popup.html";

  try {
    if (Number.isInteger(tabId)) {
      await ext.action.setPopup({ tabId, popup: popupUrl });
    }
    await ext.action.openPopup(winId !== void 0 ? { windowId: winId } : undefined);
    return true;
  } catch {
    return false;
  } finally {
    if (Number.isInteger(tabId)) {
      await ext.action.setPopup({ tabId, popup: "" });
    }
  }
}

export async function handleActionClick(tab) {
  const tabId = Number.isInteger(tab?.id) ? tab.id : null;
  if (tabId === null) {
    return;
  }

  if (await canOperateOnTab(tabId)) {
    await openMainPopup(tabId, tab.windowId);
    return;
  }

  await showRestrictedNotice(tabId, tab.windowId);
}
