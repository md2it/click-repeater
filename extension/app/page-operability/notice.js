"use strict";
import { showBlockedNotice } from "./show-notice.js";
import { restrictedPageNoticeLocale, restrictedPageNoticeText, RESTRICTED_NOTICE_MIN_MS, RESTRICTED_NOTICE_CONFIG } from "./constants.js";

export async function showRestrictedNotice(tabId, windowId) {
  const locale = await restrictedPageNoticeLocale();
  const payload = {
    text: restrictedPageNoticeText(locale),
    locale,
    dismissMs: RESTRICTED_NOTICE_MIN_MS,
  };
  await showBlockedNotice(tabId, RESTRICTED_NOTICE_CONFIG, payload, windowId);
}
