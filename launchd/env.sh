# Shared settings for the launchd scripts. Source this file. Do not run it.
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LABEL="com.user.zoomshutter"
DOMAIN="gui/$(id -u)"
LAUNCHER="$REPO/launchd/bin/zoomShutterLauncher"
LOG_DIR="$HOME/Library/Logs/zoomShutter"
LOG_FILE="$LOG_DIR/zoomShutter.log"
STATE_DIR="$HOME/Library/Application Support/zoomShutter"
CONTROL_FIFO="$STATE_DIR/control"
ZOOMCTL_LINK="$HOME/.local/bin/zoomctl"
TMUX_SOCKET="${ZOOM_TMUX_SOCKET:-zoom}"

# launchctl returns before the job exits. Waits up to 10 s for it to unload.
wait_for_unload() {
  for _ in $(seq 50); do
    launchctl print "$DOMAIN/$LABEL" &>/dev/null || return 0
    sleep 0.2
  done
  return 1
}

# The PATH from the caller, before the additions below. doctor.sh checks it.
CALLER_PATH="$PATH"

# launchd starts jobs with a minimal PATH, without tmux or the fnm node.
# fnm keeps its data in FNM_DIR, or in one of two default locations.
NODE_BIN_DIR=""
for fnm_dir in "${FNM_DIR:-}" "$HOME/.local/share/fnm" "$HOME/Library/Application Support/fnm"; do
  if [ -n "$fnm_dir" ] && [ -x "$fnm_dir/aliases/default/bin/node" ]; then
    NODE_BIN_DIR="$fnm_dir/aliases/default/bin"
    break
  fi
done
export PATH="${NODE_BIN_DIR:+$NODE_BIN_DIR:}/opt/homebrew/bin:/usr/local/bin:$PATH"
