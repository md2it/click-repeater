// Shared list for on-demand injection via scripting.executeScript.
// Kept in one place so callers cannot drift apart.
const CONTENT_SCRIPT_FILES = [
  "vendor/lucide.js",
  "app/icons/project.js",
  "app/api.classic.js",
  "app/page-operability/probe.classic.js",
  "app/page-operability/content-probe.classic.js",
  "app/content/selectors.js",
  "app/content/state.js",
  "app/content/tracker.js",
  "app/content/editable.js",
  "app/content/keyboard.js",
  "app/content/mouse.js",
  "app/content/listeners.js",
  "app/content/sound.js",
  "app/content/check-overlay.js",
  "app/content/runner.js",
  "app/content/main.js",
];

export { CONTENT_SCRIPT_FILES };
