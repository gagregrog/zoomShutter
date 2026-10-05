#!/bin/bash
# Builds the app and installs a LaunchAgent that runs launch.sh at login.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.user.zoomshutter"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG_DIR="$HOME/Library/Logs/zoomShutter"

export PATH="$HOME/.local/share/fnm/aliases/default/bin:/opt/homebrew/bin:$PATH"

cd "$REPO"
pnpm install --frozen-lockfile
pnpm build

mkdir -p "$LOG_DIR" "$(dirname "$PLIST")"
cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$REPO/launchd/launch.sh</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <!-- launch.sh exits once tmux starts. Keep launchd from killing the tmux server. -->
  <key>AbandonProcessGroup</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/launchd.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/launchd.log</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Installed $PLIST"
echo "Logs: $LOG_DIR"
