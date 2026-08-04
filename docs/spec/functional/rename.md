# RENAME

- Opened from "Rename" in the [Manage menu](../ui/manage-menu.md) for a scenario entry
- A small modal containing only:
   - A single name field, prefilled with the entry's current name
   - The field receives focus immediately when the modal opens, with its content selected
   - Save button
   - Cancel button
- Save:
   - Applies the new name to the entry
   - Requires a non-empty name, following the same validation as other name entry in the extension
   - Closes the modal
- Cancel:
   - Discards the change
   - Closes the modal
- Closing:
   - Close icon
   - Save and Cancel button actions
   - Click outside the window
   - Esc
