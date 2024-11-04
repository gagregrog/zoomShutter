# Zoom Shutter

Automatically open and close a shutter covering a webcam when your Zoom video status changes.

## Compatibility

Relies on an applescript to query Zoom, so only works on MacOS.

## Setup and Installation

Build with `pnpm install && pnpm build`.

### Grant Privileges

You must grant your terminal emulator accessibility privileges in order to query Zoom for its current video status.

To do so, open `System Settings > Privacy & Security > Accessibility` and add your terminal emulator to the list of approved applications.

### Arduino Setup

See the [Arduino](#arduino) section for more.

## Running

Run with `pnpm start`.

This will find and connect to an Arduino via SerialPort and start a Zoom monitor.

Zoom video status will be polled every 10 seconds if no meeting is active, and every 500 ms if an active meeting is detected.

If the video is on, a command is sent to the Arduino to open the servo, and vice-versa if the video is off.

If the connection to the Arduino is lost it will be polled every 5 seconds to reconnect.

## Arduino

Compile the Arduino source using [Platform IO CLI](https://docs.platformio.org/en/latest/core/index.html) or Arduino IDE.

From within the `arduino` directory:

```sh
pio run -t upload
```

You can test the Arduino script without Zoom by connecting to it with a Serial monitor:

```sh
pio run -t monitor
```

Send `1` to open it and `2` to close it.

### Servo

```
Brown -> GND
Red -> VCC
Yellow -> 9
```

Connect a 90g servo to an Arduino Pro Micro on pin 9 and position it above your webcam with some sort of cover.

Connect the Arduino to your computer via USB.
