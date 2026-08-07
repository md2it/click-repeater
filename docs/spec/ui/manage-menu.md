# MANAGE MENU

- Opened from the "Manage" button (Lucide `ellipsis-vertical`) on a scenario entry, described in [Records page](../pages/records.md)
- Expands as an additional panel directly below that entry's row, inside the same list item, pushing subsequent entries down
   - It is not a floating overlay: it never covers other entries and is never positioned away from the entry it belongs to
   - Its width always matches the row above it; it never extends past the popup's left or right edge
- Only one entry's panel can be open at a time; opening the panel on another entry, or on the same entry's button again, collapses any panel that is already open
- The panel collapses on: choosing an action that doesn't keep it open, clicking outside the panel, Esc, and when the popup's active state changes (recording, check, or execution starting)

## Contents

1. "Name" field
   - The first field and full width of both menu columns
   - Shows and edits the scenario name
   - Every typed change immediately updates the scenario row and is saved
   - Opening an existing scenario does not focus this field
   - Opening a newly recorded scenario focuses this field and selects its name
2. Left column, top to bottom
   1. "Repeat" control
   2. "Speed" control
   3. Visible / Stealth drop-down
   4. Position / Element drop-down
3. Right column
   - Top to bottom: "Look without run" button, then "Action list" button
   - "Delete" button is aligned to the bottom of the column
   - "Look without run" starts check mode for this entry, as described in [Check mode](../functional/mode-check.md)
   - "Action list" opens the [Action list](../functional/action-list.md) modal
   - "Delete" uses red text
   - First click changes the text to "Confirm deletion"
   - A second click, while the text reads "Confirm deletion", deletes the entry
   - Moving focus/hover away from the button while armed reverts it to "Delete"

### Field details

- "Speed" control:
   - Same values and default as described in [Speed](../functional/speed.md)
- Visible / Stealth drop-down:
   - Two options, same behavior and defaults as described in [Visualisation](../functional/visualisation.md)
- Position / Element drop-down:
   - Two options, same behavior and defaults as described in [Actions](../functional/actions.md)

## Sizing

- Every item is exactly one line; text never wraps
- The panel's width is the row's width; items lay out within it and never force horizontal scrolling
- The panel never scrolls, in either direction
