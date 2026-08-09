---
name: dev-prod-parity
description: Validate that what works in the dev preview will also work in the published (deployed) app. Use before every publish/deploy, after adding a new backend service or artifact, and whenever a user reports "works in preview but broken in production" (404s, HTML-instead-of-JSON, failed subprocesses, wrong URLs).
---

# Dev/Prod Parity Validation

Production on Replit differs from the dev preview in specific, predictable ways. Every "works in preview, broken when published" bug in this project came from one of the gaps below. Run this checklist before publishing and when debugging production-only failures.

## The 6 parity gaps (each caused a real production bug)

### 1. Service must be registered for production, not just a dev workflow
A workflow only runs in **dev**. Production only starts services declared in an artifact's `.replit-artifact/artifact.toml` with a `[services.production]` build + run config.
- Symptom: API returns the frontend's `index.html` ("DOCTYPE is not valid JSON") or 404 because requests fall through to a static catch-all.
- Check: every backend the frontend calls appears in some artifact.toml with `[[services]]`, `localPort`, `paths`, production build/run blocks.
- Note: `verifyAndReplaceArtifactToml` cannot create a new artifact.toml or change id/kind/version. To productionize an unregistered service, add it as a **second `[[services]]` block** in an existing registered artifact's toml.

### 2. Production proxy forwards the FULL path, unstripped
Dev routing may strip the path prefix; the production proxy does not. A service at `paths = ["/foo"]` receives `GET /foo/api/x`, not `/api/x`.
- Fix: first Express middleware strips the prefix with a strict boundary check:
  ```ts
  const prefix = "/foo";
  app.use((req, _res, next) => {
    if (req.url === prefix || req.url.startsWith(`${prefix}/`) || req.url.startsWith(`${prefix}?`)) {
      req.url = req.url.slice(prefix.length) || "/";
    }
    next();
  });
  ```
- Health check paths in `[services.production.health.startup]` are proxy-visible: use `/foo/healthz`, not `/healthz`.

### 3. Working directory differs
Dev (`pnpm --filter <pkg> run dev`) runs with cwd = the artifact dir. Production (`node artifacts/<pkg>/dist/index.mjs`) runs with cwd = **workspace root**.
- Never resolve sibling/asset files via `process.cwd()`. Use:
  ```ts
  import { dirname, join } from "node:path";
  import { fileURLToPath } from "node:url";
  const here = dirname(fileURLToPath(import.meta.url));
  ```
- Symptom: subprocesses die instantly ("MCP error -32000: Connection closed"), missing-file errors that never happen in dev.

### 4. Environment variables differ
`REPLIT_DEV_DOMAIN` / `REPLIT_DOMAINS` are dev-only or hold the dev domain. Any externally-advertised URL (agent cards, webhooks, OG tags) must come from an explicit env var (e.g. `PUBLIC_BASE_URL`) set in the service's `[services.production.run.env]`, using the real production URL from `getDeploymentInfo()` — never guessed.
- Symptom: production advertises `http://localhost:PORT` or a `.replit.dev` URL.

### 5. Frontend URLs must be base-path relative
Root-relative fetches (`/api/...`) escape the artifact's path prefix. Use `import.meta.env.BASE_URL` (Vite) or the scaffold's helper. Compile-time env vars (`VITE_*`) are baked at build; confirm they're set for the production build or have safe relative defaults.

### 6. Stale production build
The published app is a snapshot. If a fix was merged after the last publish, production still runs the old code — republish before concluding something is "broken in production."

## Pre-publish validation procedure

1. **Simulate production locally.** For each runnable service, from the **workspace root**:
   ```bash
   cd /home/runner/workspace && PORT=<freePort> NODE_ENV=production node <prod run args...>
   ```
   Then curl the health endpoint **with the path prefix** (`/foo/healthz`) and one real API route with the prefix. This alone catches gaps 2 and 3.
2. **Grep for landmines** in server code: `process.cwd()`, `REPLIT_DEV_DOMAIN`, hardcoded `localhost`, hardcoded ports.
3. **Check artifact.toml coverage**: every path the frontend fetches maps to a registered service's `paths`.
4. **After publishing**, smoke-test the live URL (from `getDeploymentInfo().primaryUrl`): health endpoints, one real API call, and any externally-advertised URLs (agent card, webhooks) contain the production domain.
5. **Check deployment logs** (RefreshAllLogs / deployment log files) for `healthcheck failed` and `runnable=N` — N must equal the number of backend services you expect.

## Debugging a production-only failure

- "DOCTYPE is not valid JSON" → gap 1 (service not deployed) or gap 5 (wrong fetch URL).
- HTTP 404 from a deployed service → gap 2 (prefix not stripped).
- Subprocess/file errors only in prod → gap 3 (cwd).
- Wrong/localhost URLs advertised → gap 4.
- Feature missing entirely → gap 6 (stale build).
