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
  renameClickId: null,
  actionListClickId: null,
  showDetailedSteps: false,
  manageMenuClickId: null,
  manageMenuEl: null,
  manageMenuDeleteArmed: false,
  pendingDisplayMovesClickId: null,
  pendingModeClickId: null,
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
  renameModal: document.getElementById("rename-modal"),
  closeRenameModalBtn: document.getElementById("close-rename-modal-btn"),
  renameNameField: document.getElementById("rename-name-field"),
  renameName: document.getElementById("rename-name"),
  clearRenameNameBtn: document.getElementById("clear-rename-name-btn"),
  saveRenameBtn: document.getElementById("save-rename-btn"),
  cancelRenameBtn: document.getElementById("cancel-rename-btn"),
  actionListModal: document.getElementById("action-list-modal"),
  actionListModalTitle: document.getElementById("action-list-modal-title"),
  closeActionListModalBtn: document.getElementById("close-action-list-modal-btn"),
  actionListSteps: document.getElementById("action-list-steps"),
  actionListDetailRow: document.getElementById("action-list-detail-row"),
  actionListDetail: document.getElementById("action-list-detail"),
  actionListDetailLabel: document.getElementById("action-list-detail-label"),
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
