import { CONTENT_SCRIPT_FILES } from "./content-script-files.js";
import { ext } from "../../lib/our/api.js";

async function isContentScriptReady(tabId) {
  try {
    const response = await ext.tabs.sendMessage(tabId, { type: "content-ping" });
    return response?.ok === true;
  } catch {
    return false;
  }
}

async function ensureContentScripts(tabId) {
  if (!Number.isInteger(tabId)) {
    return false;
  }

  if (await isContentScriptReady(tabId)) {
    return true;
  }

  try {
    await ext.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: CONTENT_SCRIPT_FILES,
      injectImmediately: true,
    });
  } catch {
    return false;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (await isContentScriptReady(tabId)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  return isContentScriptReady(tabId);
}

// Start/stop recording listeners in every frame that has the content scripts.
async function applyRecordingListenersAllFrames(tabId, shouldStart) {
  if (!await ensureContentScripts(tabId)) {
    return { ok: false, error: "inject_failed" };
  }

  try {
    const results = await ext.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: (start) => {
        const api = globalThis.__clickRepeaterRecording;
        if (!api) {
          return false;
        }
        if (start) {
          api.start();
        } else {
          api.stop();
        }
        return true;
      },
      args: [shouldStart],
    });
    const reached = Array.isArray(results) && results.some((entry) => entry?.result === true);
    return reached ? { ok: true } : { ok: false, error: "listener_message_failed" };
  } catch {
    return { ok: false, error: "tab_unreachable" };
  }
}

export { ensureContentScripts, applyRecordingListenersAllFrames };
