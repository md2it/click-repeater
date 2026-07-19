import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

const CHROME_STORE =
  "https://chromewebstore.google.com/detail/click-repeater/ojdgninjdijhhclanjlhaipehopjjmoo";
const FIREFOX_STORE = "https://addons.mozilla.org/firefox/addon/click-repeater/";

// Classic copy: same detection logic, loadable in vm without touching real navigator.
const root = new URL("../extension/", import.meta.url);
const source = readFileSync(new URL("app/support-survey/constants.classic.js", root), "utf8");

function loadWithGlobals(globals) {
  const context = createContext({ console, ...globals });
  runInContext(source, context);
  return context;
}

// Chromium: only chrome, chrome-extension:// URL → Chrome Web Store
{
  const ctx = loadWithGlobals({
    chrome: { runtime: { getURL: (path) => `chrome-extension://id${path}` } },
  });
  assert.equal(ctx.isFirefoxExtensionRuntime(), false);
  assert.equal(ctx.getSurveyStoreUrl(), CHROME_STORE);
  assert.equal(ctx.getSurveyStoreRateLabel(), "Rate in Chrome web store");
}

// Chromium with a `browser` polyfill (browser !== chrome) must still pick Chrome store
{
  const chromeApi = { runtime: { getURL: (path) => `chrome-extension://id${path}` } };
  const browserApi = { runtime: { getURL: (path) => `chrome-extension://id${path}` } };
  assert.notEqual(browserApi, chromeApi);
  const ctx = loadWithGlobals({ chrome: chromeApi, browser: browserApi });
  assert.equal(ctx.isFirefoxExtensionRuntime(), false);
  assert.equal(ctx.getSurveyStoreUrl(), CHROME_STORE);
}

// Firefox: moz-extension:// URL → Firefox Add-ons
{
  const ctx = loadWithGlobals({
    browser: { runtime: { getURL: (path) => `moz-extension://id${path}` } },
    chrome: { runtime: { getURL: (path) => `moz-extension://id${path}` } },
  });
  assert.equal(ctx.isFirefoxExtensionRuntime(), true);
  assert.equal(ctx.getSurveyStoreUrl(), FIREFOX_STORE);
  assert.equal(ctx.getSurveyStoreRateLabel(), "Rate in Firefox store");
}

// UA fallback when runtime.getURL is unavailable
{
  const ctx = loadWithGlobals({
    navigator: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0" },
  });
  assert.equal(ctx.isFirefoxExtensionRuntime(), true);
  assert.equal(ctx.getSurveyStoreUrl(), FIREFOX_STORE);
}

{
  const ctx = loadWithGlobals({
    navigator: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36" },
  });
  assert.equal(ctx.isFirefoxExtensionRuntime(), false);
  assert.equal(ctx.getSurveyStoreUrl(), CHROME_STORE);
}

console.log("support-survey browser detection checks passed");
