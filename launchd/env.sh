# Shared settings for the launchd scripts. Source this file. Do not run it.
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LABEL="com.user.zoomshutter"
DOMAIN="gui/$(id -u)"
LAUNCHER="$REPO/launchd/bin/zoomShutterLauncher"
LOG_DIR="$HOME/Library/Logs/zoomShutter"
LOG_FILE="$LOG_DIR/zoomShutter.log"
STATE_DIR="$HOME/Library/Application Support/zoomShutter"
CONTROL_FIFO="$STATE_DIR/control"
TMUX_SOCKET="${ZOOM_TMUX_SOCKET:-zoom}"

# launchd starts jobs with a minimal PATH, without tmux or the fnm node.
export PATH="$HOME/.local/share/fnm/aliases/default/bin:/opt/homebrew/bin:$PATH"
