import { readSession, readCheckState, readExecutionState, clearSession, getOriginFromUrl } from "./storage.js";
import { ensureContentScripts, applyRecordingListenersAllFrames } from "./inject.js";
import { stopCheckMode, resumeCheckModeAfterNavigation } from "./check.js";
import { stopExecutionWithEvent, resumeExecutionAfterNavigation } from "./execution.js";
import { syncActionBadge } from "./badge.js";
import { ext } from "../api.js";

// Prefer changeInfo.url from tabs.onUpdated; fall back to tab.url / tabs.get.
function resolveNavigationUrl(changeInfo, tab) {
  if (typeof changeInfo?.url === "string" && changeInfo.url) {
    return changeInfo.url;
  }
  if (typeof tab?.url === "string" && tab.url) {
    return tab.url;
  }
  return null;
}

async function resolveTabOrigin(tabId, changeInfo, tab) {
  const url = resolveNavigationUrl(changeInfo, tab);
  if (url) {
    return getOriginFromUrl(url);
  }
  try {
    const current = await ext.tabs.get(tabId);
    if (typeof current?.url === "string" && current.url) {
      return getOriginFromUrl(current.url);
    }
  } catch {
    // URL may be unavailable without host access after an origin change.
  }
  return null;
}

function isDifferentOrigin(storedOrigin, nextOrigin) {
  return Boolean(storedOrigin && nextOrigin && nextOrigin !== storedOrigin);
}

async function stopRecordingForTab(tabId) {
  const session = await readSession();
  if (!session?.isActive || session.tabId !== tabId) {
    return;
  }
  await clearSession();
  await syncActionBadge();
}

async function stopCheckModeForTab(tabId) {
  const state = await readCheckState();
  if (!state?.isActive || state.tabId !== tabId) {
    return;
  }
  await stopCheckMode();
}

async function stopExecutionForTab(tabId) {
  const state = await readExecutionState();
  if (!state?.isRunning || state.tabId !== tabId) {
    return;
  }
  await stopExecutionWithEvent({
    kind: "stopped",
    clickName: state.clickName,
  });
}

// Stop when origin clearly changed, or when URL/origin is unknown after navigation.
async function stopModesIfOriginLostOrChanged(tabId, nextOrigin, { requireKnownOrigin }) {
  const session = await readSession();
  if (session?.isActive && session.tabId === tabId) {
    if (!nextOrigin && requireKnownOrigin) {
      await stopRecordingForTab(tabId);
    } else if (isDifferentOrigin(session.origin, nextOrigin)) {
      await stopRecordingForTab(tabId);
    }
  }

  const checkState = await readCheckState();
  if (checkState?.isActive && checkState.tabId === tabId) {
    if (!nextOrigin && requireKnownOrigin) {
      await stopCheckModeForTab(tabId);
    } else if (isDifferentOrigin(checkState.origin, nextOrigin)) {
      await stopCheckModeForTab(tabId);
    }
  }

  const executionState = await readExecutionState();
  if (executionState?.isRunning && executionState.tabId === tabId) {
    if (!nextOrigin && requireKnownOrigin) {
      await stopExecutionForTab(tabId);
    } else if (isDifferentOrigin(executionState.origin, nextOrigin)) {
      await stopExecutionForTab(tabId);
    }
  }
}

async function handleRecordingNavigation(tabId, nextOrigin) {
  const session = await readSession();
  if (!session?.isActive || session.tabId !== tabId) {
    return;
  }

  if (!nextOrigin || isDifferentOrigin(session.origin, nextOrigin)) {
    await stopRecordingForTab(tabId);
    return;
  }

  const injected = await ensureContentScripts(tabId);
  if (!injected) {
    await stopRecordingForTab(tabId);
    return;
  }

  await applyRecordingListenersAllFrames(tabId, true);
}

async function handleCheckNavigation(tabId, nextOrigin) {
  const state = await readCheckState();
  if (!state?.isActive || state.tabId !== tabId) {
    return;
  }

  if (!nextOrigin || isDifferentOrigin(state.origin, nextOrigin)) {
    await stopCheckModeForTab(tabId);
    return;
  }

  await resumeCheckModeAfterNavigation(tabId);
}

async function handleExecutionNavigation(tabId, nextOrigin) {
  const state = await readExecutionState();
  if (!state?.isRunning || state.tabId !== tabId) {
    return;
  }

  if (!nextOrigin || isDifferentOrigin(state.origin, nextOrigin)) {
    await stopExecutionForTab(tabId);
    return;
  }

  await resumeExecutionAfterNavigation(tabId);
}

ext.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Explicit URL updates: stop as soon as a different origin is visible.
  if (changeInfo.url) {
    void (async () => {
      const nextOrigin = await resolveTabOrigin(tabId, changeInfo, tab);
      await stopModesIfOriginLostOrChanged(tabId, nextOrigin, { requireKnownOrigin: false });
    })();
  }

  if (changeInfo.status === "complete") {
    void (async () => {
      const nextOrigin = await resolveTabOrigin(tabId, changeInfo, tab);
      // After navigation finishes, unknown URL/origin → stop (do not guess same-origin).
      await stopModesIfOriginLostOrChanged(tabId, nextOrigin, { requireKnownOrigin: true });
      await handleRecordingNavigation(tabId, nextOrigin);
      await handleCheckNavigation(tabId, nextOrigin);
      await handleExecutionNavigation(tabId, nextOrigin);
    })();
  }
});

ext.tabs.onRemoved.addListener((tabId) => {
  void stopRecordingForTab(tabId);
  void stopCheckModeForTab(tabId);
  void stopExecutionForTab(tabId);
});
