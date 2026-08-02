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
});
