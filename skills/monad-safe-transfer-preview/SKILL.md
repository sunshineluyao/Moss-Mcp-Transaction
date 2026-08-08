---
id: preview_monad_testnet_transfer
name: Monad Testnet Safe Transfer Preview
version: 1.0.0
description: >
  Preview a native MON transfer on Monad Testnet before it reaches a wallet.
  Fetches live on-chain data (balance, gas estimate, network state) and
  evaluates nine safety rules. Returns READY_FOR_WALLET_REVIEW only when all
  checks pass; any warning yields BLOCKED. No signing, no broadcasting.
author: agent-gateway
tags:
  - monad
  - testnet
  - transfer
  - preview
  - safety
ruleIds:
  - RECORD_INTENT
  - TESTNET_ONLY
  - DECIMAL_STRINGS
  - NO_PRIVATE_KEYS
  - NO_SIGNING
  - NO_BROADCAST
  - SIMULATION_REQUIRED
  - STOP_ON_WARNING
  - PRESENT_BEFORE_SIGNING
---

# Monad Testnet Safe Transfer Preview Skill

This skill implements a **preview-only** safety layer for native MON transfers
on the Monad Testnet (chain ID 10143). It is inspired by the safety model
described in the [Moss documentation](https://docs.moss.ag), adapted for
Monad Testnet where Moss itself is mainnet-only.

## Safety Rules

### RECORD_INTENT
Before any network call, capture the user's exact intent: sender address,
recipient address, and transfer amount as a decimal string. Store these values
immutably for the lifetime of the preview session. Any ambiguity in the
intent must be resolved before proceeding.

### TESTNET_ONLY
This skill operates exclusively on Monad Testnet (chain ID 10143). If the
RPC responds with a different chain ID the request must be immediately
blocked. Never use a mainnet RPC endpoint. The RPC URL is a server-side
constant; it must never be derived from user input (SSRF protection).

### DECIMAL_STRINGS
All token amounts MUST be represented as decimal strings (e.g. `"1.5"`,
`"0.001"`). Never use floating-point numbers for amounts — they are subject
to precision loss. Parse amounts to bigint via `parseEther` only at the
point of RPC call construction.

### NO_PRIVATE_KEYS
This skill must never request, store, process, or transmit private keys,
seed phrases, or any credential that controls a wallet. All operations are
read-only from the perspective of key material.

### NO_SIGNING
This skill constructs unsigned transaction objects for preview purposes only.
It must never call any signing function (`eth_sign`, `personal_sign`,
`eth_signTypedData`, `wallet_signTransaction`, etc.) or any library method
that requires a private key to sign.

### NO_BROADCAST
This skill must never submit transactions to the network. Methods such as
`eth_sendRawTransaction`, `eth_sendTransaction`, or any library wrapper that
broadcasts are strictly forbidden. The unsigned transaction object is returned
to the caller for display only.

### SIMULATION_REQUIRED
A `preview_simulate` call with live on-chain evidence (balance confirmation,
gas estimate, block timestamp) must complete successfully before the result
is presented to the user. The simulation result becomes part of the returned
artifact. A preview without simulation evidence must be treated as
`BLOCKED`.

### STOP_ON_WARNING
If any preflight check yields a warning — chain ID mismatch, RPC timeout,
invalid address, zero address, non-positive amount, insufficient balance,
gas estimation failure, or missing simulation — the decision must be set to
`BLOCKED` and processing must stop. There is no concept of a "soft warning"
that allows the flow to continue.

### PRESENT_BEFORE_SIGNING
The full preview artifact (network evidence, unsigned transaction, gas
estimate, decision, all safety flags) must be presented to the user for
review before any wallet interaction is initiated. The agent must not skip
the review step or proceed autonomously to wallet submission.

## Data Flow

```
preview_discover → preview_load → preview_action → preview_simulate
```

1. **preview_discover** — returns the available action descriptor.
2. **preview_load** — returns the input contract (required fields, types) and
   the active safety rule IDs.
3. **preview_action** — validates addresses and amount client-side, constructs
   an unsigned transaction object. No RPC call at this step.
4. **preview_simulate** — requires the output of `preview_action`. Queries
   live Monad Testnet RPC for: chain ID (verified against 10143), latest block
   number and timestamp, sender balance, gas estimate, gas price, and
   optionally recipient code (to flag contract recipients). Returns network
   evidence and a final decision.

## Decision Values

- `READY_FOR_WALLET_REVIEW` — all preflight checks passed; safe to present to
  the user for wallet submission.
- `BLOCKED` — one or more preflight checks failed; do not proceed to wallet.
