# COMPOSITE SCENARIOS

A composite scenario runs an ordered list of simple scenarios and pauses. A simple scenario is a recording of actions with its own name and playback settings.

---

## Page and cards

- The user reorders complex scenarios by dragging their handles within the top-level list. The order is saved. Nested scenarios and pauses can only be reordered within their own list

- The popup has a separate Composite scenarios page alongside the existing [Clicks page](records.md)
- The menu uses the Lucide `circle-chevrons-right` icon
- The create button appears above the explanation and list. It adds an empty composite scenario and opens its card for naming and adding items
- The collapsed card shows Play, the name, and the expand control. Play is grey and disabled when the list is empty
- Clicking outside an expanded card collapses it. Its nested items and controls count as part of the card
- The expanded card shows the editable name with a delete button, the ordered list, and the add controls. Horizontal separators distinguish the visible blocks. When the list is empty, the add controls follow the name field
- A centered explanation above the list uses the current scenario name and describes playback order. An empty list shows guidance about adding simple scenarios and pauses in its place
- Simple scenario cards reuse the [Clicks page entry](records.md) and [Manage menu](../ui/manage-menu.md), including individual playback, Check, Action list, settings, renaming, and deletion
- A nested card opens within its parent without collapsing the composite card. It also offers Duplicate, which inserts an independent copy immediately after the original in the saved order. Each duplicate adds `↳ ` to the current name, which remains editable. Its steps and settings are copied from the original
- Simple scenarios and pauses share one list and can be reordered together using [drag-and-drop](../functional/sorting.md). The saved order is restored when the popup reopens

---

## Adding a simple scenario

The localized Add label is centered on its own line above three compact secondary controls: New scenario, Existing scenario, and Pause. The controls wrap when needed. New scenario opens the recording flow. Existing scenario opens the picker.

- Recording uses the existing [recording flow](../functional/mode-record.md), including its naming and playback defaults. A successful recording is saved to the end of the composite that started the recording. An unsuccessful recording adds no item
- The picker first shows saved entries from the Clicks page in their current order. It then shows simple scenarios from other composites in their displayed order, following each composite's item order
- The picker keeps the first occurrence of each distinct combination of name, full ordered steps, and all per-scenario settings, including repeat count, speed, targeting mode, and visibility. Card identity, source, and list position do not affect equality
- Deleted entries are absent. An independently saved copy remains eligible even after its source is deleted
- Selecting an entry appends a copy of its name, steps, and settings. Selecting it again appends another independent copy. Editing, moving, or deleting any copy affects only that card and its containing list

---

## Pauses

- The Pause button appends a pause. A composite can contain multiple pauses in any position, including consecutive pauses
- A pause uses the height of a collapsed simple scenario card. It has a drag handle, a grey non-interactive clock in the Play slot, an editable duration, and an expand control
- The duration label and input share a stretching rounded field styled like Repeat
- The localized label and numeric input share one row. The label is a single string such as “Пауза (сек)” or “Pause (sec)”, aligned opposite the input. The duration is shown as a number in the field
- The expanded pause shows Duplicate on the left and Delete on the right. Duplicate inserts an independent copy directly below the original. See [Pause](../functional/pause.md) for duration and execution rules

---

## Playback

1. Play starts at the first item and follows the saved list order
2. Each simple scenario completes all of its configured repeats at its configured speed before playback advances. A pause waits for its configured duration before playback advances
3. Playback completes after the last item, including any trailing pause

- The time remaining covers the active item and all following items, including pauses and all configured repeats. Display it as an estimate when action timing is variable
- Opening or closing the popup during composite playback leaves the run active. While open, the popup shows Stop above the time estimate and the list
- Playback, recording, and Check controls are unavailable for the duration of the run, including during pauses
- The toolbar badge shows the remaining repeat cycles across the composite as described in [Browser toolbar elements](../ui/browser-panel.md#badge)
- Stop follows the existing [execution stop rules](../functional/mode-execute.md). Stopping during a pause cancels the wait and ends the run immediately. After any stop, no further item starts
- The existing execution rules for target failures and tab navigation apply to the whole run. If a child run stops or fails, the composite ends with the same outcome. On same-origin navigation, playback resumes from the current position after page load
- Starting an individual nested scenario uses its normal playback flow and plays only that scenario

---

## Acceptance cases

- Expand a pause and duplicate it. Its copy appears immediately below it. Editing the copy leaves the original duration intact, and both can be reordered with scenarios

- Duplicate an item in the middle of the list and verify that the copy appears immediately below the original. Duplicate that copy and verify that the result has two `↳ ` prefixes. Changes to either copy leave the original intact

- Add the same simple scenario twice, change one copy's name, speed, and repeat count, then delete the source. Both copies remain and play with their own settings
- Open the picker with identical entries in the Clicks page and other composites. Only the earliest occurrence is shown. Entries that differ in one setting remain separately selectable
- Record from an expanded composite and verify that the new card appears at the end of that composite. Reopen the popup and verify that the card and order persist
- Reorder two simple scenarios and two pauses, reopen the popup, and run the composite. Playback follows the saved order and finishes every repeat and pause
- Reopen the popup during playback and verify that the run continues and the estimate and Stop control are visible
- Run a composite with more than 999 cycles. Verify that the badge shows `…` until the remainder reaches 999, then shows the exact count
- During a pause, verify that the remaining time includes later items. Stop the run and verify that the next item never starts
- Open an empty composite and verify that Play is disabled and the add controls follow Name

---

## Decisions to confirm

- Recording from a composite is described above as saving only into that composite. Confirm whether it should also create a separate entry on the Clicks page
- Confirm whether a list containing only pauses can run. The empty-list rule above disables Play only when there are no items
- Confirm how to delete a composite. A page-level card menu could use the existing two-click delete confirmation and remove the composite together with its items
