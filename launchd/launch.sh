#!/bin/bash
# Starts the zoom tmux session unless it already exists. Safe to run repeatedly.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SOCKET="${ZOOM_TMUX_SOCKET:-zoom}"
LOG_DIR="$HOME/Library/Logs/zoomShutter"
LOG_FILE="$LOG_DIR/zoomShutter.log"
MAX_LOG_BYTES=5000000

# launchd starts jobs with a minimal PATH, without tmux or the fnm node.
export PATH="$HOME/.local/share/fnm/aliases/default/bin:/opt/homebrew/bin:$PATH"

if tmux -L "$SOCKET" has-session 2>/dev/null; then
  exit 0
fi

mkdir -p "$LOG_DIR"
if [ -f "$LOG_FILE" ] && [ "$(/usr/bin/stat -f %z "$LOG_FILE")" -gt "$MAX_LOG_BYTES" ]; then
  mv "$LOG_FILE" "$LOG_FILE.1"
fi

tmux -L "$SOCKET" new-session -d -c "$REPO" "$REPO/launchd/run.sh" \; \
  pipe-pane -o "'$REPO/launchd/timestamp.sh' >> '$LOG_FILE'" \; \
  split-window -c "$REPO" \; \
  select-pane -t 0
