"use strict";

TestHarness.test("recording creates a stable selector for an id and a structural selector without one", () => {
  const fixture = document.createElement("section");
  fixture.innerHTML = "<button id='save:now'>Save</button><ul><li>First</li><li id='second-row'>Second</li></ul>";
  document.body.append(fixture);

  const idTarget = fixture.querySelector("button");
  const structuralTarget = fixture.querySelector("li");
  TestHarness.assertEqual(buildSelector(idTarget), "#save\\:now");
  const structuralSelector = buildSelector(structuralTarget);
  TestHarness.assert(structuralSelector.endsWith("li:nth-of-type(1)"));
  TestHarness.assertEqual(document.querySelector(structuralSelector), structuralTarget);
  TestHarness.assertEqual(buildSelector({}), "");

  fixture.remove();
});

TestHarness.test("editable recording state distinguishes writable fields from unavailable controls", () => {
  const input = document.createElement("input");
  input.value = "draft";
  input.setSelectionRange(1, 4);
  const disabled = document.createElement("input");
  disabled.disabled = true;
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  TestHarness.assertEqual(isTextEditableElement(input), true);
  TestHarness.assertEqual(isTextEditableElement(disabled), false);
  TestHarness.assertEqual(isTextEditableElement(checkbox), false);
  const state = readEditableKeyboardState(input);
  TestHarness.assertEqual(state.value, "draft");
  TestHarness.assertEqual(state.selectionStart, 1);
  TestHarness.assertEqual(state.selectionEnd, 4);
});
