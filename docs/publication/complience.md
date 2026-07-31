# RESPONSES TO MODERATOR QUESTIONS


## Single purpose
Click Repeater records a user-defined sequence of clicks on the current web page and repeats that sequence when the user starts the saved clicks. Users can configure the target mode, visibility, repeat count, and execution speed, and can stop execution at any time. Clicks and preferences are stored locally in the browser. The extension does not collect data, track users, or send page content to any server.

## Permission justification
- `storage`
  Save clicks and preferences locally, including recorded click coordinates and element selectors, click names, repeat counts, execution options, language, theme, and the default. Keep short-lived recording and execution state so the extension can coordinate its popup, background process, and the active page. No data is uploaded or shared.

- `scripting`
  Inject content scripts into the active tab after an explicit user action, and probe whether the extension can operate on the current page when the content script is not yet responding (for example, immediately after a navigation or on a page that loaded before the extension was installed). The probe function runs a minimal operability check and returns a boolean — no page content is read or transmitted.

- `activeTab`
  Grant temporary access to the tab the user is viewing when they invoke the extension (toolbar icon, popup, context menu, command, or start of recording / check / execution). Access is limited to that tab’s origin and is not a permanent host permission for all sites.

- `contextMenus`
  Provide toolbar-context menu entries that open the extension popup on a chosen page (clicks, settings, shortcuts, about).
