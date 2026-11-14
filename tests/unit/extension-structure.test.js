"use strict";

TestHarness.test("extension manifest and injected content script inventory stay consistent", async () => {
  const manifestResponse = await fetch("/extension/manifest.json");
  TestHarness.assert(manifestResponse.ok, "manifest.json must be reachable");
  const manifest = await manifestResponse.json();

  const inventoryResponse = await fetch("/extension/app/background/content-script-files.js");
  TestHarness.assert(inventoryResponse.ok, "content-script-files.js must be reachable");
  const inventorySource = await inventoryResponse.text();
  const sharedFiles = [...inventorySource.matchAll(/"([^"\n]+\.js)"/g)].map((match) => match[1]);
  const uniqueFiles = [...new Set(sharedFiles)];

  for (const file of uniqueFiles) {
    const fileResponse = await fetch(`/extension/${file}`, { method: "HEAD" });
    TestHarness.assert(fileResponse.ok, `Missing content script file: ${file}`);
  }

  TestHarness.assert(!manifest.content_scripts?.length, "content_scripts must stay removed");
  TestHarness.assert(!manifest.permissions?.includes("tabs"), "tabs permission must stay removed");
  TestHarness.assert(!JSON.stringify(manifest).includes("<all_urls>"), "<all_urls> must stay removed");
  TestHarness.assertEqual(manifest.background.service_worker, "app/background/main.js");
  TestHarness.assertEqual(manifest.background.type, "module");
  TestHarness.assertEqual(
    manifest.action.default_popup,
    "popup.html",
    "toolbar clicks must use Firefox's native popup path",
  );

  const executionResponse = await fetch("/extension/app/background/execution.js");
  TestHarness.assert(executionResponse.ok, "execution source must be reachable");
  const executionSource = await executionResponse.text();
  TestHarness.assert(
    /setPopup\(\{ tabId, popup: "popup\.html" \}\)/.test(executionSource),
    "temporary execution popups must restore the native popup after a run",
  );
});

TestHarness.test("playback stop replaces the record button above the scenario list", async () => {
  const popupResponse = await fetch("/extension/popup.html");
  TestHarness.assert(popupResponse.ok, "popup.html must be reachable");
  const popupDocument = new DOMParser().parseFromString(await popupResponse.text(), "text/html");
  const recordButton = popupDocument.getElementById("record-btn");
  const stopButton = popupDocument.getElementById("stop-execution-btn");
  const playbackStatus = popupDocument.getElementById("playback-status");
  const statusLine = popupDocument.getElementById("status-line");
  const scenarioList = popupDocument.getElementById("clicks-list");

  TestHarness.assert(recordButton, "Record button must exist");
  TestHarness.assert(stopButton, "Stop button must exist");
  TestHarness.assert(playbackStatus, "Playback status container must exist");
  TestHarness.assert(statusLine, "Playback status line must exist");
  TestHarness.assert(scenarioList, "Simple scenario list must exist");
  TestHarness.assertEqual(recordButton.nextElementSibling, playbackStatus);
  TestHarness.assertEqual(playbackStatus.firstElementChild, stopButton);
  TestHarness.assert(
    stopButton.compareDocumentPosition(statusLine) & Node.DOCUMENT_POSITION_FOLLOWING,
    "Stop must appear above the playback explanation",
  );
  TestHarness.assert(
    statusLine.compareDocumentPosition(scenarioList) & Node.DOCUMENT_POSITION_FOLLOWING,
    "The playback explanation must appear above the scenario list",
  );
});

TestHarness.test("active scenario card provides stop while other runs are disabled", async () => {
  const [renderResponse, executionResponse, stylesResponse, themeResponse, modalStylesResponse, tooltipResponse, iconsResponse] = await Promise.all([
    fetch("/extension/app/popup/render.js"),
    fetch("/extension/app/popup/execution.js"),
    fetch("/extension/app/popup/base.css"),
    fetch("/extension/app/popup/theme.css"),
    fetch("/extension/app/popup/modal.css"),
    fetch("/extension/app/popup/tooltip.js"),
    fetch("/extension/vendor/lucide.js")
  ]);
  TestHarness.assert(renderResponse.ok, "popup renderer must be reachable");
  TestHarness.assert(executionResponse.ok, "popup execution controls must be reachable");
  TestHarness.assert(stylesResponse.ok, "popup styles must be reachable");
  TestHarness.assert(themeResponse.ok, "popup theme must be reachable");
  TestHarness.assert(modalStylesResponse.ok, "popup modal styles must be reachable");
  TestHarness.assert(tooltipResponse.ok, "popup tooltip script must be reachable");
  TestHarness.assert(iconsResponse.ok, "popup icon set must be reachable");

  const [renderSource, executionSource, stylesSource, themeSource, modalStylesSource, tooltipSource, iconsSource] = await Promise.all([
    renderResponse.text(),
    executionResponse.text(),
    stylesResponse.text(),
    themeResponse.text(),
    modalStylesResponse.text(),
    tooltipResponse.text(),
    iconsResponse.text()
  ]);
  TestHarness.assert(/action: isActiveExecution \? "stop" : "run"/.test(renderSource));
  TestHarness.assert(/runButton\.disabled = isExecutionRunning && !isActiveExecution/.test(renderSource));
  TestHarness.assert(/delete runButton\.dataset\.tooltip/.test(renderSource));
  TestHarness.assert(/state\.activeExecutionClickId = nextClickId/.test(executionSource));
  TestHarness.assert(
    /async function stopExecution\(\) \{[\s\S]*?clearExecutionPolling\(\);\s*setActiveExecutionClickId\(null\);/.test(executionSource),
    "Stopping playback must restore the scenario cards",
  );
  TestHarness.assert(/\.click-row \.run-btn:disabled/.test(stylesSource));
  TestHarness.assert(/\.click-row \.run-btn--stop/.test(stylesSource));
  TestHarness.assert(/\.icon-btn\[data-tooltip\]:not\(:disabled\)::after/.test(modalStylesSource));
  TestHarness.assert(/\.icon-btn:not\(:disabled\):hover\[data-tooltip\]::after/.test(modalStylesSource));
  TestHarness.assert(/trigger\.matches\(":disabled"\)/.test(tooltipSource));
  TestHarness.assert(/square:.*lucide-square/.test(iconsSource));
  TestHarness.assert(/html\.dark-theme \.click-row \.run-btn:disabled/.test(themeSource));
  TestHarness.assert(/html\.dark-theme \.click-row \.run-btn--stop/.test(themeSource));
});

TestHarness.test("running status shows fixed-width repeat counter and elapsed time", async () => {
  const [executionResponse, i18nResponse] = await Promise.all([
    fetch("/extension/app/popup/execution.js"),
    fetch("/extension/app/i18n.js")
  ]);
  TestHarness.assert(executionResponse.ok, "popup execution controls must be reachable");
  TestHarness.assert(i18nResponse.ok, "popup i18n must be reachable");

  const [executionSource, i18nSource] = await Promise.all([
    executionResponse.text(),
    i18nResponse.text()
  ]);
  TestHarness.assert(/function formatCycleCounter\(executionState\)/.test(executionSource));
  TestHarness.assert(/setStatus\(t\("running", \{ cycles, time \}\)\)/.test(executionSource));
  TestHarness.assert(/`\$\{remainingCycles\}\/\$\{totalRepeats\}`/.test(executionSource));
  TestHarness.assert(/running: "Remaining: \{cycles\} \| \{time\}"/.test(i18nSource));
});
