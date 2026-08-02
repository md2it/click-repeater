"use strict";

TestHarness.test("saved keyboard action restores selection and replaces it with typed text", () => {
  const input = document.createElement("input");
  input.id = "playback-field";
  input.value = "hello";
  document.body.append(input);
  const inputTypes = [];
  input.addEventListener("input", (event) => inputTypes.push(event.inputType));

  dispatchKeyboardAction({
    type: "keydown",
    key: "X",
    code: "KeyX",
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: true,
    location: 0,
    repeat: false,
    isComposing: false,
    targetSelector: "#playback-field",
    editState: { kind: "form-field", value: "hello", selectionStart: 1, selectionEnd: 4 }
  });

  TestHarness.assertEqual(input.value, "hXo");
  TestHarness.assertEqual(input.selectionStart, 2);
  TestHarness.assertEqual(inputTypes.join(","), "insertText");
  input.remove();
});

TestHarness.test("saved delete action removes the selected text and emits the browser input contract", () => {
  const input = document.createElement("input");
  input.id = "delete-field";
  input.value = "abcdef";
  document.body.append(input);
  let inputType = "";
  input.addEventListener("input", (event) => { inputType = event.inputType; });

  dispatchKeyboardAction({
    type: "keydown", key: "Backspace", code: "Backspace", targetSelector: "#delete-field",
    altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, location: 0, repeat: false,
    isComposing: false, editState: { kind: "form-field", value: "abcdef", selectionStart: 2, selectionEnd: 5 }
  });

  TestHarness.assertEqual(input.value, "abf");
  TestHarness.assertEqual(input.selectionStart, 2);
  TestHarness.assertEqual(inputType, "deleteContentBackward");
  input.remove();
});

TestHarness.test("recording listeners send click and keyboard data once while recording is active", () => {
  globalThis.__clickRepeaterTestMessages.length = 0;
  const input = document.createElement("input");
  input.id = "recording-field";
  input.value = "note";
  input.setSelectionRange(4, 4);
  document.body.append(input);

  startRecordingListeners();
  input.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 24, clientY: 36 }));
  input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a", code: "KeyA" }));
  stopRecordingListeners();
  input.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 1, clientY: 1 }));

  TestHarness.assertEqual(globalThis.__clickRepeaterTestMessages.length, 2);
  const [click, keyboard] = globalThis.__clickRepeaterTestMessages;
  TestHarness.assertEqual(click.type, "recording-click");
  TestHarness.assertEqual(click.selector, "#recording-field");
  TestHarness.assertEqual(keyboard.type, "recording-keyboard");
  TestHarness.assertEqual(keyboard.editState.value, "note");
  input.remove();
});
