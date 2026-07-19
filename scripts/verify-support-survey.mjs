import assert from "node:assert/strict";
import { createSupportSurveyLogic } from "../extension/lib/our/support-survey/logic.js";

const logic = createSupportSurveyLogic({
  threshold: 25,
  cooldownMs: 60 * 24 * 60 * 60 * 1000,
});

const initial = logic.createDefaultState();
assert.equal(logic.canShow({ ...initial, actionCount: 24 }), false);
assert.equal(logic.canShow({ ...initial, actionCount: 25 }), true);
const deferred = logic.defer({ ...initial, actionCount: 7 });
assert.equal(deferred.actionCount, 7);
assert.equal(deferred.actionCountAtLastDeferral, 7);
assert.equal(logic.canShow(logic.addSuccessfulActions(deferred, 24)), false);
assert.equal(logic.canShow(logic.addSuccessfulActions(deferred, 25)), true);

console.log("support-survey logic checks passed");
