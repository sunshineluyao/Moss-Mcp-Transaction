---
name: Production path-prefix routing
description: How Replit's production proxy forwards paths to runnable artifact services, and what services must do to work in both dev and prod
---

**Rule:** The Replit production deployment proxy maps path prefixes (from `paths = [...]` in artifact.toml services) to local ports, but forwards the **full, unstripped URL** to the process. A service whose routes are defined without the prefix must strip it in an early Express middleware (`req.url = req.url.slice(prefix.length) || "/"`). Health-check `path` values in `[services.production.health.startup]` are proxy-visible paths and must include the prefix (e.g. `/agent-gateway/healthz`).

**Why:** The gateway worked in dev (workflow-based routing) but returned 404/HTML in production because `/agent-gateway/api/preview` never matched `/api/preview`. Symptom was "DOCTYPE is not valid JSON" (static catch-all) or "HTTP 404".

**How to apply:** When adding a runnable service to production via artifact.toml: (1) add a prefix-stripping middleware first in the Express chain, (2) prefix the health path, (3) never resolve sibling files via `process.cwd()` — cwd is the artifact dir in dev (`pnpm --filter`) but the workspace root in prod; use `dirname(fileURLToPath(import.meta.url))`.

**Bootstrap note:** `verifyAndReplaceArtifactToml` cannot create a new artifact.toml or change id/kind/version. To productionize a service that has no artifact, add it as a second `[[services]]` block inside an existing registered artifact's toml.
