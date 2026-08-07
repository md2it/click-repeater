export const RECORDING_SESSION_KEY = "recording_session";
export const EXECUTION_STATE_KEY = "execution_state";
export const EXECUTION_LAST_EVENT_KEY = "execution_last_event";
export const CHECK_STATE_KEY = "check_state";
export const CLICKS_STORAGE_KEY = "clicks_list";
export const DEFAULT_CLICK_ID_KEY = "default_click_id";
export const BADGE_BACKGROUND_COLOR = "#012292";
export const BADGE_TEXT_COLOR = "#ffffff";
export const ACTIVE_BADGE_TEXT = "◉";
export const CREATE_BADGE_BACKGROUND_COLOR = "#dc2626";
export const RUN_BADGE_BACKGROUND_COLOR = BADGE_BACKGROUND_COLOR;
export const CHECK_BADGE_BACKGROUND_COLOR = "#0f766e";
export const BADGE_ANIMATION_STEPS = 40;
export const BADGE_ANIMATION_STEP_MS = 25;
export const CREATE_BADGE_TEXT_COLORS = [
  [255, 255, 255],
  [250, 204, 21],
  [185, 28, 28]
];
export const RUN_BADGE_TEXT_COLORS = [
  [255, 255, 255],
  [1, 34, 146]
];
export const SHORTCUT_HINT_BADGE_TEXT = "M";
export const SHORTCUT_HINT_BADGE_BACKGROUND_COLOR = "#ffffff";
export const SHORTCUT_HINT_BADGE_TEXT_COLOR = "#000000";
export const SHORTCUT_HINT_DURATION_MS = 3000;
export const SCENARIO_SPEED_VALUES = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8];

// Mutated from both execution.js (clearShortcutHintTimer) and badge.js
// (showShortcutHintBadge). Exposed as a mutable object property rather than a
// reassignable `let` binding, since ES module imports are live read-only
// bindings and cannot be reassigned from the importing module.
export const shortcutHintTimer = { id: null };

export function normalizeExecutionSpeed(speed) {
  const value = Number(speed);
  return SCENARIO_SPEED_VALUES.includes(value) ? value : 1;
}
