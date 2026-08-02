"use strict";

TestHarness.test("pointer movement path size follows the logarithmic distance formula", () => {
  const distance = 100;
  const expectedPointCount = Math.round(2 + 5 * Math.log2(1 + distance / 10));
  const path = buildHumanPath({ x: 0, y: 0 }, { x: distance, y: 0 });

  TestHarness.assertEqual(path.length, expectedPointCount);
  TestHarness.assert(path.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)));
});
