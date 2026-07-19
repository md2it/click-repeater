// Single background entry point for Chrome MV3 (background.service_worker) and
// Firefox 121+ (same file in background.scripts as the service_worker fallback).
// Manifest gecko.strict_min_version is 121.0. See extension/manifest.json.
//
// Background modules use normal ES `import`/`export`. Files that are also loaded
// as classic content/page scripts keep separate `*.classic.js` copies (or stay
// classic-only, e.g. popup scripts) so `export` syntax never runs in a
// non-module context.

import "./messages.js";
import "./context-menu.js";
