"use strict";
var PROBE_DOCUMENT_OPERABILITY = "PROBE_DOCUMENT_OPERABILITY";
function isProbeDocumentOperabilityMessage(message) {
  if (typeof message !== "object" || message === null) return false;
  return message.type === PROBE_DOCUMENT_OPERABILITY;
}
var probeListenerRegistered = false;
// `var` re-declaration: harmless merge with the `function probeDocumentOperability`
// from probe.js when sharing a classic script scope; needed for correctness if
// this file is ever imported as an ES module without probe.js already present.
var probeDocumentOperability = globalThis.probeDocumentOperability;
function registerDocumentOperabilityProbeListener() {
  if (probeListenerRegistered) return;
  probeListenerRegistered = true;
  ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isProbeDocumentOperabilityMessage(message)) return;
    sendResponse(probeDocumentOperability());
    return true;
  });
}

// Bridge for background-context ES modules; harmless no-op as a classic script.
globalThis.PROBE_DOCUMENT_OPERABILITY = PROBE_DOCUMENT_OPERABILITY;
globalThis.isProbeDocumentOperabilityMessage = isProbeDocumentOperabilityMessage;
globalThis.registerDocumentOperabilityProbeListener = registerDocumentOperabilityProbeListener;
