# moss-mcp-transaction-preview

A beginner-friendly web demo that shows what a blockchain transaction will do — before you sign anything.

---

## Who This Is For

- Web3 newcomers who want to understand a transaction before confirming it in their wallet
- Developers exploring how the [Moss MCP server](https://github.com/nishuzumi/moss/tree/main/packages/mcp-server) decodes and simulates on-chain intent
- Anyone building educational tooling on top of the Monad ecosystem

---

## The Problem This Solves

Most wallet confirmation screens show raw hex data, a gas estimate, and a "Confirm" button. That tells you almost nothing about what will actually happen on-chain.

This demo bridges that gap: it takes a transaction intent (ERC20 transfer, approval, or swap) and produces a plain-English preview — decoded parameters, simulated outcome, risk labels, and a safety checklist — so a user can understand the operation before it reaches their wallet.

---

## What the Demo Does (Scope)

This is a **front-end only preview and simulation tool**. It does not connect to a wallet, does not broadcast transactions, and does not require real funds.

| Feature | Status |
|---|---|
| ERC20 Transfer preview | Mock ✓ |
| ERC20 Approve preview | Mock ✓ |
| Mock Swap preview | Mock ✓ |
| Status timeline (Idle → Confirmed, + failure branches) | Mock ✓ |
| Risk label badges | Mock ✓ |
| Pre-signature safety checklist | ✓ |
| Bilingual (EN / ZH) integration explainer | ✓ |
| Real Moss MCP server connection | Not yet — see Roadmap |
| Wallet connection | Not included |

---

## How Moss MCP Is Relevant

[Moss MCP](https://github.com/nishuzumi/moss/tree/main/packages/mcp-server) is a Model Context Protocol server for the Monad ecosystem. It exposes a `discover → load → action → simulate` lifecycle that an agent or dApp can call to decode transaction intent and assess risk before signing.

In this demo, `src/lib/mockMcp.ts` contains a local mock that returns the same shape of data a real Moss MCP simulation would return:

```ts
// Today: pure mock
export async function simulateMCP(params) { ... }

// Tomorrow: real MCP call
import { createClient } from "@moss/mcp-server";
const client = createClient({ rpcUrl: process.env.VITE_MOSS_RPC_URL });
const tools  = await client.discover();
const tool   = await client.load(tools, params.operationType);
const action = await client.action(tool, params);
return await client.simulate(action);
```

The mock result shape exactly mirrors the expected real response, so swapping mock → real requires changing only the body of `simulateMCP`.

---

## Current Implementation Status

- **All data is mocked.** No external network calls are made.
- The four scenarios (Success, User Rejected, On-chain Reverted, System Error) drive different status timelines and result cards, but they are driven entirely by local logic, not a live chain or MCP server.
- The app is suitable as a learning tool and as a UI shell ready to be wired to a real MCP endpoint.

---

## How to Run Locally

**Requirements:** Node.js 20+, pnpm 9+

```bash
# Clone the repo
git clone https://github.com/your-org/moss-mcp-transaction-preview.git
cd moss-mcp-transaction-preview

# Install dependencies
pnpm install

# Copy environment variable template
cp .env.example .env

# Start the dev server
pnpm --filter @workspace/moss-mcp run dev
```

The app will be available at `http://localhost:<PORT>` (the port is printed in the terminal).

No wallet, no funds, and no API key are needed to run the demo.

---

## Environment Variables

Copy `.env.example` to `.env`. Neither variable is required to run the mock demo — they are placeholders for future real integration.

```env
# .env.example

# Moss MCP server endpoint — leave blank to use mock mode
VITE_MOSS_RPC_URL=

# Monad testnet or mainnet RPC URL — leave blank to use mock mode
VITE_MONAD_RPC_URL=
```

> **Never put private keys, seed phrases, or funded wallet credentials in `.env` or anywhere in this project.**

---

## Safety Boundaries

This demo is intentionally constrained:

- It **does not** connect to a wallet.
- It **does not** sign transactions.
- It **does not** broadcast transactions to any chain.
- It **does not** store private keys, seed phrases, or any user credentials.
- It **does not** provide financial advice or recommend any trade.
- All outputs are simulations. They describe what *would* happen, not what *did* happen.

The safety notice displayed in the app reads:

> *"This demo is for transaction preview and learning only. It does not sign transactions, broadcast transactions, store private keys, or provide financial advice."*

---

## Mock-First Fallback

The app is designed so that it works fully with zero external dependencies:

1. `simulateMCP()` in `src/lib/mockMcp.ts` returns deterministic mock data based on the selected operation type and scenario.
2. A simulated network delay (800–1200 ms) is added so the loading state and timeline animation feel realistic.
3. The mock response shape is identical to the shape a real Moss MCP `simulate` call would return, so no UI changes are needed when swapping in a real endpoint.

This means you can demo, test, and iterate on the UI without any backend running.

---

## Known Issues

- **Amount field accepts any number** — there is no validation against actual token balances or decimals. A real integration would need to check the user's on-chain balance before confirming the preview.
- **Addresses are not validated** — the form accepts any string in address fields. An ENS / hex address validator would improve UX and safety.
- **Mock Swap does not simulate price impact** — the output amount is a fixed 1.05× multiplier. A real integration would pull a live quote from the router contract.
- **No persistence** — simulation results are not saved across page reloads. There is no permalink or share feature yet (see Roadmap).
- **No mobile wallet deep-link** — the "Proceed to Wallet" button is a placeholder. It does not open MetaMask, Phantom, or any mobile wallet app.

---

## Roadmap

- [ ] **Real Moss MCP integration** — replace `mockMcp.ts` body with live `discover / load / action / simulate` SDK calls against `VITE_MOSS_RPC_URL`
- [ ] **Monad testnet RPC** — connect to `VITE_MONAD_RPC_URL` to fetch live gas estimates and contract verification status
- [ ] **Address validation** — validate hex addresses and support ENS resolution
- [ ] **Token balance check** — warn when the simulated amount exceeds the connected account's balance
- [ ] **Shareable permalink** — encode simulation params into the URL so a result can be shared
- [ ] **Mobile companion** — responsive mobile layout optimised for use alongside a mobile wallet
- [ ] **Real wallet handoff** — after checklist completion, deep-link to MetaMask / WalletConnect with the pre-built transaction payload

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Disclaimer

This project is a learning and preview tool. It is not financial advice. It does not interact with real funds. Use it to understand transactions, not to automate or execute them.
