const STORAGE_KEY = "clicks_list";
const DEFAULT_CLICK_ID_KEY = "default_click_id";
const SETTINGS_KEY = "popup_settings";
const clicks = [];
let defaultClickId = null;

const SCENARIO_SPEED_VALUES = [0.1, 0.25, 0.5, 0.75, 1, 2, 4, 8];
const SOUND_VOLUME_LEVELS = ["volume", "volume-1", "volume-2"];
const DEFAULT_SOUND_VOLUME = "volume-1";

const settings = {
  soundVolume: DEFAULT_SOUND_VOLUME,
  skipNewClickExplanation: false,
  skipDisplayMovesExplanation: false,
  skipModeExplanation: false,
  darkTheme: false
};

const state = {
  modalMode: null,
  editClickId: null,
  editMode: "position",
  showDetailedSteps: false,
  pendingDeleteClickId: null,
  activeCheckClickId: null,
  executionPollTimer: null,
  stopButtonShowTimer: null,
  soundPreviewClickTimer: null,
  soundPreviewReleaseTimer: null
};

const refs = {
  popup: document.querySelector(".popup-shell"),
  menu: document.querySelector(".popup-menu"),
  menuButtons: document.querySelectorAll(".popup-menu-btn"),
  pages: document.querySelectorAll("[data-page-content]"),
  list: document.getElementById("clicks-list"),
  status: document.getElementById("status-line"),
  stopExecutionBtn: document.getElementById("stop-execution-btn"),
  recordBtn: document.getElementById("record-btn"),
  editModal: document.getElementById("edit-modal"),
  editModalTitle: document.getElementById("edit-modal-title"),
  closeEditBtn: document.getElementById("close-edit-btn"),
  editNameField: document.getElementById("edit-name-field"),
  editName: document.getElementById("edit-name"),
  clearEditNameBtn: document.getElementById("clear-edit-name-btn"),
  editRepeats: document.getElementById("edit-repeats"),
  editSpeed: document.getElementById("edit-speed"),
  editDisplayMovesToggle: document.getElementById("edit-display-moves-toggle"),
  editDisplayMovesIcon: document.getElementById("edit-display-moves-icon"),
  editDisplayMovesLabel: document.getElementById("edit-display-moves-label"),
  editDisplayMoves: document.getElementById("edit-display-moves"),
  editSteps: document.getElementById("edit-steps"),
  editStepsDetailRow: document.getElementById("edit-steps-detail-row"),
  editStepsDetail: document.getElementById("edit-steps-detail"),
  editStepsDetailLabel: document.getElementById("edit-steps-detail-label"),
  editModeToggle: document.getElementById("edit-mode-toggle"),
  editModeIcon: document.getElementById("edit-mode-icon"),
  editModeLabel: document.getElementById("edit-mode-label"),
  saveEditBtn: document.getElementById("save-edit-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteEditBtn: document.getElementById("delete-edit-btn"),
  recordModal: document.getElementById("record-modal"),
  closeRecordModalBtn: document.getElementById("close-record-modal-btn"),
  recordDontShow: document.getElementById("record-dont-show"),
  recordStartBtn: document.getElementById("record-start-btn"),
  recordCancelBtn: document.getElementById("record-cancel-btn"),
  displayMovesModal: document.getElementById("display-moves-modal"),
  closeDisplayMovesModalBtn: document.getElementById("close-display-moves-modal-btn"),
  displayMovesDontShow: document.getElementById("display-moves-dont-show"),
  displayMovesVisibleBtn: document.getElementById("display-moves-visible-btn"),
  displayMovesStealthBtn: document.getElementById("display-moves-stealth-btn"),
  modeModal: document.getElementById("mode-modal"),
  closeModeModalBtn: document.getElementById("close-mode-modal-btn"),
  modeDontShow: document.getElementById("mode-dont-show"),
  modePositionBtn: document.getElementById("mode-position-btn"),
  modeElementBtn: document.getElementById("mode-element-btn"),
  settingClickSound: document.getElementById("setting-click-sound"),
  languageSelector: document.getElementById("language-selector"),
  settingSkipNewRecording: document.getElementById("setting-skip-new-recording"),
  settingSkipDisplayMoves: document.getElementById("setting-skip-display-moves"),
  settingSkipMode: document.getElementById("setting-skip-mode"),
  settingDarkTheme: document.getElementById("setting-dark-theme"),
  supportSurveyModal: document.getElementById("support-survey-modal"),
  supportSurveyTitle: document.getElementById("support-survey-title"),
  supportSurveyCloseBtn: document.getElementById("support-survey-close-btn"),
  surveyStepUseful: document.getElementById("survey-step-useful"),
  surveyStepThankYou: document.getElementById("survey-step-thankyou"),
  surveyStepSorry: document.getElementById("survey-step-sorry"),
  surveyAskLaterBtn: document.getElementById("survey-ask-later-btn"),
  surveyNeverAskBtn: document.getElementById("survey-never-ask-btn"),
  surveyNoBtn: document.getElementById("survey-no-btn"),
  surveyYesBtn: document.getElementById("survey-yes-btn"),
  surveyLaterBtn: document.getElementById("survey-later-btn"),
  surveyStarGithubBtn: document.getElementById("survey-star-github-btn"),
  surveyRateStoreBtn: document.getElementById("survey-rate-store-btn"),
  surveySendEmailBtn: document.getElementById("survey-send-email-btn"),
  surveySorryLaterBtn: document.getElementById("survey-sorry-later-btn"),
  surveySorryNeverAskBtn: document.getElementById("survey-sorry-never-ask-btn")
};

const iconSet = globalThis.clickRepeaterLucideIcons;
