#!/bin/bash
# Controls the zoomShutter agent.
#   start          start the agent if needed and create the tmux console
#   stop           stop the agent and the tmux console
#   send <command> send a command to the app, e.g. "toggle"
#   tail           follow the app log
set -euo pipefail
source "$(dirname "$0")/env.sh"

is_running() {
  launchctl print "$DOMAIN/$LABEL" 2>/dev/null | grep -q 'state = running'
}

case "${1:-}" in
  start)
    is_running || launchctl kickstart "$DOMAIN/$LABEL"
    if ! tmux -L "$TMUX_SOCKET" has-session 2>/dev/null; then
      tmux -L "$TMUX_SOCKET" new-session -d -c "$REPO" "$REPO/launchd/console.sh" \; \
        split-window -c "$REPO" \; \
        select-pane -t 0
    fi
    ;;
  stop)
    launchctl kill SIGTERM "$DOMAIN/$LABEL" 2>/dev/null || true
    tmux -L "$TMUX_SOCKET" kill-server 2>/dev/null || true
    ;;
  send)
    shift
    if ! is_running; then
      echo "zoomShutter is not running. Start it with: $0 start" >&2
      exit 1
    fi
    printf '%s\n' "$*" > "$CONTROL_FIFO"
    ;;
  tail)
    exec tail -n 100 -F "$LOG_FILE"
    ;;
  *)
    echo "usage: $0 start|stop|send <command>|tail" >&2
    exit 2
    ;;
esac
