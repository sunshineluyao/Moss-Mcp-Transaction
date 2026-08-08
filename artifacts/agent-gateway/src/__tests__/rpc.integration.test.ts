/**
 * Deterministic RPC integration tests using a local fake HTTP server.
 * Tests fetchNetworkEvidence with mocked eth_* responses.
 *
 * Uses valid EIP-55 checksummed addresses (Hardhat built-in accounts).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";

// Valid EIP-55 checksummed addresses (Hardhat built-in accounts)
const VALID_SENDER    = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const VALID_RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

let fakeRpcServer: Server;
let fakeRpcPort: number;
const FAKE_BALANCE = 10_000_000_000_000_000_000n; // 10 MON

function startFakeRpc(): Promise<void> {
  return new Promise((resolve) => {
    fakeRpcServer = createServer((req, res) => {
      let body = "";
      req.on("data", (d) => (body += d));
      req.on("end", () => {
        try {
          const rpc = JSON.parse(body) as { method: string; id: unknown };
          let result: unknown;
          switch (rpc.method) {
            case "eth_chainId":
              result = "0x279f"; // 10143
              break;
            case "eth_blockNumber":
              result = "0x" + (5_555_555).toString(16);
              break;
            case "eth_getBalance":
              result = "0x" + FAKE_BALANCE.toString(16);
              break;
            case "eth_estimateGas":
              result = "0x5208"; // 21000
              break;
            case "eth_gasPrice":
              result = "0x3b9aca00"; // 1 gwei
              break;
            case "eth_getCode":
              result = "0x"; // EOA
              break;
            case "eth_getBlockByNumber":
              result = {
                number: "0x54c563",
                timestamp: "0x682a1f00",
              };
              break;
            default:
              result = null;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ jsonrpc: "2.0", id: rpc.id, result }));
        } catch {
          res.writeHead(400);
          res.end("Bad request");
        }
      });
    });

    fakeRpcServer.listen(0, "127.0.0.1", () => {
      fakeRpcPort = (fakeRpcServer.address() as { port: number }).port;
      resolve();
    });
  });
}

beforeAll(async () => {
  await startFakeRpc();
  // Point the RPC module at our fake server BEFORE importing it
  process.env.MONAD_TESTNET_RPC_URL = `http://127.0.0.1:${fakeRpcPort}`;
}, 10_000);

afterAll(async () => {
  await new Promise<void>((r) => fakeRpcServer?.close(() => r()));
});

describe("fetchNetworkEvidence — deterministic fake RPC", () => {
  it("returns network evidence with the correct chain ID (10143)", async () => {
    const { fetchNetworkEvidence } = await import("../rpc/monadTestnet.js");
    const evidence = await fetchNetworkEvidence({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "0.1",
    });
    expect(evidence.chainId).toBe(10143);
    expect(evidence.chainIdVerified).toBe(true);
  });

  it("returns block number matching the fake RPC", async () => {
    const { fetchNetworkEvidence } = await import("../rpc/monadTestnet.js");
    const evidence = await fetchNetworkEvidence({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "0.5",
    });
    expect(typeof evidence.blockNumber).toBe("string");
    expect(BigInt(evidence.blockNumber)).toBe(5_555_555n);
  });

  it("returns the correct sender balance (10 MON)", async () => {
    const { fetchNetworkEvidence } = await import("../rpc/monadTestnet.js");
    const evidence = await fetchNetworkEvidence({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "0.1",
    });
    expect(evidence.senderBalanceEth).toBe("10");
  });

  it("returns recipientIsContract = false for an EOA (eth_getCode = '0x')", async () => {
    const { fetchNetworkEvidence } = await import("../rpc/monadTestnet.js");
    const evidence = await fetchNetworkEvidence({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "0.1",
    });
    expect(evidence.recipientIsContract).toBe(false);
  });

  it("includes the RPC URL in evidence", async () => {
    const { fetchNetworkEvidence } = await import("../rpc/monadTestnet.js");
    const evidence = await fetchNetworkEvidence({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "0.1",
    });
    expect(typeof evidence.rpcUrl).toBe("string");
    expect(evidence.rpcUrl.length).toBeGreaterThan(0);
  });

  it("includes a queriedAt ISO timestamp", async () => {
    const { fetchNetworkEvidence } = await import("../rpc/monadTestnet.js");
    const evidence = await fetchNetworkEvidence({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "0.1",
    });
    expect(typeof evidence.queriedAt).toBe("string");
    expect(() => new Date(evidence.queriedAt)).not.toThrow();
    expect(new Date(evidence.queriedAt).getTime()).toBeGreaterThan(0);
  });

  it("throws RpcError for invalid sender address", async () => {
    const { fetchNetworkEvidence, RpcError } = await import("../rpc/monadTestnet.js");
    await expect(
      fetchNetworkEvidence({
        sender: "not-an-address",
        recipient: VALID_RECIPIENT,
        amount: "1",
      })
    ).rejects.toBeInstanceOf(RpcError);
  });

  it("throws RpcError for invalid recipient address", async () => {
    const { fetchNetworkEvidence, RpcError } = await import("../rpc/monadTestnet.js");
    await expect(
      fetchNetworkEvidence({
        sender: VALID_SENDER,
        recipient: "bad-address",
        amount: "1",
      })
    ).rejects.toBeInstanceOf(RpcError);
  });
});

describe("RpcError — type and code correctness", () => {
  it("RpcError is an instance of Error with a code property", async () => {
    const { RpcError } = await import("../rpc/monadTestnet.js");
    const err = new RpcError("Wrong chain: expected 10143, got 1", "WRONG_CHAIN");
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("WRONG_CHAIN");
    expect(err.message).toContain("10143");
  });

  it("RpcError TIMEOUT code is correctly typed", async () => {
    const { RpcError } = await import("../rpc/monadTestnet.js");
    const err = new RpcError("RPC timeout", "TIMEOUT");
    expect(err.code).toBe("TIMEOUT");
  });

  it("RpcError INVALID_ADDRESS is thrown for a non-checksummed mixed-case address", async () => {
    const { fetchNetworkEvidence, RpcError } = await import("../rpc/monadTestnet.js");
    // Mixed-case non-EIP-55 address — rejected by viem's isAddress (strict mode)
    await expect(
      fetchNetworkEvidence({
        sender: "0xaAbBcCdDeEfF0011223344556677889900aAbBcC",
        recipient: VALID_RECIPIENT,
        amount: "1",
      })
    ).rejects.toBeInstanceOf(RpcError);
  });
});
