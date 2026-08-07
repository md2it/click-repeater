# GLOSSARY

## Scenario and actions

- **Scenario** — A saved ordered list of recorded actions.
- **Action** — One recorded user interaction in a scenario.
- **Step** — A stored low-level action shown in the Action list.
- **Click action** — An action that presses and releases the primary pointer button.
- **Keyboard action** — A key down or key up action.
- **Pointer movement** — Virtual pointer movement generated before a click when needed.
- **Virtual pointer** — The internal pointer position used by the extension; it does not move the system cursor.
- **Target** — The page location or element used for a click action.
- **Click point** — The final page point where a click is expected to happen.
- **Position mode** — A targeting mode that uses recorded coordinates.
- **Element mode** — A targeting mode that uses a recorded element selector.

## Scenario entry and Manage menu

- **Scenario entry** — One scenario item in the Clicks page list.
- **Scenario row** — The always-visible, non-editable part of a scenario entry with its name, Run button, and Manage button.
- **Manage button** — The button in the scenario row that opens or closes the Manage menu.
- **Manage menu** — The settings panel for one scenario.
- **Manage menu accordion** — The expandable container that holds the Manage menu.
- **Expanded / open** — The state in which a scenario's Manage menu is visible.
- **Collapsed / closed** — The state in which a scenario's Manage menu is hidden.
- **Drag handle** — The control used to reorder scenario entries.
- **Repeat count** — The number of times a scenario runs.
- **Speed** — The scenario setting that changes generated action timing.
- **Default scenario** — The scenario launched by the shortcut, when one is set.

## Modes and views

- **Recording mode** — The mode that records supported actions on the current page into a new scenario.
- **Execution mode** — The mode that runs a saved scenario.
- **Check mode** — The mode that shows the expected action path without running actions.
- **Check overlay** — The page overlay shown in Check mode.
- **Visible mode** — The execution setting that shows the virtual pointer and click effects.
- **Stealth mode** — The execution setting that hides the pointer visualisation and avoids its DOM injection.
- **Action list** — The read-only modal that shows a scenario's recorded steps.
- **Compact step list** — A simplified, user-readable view of recorded steps.
- **Detailed step list** — A view that shows stored low-level steps one by one.

## Application areas

- **Popup window** — The extension window opened from the browser toolbar.
- **Clicks page** — The popup page that contains the Record button and scenario list.
- **Settings page** — The popup page for extension-wide settings.
- **Browser toolbar** — The browser area that contains the extension icon.
- **Origin** — The protocol, domain, and port of a website; a different origin is treated as another site.
