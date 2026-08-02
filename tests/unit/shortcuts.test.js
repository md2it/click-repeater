"use strict";

TestHarness.test("shortcut prefix chord matches Shift+X with the platform modifier", () => {
  const mac = isMacPlatform();
  TestHarness.assertEqual(
    isPrefixShortcut(new KeyboardEvent("keydown", {
      code: "KeyX",
      shiftKey: true,
      ctrlKey: !mac,
      metaKey: mac,
    })),
    true,
  );
  TestHarness.assertEqual(
    isPrefixShortcut(new KeyboardEvent("keydown", { code: "KeyX", ctrlKey: !mac, metaKey: mac })),
    false,
  );
  TestHarness.assertEqual(
    isPrefixShortcut(new KeyboardEvent("keydown", {
      code: "KeyY",
      shiftKey: true,
      ctrlKey: !mac,
      metaKey: mac,
    })),
    false,
  );
});

TestHarness.test("shortcut default action accepts M without modifier keys", () => {
  TestHarness.assertEqual(
    isPrefixActionKey(new KeyboardEvent("keydown", { code: "KeyM" })),
    true,
  );
  TestHarness.assertEqual(
    isPrefixActionKey(new KeyboardEvent("keydown", { code: "KeyM", ctrlKey: true })),
    false,
  );
  TestHarness.assertEqual(
    isPrefixActionKey(new KeyboardEvent("keydown", { code: "KeyA" })),
    false,
  );
});

TestHarness.test("shortcut hint activation sends a runtime message to the background", () => {
  globalThis.__clickRepeaterTestMessages.length = 0;
  startWaitingForShortcutAction();
  TestHarness.assertEqual(globalThis.__clickRepeaterTestMessages.length, 1);
  TestHarness.assertEqual(globalThis.__clickRepeaterTestMessages[0].type, "shortcut-prefix-activated");
  stopWaitingForShortcutAction();
});
