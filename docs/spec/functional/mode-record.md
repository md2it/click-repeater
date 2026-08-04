# RECORDING MODE

---

## LOGIC

### Starting the mode
1. Use the dedicated button in the popup
2. A dismissible explanation modal is shown as described in docs/spec/ui/modal-explanations.md
3. The mode starts:
   - From the button in the modal, if the modal is shown
   - Immediately, if the modal is not shown
4. The popup closes when the mode starts

### During the mode
- The user performs supported actions on the page
- The extension records:
   - Actions described in docs/spec/functional/actions.md
   - Click coordinates, for click actions
   - Selectors of clicked elements, for click actions
   - Keyboard event data, for key press and key release actions

### Event listeners
- Action listeners are enabled only during recording
- `recording-click` is not sent outside recording
- Selectors are not generated outside recording
- Listeners are removed after recording ends
- `keydown/keyup` events record only keyboard actions
- Listeners do not block website events
- Do not use `stopPropagation`
- Do not use `preventDefault`

### Ending recording mode
- After finishing the actions, the user clicks the extension icon again to end the mode
- The recorded scenario is saved immediately, with no intermediate confirmation window:
   - Name: `domain + date + time`, for example `google.com 2026-06-02 19:34`. Excludes http, www, /, etc.
   - Repeat = 1
   - All other values use their defaults
- The new entry appears at the top of the list, and the save-confirmation animation described below plays on it
- The user can rename the entry and change its other settings afterward through the [Manage menu](../ui/manage-menu.md)

### Save-confirmation animation
- Plays once on a scenario entry immediately after it is newly saved (currently only reachable by finishing a recording)
- A light streak sweeps across the entry: left to right, then right to left, then left to right again
- The streak is angled at roughly 30 degrees
- The streak has two layers: one sharp-edged, one blurred
- The streak is visible against both the light and the dark theme
- The animation is purely visual and does not block interaction with the entry

### Navigation during recording
- Same origin (same site): recording continues; content scripts are re-injected after the page loads
- Different origin (another site): recording stops
- Closing the recording tab stops recording
