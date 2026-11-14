
registerDocumentOperabilityProbeListener();

let compositePauseTimer = null;
function clearCompositePause() {
  if (compositePauseTimer === null) return;
  window.clearTimeout(compositePauseTimer);
  compositePauseTimer = null;
  stopExecutionClickListener();
  removeTrackerElement();
  executionState.trackMoves = false;
}

function startCompositePause({ until, runToken, point }) {
  clearCompositePause();
  executionState.runToken = runToken;
  if (point) {
    executionState.trackMoves = true;
    moveTracker(point);
  }
  startExecutionClickListener();
  const checkDeadline = () => {
    const remaining = Math.max(0, until - Date.now());
    setTrackerPauseCountdown(Math.ceil(remaining / 1000));
    if (remaining > 0) {
      const nextTick = Math.min(remaining, remaining % 1000 || 1000);
      compositePauseTimer = window.setTimeout(checkDeadline, point ? nextTick : Math.min(remaining, 2147483647));
      return;
    }
    // Leave zero visible through a paint before handing off to the next item.
    compositePauseTimer = window.setTimeout(() => {
      clearCompositePause();
      void sendRuntimeMessage({ type: "execution-completed", runToken });
    }, point ? 34 : 0);
  };
  compositePauseTimer = window.setTimeout(checkDeadline, 0);
}

document.addEventListener(
  "pointerdown",
  (event) => warmSoundEffectsFromUserGesture(event),
  { capture: true, passive: true }
);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== "string") {
    sendResponse({ ok: false, error: "invalid_message" });
    return;
  }

  if (message.type === "composite-pause") {
    startCompositePause(message);
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "execution-run") {
    removeCheckOverlay();
    void runExecution(message)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ ok: false, error: "run_failed" }));
    return true;
  }

  if (message.type === "content-ping") {
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "execution-stop") {
    clearCompositePause();
    if (!executionState.isRunning) {
      sendResponse({ ok: true, wasRunning: false });
      return;
    }

    executionState.stopRequested = true;
    stopExecutionClickListener();
    sendResponse({ ok: true, wasRunning: true });
    return;
  }

  if (message.type === "recording-listener-start") {
    removeCheckOverlay();
    startRecordingListeners();
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "recording-listener-stop") {
    stopRecordingListeners();
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "check-start") {
    sendResponse(renderCheckOverlay(message));
    return;
  }

  if (message.type === "check-stop") {
    removeCheckOverlay();
    sendResponse({ ok: true });
    return;
  }

  // A dedicated listener handles operability probes.
  if (message.type === PROBE_DOCUMENT_OPERABILITY) {
    return;
  }

  sendResponse({ ok: false, error: "unknown_message_type" });
});

document.addEventListener(
  "keydown",
  (event) => {
    if (!event.isTrusted) {
      return;
    }

    warmSoundEffectsFromUserGesture(event);

    if (event.key === "Escape") {
      if (executionState.isRunning || compositePauseTimer !== null) {
        clearCompositePause();
        executionState.stopRequested = true;
        void sendRuntimeMessage({ type: "execution-stop-request", runToken: executionState.runToken });
      }
      return;
    }

  },
  true
);

void sendRuntimeMessage({ type: "recording-status" }).then((response) => {
  if (response?.ok && response.isActive) {
    startRecordingListeners();
  }
});

globalThis.__clickRepeaterRecording = {
  start: () => {
    removeCheckOverlay();
    startRecordingListeners();
  },
  stop: stopRecordingListeners,
};

window.addEventListener("pagehide", () => {
  if (!executionState.isRunning) {
    return;
  }
  executionState.unloadDuringRun = true;
  executionState.stopRequested = true;
});
