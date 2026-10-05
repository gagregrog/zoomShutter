#!/bin/bash
# tmux pane 0: shows the app log and sends each typed line to the app.
source "$(dirname "$0")/env.sh"

tail -n 100 -F "$LOG_FILE" &
TAIL_PID=$!
trap 'kill "$TAIL_PID" 2>/dev/null' EXIT

while IFS= read -r line; do
  "$REPO/launchd/zoomctl.sh" send "$line" || true
done
