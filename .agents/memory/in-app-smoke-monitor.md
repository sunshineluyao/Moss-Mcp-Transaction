---
name: In-app smoke monitor
description: Why prod smoke checks run inside the gateway instead of a Scheduled Deployment
---

A repl has one deployment slot; this project's is the autoscale app, so a separate Scheduled Deployment for monitoring is impossible in the same repl.

**Why:** Scheduled Deployments are a deployment type, not an add-on — they would replace the published app.

**How to apply:** run recurring prod checks inside the deployed service (interval timer + run-on-startup so every autoscale wake triggers one), log failures loudly for deployment logs, and expose a status endpoint. Limitation: no runs while the autoscale instance is fully idle; true always-on alerting needs an external monitor or a second repl.
