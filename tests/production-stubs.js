"use strict";

// The content scripts only need runtime messaging for the browser-free paths
// exercised here. The real extension API remains outside this test boundary.
globalThis.__clickRepeaterTestMessages = [];
globalThis.chrome = {
  runtime: {
    lastError: null,
    sendMessage(message, callback) {
      globalThis.__clickRepeaterTestMessages.push(message);
      callback?.({ ok: true });
    }
  }
};
