# EXECUTION MODE

---

## START AND STOP

- Clicking the extension icon in the browser toolbar:
   - Opens the popup
   - Does not start anything
   - Stops the active mode, if one is running
- Recording mode starts only from the button in the popup
- Execution mode starts:
   - From the button for a specific entry in the popup
   - From the shortcut for the default

---

## ACTION SOURCE

- Execution mode runs the saved scenario as an ordered list of actions
- Supported actions and action-specific details are described in [Actions](actions.md)
- Generated timing is described in [Speed](speed.md)
- Execution mode is responsible for orchestration:
   - Selecting the next action
   - Preparing the action for execution
   - Applying stop conditions
   - Moving to the next action
   - Completing the scenario

---

## ACTION SEQUENCE

Loop conditions:
- A next action exists
- The user has not clicked
- Stop has not been requested

Loop:
1. Prepare the next action
    1. Read the recorded action data
    2. Identify the action type
    3. Load the action-specific execution rules from [Actions](actions.md)
2. Execute the action
    1. For pointer movement, apply the pointer movement rules
    2. For click, prepare the target and apply the click rules
    3. For key press, apply the key press rules
    4. For key release, apply the key release rules
3. Complete the action
    1. Apply the completed-action pause defined by [Speed](speed.md)
4. Start the loop for the next action if:
    - A next action exists
    - The user has not clicked
    - Stop has not been requested
    - The target was found, if the action was a click
