#!/bin/bash
# Builds the app and the launcher, then installs a LaunchAgent that runs the
# app at login.
set -euo pipefail
source "$(dirname "$0")/env.sh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ -z "$NODE_BIN_DIR" ]; then
  echo "No fnm default node. Run: fnm install --lts && fnm default lts-latest" >&2
  exit 1
fi
if ! command -v tmux &>/dev/null; then
  echo "tmux not found. Run: brew install tmux" >&2
  exit 1
fi
if ! xcode-select -p &>/dev/null; then
  echo "Xcode command line tools not found. Run: xcode-select --install" >&2
  exit 1
fi
if ! command -v pnpm &>/dev/null; then
  corepack enable
fi

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

mkdir -p "$(dirname "$ZOOMCTL_LINK")"
ln -sfn "$REPO/launchd/zoomctl.sh" "$ZOOMCTL_LINK"

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
wait_for_unload
launchctl bootstrap "$DOMAIN" "$PLIST"
echo "Installed $PLIST"
echo "Linked $ZOOMCTL_LINK"
echo "Logs: $LOG_DIR"

echo
echo "On first run, macOS asks to let zoomShutterLauncher control System Events,"
echo "then for Accessibility. Grant both. If no Accessibility prompt appears, add"
echo "$LAUNCHER in System Settings > Privacy & Security > Accessibility."
echo
echo "Waiting for the app to start..."
sleep 5
"$REPO/launchd/doctor.sh" || true
