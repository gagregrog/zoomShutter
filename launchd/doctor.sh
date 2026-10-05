#!/bin/bash
# Reports the state of the zoomShutter install. Exits 1 when a check fails.
source "$(dirname "$0")/env.sh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
FAILED=0

ok() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
fail() {
  printf '  \033[31m✗\033[0m %s\n' "$*"
  FAILED=1
}
section() { printf '\n\033[1m%s\033[0m\n' "$*"; }

# Prints the parent pids of $1, nearest first.
ancestors() {
  local pid=$1
  while [ "$pid" -gt 1 ]; do
    pid=$(ps -o ppid= -p "$pid" | tr -d ' ')
    [ -n "$pid" ] || break
    echo "$pid"
  done
}

section "Tools"
if [ -n "$NODE_BIN_DIR" ]; then
  ok "node $("$NODE_BIN_DIR/node" --version) ($NODE_BIN_DIR)"
else
  fail "No fnm default node. Run: fnm install --lts && fnm default lts-latest"
fi
if command -v pnpm &>/dev/null; then
  ok "pnpm $(pnpm --version)"
else
  fail "pnpm not found. Run: corepack enable"
fi
if command -v tmux &>/dev/null; then
  ok "$(tmux -V)"
else
  fail "tmux not found. Run: brew install tmux"
fi
if xcode-select -p &>/dev/null; then
  ok "Xcode command line tools"
else
  fail "Xcode command line tools not found. Run: xcode-select --install"
fi

section "Build"
if [ ! -f "$REPO/build/index.js" ]; then
  fail "App not built. Run: make install"
elif [ -n "$(find "$REPO/src" -type f -newer "$REPO/build/index.js" | head -1)" ]; then
  warn "src changed after the last build. Run: make install"
else
  ok "App build is current"
fi
if [ ! -x "$LAUNCHER" ]; then
  fail "Launcher not built. Run: make install"
elif [ "$REPO/launchd/launcher.c" -nt "$LAUNCHER" ]; then
  warn "launcher.c changed after the last build. Run: make install, then grant Accessibility again"
else
  ok "Launcher built ($(codesign -dv "$LAUNCHER" 2>&1 | grep '^Identifier=' | cut -d= -f2))"
fi

section "Install"
if [ ! -f "$PLIST" ]; then
  fail "LaunchAgent not installed. Run: make install"
elif ! grep -q "<string>$LAUNCHER</string>" "$PLIST"; then
  fail "LaunchAgent runs a launcher from another checkout. Run: make install"
else
  ok "LaunchAgent installed"
fi
if [ "$(/usr/bin/readlink "$ZOOMCTL_LINK" 2>/dev/null)" = "$REPO/launchd/zoomctl.sh" ]; then
  ok "zoomctl linked at $ZOOMCTL_LINK"
else
  fail "zoomctl link missing or points elsewhere. Run: make install"
fi
case ":$CALLER_PATH:" in
  *":$(dirname "$ZOOMCTL_LINK"):"*) ok "$(dirname "$ZOOMCTL_LINK") is on PATH" ;;
  *) fail "$(dirname "$ZOOMCTL_LINK") is not on PATH. Add it in your shell config." ;;
esac
if PATH="$CALLER_PATH" command -v zoomShutter &>/dev/null; then
  warn "Old global zoomShutter command at $(PATH="$CALLER_PATH" command -v zoomShutter). Run: npm rm -g zoom-shutter"
fi

section "Agent"
AGENT_INFO="$(launchctl print "$DOMAIN/$LABEL" 2>/dev/null)"
LAUNCHER_PID=""
if [ -z "$AGENT_INFO" ]; then
  fail "Agent not loaded. Run: make install"
elif grep -q 'state = running' <<<"$AGENT_INFO"; then
  LAUNCHER_PID="$(awk '/^\tpid = /{print $3; exit}' <<<"$AGENT_INFO")"
  ok "Agent running (launcher pid $LAUNCHER_PID)"
else
  last_exit="$(awk -F' = ' '/last exit code/{print $2; exit}' <<<"$AGENT_INFO")"
  fail "Agent loaded but not running (last exit: ${last_exit:-none}). Run: zoomctl start"
fi

section "App"
APP_PIDS="$(pgrep -f 'zoomShutter/build/index.js')"
if [ -z "$APP_PIDS" ]; then
  fail "App not running. See $LOG_DIR/launchd.log"
else
  for pid in $APP_PIDS; do
    if [ -n "$LAUNCHER_PID" ] && ancestors "$pid" | grep -qx "$LAUNCHER_PID"; then
      ok "App running under the launcher (pid $pid)"
    else
      fail "App pid $pid runs outside the agent, e.g. from an old tmux session. Stop it: kill $pid"
    fi
  done
  [ "$(wc -w <<<"$APP_PIDS")" -gt 1 ] && fail "More than one app instance is running"
fi

section "Arduino"
DEVICES="$(ls /dev/tty.usbmodem* 2>/dev/null)"
if [ -z "$DEVICES" ]; then
  warn "No Arduino serial device found. Is it plugged in?"
else
  for device in $DEVICES; do
    holder="$(lsof -t "$device" 2>/dev/null | head -1)"
    if [ -z "$holder" ]; then
      warn "$device is not open"
    elif grep -qx "$holder" <<<"$APP_PIDS"; then
      ok "$device is open by the app"
    else
      fail "$device is open by another process: $(ps -o pid=,command= -p "$holder")"
    fi
  done
fi

section "Permissions"
LAST_DENIED="$(grep -n 'NEEDS_PRIVILEGES' "$LOG_FILE" 2>/dev/null | tail -1 | cut -d: -f1)"
LAST_STATUS="$(grep -n '\[ZOOM:STATUS\]' "$LOG_FILE" 2>/dev/null | tail -1 | cut -d: -f1)"
if [ -n "$LAST_DENIED" ] && [ "${LAST_STATUS:-0}" -lt "$LAST_DENIED" ]; then
  fail "Accessibility denied. Grant it to $LAUNCHER in System Settings > Privacy & Security > Accessibility"
elif [ -n "$LAST_STATUS" ]; then
  ok "App reads Zoom status"
else
  warn "No Zoom status in the log yet"
fi

section "Log ($LOG_FILE)"
tail -n 5 "$LOG_FILE" 2>/dev/null | sed 's/^/  /'

echo
exit "$FAILED"
