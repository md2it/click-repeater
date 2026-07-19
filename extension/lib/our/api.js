import { SAFE_EXTENSION_API_IGNORED_ERRORS } from "../../app/safe-extension-api-rules.js";
import { createSafeExtensionApi } from "./safe-extension-api.js";

const ext = createSafeExtensionApi(
  typeof browser !== "undefined" ? browser : chrome,
  [
    SAFE_EXTENSION_API_IGNORED_ERRORS,
    globalThis.CLICK_REPEATER_SAFE_EXTENSION_API_IGNORED_ERRORS,
  ],
);

export { ext };
