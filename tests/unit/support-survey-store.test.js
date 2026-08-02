"use strict";

const CHROME_STORE =
  "https://chromewebstore.google.com/detail/click-repeater/ojdgninjdijhhclanjlhaipehopjjmoo";
const FIREFOX_STORE = "https://addons.mozilla.org/firefox/addon/click-repeater/";

function withRuntimeGlobals(globals, run) {
  const savedChrome = globalThis.chrome;
  const savedBrowser = globalThis.browser;
  const savedNavigator = globalThis.navigator;

  if ("chrome" in globals) globalThis.chrome = globals.chrome;
  else globalThis.chrome = undefined;

  if ("browser" in globals) globalThis.browser = globals.browser;
  else globalThis.browser = undefined;

  if ("navigator" in globals) {
    Object.defineProperty(globalThis, "navigator", {
      value: globals.navigator,
      configurable: true,
    });
  }

  try {
    return run();
  } finally {
    globalThis.chrome = savedChrome;
    if (savedBrowser === undefined) globalThis.browser = undefined;
    else globalThis.browser = savedBrowser;
    Object.defineProperty(globalThis, "navigator", {
      value: savedNavigator,
      configurable: true,
    });
  }
}

TestHarness.test("support survey store detection prefers Chrome Web Store on Chromium runtimes", () => {
  withRuntimeGlobals(
    {
      chrome: { runtime: { getURL: (path) => `chrome-extension://id${path}` } },
    },
    () => {
      TestHarness.assertEqual(isFirefoxExtensionRuntime(), false);
      TestHarness.assertEqual(getSurveyStoreUrl(), CHROME_STORE);
      TestHarness.assertEqual(getSurveyStoreRateLabel(), "Rate in Chrome web store");
    },
  );
});

TestHarness.test("support survey store detection ignores a browser polyfill on Chromium", () => {
  const chromeApi = { runtime: { getURL: (path) => `chrome-extension://id${path}` } };
  const browserApi = { runtime: { getURL: (path) => `chrome-extension://id${path}` } };
  TestHarness.assert(!Object.is(browserApi, chromeApi));

  withRuntimeGlobals({ chrome: chromeApi, browser: browserApi }, () => {
    TestHarness.assertEqual(isFirefoxExtensionRuntime(), false);
    TestHarness.assertEqual(getSurveyStoreUrl(), CHROME_STORE);
  });
});

TestHarness.test("support survey store detection prefers Firefox Add-ons on Gecko runtimes", () => {
  withRuntimeGlobals(
    {
      browser: { runtime: { getURL: (path) => `moz-extension://id${path}` } },
      chrome: { runtime: { getURL: (path) => `moz-extension://id${path}` } },
    },
    () => {
      TestHarness.assertEqual(isFirefoxExtensionRuntime(), true);
      TestHarness.assertEqual(getSurveyStoreUrl(), FIREFOX_STORE);
      TestHarness.assertEqual(getSurveyStoreRateLabel(), "Rate in Firefox store");
    },
  );
});

TestHarness.test("support survey store detection falls back to user agent when runtime URLs are unavailable", () => {
  withRuntimeGlobals(
    {
      navigator: {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
      },
    },
    () => {
      TestHarness.assertEqual(isFirefoxExtensionRuntime(), true);
      TestHarness.assertEqual(getSurveyStoreUrl(), FIREFOX_STORE);
    },
  );

  withRuntimeGlobals(
    {
      navigator: {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
      },
    },
    () => {
      TestHarness.assertEqual(isFirefoxExtensionRuntime(), false);
      TestHarness.assertEqual(getSurveyStoreUrl(), CHROME_STORE);
    },
  );
});
