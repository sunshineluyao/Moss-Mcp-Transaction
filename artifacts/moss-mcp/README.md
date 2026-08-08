# Moss MCP Transaction Preview — Frontend

This directory contains the React/Vite frontend for the Moss MCP Transaction Preview.

For full documentation — architecture, API endpoints, test commands, and safety boundary — see the [root README](../../README.md).

## Development

```bash
# From the workspace root
pnpm --filter @workspace/moss-mcp run dev
```

The app is served at the path `/` in Replit's path-based router.
API calls go to the Agent Gateway at `/agent-gateway/api/preview`.

## Key files

| File | Purpose |
|------|---------|
| `src/pages/Home.tsx` | Main UI page |
| `src/lib/api.ts` | `usePreview` hook — calls POST /agent-gateway/api/preview |
| `src/types/preview.ts` | Frontend mirror of PreviewArtifact types |

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_AGENT_GATEWAY_URL` | `/agent-gateway` | Override the agent gateway base URL for local dev outside Replit |
| `PORT` | assigned by Replit | Vite dev server port |
| `BASE_PATH` | `/` | Vite base path |
