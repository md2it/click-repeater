# Browser tests

Run the complete suite from the project root:

```sh
./tests/run-tests.sh
```

The wrapper uses the shared runner from the neighboring `browser-extension-ci-cd` repository. Set `BROWSER_EXTENSION_CI_CD` if that repository is checked out elsewhere. The runner starts a temporary Python localhost, executes `index.html` in headless Chrome or Chromium, prints JSON, and always stops the server and browser. Exit code `0` means passed, `1` means failed tests, and `2` means an infrastructure error.

- `unit/` contains isolated logic tests.
- `integration/` contains tests that combine browser primitives or extension components.
- The shared browser harness runs registered tests in sequence and renders the report.

Coverage map:
- `mode-record`: selector generation, editable state, recording listeners
- `mode-execute`: execution normalization, keyboard playback, speed profile, pointer path sizing
- `mode-check`: overlay grouping and non-interactive rendering
- `actions`: click/keyboard normalization and coordinate parsing
- `shortcuts`: prefix/action chord detection and hint messaging
- `support-survey`: threshold, deferral, cooldown, and store detection
- `page-operability`: document probe and probe message contract
- `extension structure`: manifest permissions and content-script inventory

Add each test file to `index.html` after the shared harness. The page exposes its machine-readable result as `data-test-status="passed"` or `data-test-status="failed"` on the root `<html>` element.

The suite loads the production content-script files needed by the scenarios and replaces only `chrome.runtime.sendMessage` with a local capture stub. It deliberately does not emulate extension storage, tabs, service workers, permissions, or popup lifecycle.

Deferred browser/e2e coverage: real `chrome.storage.local` persistence and migration, active-tab operability, cross-frame injection, same-origin navigation resume, toolbar/command shortcuts, and popup-to-background messaging. These require an installed extension and therefore do not belong in this lightweight browser suite.
