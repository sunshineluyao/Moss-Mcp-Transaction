/**
 * sendPanel.test.ts
 *
 * Verifies that ensureMonadTestnet's network-switching logic is strictly
 * fail-closed: eth_sendTransaction must NEVER be reached when the switch fails,
 * regardless of error code (4901, 4001, -32603, or anything else).
 */

import { describe, it, expect, vi } from "vitest";
import {
  ensureMonadTestnet,
  MONAD_CHAIN_HEX,
  MONAD_CHAIN_ID,
  MONAD_TESTNET_CHAIN_PARAMS,
  type Eip1193Provider,
} from "./sendPanel";

// ── Helpers ──────────────────────────────────────────────────────────────────

interface MockOpts {
  /** Error thrown by wallet_switchEthereumChain (undefined = success) */
  switchError?: { code: number; message?: string };
  /** Whether wallet_addEthereumChain should fail */
  addError?: boolean;
  /** eth_chainId response (default: MONAD_CHAIN_HEX) */
  chainId?: string;
  /** eth_chainId request should throw */
  chainIdError?: boolean;
}

function makeProvider(opts: MockOpts = {}): {
  provider: Eip1193Provider;
  sendTransaction: ReturnType<typeof vi.fn>;
  calls: string[];
} {
  const calls: string[] = [];
  const sendTransaction = vi.fn().mockResolvedValue("0xdeadbeef");

  const provider: Eip1193Provider = {
    request: vi.fn(async ({ method }: { method: string }) => {
      calls.push(method);

      if (method === "wallet_switchEthereumChain") {
        if (opts.switchError) throw opts.switchError;
        return null;
      }
      if (method === "wallet_addEthereumChain") {
        if (opts.addError) throw new Error("add rejected");
        return null;
      }
      if (method === "eth_chainId") {
        if (opts.chainIdError) throw new Error("rpc error");
        return opts.chainId ?? MONAD_CHAIN_HEX;
      }
      if (method === "eth_sendTransaction") {
        return sendTransaction();
      }
      return null;
    }),
  };

  return { provider, sendTransaction, calls };
}

// ── Constant regression ───────────────────────────────────────────────────────
// These tests pin the literal hex/decimal values so any typo in the constant
// is caught immediately rather than at runtime on-chain.

describe("chain ID constants", () => {
  it("MONAD_CHAIN_HEX is exactly '0x279f' (decimal 10143)", () => {
    expect(MONAD_CHAIN_HEX).toBe("0x279f");
    expect(parseInt(MONAD_CHAIN_HEX, 16)).toBe(10143);
  });

  it("MONAD_CHAIN_ID is exactly 10143", () => {
    expect(MONAD_CHAIN_ID).toBe(10143);
  });

  it("MONAD_TESTNET_CHAIN_PARAMS.chainId is '0x279f' (decimal 10143)", () => {
    expect(MONAD_TESTNET_CHAIN_PARAMS.chainId).toBe("0x279f");
    expect(parseInt(MONAD_TESTNET_CHAIN_PARAMS.chainId, 16)).toBe(10143);
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ensureMonadTestnet", () => {
  it("returns ok:true when wallet switches cleanly to Monad Testnet", async () => {
    const { provider, sendTransaction } = makeProvider();
    const result = await ensureMonadTestnet(provider);

    expect(result.ok).toBe(true);
    // Prove sendTransaction was never called (caller responsibility, but spy confirms no leak)
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  // ── 4902: unknown chain — should attempt addEthereumChain ─────────────────

  it("4902: calls wallet_addEthereumChain and returns ok:true on success", async () => {
    const { provider, calls, sendTransaction } = makeProvider({
      switchError: { code: 4902 },
    });
    const result = await ensureMonadTestnet(provider);

    expect(result.ok).toBe(true);
    expect(calls).toContain("wallet_addEthereumChain");
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  it("4902 + add fails: returns ok:false without reaching eth_sendTransaction", async () => {
    const { provider, calls, sendTransaction } = makeProvider({
      switchError: { code: 4902 },
      addError: true,
    });
    const result = await ensureMonadTestnet(provider);

    expect(result.ok).toBe(false);
    expect(calls).not.toContain("eth_sendTransaction");
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  // ── 4001: user rejected — must abort immediately ──────────────────────────

  it("4001: returns ok:false immediately — eth_sendTransaction is never reached", async () => {
    const { provider, calls, sendTransaction } = makeProvider({
      switchError: { code: 4001 },
    });
    const result = await ensureMonadTestnet(provider);

    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toMatch(/rejected/i);

    // Critical: wallet_addEthereumChain and eth_sendTransaction must NOT be called
    expect(calls).not.toContain("wallet_addEthereumChain");
    expect(calls).not.toContain("eth_sendTransaction");
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  // ── -32603: generic internal RPC error — must abort, NOT treated as 4902 ──

  it("-32603: returns ok:false immediately — eth_sendTransaction is never reached", async () => {
    const { provider, calls, sendTransaction } = makeProvider({
      switchError: { code: -32603 },
    });
    const result = await ensureMonadTestnet(provider);

    expect(result.ok).toBe(false);

    // Critical: -32603 must NOT fall through to wallet_addEthereumChain
    expect(calls).not.toContain("wallet_addEthereumChain");
    expect(calls).not.toContain("eth_sendTransaction");
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  // ── Chain ID verification (re-query after switch) ─────────────────────────

  it("wrong chainId after switch: returns ok:false without reaching eth_sendTransaction", async () => {
    const { provider, calls, sendTransaction } = makeProvider({
      chainId: "0x1", // Ethereum mainnet
    });
    const result = await ensureMonadTestnet(provider);

    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toMatch(/1/); // mentions wrong chain
    expect(calls).not.toContain("eth_sendTransaction");
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  it("eth_chainId read fails: returns ok:false without sending", async () => {
    const { provider, calls, sendTransaction } = makeProvider({
      chainIdError: true,
    });
    const result = await ensureMonadTestnet(provider);

    expect(result.ok).toBe(false);
    expect(calls).not.toContain("eth_sendTransaction");
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  // ── Unknown error code: also aborts ───────────────────────────────────────

  it("unknown switch error code: returns ok:false without reaching eth_sendTransaction", async () => {
    const { provider, calls, sendTransaction } = makeProvider({
      switchError: { code: 9999 },
    });
    const result = await ensureMonadTestnet(provider);

    expect(result.ok).toBe(false);
    expect(calls).not.toContain("wallet_addEthereumChain");
    expect(calls).not.toContain("eth_sendTransaction");
    expect(sendTransaction).not.toHaveBeenCalled();
  });
});
