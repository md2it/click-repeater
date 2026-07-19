"use strict";

var SAFE_EXTENSION_API_IGNORED_ERRORS = {
  "tabs.sendMessage": {
    messages: [
      "No tab with id",
      "Invalid tab ID",
      "Receiving end does not exist",
      "Could not establish connection",
    ],
    fallback: void 0,
  },
  "tabs.get": {
    messages: ["No tab with id", "Invalid tab ID"],
    fallback: void 0,
  },
  "scripting.executeScript": {
    messages: ["No tab with id", "Invalid tab ID"],
    fallback: [],
  },
  "action.setBadgeText": {
    messages: ["No tab with id", "Invalid tab ID"],
    fallback: void 0,
  },
  "action.setBadgeBackgroundColor": {
    messages: ["No tab with id", "Invalid tab ID"],
    fallback: void 0,
  },
  "action.setBadgeTextColor": {
    messages: ["No tab with id", "Invalid tab ID"],
    fallback: void 0,
  },
  "action.setPopup": {
    messages: ["No tab with id", "Invalid tab ID"],
    fallback: void 0,
  },
};

// `var` re-declaration: harmless merge with the `var ext` from lib/our/api.js
// when sharing a classic script global scope (popup/welcome pages); required
// so this file also works when imported as an ES module in the background
// context, where module scopes don't share bindings with other modules.
var ext = globalThis.ext;
var createSafeExtensionApi = globalThis.createSafeExtensionApi;
ext = createSafeExtensionApi(ext, [
  SAFE_EXTENSION_API_IGNORED_ERRORS,
  globalThis.CLICK_REPEATER_SAFE_EXTENSION_API_IGNORED_ERRORS,
]);
globalThis.ext = ext;
