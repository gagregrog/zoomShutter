#!/bin/bash
# Stops the app and removes the LaunchAgent.
set -euo pipefail
source "$(dirname "$0")/env.sh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

"$REPO/launchd/zoomctl.sh" stop
launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
rm -f "$PLIST"
echo "Removed $PLIST"
