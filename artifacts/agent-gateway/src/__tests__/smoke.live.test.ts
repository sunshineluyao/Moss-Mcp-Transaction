/**
 * Live smoke test — runs against the real Monad Testnet RPC.
 * Run with: pnpm --filter @workspace/agent-gateway test:live
 *
 * This test is intentionally excluded from the default test run (pnpm test)
 * because it requires network access and the Monad Testnet to be reachable.
 *
 * Asserts:
 *   - eth_chainId returns 10143 from the configured RPC endpoint.
 *   - The response is a valid JSON-RPC 2.0 response.
 */
import { describe, it, expect } from "vitest";

const MONAD_TESTNET_RPC_URL =
  process.env.MONAD_TESTNET_RPC_URL ?? "https://testnet-rpc.monad.xyz";

const EXPECTED_CHAIN_ID = 10143;

describe("Live smoke test — Monad Testnet RPC", () => {
  it(`eth_chainId returns ${EXPECTED_CHAIN_ID} from ${MONAD_TESTNET_RPC_URL}`, async () => {
    let res: Response;
    try {
      res = await fetch(MONAD_TESTNET_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      throw new Error(
        `RPC request failed (is ${MONAD_TESTNET_RPC_URL} reachable?): ${err instanceof Error ? err.message : String(err)}`
      );
    }

    expect(res.ok, `HTTP ${res.status} from ${MONAD_TESTNET_RPC_URL}`).toBe(true);

    const body = (await res.json()) as { jsonrpc: string; id: number; result: string };
    expect(body.jsonrpc).toBe("2.0");
    expect(body.id).toBe(1);
    expect(typeof body.result).toBe("string");

    const chainId = parseInt(body.result, 16);
    expect(
      chainId,
      `Chain ID mismatch: expected ${EXPECTED_CHAIN_ID}, got ${chainId} (0x${chainId.toString(16)}). ` +
        `Check that MONAD_TESTNET_RPC_URL points to Monad Testnet.`
    ).toBe(EXPECTED_CHAIN_ID);
  }, 20_000);

  it("eth_blockNumber returns a non-zero block number", async () => {
    let res: Response;
    try {
      res = await fetch(MONAD_TESTNET_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 2,
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      throw new Error(
        `RPC request failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    expect(res.ok).toBe(true);
    const body = (await res.json()) as { result: string };
    const blockNumber = parseInt(body.result, 16);
    expect(blockNumber, "Block number should be > 0 on a live network").toBeGreaterThan(0);
  }, 20_000);
});
