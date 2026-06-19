# CLICK SOUND

- Each successfully executed scenario click plays a short sound imitating a mouse click.
- The sound is controlled by the extension-wide "Click sound" setting.
- The setting is enabled by default.
- When disabled, scenario execution is silent.
- The sound is generated locally and does not require network access.

## Volume

- Click volume follows the user's operating-system and output-device volume.
- The extension must not read, change, bypass, or reset system volume or audio-device settings.
- The click has a fixed internal gain. A separate extension volume setting is not currently provided.
- Future changes to internal gain must preserve sufficient audibility without clipping or dominating other audio.

## Implementation

- The sound is generated with the Web Audio API and routed to the current system output.
- One audio context is reused for the complete scenario and released after completion, user interruption, or an execution error.
- Closing or navigating the tab also releases the audio context through browser lifecycle cleanup.
- While a scenario is running, an approximately `-120 dBFS`, 30 Hz keep-alive signal maintains an active Bluetooth audio channel. This is required for reliable system-volume synchronisation with wireless headphones such as AirPods.
- The keep-alive signal starts with scenario execution and stops when execution ends. It must remain effectively inaudible and must not alter other audio streams or device settings.
- The audible click remains a separate short transient played through the same audio context.
