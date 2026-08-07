# MANAGE MENU

- Opened from the "Manage" button (Lucide `ellipsis-vertical`) on a scenario entry, described in [Records page](../pages/records.md)
- Expands as an additional panel directly below that entry's row, inside the same list item, pushing subsequent entries down
   - It is not a floating overlay: it never covers other entries and is never positioned away from the entry it belongs to
   - Its width always matches the row above it; it never extends past the popup's left or right edge
- Only one entry's panel can be open at a time; opening the panel on another entry, or on the same entry's button again, collapses any panel that is already open
- The panel collapses on: choosing an action that doesn't keep it open, clicking outside the panel, Esc, and when the popup's active state changes (recording, check, or execution starting)

---

## Contents

1. "Name" field
   - The first field and full width of both menu columns
   - Shows and edits the scenario name
   - Every typed change immediately updates the scenario row and is saved
   - Opening an existing scenario does not focus this field
   - Opening a newly recorded scenario focuses this field and selects its name
2. Two columns under the name field, one field each
   1. Left: "Repeat" control
   2. Right: "Speed" control
3. Compact icon row under the two fields
   - Secondary actions are icon-only buttons (Lucide), inline, one shared style
   - Left group, left to right:
      1. "View on screen without running" (`waypoints`)
      2. "Action list" (`list-ordered`)
      3. Visible / Stealth toggle (`eye` when visible, `eye-off` when stealth)
      4. Position / Element toggle (`locate` for position, `search-code` for element)
   - Right edge: "Delete" (`trash-2`), red
   - Every compact button has a standard black tooltip with localized text (existing strings: view on screen without running, action list, visible/stealth, position/element, delete / sure? click again to delete)
   - "View on screen without running" starts check mode for this entry, as described in [Check mode](../functional/mode-check.md)
   - "Action list" opens the [Action list](../functional/action-list.md) modal
   - Visible / Stealth and Position / Element:
      - If the matching explanation modal is not skipped in settings, a click opens that modal and the change is made there
      - If the explanation is skipped, a click toggles the setting immediately
   - "Delete":
      - First click arms the button (tooltip and accessible name become "Sure? Click again to delete", red armed look)
      - A second click while armed deletes the entry
      - Moving focus/hover away from the button while armed reverts it to "Delete"

### Field details

- "Speed" control:
   - Same values and default as described in [Speed](../functional/speed.md)
- Visible / Stealth:
   - Two options, same behavior and defaults as described in [Visualisation](../functional/visualisation.md)
- Position / Element:
   - Two options, same behavior and defaults as described in [Actions](../functional/actions.md)

---

## Sizing

- Every item is exactly one line; text never wraps
- The panel's width is the row's width; items lay out within it and never force horizontal scrolling
- The panel never scrolls, in either direction
