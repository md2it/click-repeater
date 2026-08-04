# ACTION LIST

- Opened from "Action list" in the [Manage menu](../ui/manage-menu.md) for a scenario entry
- A modal containing only:
   - The scenario's name, read-only
   - The list of recorded steps, read-only
   - A "Show details" toggle below the step list

## Step list

- Content depends on the entry's Mode setting:
   - Position: click positions are listed
   - Element: UI elements to click are listed
- By default, steps are shown in a compact user-readable form:
   - TYPE: grouped text input
   - KEY: single non-text key action
   - HOTKEY: simple keyboard shortcut
   - CLICK: click target based on the current Mode setting
- The compact step list is calculated from saved low-level steps and does not change storage or execution data
- The "Show details" toggle switches to the detailed low-level step view
- The detailed view shows the original stored steps one by one

## Closing

- Close icon
- Click outside the window
- Esc
