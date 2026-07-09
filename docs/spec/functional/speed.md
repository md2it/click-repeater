# SPEED

---

## TABLE OF CONTENTS

- [GENERAL RULES](#general-rules)
- [SETTING](#setting)
- [BASE TIMING](#base-timing)
- [CALCULATION](#calculation)
- [EXAMPLES](#examples)
- [RUNTIME VARIABILITY](#runtime-variability)

---

## GENERAL RULES

- Speed defines generated timing during scenario execution
- Speed is configured separately for each scenario
- Speed applies to pointer movement, target stabilization, button hold, release-to-click pause, and completed-action pause
- Action-specific behavior is described in [Actions](actions.md)

---

## SETTING

- Speed is controlled by the scenario setting: [Editing - Speed](edit.md#settings)
- The setting applies only to the scenario where it is configured
- Default value: `1x`
- Each speed is a positive multiplier, lower or higher than `1`
- Speed lower than `1` slows execution down
- Speed higher than `1` speeds execution up
- Available speed options:
   - `0.1x`
   - `0.25x`
   - `0.5x`
   - `0.75x`
   - `1x`
   - `2x`
   - `4x`
   - `8x`

---

## BASE TIMING

- `1x` is the base timing profile
- Click action:
   - Movement point interval: 15 ms between generated pointer movement points before the click
   - Pause before pressing: 200 ms after target entry and before `pointerdown`
   - Button hold: 200 ms between `mousedown` and `pointerup`
   - Release-to-click pause: 1 ms between `mouseup` and `click`
- Key down action:
   - No specific pauses
- Key up action:
   - No specific pauses
- Completed-action pause: 100-200 ms after each action

---

## CALCULATION

- For any selected speed, calculate each timing value from the base `1x` value:

  `W = ceil(V / X)`

  Where:
   - `W` is the final timing value in milliseconds
   - `V` is the base timing value at `1x`
   - `X` is the selected positive speed multiplier
- For ranges, apply the formula to both range boundaries
- Round calculated values up to whole milliseconds
- The final value must not be lower than 1 ms

---

## EXAMPLES

  | Base value | Speed | Calculation | Final value |
  |---:|---:|---:|---:|
  | 100 ms | `4x` | `ceil(100 / 4)` | 25 ms |
  | 100 ms | `0.5x` | `ceil(100 / 0.5)` | 200 ms |

---

## RUNTIME VARIABILITY

- Distance may increase pointer movement duration; the multiplier controls relative pacing but does not guarantee a proportional change in total duration
- Calculate pauses at runtime
- Do not repeat timing patterns
- Avoid a uniform overall pace by varying the curve and non-movement pauses
