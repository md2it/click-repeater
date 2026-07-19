import { readCheckState, writeCheckState, clearCheckState } from "./storage.js";
import { canOperateOnTab } from "../../lib/our/page-operability/can-operate.js";
import { showRestrictedNotice } from "../page-operability/notice.js";
import { syncActionBadge } from "./badge.js";
import { ext } from "../../lib/our/api.js";
import { CONTENT_SCRIPT_FILES } from "./content-script-files.js";

async function sendCheckOverlayMessage(tabId, message, steps = []) {
  if (!Number.isInteger(tabId)) {
    return { ok: false, error: "tab_id_required" };
  }

  const send = async () => {
    try {
      const targetFrameId = getCheckFrameId(steps);
      const response = Number.isInteger(targetFrameId)
        ? await ext.tabs.sendMessage(tabId, message, { frameId: targetFrameId })
        : await ext.tabs.sendMessage(tabId, message);
      return response?.ok ? response : { ok: false, error: response?.error ?? "check_message_failed" };
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

function getCheckFrameId(steps) {
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

export async function stopCheckMode() {
  const state = await readCheckState();
  await clearCheckState();
  if (Number.isInteger(state?.tabId)) {
    try {
      await ext.tabs.sendMessage(state.tabId, { type: "check-stop" });
    } catch {
      // Ignore: tab may be closed or unavailable.
    }
  }
  await syncActionBadge();
  return Boolean(state?.isActive);
}

export async function startCheckModeOnTab({ tabId, clickId, clickName, steps }) {
  const currentState = await readCheckState();
  if (currentState?.isActive && currentState.clickId === clickId && currentState.tabId === tabId) {
    const wasActive = await stopCheckMode();
    return { ok: true, isActive: false, wasActive };
  }

  if (!Number.isInteger(tabId)) {
    return { ok: false, error: "tab_id_required" };
  }

  if (!(await canOperateOnTab(tabId))) {
    await showRestrictedNotice(tabId);
    return { ok: false, error: "page_blocked" };
  }

  await stopCheckMode();
  const response = await sendCheckOverlayMessage(tabId, {
    type: "check-start",
    clickId,
    clickName,
    steps
  }, steps);

  if (!response?.ok) {
    return { ok: false, error: response?.error ?? "check_start_failed" };
  }

  await writeCheckState({
    isActive: true,
    clickId,
    clickName,
    tabId,
    renderedCount: Number.isFinite(Number(response.renderedCount)) ? Number(response.renderedCount) : 0
  });
  await syncActionBadge();

  return { ok: true, isActive: true, renderedCount: response.renderedCount ?? 0 };
}

async function stopCheckModeForTab(tabId) {
  const state = await readCheckState();
  if (!state?.isActive || state.tabId !== tabId) {
    return;
  }
  await stopCheckMode();
}

ext.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    void stopCheckModeForTab(tabId);
  }
});

ext.tabs.onRemoved.addListener((tabId) => {
  void stopCheckModeForTab(tabId);
});
