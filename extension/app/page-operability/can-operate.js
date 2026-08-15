import { PROBE_DOCUMENT_OPERABILITY } from "./content-probe.js";
import { ext } from "../api.js";
import { probeDocumentOperability } from "./probe.js";

function scriptingTarget(tabId, frameId) {
  return frameId !== void 0 && frameId !== 0 ? { tabId, frameIds: [frameId] } : { tabId };
}

function messageOptions(frameId) {
  return frameId !== void 0 && frameId !== 0 ? { frameId } : void 0;
}

// Do not cache this result: navigation can change operability within the same tab.
async function canOperateOnTab(tabId, frameId) {
  if (!Number.isInteger(tabId)) return false;
  try {
    const options = messageOptions(frameId);
    const response = options === void 0
      ? await ext.tabs.sendMessage(tabId, { type: PROBE_DOCUMENT_OPERABILITY })
      : await ext.tabs.sendMessage(
        tabId,
        { type: PROBE_DOCUMENT_OPERABILITY },
        options,
      );
    if (response === true) return true;
    if (response === false) return false;
  } catch {
    // Fall through to scripting probe.
  }
  try {
    const [result] = await ext.scripting.executeScript({
      target: scriptingTarget(tabId, frameId),
      func: probeDocumentOperability,
    });
    return result?.result === true;
  } catch (error) {
    // Keep the user-facing message neutral while retaining the technical cause.
    console.debug("[Click Repeater] page operability probe failed:", error);
    return false;
  }
}

export { canOperateOnTab, messageOptions, scriptingTarget };
