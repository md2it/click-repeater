const SURVEY_STORAGE_KEY = "support_survey_state";
const SURVEY_THRESHOLD = 25;
const SURVEY_COOLDOWN_MS = 60 * 24 * 60 * 60 * 1000;
const SURVEY_GITHUB_URL = "https://github.com/md2it/browser-extension-click-repeater";
const SURVEY_CHROME_STORE_URL = "https://chromewebstore.google.com/detail/click-repeater/ojdgninjdijhhclanjlhaipehopjjmoo";
const SURVEY_FIREFOX_STORE_URL = "https://addons.mozilla.org/firefox/addon/click-repeater/";
const SURVEY_FEEDBACK_EMAIL = "mailto:contact@md2it.com";

/** True for Firefox/Gecko extension runtime; not fooled by a `browser` polyfill on Chromium. */
function isFirefoxExtensionRuntime() {
  try {
    const runtime =
      (typeof chrome !== "undefined" && chrome && chrome.runtime) ||
      (typeof browser !== "undefined" && browser && browser.runtime) ||
      null;
    if (runtime && typeof runtime.getURL === "function") {
      return String(runtime.getURL("/")).startsWith("moz-extension:");
    }
  } catch (_) {}
  return typeof navigator !== "undefined" && /Firefox\//.test(String(navigator.userAgent || ""));
}

function getSurveyStoreUrl() {
  return isFirefoxExtensionRuntime() ? SURVEY_FIREFOX_STORE_URL : SURVEY_CHROME_STORE_URL;
}

function getSurveyStoreRateLabel() {
  return isFirefoxExtensionRuntime()
    ? "Rate in Firefox store"
    : "Rate in Chrome web store";
}
