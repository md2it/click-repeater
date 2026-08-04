# CLICKS PAGE

- Contains:
   - "RECORD" button
   - A vertical list of existing click cards below it

## Each entry

- Displayed in one inline row
- Left-aligned:
   - Drag handle, used for reordering as described in [Sorting](../functional/sorting.md)
   - Lucide play icon, which starts execution mode
   - Repeat field, positioned right after the play icon:
      - Localized "repeat" label, followed by the numeric repeat-count input
      - The label width is adaptive: it fits the localized word for "repeat" in the active language
      - The input width is fixed at 3 characters regardless of language
   - Name as non-clickable text, taking the remaining row space
- Right-aligned:
   - "Manage" button (Lucide `ellipsis-vertical`), which opens the [Manage menu](../ui/manage-menu.md)
   - Has a tooltip as described in [Interface - Tooltips](../ui/common.md#tooltips)
- No mode or visibility indicator icons are shown inline in the row; the current mode and visibility are only shown inside the Manage menu
- No favorite/default control is shown in the row; see [Default](../functional/default.md)
