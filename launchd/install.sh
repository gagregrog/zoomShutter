#!/bin/bash
# Builds the app and the launcher, then installs a LaunchAgent that runs the
# app at login.
set -euo pipefail
source "$(dirname "$0")/env.sh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

cd "$REPO"
pnpm install --frozen-lockfile
pnpm build

# A rebuilt launcher needs a new Accessibility grant, so build only when the
# source changes.
if [ ! -x "$LAUNCHER" ] || [ launchd/launcher.c -nt "$LAUNCHER" ]; then
  mkdir -p "$(dirname "$LAUNCHER")"
  clang -O2 -Wall -Wextra -o "$LAUNCHER" launchd/launcher.c
  codesign --force --sign - --identifier "$LABEL" "$LAUNCHER"
  echo "Built $LAUNCHER. Grant it Accessibility when macOS asks."
fi

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
    <string>$LAUNCHER</string>
    <string>$REPO/launchd/run.sh</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <!-- Restart after a crash, but not after zoomctl.sh stop. -->
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key>
    <false/>
  </dict>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/launchd.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/launchd.log</string>
</dict>
</plist>
PLIST

"$REPO/launchd/zoomctl.sh" stop
launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
launchctl bootstrap "$DOMAIN" "$PLIST"
echo "Installed $PLIST"
echo "Logs: $LOG_DIR"
