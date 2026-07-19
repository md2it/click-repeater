import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("../extension", import.meta.url).pathname);
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8"));
const source = readFileSync(resolve(root, "app/background/content-script-files.js"), "utf8");
const sharedFiles = [...source.matchAll(/"([^"\n]+\.js)"/g)].map((match) => match[1]);
const declaredFiles = manifest.content_scripts?.[0]?.js ?? [];

const missingFiles = [...new Set([...sharedFiles, ...declaredFiles])].filter(
  (file) => !existsSync(resolve(root, file)),
);
if (missingFiles.length) {
  throw new Error(`Missing content script files: ${missingFiles.join(", ")}`);
}

const missingFromShared = declaredFiles.filter((file) => !sharedFiles.includes(file));
const missingFromManifest = sharedFiles.filter((file) => !declaredFiles.includes(file));
if (missingFromShared.length || missingFromManifest.length) {
  throw new Error(
    [
      missingFromShared.length ? `Not in shared list: ${missingFromShared.join(", ")}` : "",
      missingFromManifest.length ? `Not in manifest: ${missingFromManifest.join(", ")}` : "",
    ].filter(Boolean).join("; "),
  );
}

console.log("Click Repeater extension structure is consistent.");
