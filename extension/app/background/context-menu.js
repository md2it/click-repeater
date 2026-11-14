import { openMainPopup } from "./execution.js";
import { ext } from "../api.js";
import {
  TRANSLATIONS,
  EN_MESSAGES,
  normalizeLocale,
  LOCALE_STORAGE_KEY,
} from "../i18n.js";
import { isRtlLocale } from "../i18n/rtl.js";

const CONTEXT_MENU_CLICKS = "clicks";
const CONTEXT_MENU_COMPOSITES = "composites";
const CONTEXT_MENU_SETTINGS = "settings";
const CONTEXT_MENU_ABOUT = "about";
const CONTEXT_MENU_RECOMMEND = "recommend";

const CONTEXT_MENU_EMOJI = {
  clicks: "▶️",
  composites: "▶▶▶▶",
  settings: "⚙️",
  about: "ℹ️",
  recommend: "❤️",
};

const CONTEXT_MENU_NAV_KEYS = {
  clicks: "navClicks",
  composites: "navComposites",
  settings: "navSettings",
  about: "navAbout",
  recommend: "navRecommend",
};

function contextMenuTitle(id, locale) {
  const strings = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
  const label = strings[CONTEXT_MENU_NAV_KEYS[id]] ?? EN_MESSAGES[CONTEXT_MENU_NAV_KEYS[id]];
  const emoji = CONTEXT_MENU_EMOJI[id];
  return isRtlLocale(locale) ? `${label} ${emoji}` : `${emoji} ${label}`;
}

async function getStoredLocale() {
  try {
    const data = await ext.storage.local.get(LOCALE_STORAGE_KEY);
    return normalizeLocale(data?.[LOCALE_STORAGE_KEY]) ?? "en";
  } catch {
    return "en";
  }
}

async function createContextMenuItem(props) {
  try {
    await ext.contextMenus.create(props);
  } catch (err) {
    console.error("[Click Repeater] contextMenus.create failed:", err, props);
  }
}

let ensureContextMenuChain = Promise.resolve();

function ensureContextMenu() {
  ensureContextMenuChain = ensureContextMenuChain.then(async () => {
    const locale = await getStoredLocale();
    try {
      await ext.contextMenus.removeAll();
    } catch (err) {
      console.error("[Click Repeater] contextMenus.removeAll failed:", err);
    }
    for (const id of [CONTEXT_MENU_CLICKS, CONTEXT_MENU_COMPOSITES, CONTEXT_MENU_SETTINGS, CONTEXT_MENU_ABOUT, CONTEXT_MENU_RECOMMEND]) {
      await createContextMenuItem({
        id,
        title: contextMenuTitle(id, locale),
        contexts: ["action"],
      });
    }
  });
  return ensureContextMenuChain;
}

void ensureContextMenu();

ext.runtime.onInstalled.addListener(() => {
  void ensureContextMenu();
});

ext.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && LOCALE_STORAGE_KEY in changes) {
    void ensureContextMenu();
  }
});

ext.contextMenus.onClicked.addListener((info, tab) => {
  const page = info.menuItemId;
  if (page === CONTEXT_MENU_CLICKS || page === CONTEXT_MENU_COMPOSITES || page === CONTEXT_MENU_SETTINGS ||
      page === CONTEXT_MENU_ABOUT || page === CONTEXT_MENU_RECOMMEND) {
    void openMainPopup(tab?.id, tab?.windowId, page);
  }
});
