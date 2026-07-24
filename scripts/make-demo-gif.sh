#!/usr/bin/env bash
# Generates assets/moss-mcp-transaction-preview-demo.gif from a real browser walkthrough.
# Requires: ffmpeg, Playwright runtime, node modules installed.
#
# Pipeline (reproducible):
# 1) Start local moss-mcp app with required env vars (PORT + BASE_PATH).
# 2) Wait until health check to APP_URL succeeds.
# 3) Run scripts/capture-demo.mjs to perform real UI interactions and capture frames.
# 4) Encode frames into final GIF at assets/moss-mcp-transaction-preview-demo.gif.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PORT="${APP_PORT:-23076}"
APP_URL="http://localhost:${APP_PORT}/"
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

echo "Starting local app server on ${APP_URL}"
cd "$ROOT_DIR"

if [[ ! -d "$ROOT_DIR/node_modules/playwright" ]]; then
  echo "playwright is not installed. Run: pnpm install"
  exit 1
fi

if [[ ! -x "$ROOT_DIR/node_modules/ffmpeg-static/ffmpeg" ]]; then
  echo "ffmpeg-static binary missing. Installing via package script..."
  node "$ROOT_DIR/node_modules/ffmpeg-static/install.js"
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

echo "Capturing demo flow with real interaction"
APP_URL="$APP_URL" node "$ROOT_DIR/scripts/capture-demo.mjs"

echo "Done. GIF updated at $ROOT_DIR/assets/moss-mcp-transaction-preview-demo.gif"
