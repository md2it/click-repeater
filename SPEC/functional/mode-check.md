# CHECK MODE

---

## PURPOSE

- Check mode shows how a saved scenario is expected to run
- Check mode does not execute scenario actions
- Check mode does not perform clicks
- Check mode does not type text
- Check mode is used to inspect the action path before execution

---

## START AND STOP

- Check mode starts:
   - From the button for a specific scenario in the scenario modal
   - With the working button name `Check`
   - With a check icon as the working visual direction
- When check mode starts:
   - The popup remains open
   - The check overlay is rendered on the current page
- Check mode stops:
   - When the user clicks the same button again
   - When the extension exits its active state for any reason
- When check mode stops:
   - The check overlay is removed

---

## ACTION SOURCE

- Check mode reads the saved scenario as an ordered list of actions
- Supported actions and action-specific details are described in [Actions](actions.md)
- Check mode renders actions that can be resolved to an expected action point
- Expected action point:
   - Does not depend on the targeting method
   - Can be based on recorded coordinates
   - Can be based on an element target
- Click points are resolved by reusing the existing `Click point` calculation described in [Actions](actions.md)

---

## VISUAL SCHEME

- Each rendered action point is shown where the related click is expected to happen
- Action icons:
   - A click point is shown with the Lucide `mouse-left` icon
   - Keyboard actions are shown with the Lucide `keyboard` icon
- Keyboard actions are attached to the latest resolved click point
- Grouping:
   - If several consecutive keyboard actions happen at the same point, they are shown as one `keyboard` icon
   - If several consecutive clicks happen at the same point, they are shown as one `mouse-left` icon
- Action numbers:
   - Each rendered icon has an action number or action number range near it
   - A single rendered action shows one number, for example `3` or `14`
   - Several grouped actions show a range, for example `14-17`
- Icon placement:
   - If click and keyboard actions are shown at the same point, their icons and numbers must not overlap
   - Click and keyboard icons at the same point are placed next to each other
- Lines:
   - Consecutive rendered action points are connected by a dashed line
   - The dashed line connects only rendered points
   - The dashed line shows the expected order of rendered points
- The visual scheme does not trigger website events
- The visual scheme is informational only

---

## ACTION POINT SCOPE

- Click actions define visualization points
- The visualization point coincides with the expected click point
- Click point calculation:
   - For coordinate-based targeting, the click point is calculated from the saved action coordinates
   - For element-based targeting, the click point is calculated from the element target
- Keyboard actions:
   - Do not define a new visualization point
   - Are rendered only when they can be attached to a resolved click point
- If an action cannot be resolved to a rendered point, it is not rendered in check mode
- If the scenario has no renderable actions, check mode shows no action points
