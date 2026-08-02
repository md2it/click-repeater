"use strict";

TestHarness.test("support survey shows only after the configured successful-action threshold", () => {
  const logic = createSupportSurveyLogic({
    threshold: 25,
    cooldownMs: 60 * 24 * 60 * 60 * 1000,
  });
  const initial = logic.createDefaultState();

  TestHarness.assertEqual(logic.canShow({ ...initial, actionCount: 24 }), false);
  TestHarness.assertEqual(logic.canShow({ ...initial, actionCount: 25 }), true);
});

TestHarness.test("support survey deferral resets the threshold anchor without resetting the cumulative counter", () => {
  const logic = createSupportSurveyLogic({
    threshold: 25,
    cooldownMs: 60 * 24 * 60 * 60 * 1000,
  });
  const initial = logic.createDefaultState();
  const deferred = logic.defer({ ...initial, actionCount: 7 });

  TestHarness.assertEqual(deferred.actionCount, 7);
  TestHarness.assertEqual(deferred.actionCountAtLastDeferral, 7);
  TestHarness.assertEqual(logic.canShow(logic.addSuccessfulActions(deferred, 24)), false);
  TestHarness.assertEqual(logic.canShow(logic.addSuccessfulActions(deferred, 25)), true);
});

TestHarness.test("support survey respects never ask, completed, and cooldown gates", () => {
  const logic = createSupportSurveyLogic({
    threshold: 25,
    cooldownMs: 60 * 24 * 60 * 60 * 1000,
  });
  const base = {
    actionCount: 25,
    actionCountAtLastDeferral: 0,
    neverAsk: false,
    completed: false,
    lastShownAt: null,
  };
  const now = Date.now();

  TestHarness.assertEqual(logic.canShow({ ...base, neverAsk: true }), false);
  TestHarness.assertEqual(logic.canShow({ ...base, completed: true }), false);
  TestHarness.assertEqual(
    logic.canShow({ ...base, lastShownAt: now - 1000 }, now),
    false,
  );
  TestHarness.assertEqual(
    logic.canShow(
      { ...base, lastShownAt: now - 60 * 24 * 60 * 60 * 1000 - 1000 },
      now,
    ),
    true,
  );
});
