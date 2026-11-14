# PAUSE

A pause adds a configurable wait in seconds to a [composite scenario](../pages/composite-scenarios.md).

---

## Duration and playback

- The user can edit the duration using the numeric input or its increment and decrement arrows. The arrows appear on hovering the field group, including its label, or when the group contains focus. The number stays in place. Clicking the label focuses the input. The value is saved for subsequent runs
- The next item starts after the configured duration elapses. A trailing pause completes before the run ends
- Pauses contribute to the estimated time remaining. They contribute zero cycles to the toolbar badge
- Stopping the composite during a pause cancels the wait immediately and ends the run

---

## Countdown on the page

- After a visible scenario leaves a virtual cursor, the pause shows it at the last position with a countdown beside it
- The countdown shows whole seconds from the configured duration through zero. Playback advances after the pause
- Consecutive pauses use the same cursor position. The cursor and countdown disappear when the run stops or finishes
- An initial pause or a pause after Stealth runs without an on-page cursor or countdown
- On same-origin navigation, the countdown resumes using the remaining duration and the last saved cursor position

---

## Decision to confirm

- Confirm the pause input rules. Proposed default is 1 second, with positive whole seconds and the previous valid value restored when an invalid edit is committed
