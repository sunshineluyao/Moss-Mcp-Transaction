#!/usr/bin/env bash
# Generates assets/moss-mcp-transaction-preview-demo.gif from a real browser walkthrough.
# Requires: ffmpeg, Playwright runtime, node modules installed.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PORT="${APP_PORT:-23076}"
APP_URL="http://localhost:${APP_PORT}/"
SERVER_PID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]] && ps -p "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "Starting local app server on ${APP_URL}"
cd "$ROOT_DIR"
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

echo "Capturing demo flow with real interaction"
APP_URL="$APP_URL" node "$ROOT_DIR/scripts/capture-demo.mjs"

echo "Done. GIF updated at $ROOT_DIR/assets/moss-mcp-transaction-preview-demo.gif"
