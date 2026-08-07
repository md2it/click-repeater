"use strict";

TestHarness.test("scenario speed accepts only the documented multipliers and scales all click timings", () => {
  TestHarness.assertEqual(normalizeExecutionSpeed(4), 4);
  TestHarness.assertEqual(normalizeExecutionSpeed("0.5"), 0.5);
  TestHarness.assertEqual(normalizeExecutionSpeed(1.5), 1.5);
  TestHarness.assertEqual(normalizeExecutionSpeed("1.5"), 1.5);
  TestHarness.assertEqual(normalizeExecutionSpeed(3), 1);
  TestHarness.assertEqual(normalizeExecutionSpeed(0), 1);

  const fast = getExecutionSpeedProfile(4);
  TestHarness.assertEqual(fast.moveIntervalMs, 4);
  TestHarness.assertEqual(fast.beforeDownMs, 50);
  TestHarness.assertEqual(fast.holdMs, 50);
  TestHarness.assertEqual(fast.afterUpMs, 1);
  TestHarness.assertEqual(fast.stepMs, 25);

  const slow = getExecutionSpeedProfile(0.5);
  TestHarness.assertEqual(slow.beforeDownMs, 400);
  TestHarness.assertEqual(slow.stepMs, 200);
});

TestHarness.test("execution rejects unusable saved actions and preserves valid click and keyboard details", () => {
  TestHarness.assertEqual(normalizeExecutionAction("   "), null);
  TestHarness.assertEqual(normalizeExecutionAction({ type: "click", target: "" }), null);
  TestHarness.assertEqual(normalizeExecutionAction({ type: "keydown", key: "", code: "" }), null);

  const click = normalizeExecutionAction({
    type: "click",
    target: "  #pay-now  ",
    targetMode: "element",
    frameId: 3,
    documentId: "document-7"
  });
  TestHarness.assertEqual(click.target, "#pay-now");
  TestHarness.assertEqual(click.targetMode, "element");
  TestHarness.assertEqual(click.frameId, 3);

  const key = normalizeExecutionAction({
    type: "keydown",
    key: "a",
    code: "KeyA",
    shiftKey: 1,
    targetSelector: "  #comment  ",
    editState: { kind: "unknown", value: 42, selectionStart: 1.5 }
  });
  TestHarness.assertEqual(key.shiftKey, true);
  TestHarness.assertEqual(key.targetSelector, "#comment");
  TestHarness.assertEqual(key.editState.kind, "form-field");
  TestHarness.assertEqual(key.editState.value, "");
  TestHarness.assertEqual(key.editState.selectionStart, null);
});

TestHarness.test("recorded coordinate targets are parsed strictly and kept inside the viewport", () => {
  const point = parseCoordinateStep(" -10 , 999999 ");
  TestHarness.assertEqual(point.x, 2);
  TestHarness.assertEqual(point.y, Math.max(2, window.innerHeight - 2));
  TestHarness.assertEqual(parseCoordinateStep("12.5, 4"), null);
  TestHarness.assertEqual(parseCoordinateStep("12; 4"), null);
  TestHarness.assertEqual(parseCoordinateStep(null), null);
});
