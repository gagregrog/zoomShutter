#!/bin/bash
# Stops the app and removes the LaunchAgent.
set -euo pipefail
source "$(dirname "$0")/env.sh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

"$REPO/launchd/zoomctl.sh" stop
launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
wait_for_unload
rm -f "$PLIST"
echo "Removed $PLIST"

if [ "$(/usr/bin/readlink "$ZOOMCTL_LINK" 2>/dev/null)" = "$REPO/launchd/zoomctl.sh" ]; then
  rm "$ZOOMCTL_LINK"
  echo "Removed $ZOOMCTL_LINK"
fi

echo
echo "To remove the grants, delete zoomShutterLauncher from Accessibility and"
echo "Automation in System Settings > Privacy & Security."
