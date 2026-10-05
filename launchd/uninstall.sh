#!/bin/bash
# Removes the LaunchAgent. Does not stop a running zoom tmux session.
set -euo pipefail

LABEL="com.user.zoomshutter"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
rm -f "$PLIST"
echo "Removed $PLIST"
