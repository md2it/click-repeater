# MANAGE MENU

- Opened from the "Manage" button (Lucide `ellipsis-vertical`) on a scenario entry, described in [Records page](../pages/records.md)
- Expands as an additional panel directly below that entry's row, inside the same list item, pushing subsequent entries down
   - It is not a floating overlay: it never covers other entries and is never positioned away from the entry it belongs to
   - Its width always matches the row above it; it never extends past the popup's left or right edge
- Only one entry's panel can be open at a time; opening the panel on another entry, or on the same entry's button again, collapses any panel that is already open
- The panel collapses on: choosing an action that doesn't keep it open, clicking outside the panel, Esc, and when the popup's active state changes (recording, check, or execution starting)

## Contents, top to bottom, one item per line

1. "Speed" control
   - Same values and default as described in [Speed](../functional/speed.md)
2. "Rename" button
   - Opens the [Rename](../functional/rename.md) modal
3. "Look without run" button
   - Starts check mode for this entry, as described in [Check mode](../functional/mode-check.md)
4. "Action list" button
   - Opens the [Action list](../functional/action-list.md) modal
5. Visible / Stealth drop-down
   - Two options, same behavior and defaults as described in [Visualisation](../functional/visualisation.md)
6. Position / Element drop-down
   - Two options, same behavior and defaults as described in [Actions](../functional/actions.md)
7. "Delete" button
   - Red text
   - First click changes the text to "Confirm deletion"
   - A second click, while the text reads "Confirm deletion", deletes the entry
   - Moving focus/hover away from the button while armed reverts it to "Delete"

## Sizing

- Every item is exactly one line; text never wraps
- The panel's width is the row's width; items lay out within it and never force horizontal scrolling
- The panel never scrolls, in either direction
