"use strict";

TestHarness.test("pointer movement path size follows the logarithmic distance formula", () => {
  const distance = 100;
  const expectedPointCount = Math.round(2 + 5 * Math.log2(1 + distance / 10));
  const path = buildHumanPath({ x: 0, y: 0 }, { x: distance, y: 0 });

  TestHarness.assertEqual(path.length, expectedPointCount);
  TestHarness.assert(path.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)));
});

TestHarness.test("pointer movement path is deterministic for the same endpoints", () => {
  const start = { x: 12, y: 40 };
  const end = { x: 220, y: 180 };
  const first = buildHumanPath(start, end);
  const second = buildHumanPath(start, end);

  TestHarness.assertEqual(first.length, second.length);
  for (let index = 0; index < first.length; index += 1) {
    TestHarness.assertEqual(first[index].x, second[index].x);
    TestHarness.assertEqual(first[index].y, second[index].y);
  }
});
