"use strict";

import { showBlockedNotice } from "../page-operability/show-notice.js";
import { restrictedPageNoticeLocale } from "../page-operability/constants.js";
import { executionErrorNoticeText, EXECUTION_NOTICE_MIN_MS, EXECUTION_NOTICE_CONFIG } from "./constants.js";

export async function showExecutionErrorNotice(tabId, kind, windowId) {
  const locale = await restrictedPageNoticeLocale();
  const payload = {
    text: executionErrorNoticeText(kind, locale),
    locale,
    dismissMs: EXECUTION_NOTICE_MIN_MS,
  };
  await showBlockedNotice(tabId, EXECUTION_NOTICE_CONFIG, payload, windowId);
}
