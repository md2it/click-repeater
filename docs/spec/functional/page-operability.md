# PAGE OPERABILITY

---

## CHECK

- Follow the `element-deleter` logic
- Reuse `../lib/our/page-operability`
- Check the active tab when the extension icon is clicked and when launch is requested by shortcut
- Check again immediately before recording or executing
- A check failure, content-script injection failure, or communication failure means the page is unavailable
- State is determined separately for each tab and is not cached after navigation to another page
- Content scripts are not declared for all sites; they are injected on demand with `scripting` after an `activeTab` user gesture

## UNAVAILABLE PAGE

- The standard popup does not open
- Recording and execution do not start
- A separate notification popup opens:
   - "Browser extensions do not work on system pages or protected websites. Try another website"
- Reuse the text and translations from `element-deleter`
- If the separate popup cannot be opened, the notification opens in a new active tab
- The temporary popup is assigned only to the tab being checked
- The temporary popup setting is always cleared after opening or after an error
- Each subsequent launch performs a new check

## AVAILABLE PAGE

- The standard popup opens
- Recording and execution work without a warning

## ORIGIN BOUNDARY

- Temporary access from `activeTab` applies to the current tab origin
- Recording, check, and execution may continue across same-origin navigations (content scripts are re-injected; execution resumes from progress)
- A navigation to a different origin stops recording, check, or execution; the extension does not keep broad host access to follow the user across sites
