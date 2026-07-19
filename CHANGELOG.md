# RELEASE LIST

Regular SemVer logic.

## RELEASES

### 1.2.8
- Centralized content-script injection files and added an extension structure consistency check

### 1.2.7
- Welcome pin hint is positioned from the viewport edge (no fixed inset)

### 1.2.6
- Refactored background to a single modular entry (`app/background/main.js`) for Chrome MV3 and Firefox 121+
- Goal: one complete background load path instead of a short `background.scripts` list plus a longer `sw.js` `importScripts` list
- Fixes Firefox loading a thinner background than Chrome (Welcome, context menu, and related modules were missing from `background.scripts`)
- Declares Firefox minimum version 121.0 to match the service worker + scripts fallback model

### 1.2.5
- Widened Welcome and tightened About copy for small screens

### 1.2.4
- Updated the Welcome page to match About

### 1.2.3
- Refined the About page layout

### 1.2.2
- Delayed Stop button appearance on scenario start to avoid a brief red flash

### 1.2.1
- Refined activity statistics in About

### 1.2.0
- Added optional feedback survey and activity statistics in About

### 1.1.4
- Check mode: visualisation without executing

### 1.1.3
- Add scenario-specific speed setting
- Improve sound setting preview
- Use medium sound volume by default
- Add sound volume levels
- Adjust scenario list indicators
- Keep default clicks in manual order

### 1.1.2
- Added compact step display for recorded keyboard input
- Added detailed step view toggle
- Improved keyboard shortcut display

### 1.1.1
- Added keyboard sound effects
- Renamed Click sound setting to Sound effects

### 1.1.0
- Added recording and playback of keyboard input

### 1.0.7
- Improved execution speed timing calculation

### 1.0.6
- Fixed recording on pages that were already open when the extension was installed

### 1.0.5
- Click sound
- Additional delete button in record card
- RTL menu will be on the left side too
- Execution speeds updated to 0.5×, 1×, 4×, and 10×
- Added a high-speed 10× execution mode
- Execution speed now controls the complete playback pace
- Smoother and more consistent cursor movement
- Improved cursor animation at high execution speeds
- Improved movement trajectory calculation for short and long distances
- Improved click reliability for dynamic and hover-sensitive page elements

### 1.0.4
- Improved click visualization

### 1.0.3
- Rebranded from Macros Repeater to Click Repeater
- Cursor tracker restyled to brand colors with improved UX
- Reduced click offset radius for more precise targeting
- Manifest cleanup: removed redundant background script list
- Localized extension description in manifest for all 7 supported languages

### 1.0.2
- Rounded corners on extension icon

### 1.0.1
- AMO compliance: added Firefox add-on ID and data collection permissions declaration to manifest

### 1.0.0
- Record click sequences on web pages
- Run clicks in Position or Element mode
- Visible and Stealth execution
- Repeat up to 999 times
- Four execution speed settings
- Set one as default and launch it with a shortcut
- Edit, delete, and reorder saved clicks
- Light and dark themes
- Themes
- Settings
