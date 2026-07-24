# Moss MCP Transaction Preview

A beginner-friendly web demo that shows what a blockchain transaction will do — in plain English — before you sign anything.

---

## Project Purpose

Most wallet confirmation screens show raw hex data, a gas estimate, and a "Confirm" button. That tells you almost nothing about what will actually happen on-chain.

This demo bridges that gap: it takes a transaction intent (ERC20 transfer, approval, or swap), runs it through a mock of the Moss MCP simulation pipeline, and produces a human-readable preview — decoded parameters, simulated outcome, risk labels, and a safety checklist — so a user can understand the operation before it reaches their wallet.

**Who this is for:**
- Web3 newcomers who want to understand a transaction before confirming it in their wallet
- Developers exploring how the [Moss MCP server](https://github.com/nishuzumi/moss/tree/main/packages/mcp-server) decodes and simulates on-chain intent
- Anyone building educational tooling on top of the Monad ecosystem

---

## What Moss MCP Means in This Demo

[Moss MCP](https://github.com/nishuzumi/moss/tree/main/packages/mcp-server) is a **Model Context Protocol server** for the Monad ecosystem. It is **not** an auto-trading bot. It exposes a four-step lifecycle that a dApp or AI agent can call to understand a transaction before the user signs:

| Step | What it does |
|------|-------------|
| `discover(walletAddress)` | Finds available on-chain actions for a wallet |
| `load(actionId, params)` | Fetches the action manifest and resolves the ABI |
| `action(manifest, userParams)` | Constructs the unsigned transaction |
| `simulate(unsignedTx, rpcUrl)` | Dry-runs the tx and returns a structured risk report |

In this demo, `src/lib/mockMcp.ts` contains a local stub that returns the same data shape a real Moss MCP call would return. Swapping mock → real requires changing only the body of `simulateMCP()`:

```ts
// Today: pure mock (in mockMcp.ts)
export async function simulateMCP(params) { /* deterministic local logic */ }

// Tomorrow: real MCP call
import { MossClient } from "@moss/mcp-server";
const client   = new MossClient({ rpcUrl: process.env.MONAD_RPC_URL });
const actions  = await client.discover(params.accountAddress);
const manifest = await client.load(actions[0].id, params);
const tx       = await client.action(manifest, params);
return           await client.simulate(tx);
```

---

## How to Run

**Requirements:** Node.js 20+, pnpm 9+

```bash
# Clone the repo
git clone https://github.com/your-org/moss-mcp-transaction-preview.git
cd moss-mcp-transaction-preview

# Install dependencies
pnpm install

# Start the dev server
pnpm --filter @workspace/moss-mcp run dev
```

The app will be available at `http://localhost:<PORT>` (printed in the terminal).

No wallet, no funds, and no API key are needed to run the mock demo.

**Environment variables** (optional — only needed for real MCP integration):

```env
# .env
VITE_MOSS_RPC_URL=    # Moss MCP server endpoint — leave blank for mock mode
VITE_MONAD_RPC_URL=   # Monad testnet/mainnet RPC — leave blank for mock mode
```

> **Never put private keys, seed phrases, or funded wallet credentials in `.env` or anywhere in this project.**

---

## Safety Boundary

This demo is intentionally constrained:

- It **does not** connect to a wallet.
- It **does not** sign transactions.
- It **does not** broadcast transactions to any chain.
- It **does not** store private keys, seed phrases, or any user credentials.
- It **does not** provide financial advice or recommend any trade.
- All outputs are simulations. They describe what *would* happen, not what *did* happen.

> *"This demo is for transaction preview and learning only. It does not sign transactions, broadcast transactions, store private keys, or provide financial advice."*

---

## User Feedback Addressed

The following UX issues raised in user feedback were addressed in this pass:

1. **Intro block** — A clear project title, subtitle, and two-sentence plain-English description now appear at the very top of the page, above the form.
2. **Top safety notice** — A second amber safety notice bar appears directly beneath the intro, so users see it before interacting with any input.
3. **"What is Moss MCP?" section** — A collapsible card between the intro and the form explains the discover/load/action/simulate lifecycle in beginner-friendly language and explicitly states this is not an auto-trading bot.
4. **Input field helper text** — Every form field now has a short descriptive hint beneath it (Operation Type, Account Address, Token Address, Recipient/Spender, Amount, Scenario).
5. **Contextual Recipient/Spender hint** — The helper text under the Recipient/Spender field adjusts based on the selected operation type (Transfer vs. Approve).
6. **"Before you generate" checklist** — Three informational bullet points appear above the Generate Preview button as a reminder. The checklist is display-only and does not gate the button.
7. **"How to read this preview" section** — When a result is shown, an info card above the preview card defines all 8 result fields (Protocol, Method, Intent, Parameters, Risk Labels, Warnings, Confidence, Receipt Texts) in one sentence each.
8. **Status legend** — A compact two-column definition list beneath the Status Timeline defines all 8 states (Idle, Awaiting Signature, Pending, Confirming, Confirmed, Rejected, Reverted, System Error) with their exact plain-English meanings.
9. **README rewrite** — This file was rewritten to include Project Purpose, What Moss MCP Means in This Demo, How to Run, Safety Boundary, this feedback section, Known Issues, and Next Steps.

---

## Known Issues

- **Amount field accepts any number** — no validation against actual token balances or decimals. A real integration would check the user's on-chain balance.
- **Addresses are not validated** — the form accepts any string. An ENS / hex address validator would improve UX and safety.
- **Mock Swap does not simulate price impact** — the output amount is a fixed 1.05× multiplier. A real integration would pull a live quote from the router contract.
- **No persistence** — simulation results are not saved across page reloads. There is no permalink or share feature yet (see Next Steps).
- **"Proceed to Wallet" is a placeholder** — it does not open MetaMask, Phantom, or any mobile wallet app.

---

## Next Steps

- [ ] **Real Moss MCP integration** — replace `mockMcp.ts` body with live `discover / load / action / simulate` SDK calls against `VITE_MOSS_RPC_URL`
- [ ] **Timeline scenario QA** — verify each scenario (Success, User Rejected, On-chain Reverted, System Error) renders the correct timeline path before a live demo
- [ ] **Shareable permalink** — encode simulation params into the URL so a result can be shared
- [ ] **Mobile companion** — responsive layout optimised for use alongside a mobile wallet
- [ ] **Address validation** — validate hex addresses and support ENS resolution
- [ ] **Token balance check** — warn when the simulated amount exceeds the connected account's balance
- [ ] **Real wallet handoff** — after checklist completion, deep-link to MetaMask / WalletConnect with the pre-built transaction payload

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Disclaimer

This project is a learning and preview tool. It is not financial advice. It does not interact with real funds. Use it to understand transactions, not to automate or execute them.
