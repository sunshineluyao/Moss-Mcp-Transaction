#!/usr/bin/env bash
# Generates a demo GIF of the Moss MCP Transaction Preview.
#
# NOTICE: The old dual-scenario pipeline (Success / User Rejected) no longer
# applies — the UI now shows a single gold path (MON transfer preview on Monad
# Testnet). A truthful GIF requires a live Monad Testnet RPC connection and a
# test address with testnet balance.
#
# If the live RPC is unavailable, the script will capture an error state, which
# is honest but not suitable for README use. An honest TODO is left in the README
# until a reliable demo address can be set up.
#
# Usage:
#   SENDER=0x... RECIPIENT=0x... AMOUNT=0.1 bash scripts/make-demo-gif.sh
#
# Stale GIFs (showing Confirmed/Rejected lifecycle) have been removed from the README.
# The assets/ directory may still contain them; they are NOT referenced anywhere.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PORT="${APP_PORT:-23076}"
APP_URL="http://localhost:${APP_PORT}/"
OUTPUT_GIF="$ROOT_DIR/assets/moss-monad-testnet-preview.gif"
SERVER_PID=""

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd"
    exit 1
  fi
}

cleanup() {
  if [[ -n "$SERVER_PID" ]] && ps -p "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

require_cmd pnpm
require_cmd node
require_cmd curl

echo "Starting local moss-mcp app on ${APP_URL}"
cd "$ROOT_DIR"

if [[ ! -d "$ROOT_DIR/node_modules/playwright" ]] && [[ ! -d "$ROOT_DIR/node_modules/.pnpm" ]]; then
  echo "playwright is not installed. Run: pnpm install"
  exit 1
fi

PORT="$APP_PORT" BASE_PATH="/" pnpm --filter @workspace/moss-mcp run dev >/tmp/moss-mcp-demo-server.log 2>&1 &
SERVER_PID="$!"

for _ in $(seq 1 60); do
  if curl -sSf "$APP_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sSf "$APP_URL" >/dev/null 2>&1; then
  echo "App server did not become ready. Check /tmp/moss-mcp-demo-server.log"
  exit 1
fi

echo "Capturing demo flow (single gold path: MON transfer preview)"
APP_URL="$APP_URL" OUTPUT_GIF="$OUTPUT_GIF" \
  SENDER="${SENDER:-}" RECIPIENT="${RECIPIENT:-}" AMOUNT="${AMOUNT:-0.1}" \
  node "$ROOT_DIR/scripts/capture-demo.mjs"

echo "Done. GIF written to: $OUTPUT_GIF"
echo ""
echo "NOTE: Update README.md to reference this GIF only if it shows a truthful READY_FOR_WALLET_REVIEW result."
echo "      Do not commit a GIF that shows the obsolete Confirmed/Rejected lifecycle."
