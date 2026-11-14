const menuIcons = {
  clicks: iconSet.play,
  composites: globalThis.clickRepeaterProjectIcons.circleChevronsRight,
  settings: iconSet.settings,
  about: iconSet.info,
  recommend: iconSet.heartHandshake
};

for (const button of refs.menuButtons) {
  button.innerHTML = menuIcons[button.dataset.page] ?? "";
}

for (const icon of document.querySelectorAll("[data-about-icon]")) {
  icon.innerHTML = iconSet[icon.dataset.aboutIcon] ?? "";
}

for (const button of document.querySelectorAll(".modal-close-btn")) {
  button.innerHTML = iconSet.x;
}


function renderLanguageSelector() {
  refs.languageSelector.replaceChildren();
  for (const locale of LOCALES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "language-btn";
    button.dataset.locale = locale;
    button.textContent = LOCALE_LABELS[locale];
    button.classList.toggle("active", locale === currentLocale);
    button.setAttribute("aria-pressed", String(locale === currentLocale));
    refs.languageSelector.append(button);
  }
}

function syncPopupLocale() {
  applyTranslations();
  void refreshSupportSurveyAboutStatistic();
  const menuKeys = {
    clicks: "navClicks",
    composites: "navComposites",
    settings: "navSettings",
    about: "navAbout",
    recommend: "navRecommend"
  };
  for (const button of refs.menuButtons) {
    const label = t(menuKeys[button.dataset.page]);
    button.dataset.tooltip = label;
    button.setAttribute("aria-label", label);
  }
  refs.list.setAttribute("aria-label", t("clicksList"));
  refs.languageSelector.setAttribute("aria-label", t("language"));
  globalThis.syncRecommendPage?.();
  renderLanguageSelector();
  render();
  syncPopupHeight();
}

refs.languageSelector.addEventListener("click", async (event) => {
  const button = event.target.closest(".language-btn");
  if (!button?.dataset.locale) return;
  await selectLocale(button.dataset.locale);
  syncPopupLocale();
  if (state.activeExecutionClickId === null) setStatus("");
});

function selectPopupPage(pageName) {
  for (const page of refs.pages) {
    page.classList.toggle("hidden", page.dataset.pageContent !== pageName);
  }

  for (const button of refs.menuButtons) {
    const active = button.dataset.page === pageName;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  }

  const playbackStatus = document.getElementById("playback-status");
  if (pageName === "clicks") {
    refs.recordBtn.after(playbackStatus);
  } else if (pageName === "composites") {
    createCompositeBtn.after(playbackStatus);
  } else {
    playbackStatus.parentElement.closest(".popup-content").prepend(playbackStatus);
  }
  syncPlaybackStatusVisibility();
  syncPopupHeight();
}

const LAST_POPUP_PAGE_KEY = "last_popup_page";
const validPopupPages = new Set(Array.from(refs.menuButtons, (button) => button.dataset.page));
const requestedPopupPage = new URLSearchParams(location.search).get("page");
const explicitPopupPage = validPopupPages.has(requestedPopupPage) ? requestedPopupPage : null;
let chosePopupPage = false;

function rememberPopupPage(pageName) {
  selectPopupPage(pageName);
  void ext.storage.local.set({ [LAST_POPUP_PAGE_KEY]: pageName }).catch(() => {});
}

refs.menu.addEventListener("click", (event) => {
  const page = event.target.closest(".popup-menu-btn")?.dataset.page;
  if (!validPopupPages.has(page)) return;

  chosePopupPage = true;
  rememberPopupPage(page);
});

async function restorePopupPage() {
  if (explicitPopupPage) {
    rememberPopupPage(explicitPopupPage);
    return;
  }

  const data = await ext.storage.local.get(LAST_POPUP_PAGE_KEY).catch(() => ({}));
  if (chosePopupPage) return;

  const savedPage = data?.[LAST_POPUP_PAGE_KEY];
  selectPopupPage(validPopupPages.has(savedPage) ? savedPage : "clicks");
}
