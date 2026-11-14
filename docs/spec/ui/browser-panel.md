# BROWSER TOOLBAR ELEMENTS

---

## ICON
- Background: `#012292`
- mouse-pointer, `#fff`

---

## BADGE
- Background: `#012292`; text: `#fff`
   - In recording mode, flashes red
   - In execution mode, shows a non-flashing countdown of remaining cycles
   - For a composite run, the initial count is the sum of configured repeats in its simple scenarios. Repeats of 3, 2, and 1 give an initial count of 6
   - The count includes any in-progress cycle until it completes and decreases by one after each completed cycle. It stays constant during pauses
   - While a composite run is active, show the exact count from `0` through `999` and show `…` above `999`. A trailing pause displays `0` until the run ends
   - The composite time estimate appears in the open popup

---

## CONTEXT MENU
- Uses the same list of items as the menu in popup with the same therms, CAPS, incl. i18n
- Uses relevant emoji instead of lucide icons. ▶️⚙️ℹ️
