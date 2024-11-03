# Zoom Shutter

Automatically open and close a shutter covering a webcam when your Zoom video status changes.

## Compatibility

Relies on an applescript to query Zoom, so only works on MacOS.

## Installation

Build with `pnpm install && pnpm build`.

### Grant Privileges

You must grant your terminal emulator accessibility privileges in order to query Zoom for its current video status.

To do so, open `System Settings > Privacy & Security > Accessibility` and add your terminal emulator to the list of approved applications.
