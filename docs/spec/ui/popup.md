# POPUP WINDOW

- Fixed width: 14 cm
- Window height depends on the number and size of elements
   - Minimum height: 10 cm
   - If the elements do not fit within 10 cm, the window grows vertically but does not exceed the user's screen height
- Opens as a popup below the browser toolbar when launched
- Closes:
   - When the user clicks outside the popup
   - Automatically when recording mode starts, as described in [Recording mode](../functional/mode-record.md)
   - Automatically when execution mode starts, as described in [Execution mode](../functional/mode-execute.md)
   - Automatically when check mode starts, as described in [Check mode](../functional/mode-check.md)
- A vertical menu is displayed on the left
  - Recommend uses the heart-handshake icon and is always the last item
- Contains one of the PAGES, except WELCOME, which opens in a separate tab
- On reopening, the popup restores the last page selected in its navigation or opened through a direct menu action. If the saved page is missing or unavailable, it opens Clicks
- A direct menu action opens its specified page. Completing a recording within a composite opens Composite scenarios. On a restored page, the composite playback status and Stop remain available
- The automatic transition after recording leaves the saved page selection intact
