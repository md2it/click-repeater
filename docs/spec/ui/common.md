# INTERFACE

- All modal windows:
   - If they do not fit entirely in the popup, they may scroll vertically
   - Can be closed with Esc

## Button colors

- Blue buttons (`btn-primary`, launch button):
   - Blue `#012292` background; white `#fff` icons and text
- White buttons (all other `icon-btn`, `btn`):
   - White/transparent background; dark gray `#4f5570` icons and text
- Exceptions that intentionally differ:
   - "Delete" in the [Manage menu](manage-menu.md): red `#c83232` icon, in both its default and "Sure? Click again to delete" armed state

## Tooltips

- All tooltips are custom; browser-native tooltips (`title`) are not used
- Shown on pointer hover and keyboard focus
- Use one consistent, concise style, are visually separated from the main interface, and provide good readability
- Contain short localized text; a second explanatory line is allowed when needed
- Positioned near the element and remain fully within the popup boundaries
- The "Manage" button on each scenario entry and the compact icon buttons in the [Manage menu](manage-menu.md) follow these rules
