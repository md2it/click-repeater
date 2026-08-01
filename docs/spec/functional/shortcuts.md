# SHORTCUTS

> [!NOTE]
> These hotkeys exist as a **hidden capability**. The SHORTCUTS page was removed from the UI because without `<all_urls>` the page-side chord does not run on cold pages (it needs a prior user gesture / content-script injection on the tab). We chose mass-user simplicity over advertising advanced shortcuts.

---

## USAGE EXAMPLE
1. The user presses:
   - Mac: `cmd + shift + X`
   - Non-Mac: `ctrl + shift + X`
2. The user releases the keys
3. A badge with a prompt appears
4. The user presses `M` within 3 seconds. After 3 seconds, the timeout expires and the badge resets
5. The default starts, if one is assigned

---

## RULES

- Keyboard layout must not affect shortcut operation. Languages with non-standard layouts may be added
- Letter case must not affect shortcut operation
- Add a shortcut description to the manifest, but do not set suggested keys because prefixes cannot be configured there and Esc would conflict
- `Ctrl+Shift+X` / `⇧⌘X` does not show the badge if the extension cannot run on the current page
- The prefix and action letter work while an input field is focused; the characters may appear in the field

### Shortcut interception
- Listen for `Ctrl+Shift+X` / `⇧⌘X` in the content script after it is injected on the current tab
- Content scripts are injected on explicit user actions (`activeTab`): toolbar icon, popup, context menu, recording/check/execution start, or the optional browser command `clicks-prefix`
- Page shortcuts therefore work on the current origin after the extension has been used on that tab (or after the browser command fires)
- All other shortcuts work only while the extension is active, to avoid blocking other applications
- When using common shortcuts, enable the content listener only while active

---

## DEFAULT SHORTCUTS

### Primary shortcut
- Default: `Ctrl+Shift+X` --> `M`
- Mac: `⇧⌘X` --> `M`

### Esc
- `Esc` = stop -- default for all projects
