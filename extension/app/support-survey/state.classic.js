// Classic popup/content companion for app/support-survey/state.js (ES module).
// Shares scope with api.classic.js, logic.classic.js, and constants.classic.js.
var ext = globalThis.ext;
var createSupportSurveyLogic = globalThis.createSupportSurveyLogic;

const supportSurveyLogic = createSupportSurveyLogic({
  threshold: SURVEY_THRESHOLD,
  cooldownMs: SURVEY_COOLDOWN_MS,
});

function normalizeSupportSurveyState(raw) {
  const normalized = supportSurveyLogic.normalizeState(raw);
  return {
    ...normalized,
    completed:
      normalized.completed ||
      raw?.completedViaGithub === true ||
      raw?.completedViaStore === true,
  };
}

async function readSupportSurveyState() {
  try {
    const data = await ext.storage.local.get(SURVEY_STORAGE_KEY);
    return normalizeSupportSurveyState(data?.[SURVEY_STORAGE_KEY]);
  } catch {
    return supportSurveyLogic.createDefaultState();
  }
}

async function writeSupportSurveyState(state) {
  try {
    await ext.storage.local.set({
      [SURVEY_STORAGE_KEY]: normalizeSupportSurveyState(state),
    });
    return true;
  } catch {
    return false;
  }
}

async function recordSuccessfulScenario() {
  const state = await readSupportSurveyState();
  const nextState = supportSurveyLogic.addSuccessfulActions(state);
  if (!(await writeSupportSurveyState(nextState))) return false;
  return supportSurveyLogic.canShow(nextState);
}

async function shouldShowSupportSurvey() {
  const state = await readSupportSurveyState();
  return supportSurveyLogic.canShow(state);
}

async function markSupportSurveyShown() {
  const state = await readSupportSurveyState();
  return writeSupportSurveyState(supportSurveyLogic.markShown(state));
}

async function deferSupportSurvey() {
  const state = await readSupportSurveyState();
  return writeSupportSurveyState(supportSurveyLogic.defer(state));
}

async function disableSupportSurveyForever() {
  const state = await readSupportSurveyState();
  return writeSupportSurveyState(supportSurveyLogic.disableForever(state));
}

async function completeSupportSurvey() {
  const state = await readSupportSurveyState();
  return writeSupportSurveyState(supportSurveyLogic.markCompleted(state));
}
