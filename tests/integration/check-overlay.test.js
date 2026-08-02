"use strict";

TestHarness.test("check mode groups consecutive actions at one point and does not trigger page clicks", () => {
  let pageClicks = 0;
  const pageTarget = document.createElement("button");
  pageTarget.addEventListener("click", () => { pageClicks += 1; });
  document.body.append(pageTarget);

  const result = renderCheckOverlay({
    clickId: "saved-scenario",
    steps: [
      { type: "click", target: "20, 20", targetMode: "position" },
      { type: "click", target: "20, 20", targetMode: "position" },
      { type: "keydown", key: "a", code: "KeyA" },
      { type: "keyup", key: "a", code: "KeyA" },
      { type: "click", target: "80, 20", targetMode: "position" }
    ]
  });

  const overlay = document.getElementById("__click_repeater_check_overlay");
  const labels = Array.from(overlay.querySelectorAll("div > span:last-child")).map((label) => label.textContent);
  TestHarness.assertEqual(result.renderedCount, 3);
  TestHarness.assertEqual(labels.join(","), "1-2,3-4,5");
  TestHarness.assertEqual(pageClicks, 0);

  removeCheckOverlay();
  pageTarget.remove();
});
