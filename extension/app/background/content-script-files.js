// Shared by declarative content_scripts and on-demand injection. Keeping this
// list in one place prevents the two execution paths from drifting apart.
const CONTENT_SCRIPT_FILES = [
  "lib/vendor/icons/lucide/icons.js",
  "lib/our/api.classic.js",
  "lib/our/page-operability/probe.classic.js",
  "lib/our/page-operability/content-probe.classic.js",
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
