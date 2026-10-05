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

Run `pnpm agent:install` to build the app and install a LaunchAgent. The agent starts the app each time you log in. It runs the app outside tmux and outside your terminal.

The agent runs `launchd/bin/zoomShutterLauncher`, a small compiled launcher. The launcher runs `launchd/run.sh`, which restarts the app 5 seconds after it exits. macOS checks Accessibility against the launcher, so grant Accessibility to `zoomShutterLauncher` only. The install builds the launcher again only when `launchd/launcher.c` changes. A new build needs a new grant.

Control the app with `launchd/zoomctl.sh`:

- `start`: start the agent if needed and create the `zoom` tmux console (socket `-L zoom`). Pane 0 shows the log and sends each line you type to the app.
- `stop`: stop the app and the tmux console. The agent starts again at your next login.
- `send <command>`: send a command, e.g. `zoomctl.sh send toggle`.
- `tail`: follow the log.

Logs go to `~/Library/Logs/zoomShutter/`:

- `zoomShutter.log`: app output with timestamps. At 5 MB, the next start moves it to `zoomShutter.log.1`.
- `launchd.log`: errors from the launcher and `run.sh`.

The launcher uses the fnm `default` node. After you change the fnm default, run `pnpm agent:install` again.

Run `pnpm agent:uninstall` to stop the app and remove the LaunchAgent.

### Convenience Functions

<details><summary>Add the following to your `~/.zshrc` or similar to expose helper functions and ensure that this library is always available on your system:</summary>

```bash
zoom() {
	if [ ! -d ~/dev/zoomShutter ]; then
		echo "zoomShutter not found. Installing..."
		mkdir -p ~/dev
		git clone git@github.com:gagregrog/zoomShutter.git ~/dev/zoomShutter || {
			echo "Failed to clone zoomShutter repository"
			return 1
		}
		# The project pins pnpm via "packageManager", so drive it through corepack.
		corepack enable &> /dev/null
		(cd ~/dev/zoomShutter && corepack pnpm agent:install) || return 1
	fi

	# start the agent and the tmux console if needed, then attach
	~/dev/zoomShutter/launchd/zoomctl.sh start && tmux -L zoom attach
}

zoom-toggle() {
	~/dev/zoomShutter/launchd/zoomctl.sh send toggle
}

zoom-open() {
	~/dev/zoomShutter/launchd/zoomctl.sh send open
}

zoom-close() {
	~/dev/zoomShutter/launchd/zoomctl.sh send close
}

zoom-stop() {
	~/dev/zoomShutter/launchd/zoomctl.sh stop
}

zoom-tail() {
	~/dev/zoomShutter/launchd/zoomctl.sh tail
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
