import { isActionOnToolbar, onActionToolbarChanged } from "../pin.js";
import { getLocaleForWelcome, buildWelcomeData } from "./data.js";
import { WELCOME_TAB_CONFIG, WELCOME_PIN_WATCH_CONFIG } from "./constants.js";
import { ext } from "../api.js";

const welcomePinWatchers = new Map();

function stopWelcomePinWatcher(tabId) {
  const stop = welcomePinWatchers.get(tabId);
  if (stop) stop();
  welcomePinWatchers.delete(tabId);
}

function notifyWelcomePinned(tabId) {
  const type = WELCOME_PIN_WATCH_CONFIG.pinStatusChangedMessageType;
  void ext.tabs.sendMessage(tabId, { type, pinned: true }).catch(() => {});
  stopWelcomePinWatcher(tabId);
}

function watchWelcomePinStatus(tabId) {
  stopWelcomePinWatcher(tabId);
  void isActionOnToolbar(ext.action).then((pinned) => {
    if (pinned === true) notifyWelcomePinned(tabId);
  });
  const stop = onActionToolbarChanged(ext.action, (pinned) => {
    if (pinned) notifyWelcomePinned(tabId);
  });
  welcomePinWatchers.set(tabId, stop);
}

async function showWelcome() {
  const locale = await getLocaleForWelcome();
  const manifest = ext.runtime.getManifest();
  const isPinned = await isActionOnToolbar(ext.action);
  await ext.storage.session.set({
    [WELCOME_TAB_CONFIG.sessionDataKey]: buildWelcomeData(
      locale,
      manifest.name,
      { isPinned },
    ),
  });
  try {
    await ext.tabs.create({
      url: ext.runtime.getURL(WELCOME_TAB_CONFIG.pageHtml),
      active: true,
    });
  } catch (err) {
    console.error(`[${WELCOME_TAB_CONFIG.logLabel}] welcome tab failed:`, err);
  }
}

export { showWelcome, watchWelcomePinStatus };
