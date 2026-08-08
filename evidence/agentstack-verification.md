# AgentStack Verification Evidence

## Agent Gateway: Monad Testnet Safe Preview Agent

### Public URLs

The agent-gateway derives its public base URL using this priority order:
1. `PUBLIC_BASE_URL` env var (explicit override — required for production deployment)
2. `REPLIT_DEV_DOMAIN` env var → `https://${REPLIT_DEV_DOMAIN}/agent-gateway` (set automatically in Replit workspace)
3. `http://localhost:3100` (local dev fallback)

| Resource | Dev URL |
|---|---|
| App | `https://${REPLIT_DEV_DOMAIN}/agent-gateway` |
| Agent Card | `https://${REPLIT_DEV_DOMAIN}/agent-gateway/.well-known/agent-card.json` |
| Health | `https://${REPLIT_DEV_DOMAIN}/agent-gateway/healthz` |
| A2A endpoint | `https://${REPLIT_DEV_DOMAIN}/agent-gateway/a2a` |
| Preview API | `https://${REPLIT_DEV_DOMAIN}/agent-gateway/api/preview` |

For production deployment, set `PUBLIC_BASE_URL` to the HTTPS deployment URL
(e.g. `https://your-app.replit.app/agent-gateway`) so the Agent Card advertises
the correct externally reachable address.

### Registration Commands (run after deployment)

```bash
# Add the agent to AgentStack registry (replace with actual deployed URL)
agentstack add https://${REPLIT_DEV_DOMAIN}/agent-gateway/.well-known/agent-card.json

# Verify the registration
agentstack list
```

### Expected `agentstack list` Output (placeholder — run after deployment)

```
# Placeholder — run agentstack list after deployment and paste output here
# Example expected output:
#
# Agents:
#   - name: Monad Testnet Safe Preview Agent
#     version: 1.0.0
#     url: https://${REPLIT_DEV_DOMAIN}/agent-gateway
#     skills: preview_monad_testnet_transfer
#     protocol: 1.0
```

### Verification Status

**not externally verified yet**

This agent has not yet been registered with AgentStack CLI or any external
A2A registry. The Agent Card is valid per the A2A 1.0 spec. Registration
commands are provided above — run them after deployment and replace the
placeholder output with the actual CLI result.

### Agent Card Schema Compliance

The Agent Card at `/.well-known/agent-card.json` includes:

- `name`: `Monad Testnet Safe Preview Agent`
- `version`: `1.0.0`
- `capabilities.streaming`: `false`
- `capabilities.pushNotifications`: `false`
- `skills[0].id`: `preview_monad_testnet_transfer`
- `supportedInterfaces[0].protocolBinding`: `JSONRPC`
- `supportedInterfaces[0].protocolVersion`: `1.0`
- `supportedInterfaces[0].url`: derived from `PUBLIC_BASE_URL` or `REPLIT_DEV_DOMAIN` at startup

### Security Notes

- RPC URL is a server-side constant (`https://testnet-rpc.monad.xyz`).
  It is never derived from user input (SSRF protection).
- No private keys, no signing, no broadcasting anywhere in this stack.
- `/api/preview` is restricted to same-origin CORS.
- `/.well-known/agent-card.json` allows cross-origin (required for A2A discovery).
- Rate limiting: 30 requests/minute per IP.
