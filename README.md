# Zoom Shutter

Automatically open and close a shutter covering a webcam when your Zoom video status changes.

## Compatibility

Relies on an applescript to query Zoom, so only works on MacOS.

## Setup and Installation

Build with `pnpm install && pnpm build`.

### Grant Privileges

You must grant your terminal emulator accessibility privileges in order to query Zoom for its current video status.

To do so, open `System Settings > Privacy & Security > Accessibility` and add your terminal emulator to the list of approved applications.

If you have already done this and it was working but it stops working after an update, try removing the application from the list, closing the application, re-adding the application, then reopening the application.

### Arduino Setup

See the [Arduino](#arduino) section for more.

## Running

Run with `pnpm start` or `pnpm zoom`.

This will find and connect to an Arduino via SerialPort and start a Zoom monitor.

Zoom video status will be polled every 10 seconds if no meeting is active, and every 500 ms if an active meeting is detected.

If the video is on, a command is sent to the Arduino to open the servo, and vice-versa if the video is off.

If the connection to the Arduino is lost it will be polled every 5 seconds to reconnect.

### Global Install

You can use npm to install this globally on your system with `npm install -g .` from within this directory.

You can then access the utility by invoking `zoomShutter` directly.

### Convenience Functions

<details><summary>Add the following to your `~/.zshrc` or similar to expose helper functions and ensure that this library is always available on your system:</summary>

```bash
zoom() {
	# Check if zoomShutter command exists
	if ! command -v zoomShutter &> /dev/null; then
		echo "zoomShutter not found. Installing..."

		# Create ~/dev directory if it doesn't exist
		mkdir -p ~/dev

		# Check if the repo already exists
		if [ ! -d ~/dev/zoomShutter ]; then
			# Clone the repo
			git clone git@github.com:gagregrog/zoomShutter.git ~/dev/zoomShutter || {
				echo "Failed to clone zoomShutter repository"
				return 1
			}
		fi

		# Check if npm is available
		if command -v npm &> /dev/null; then
			# Store current directory
			pushd ~/dev/zoomShutter
			npm i -g .
			popd
		else
			echo "npm not found. Please install Node.js and npm to complete setup."
			return 1
		fi
	fi

	# Check if tmux is available
	if ! command -v tmux &> /dev/null; then
		echo "Error: tmux is not installed. Please install tmux to use this function."
		return 1
	fi

  # start or attach to the zoom tmux session
	if tmux -L zoom list-sessions &> /dev/null; then
		tmux -L zoom attach;
	else
		tmux -L zoom new-session -c ~/dev/zoomShutter "zoomShutter" \; split-window -c ~/dev/zoomShutter \; select-pane -t 0;
	fi
}

zoom-toggle() {
	if ! command -v tmux &> /dev/null; then
		echo "Error: tmux is not installed. Please install tmux to use this function."
		return 1
	fi
	tmux -L zoom send-keys -t 0 "toggle" Enter
}

zoom-open() {
	if ! command -v tmux &> /dev/null; then
		echo "Error: tmux is not installed. Please install tmux to use this function."
		return 1
	fi
	tmux -L zoom send-keys -t 0 "open" Enter
}

zoom-close() {
	if ! command -v tmux &> /dev/null; then
		echo "Error: tmux is not installed. Please install tmux to use this function."
		return 1
	fi
	tmux -L zoom send-keys -t 0 "close" Enter
}

zoom-stop() {
	if ! command -v tmux &> /dev/null; then
		echo "Error: tmux is not installed. Please install tmux to use this function."
		return 1
	fi
	tmux -L zoom kill-server || true
}
```

</details>

## Manual Overrides

By default the process will run in sync with Zoom. If you need to manually open your shutter you can pass commands to the process over `stdin`.

Simply type `open`, `o`, or `1` to enter manual mode. Type `close`, `c`, or `0` to return to automatic mode. Type `toggle` or `t` to toggle between the two.

Zoom status changes will be ignored while in manual mode.

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
