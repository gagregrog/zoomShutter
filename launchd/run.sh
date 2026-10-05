#!/bin/bash
# Runs the app and restarts it when it exits. Ctrl-C stops the loop.
REPO="$(cd "$(dirname "$0")/.." && pwd)"
RESTART_DELAY_S=5

trap 'exit 0' INT TERM

while true; do
  node "$REPO/build/index.js"
  echo "[launcher] app exited with code $?. Restarting in ${RESTART_DELAY_S}s."
  sleep "$RESTART_DELAY_S"
done
