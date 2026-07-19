import { ext } from "../../lib/our/api.js";
import {
  ARROW_UP,
  CHART_COLUMN_INCREASING,
  HEART,
  INFO,
  PIN,
  PUZZLE,
  SHIELD_CHECK,
  SQUARE_CHECK,
  TERMINAL,
} from "../../lib/vendor/icons/index.js";
import {
  LOCALES,
  LOCALE_LABELS,
  TRANSLATIONS,
  EN_MESSAGES,
  normalizeLocale,
} from "../i18n.js";
import { isRtlLocale } from "../../lib/our/i18n/rtl.js";
import { welcomeStepIcon } from "../../lib/our/welcome/step-icon.js";

/** Extension logo — project-specific, not a shared Lucide icon. */
const WELCOME_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Click Repeater"><rect width="24" height="24" rx="3" fill="#012292"/><g fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/></g></svg>';

const WELCOME_GITHUB_URL = "https://github.com/md2it/browser-extension-click-repeater";

const WELCOME_ABOUT_SECTION_ICONS = {
  overview: INFO,
  capabilities: SQUARE_CHECK,
  privacy: SHIELD_CHECK,
  code: TERMINAL,
  statistics: CHART_COLUMN_INCREASING,
};

export async function getLocaleForWelcome() {
  try {
    const data = await ext.storage.local.get("locale");
    return normalizeLocale(data?.locale) ?? "en";
  } catch {
    return "en";
  }
}

function buildWelcomeLocalePayload(locale) {
  function tl(key) {
    return TRANSLATIONS[locale]?.[key] ?? EN_MESSAGES[key] ?? key;
  }
  return {
    locale,
    dir: isRtlLocale(locale) ? "rtl" : "ltr",
    headerSubtitle: tl("panelSubtitle"),
    pinHeading: tl("welcomePin"),
    pinStep1: tl("welcomePinStep1"),
    pinStep2: tl("welcomePinStep2"),
    pinStep3: tl("welcomePinStep3"),
    aboutSections: [
      { heading: tl("aboutOverviewHeading"), iconHtml: WELCOME_ABOUT_SECTION_ICONS.overview, items: [{ text: tl("aboutOverview") }] },
      { heading: tl("aboutCapabilitiesHeading"), iconHtml: WELCOME_ABOUT_SECTION_ICONS.capabilities, items: ["aboutRecordsClicks", "aboutRepeatsClicks", "aboutPositionMode", "aboutVisualisation", "aboutRepeats", "aboutSpeed", "aboutDefaultShortcut"].map((key) => ({ text: tl(key) })) },
      { heading: tl("aboutPrivacyHeading"), iconHtml: WELCOME_ABOUT_SECTION_ICONS.privacy, items: ["noNetwork", "noCollection"].map((key) => ({ text: tl(key) })) },
      { heading: tl("aboutCodeHeading"), iconHtml: WELCOME_ABOUT_SECTION_ICONS.code, items: [{ text: tl("codeOnGithub"), href: WELCOME_GITHUB_URL }, { text: tl("credits") }] },
      { heading: tl("aboutStatisticsHeading"), iconHtml: WELCOME_ABOUT_SECTION_ICONS.statistics, items: [{ text: tl("aboutScenarioRuns").replace("{count}", "0") }] }
    ],
    aboutFooter: { productName: "Click Repeater", author: "md2it" },
    langAriaLabel: tl("language")
  };
}

export function buildWelcomeData(locale, extensionName, options) {
  const isPinned = options?.isPinned === true;
  const perLocale = Object.fromEntries(
    LOCALES.map((code) => [code, buildWelcomeLocalePayload(code)])
  );
  const current = perLocale[locale];
  return {
    extensionName,
    locale,
    dir: current.dir,
    headerLogoSvg: WELCOME_ICON_SVG,
    headerTitle: "CLICK REPEATER",
    headerSubtitle: current.headerSubtitle,
    iconSvg: WELCOME_ICON_SVG,
    pinHeading: current.pinHeading,
    pinStep1: current.pinStep1,
    pinStep2: current.pinStep2,
    pinStep3: current.pinStep3,
    puzzleIcon: welcomeStepIcon(PUZZLE),
    pinIcon: welcomeStepIcon(PIN),
    arrowUpIcon: welcomeStepIcon(ARROW_UP, 84),
    pinHintIcon: welcomeStepIcon(PIN, 48),
    heartIcon: welcomeStepIcon(HEART, 56),
    isPinned,
    aboutSections: current.aboutSections,
    aboutFooter: current.aboutFooter,
    hasAbout: true,
    hasLocales: true,
    locales: [...LOCALES],
    localeLabels: LOCALE_LABELS,
    langAriaLabel: current.langAriaLabel,
    perLocale
  };
}
