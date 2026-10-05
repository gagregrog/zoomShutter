# Zoom Shutter

Automatically open and close a shutter covering a webcam when your Zoom video status changes.

Or, operate the shutter manually via serial or button press.

## Compatibility

Automatic control relies on an applescript to query Zoom, so only works on MacOS.

## Setup and Installation

Build MacOS software with `pnpm install && pnpm build`.

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

If the video is on, a command is sent to the Arduino to open the servo, and vice-versa if the video is off (or if Zoom is closed).

If the connection to the Arduino is lost it will be polled every 5 seconds to reconnect.

### Global Install

You can use npm to install this globally on your system with `npm install -g .` from within this directory.

You can then access the utility by invoking `zoomShutter` directly.

### Start at Login

Run `pnpm agent:install` to build the app and install a LaunchAgent. The agent runs `launchd/launch.sh` each time you log in.

`launch.sh` starts a `zoom` tmux session (socket `-L zoom`) unless one already exists. The app runs in pane 0 and restarts 5 seconds after it exits. Press Ctrl-C in pane 0 to stop the restart loop.

Logs go to `~/Library/Logs/zoomShutter/`:

- `zoomShutter.log`: app output with timestamps. At 5 MB, the next launch moves it to `zoomShutter.log.1`.
- `launchd.log`: errors from `launch.sh`.

The agent does not run through your terminal emulator, so it needs its own Accessibility privileges. If `zoomShutter.log` asks for them, add the binary that macOS names in `System Settings > Privacy & Security > Accessibility`.

The launcher uses the fnm `default` node. After you change the fnm default, run `pnpm agent:install` again and check the Accessibility privileges.

Run `pnpm agent:uninstall` to remove the LaunchAgent.

### Convenience Functions

<details><summary>Add the following to your `~/.zshrc` or similar to expose helper functions and ensure that this library is always available on your system:</summary>

```bash
zoom() {
	if [ ! -d ~/dev/zoomShutter ]; then
		echo "zoomShutter not found. Installing..."
		git clone git@github.com:gagregrog/zoomShutter.git ~/dev/zoomShutter || {
			echo "Failed to clone zoomShutter repository"
			return 1
		}
		(cd ~/dev/zoomShutter && pnpm agent:install) || return 1
	fi

	# start the zoom tmux session if needed, then attach
	~/dev/zoomShutter/launchd/launch.sh && tmux -L zoom attach
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

zoom-tail() {
	tail -n 100 -f ~/Library/Logs/zoomShutter/zoomShutter.log
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
Yellow -> A3
```

Connect a 90g servo to an Arduino Pro Micro on pin A3 and position it above your webcam with some sort of cover.

Connect the Arduino to your computer via USB.
