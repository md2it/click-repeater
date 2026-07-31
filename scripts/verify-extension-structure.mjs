import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("../extension", import.meta.url).pathname);
const source = readFileSync(resolve(root, "app/background/content-script-files.js"), "utf8");
const sharedFiles = [...source.matchAll(/"([^"\n]+\.js)"/g)].map((match) => match[1]);

const missingFiles = [...new Set(sharedFiles)].filter(
  (file) => !existsSync(resolve(root, file)),
);
if (missingFiles.length) {
  throw new Error(`Missing content script files: ${missingFiles.join(", ")}`);
}

const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8"));
if (manifest.content_scripts?.length) {
  throw new Error("content_scripts must stay removed; inject via scripting.executeScript + activeTab");
}
if (manifest.permissions?.includes("tabs")) {
  throw new Error("tabs permission must stay removed");
}
const manifestText = JSON.stringify(manifest);
if (manifestText.includes("<all_urls>")) {
  throw new Error("<all_urls> must stay removed from the manifest");
}

console.log("Click Repeater extension structure is consistent.");
