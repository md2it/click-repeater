import { readSession, readCheckState } from "./storage.js";
// Circular with execution.js (execution.js also imports from this file); safe
// because these are only referenced inside function bodies below, never at
// module-evaluation time.
import { getRuntimeExecutionState, setActionBadgeText } from "./execution.js";
import { ext } from "../api.js";
import {
  BADGE_ANIMATION_STEPS,
  BADGE_ANIMATION_STEP_MS,
  CREATE_BADGE_TEXT_COLORS,
  RUN_BADGE_TEXT_COLORS,
  CREATE_BADGE_BACKGROUND_COLOR,
  RUN_BADGE_BACKGROUND_COLOR,
  CHECK_BADGE_BACKGROUND_COLOR,
  BADGE_TEXT_COLOR,
  ACTIVE_BADGE_TEXT,
} from "./state.js";

// Local to this file: only badge.js reads/mutates the badge animation state.
let badgeAnimationIntervalId = null;
let badgeAnimationFrame = 0;
let badgeAnimationMode = null;
let badgeAnimationUpdate = null;
let badgeTextColorSupported = typeof ext.action.setBadgeTextColor === "function";

function interpolateBadgeColor(startColor, endColor, progress) {
  return startColor.map((channel, index) =>
    Math.round(channel + (endColor[index] - channel) * progress)
  );
}

async function setBadgeTextColor(details) {
  if (!badgeTextColorSupported) return;
  try {
    await ext.action.setBadgeTextColor(details);
  } catch {
    badgeTextColorSupported = false;
  }
}

function getBadgeAnimationTextColor(colors, frame) {
  const totalFrames = BADGE_ANIMATION_STEPS * 2;
  const normalizedFrame = ((frame % totalFrames) + totalFrames) % totalFrames;
  const step = normalizedFrame < BADGE_ANIMATION_STEPS
    ? normalizedFrame + 1
    : totalFrames - normalizedFrame;

  if (colors.length === 2) {
    return interpolateBadgeColor(
      colors[0],
      colors[1],
      (step - 1) / (BADGE_ANIMATION_STEPS - 1)
    );
  }

  const middleStep = Math.floor(BADGE_ANIMATION_STEPS / 2);
  if (step <= middleStep) {
    return interpolateBadgeColor(
      colors[0],
      colors[1],
      (step - 1) / (middleStep - 1)
    );
  }
  return interpolateBadgeColor(
    colors[1],
    colors[2],
    (step - middleStep) / (BADGE_ANIMATION_STEPS - middleStep)
  );
}

function clearBadgeAnimation() {
  if (badgeAnimationIntervalId !== null) {
    clearInterval(badgeAnimationIntervalId);
    badgeAnimationIntervalId = null;
  }
  badgeAnimationFrame = 0;
  badgeAnimationMode = null;
  badgeAnimationUpdate = null;
}

async function setActiveBadgeVisual(mode) {
  const isCreateMode = mode === "create";
  const colors = isCreateMode ? CREATE_BADGE_TEXT_COLORS : RUN_BADGE_TEXT_COLORS;
  const backgroundColor = isCreateMode
    ? CREATE_BADGE_BACKGROUND_COLOR
    : RUN_BADGE_BACKGROUND_COLOR;

  await ext.action.setBadgeBackgroundColor({ color: backgroundColor });
  await setBadgeTextColor({
    color: getBadgeAnimationTextColor(colors, badgeAnimationFrame)
  });
  await ext.action.setBadgeText({ text: ACTIVE_BADGE_TEXT });
}

async function updateActiveBadgeVisual(mode) {
  if (badgeAnimationUpdate !== null) return;
  const update = Symbol();
  badgeAnimationUpdate = update;
  try {
    await setActiveBadgeVisual(mode);
  } finally {
    if (badgeAnimationUpdate === update) badgeAnimationUpdate = null;
  }
}

function ensureBadgeAnimation(mode) {
  if (badgeAnimationIntervalId !== null && badgeAnimationMode === mode) {
    return;
  }

  clearBadgeAnimation();
  badgeAnimationMode = mode;
  const totalFrames = BADGE_ANIMATION_STEPS * 2;

  badgeAnimationIntervalId = setInterval(async () => {
    if (badgeAnimationUpdate !== null) return;
    badgeAnimationFrame = (badgeAnimationFrame + 1) % totalFrames;
    await updateActiveBadgeVisual(mode);
  }, BADGE_ANIMATION_STEP_MS);
}

export async function syncActionBadge() {
  const session = await readSession();
  if (session?.isActive) {
    ensureBadgeAnimation("create");
    await updateActiveBadgeVisual("create");
    return;
  }

  const executionState = await getRuntimeExecutionState();
  if (executionState?.isRunning) {
    clearBadgeAnimation();
    const completedCycles = Math.floor(executionState.completedSteps / executionState.stepsPerCycle);
    const remainingCycles = executionState.isComposite
      ? executionState.remainingCycles
      : Math.min(999, Math.max(0, executionState.repeats - completedCycles));
    await setActionBadgeText(remainingCycles > 999 ? "…" : String(remainingCycles));
    return;
  }

  const checkState = await readCheckState();
  if (checkState?.isActive) {
    clearBadgeAnimation();
    await ext.action.setBadgeText({ text: "✓" });
    await ext.action.setBadgeBackgroundColor({ color: CHECK_BADGE_BACKGROUND_COLOR });
    await setBadgeTextColor({ color: BADGE_TEXT_COLOR });
    return;
  }

  clearBadgeAnimation();
  await setActionBadgeText("");
}
