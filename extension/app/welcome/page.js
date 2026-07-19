import { WELCOME_SESSION_DATA_KEY } from "./constants.js";
import { bootstrapWelcomePage } from "../../lib/our/welcome/page.js";
import { isRtlLocale } from "../../lib/our/i18n/rtl.js";

void bootstrapWelcomePage({
  sessionDataKey: WELCOME_SESSION_DATA_KEY,
  localeStorageKey: "locale",
  localeUserSelectedKey: "localeUserSelected",
  pinStatusChangedMessageType: "PIN_STATUS_CHANGED",
  watchPinStatusMessageType: "WATCH_PIN_STATUS",
  isRtlLocale
});
