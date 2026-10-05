#!/bin/bash
# Runs the app and restarts it when it exits. The launcher runs this script.
source "$(dirname "$0")/env.sh"
RESTART_DELAY_S=5
MAX_LOG_BYTES=5000000

trap 'exit 0' INT TERM

mkdir -p "$LOG_DIR" "$STATE_DIR"
if [ -f "$LOG_FILE" ] && [ "$(/usr/bin/stat -f %z "$LOG_FILE")" -gt "$MAX_LOG_BYTES" ]; then
  mv "$LOG_FILE" "$LOG_FILE.1"
fi

[ -p "$CONTROL_FIFO" ] || mkfifo "$CONTROL_FIFO"
# A read-write open does not block, and the held write end keeps the app's
# stdin from reaching EOF after each command.
exec 3<> "$CONTROL_FIFO"

while true; do
  node "$REPO/build/index.js" <&3 2>&1 | "$REPO/launchd/timestamp.sh" >> "$LOG_FILE"
  echo "[launcher] app exited with code ${PIPESTATUS[0]}. Restarting in ${RESTART_DELAY_S}s." \
    | "$REPO/launchd/timestamp.sh" >> "$LOG_FILE"
  sleep "$RESTART_DELAY_S"
done
