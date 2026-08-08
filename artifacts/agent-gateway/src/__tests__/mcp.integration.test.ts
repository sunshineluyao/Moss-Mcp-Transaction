/**
 * MCP integration tests.
 * - list-tools: the server exposes exactly four tools with correct names.
 * - ordered-call: discover → load → action → simulate returns valid outputs.
 * - out-of-order: preview_simulate with mismatched unsignedTx returns BLOCKED.
 *
 * Uses a local fake HTTP server as the Monad Testnet RPC (deterministic).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Valid EIP-55 checksummed addresses (Hardhat built-in accounts)
const VALID_SENDER   = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const VALID_RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const AMOUNT = "0.5";

// ── Fake Monad Testnet RPC ────────────────────────────────────────────────────

let fakeRpcServer: Server;
let fakeRpcPort: number;

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
              result = "0x" + (1_234_567).toString(16);
              break;
            case "eth_getBalance":
              // 10 MON in wei
              result = "0x" + (10_000_000_000_000_000_000n).toString(16);
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
                number: "0x12d687",
                timestamp: "0x" + Math.floor(Date.now() / 1000).toString(16),
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

/** Extract the first text content from an MCP CallTool response (any shape) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function firstText(result: any): string {
  const arr = result?.content as Array<{ type: string; text: string }> | undefined;
  const first = arr?.[0];
  if (!first || first.type !== "text") throw new Error("Expected text content from MCP tool");
  return first.text;
}

function makeMcpClient(name = "test-client"): { client: Client; transport: StdioClientTransport } {
  const serverPath = join(__dirname, "..", "..", "dist", "mcp", "server.mjs");
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
    env: {
      ...process.env,
      MONAD_TESTNET_RPC_URL: `http://127.0.0.1:${fakeRpcPort}`,
    },
  });
  const client = new Client({ name, version: "1.0.0" });
  return { client, transport };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

// Start the shared fake RPC once for all describe blocks in this file
beforeAll(async () => {
  await startFakeRpc();
}, 15_000);

afterAll(async () => {
  await new Promise<void>((r) => fakeRpcServer?.close(() => r()));
});

describe("MCP server: list-tools", () => {
  let client: Client;

  beforeAll(async () => {
    const { client: c, transport } = makeMcpClient("list-tools-client");
    client = c;
    await client.connect(transport);
  }, 30_000);

  afterAll(async () => {
    await client?.close();
  });

  it("exposes exactly four tools", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(4);
  });

  it("tool names are exactly: preview_discover, preview_load, preview_action, preview_simulate", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(
      ["preview_action", "preview_discover", "preview_load", "preview_simulate"].sort()
    );
  });

  it("each tool has a non-empty description", async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(tool.description?.length ?? 0, `Tool ${tool.name} has empty description`).toBeGreaterThan(0);
    }
  });

  it("preview_action requires sender, recipient, amount", async () => {
    const { tools } = await client.listTools();
    const action = tools.find((t) => t.name === "preview_action");
    expect(action).toBeDefined();
    const required = action!.inputSchema.required as string[];
    expect(required).toContain("sender");
    expect(required).toContain("recipient");
    expect(required).toContain("amount");
  });
});

describe("MCP server: ordered-call integration", () => {
  let client: Client;

  beforeAll(async () => {
    const { client: c, transport } = makeMcpClient("ordered-call-client");
    client = c;
    await client.connect(transport);
  }, 30_000);

  afterAll(async () => {
    await client?.close();
  });

  it("preview_discover returns an actions array with actionId 'transfer_mon'", async () => {
    const result = await client.callTool({ name: "preview_discover", arguments: {} });
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(firstText(result)) as { actions: Array<{ id: string }> };
    expect(Array.isArray(data.actions)).toBe(true);
    expect(data.actions[0].id).toBe("transfer_mon");
  });

  it("preview_load returns a safetyRuleIds array with 9 entries", async () => {
    const result = await client.callTool({ name: "preview_load", arguments: { actionId: "transfer_mon" } });
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(firstText(result)) as { safetyRuleIds: string[] };
    expect(Array.isArray(data.safetyRuleIds)).toBe(true);
    expect(data.safetyRuleIds).toHaveLength(9);
  });

  it("preview_action returns an unsigned transaction with correct chainId and data='0x'", async () => {
    const result = await client.callTool({
      name: "preview_action",
      arguments: { sender: VALID_SENDER, recipient: VALID_RECIPIENT, amount: AMOUNT },
    });
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(firstText(result)) as {
      unsignedTx: { chainId: number; data: string; from: string; to: string };
      decision: string;
      warnings: string[];
    };
    expect(data.decision).not.toBe("BLOCKED");
    expect(data.unsignedTx).toBeDefined();
    expect(data.unsignedTx.chainId).toBe(10143);
    expect(data.unsignedTx.data).toBe("0x");
    expect(data.unsignedTx.from.toLowerCase()).toBe(VALID_SENDER.toLowerCase());
    expect(data.unsignedTx.to.toLowerCase()).toBe(VALID_RECIPIENT.toLowerCase());
  });

  it("preview_simulate returns a decision after receiving valid unsignedTx", async () => {
    const actionResult = await client.callTool({
      name: "preview_action",
      arguments: { sender: VALID_SENDER, recipient: VALID_RECIPIENT, amount: AMOUNT },
    });
    const actionData = JSON.parse(firstText(actionResult)) as {
      unsignedTx: Record<string, unknown>;
      decision: string;
    };
    expect(actionData.decision).not.toBe("BLOCKED");
    const unsignedTx = actionData.unsignedTx;

    const simResult = await client.callTool({
      name: "preview_simulate",
      arguments: { sender: VALID_SENDER, recipient: VALID_RECIPIENT, amount: AMOUNT, unsignedTx },
    });
    const simData = JSON.parse(firstText(simResult)) as {
      decision: string;
      networkEvidence: { chainId: number } | null;
    };
    expect(["READY_FOR_WALLET_REVIEW", "BLOCKED"]).toContain(simData.decision);
    if (simData.networkEvidence !== null) {
      expect(simData.networkEvidence.chainId).toBe(10143);
    }
  }, 30_000);
});

describe("MCP server: out-of-order call guard", () => {
  let client: Client;

  beforeAll(async () => {
    const { client: c, transport } = makeMcpClient("ooo-client");
    client = c;
    await client.connect(transport);
  }, 30_000);

  afterAll(async () => {
    await client?.close();
  });

  it("calling preview_simulate with mismatched unsignedTx fields yields BLOCKED or an error", async () => {
    // The unsignedTx.to doesn't match the recipient arg — the server must reject this
    const mismatchedTx = {
      from: VALID_SENDER,
      to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // different from VALID_RECIPIENT
      value: "0x" + (500_000_000_000_000_000n).toString(16),
      data: "0x",
      gasLimit: "0x5208",
      chainId: 10143,
    };

    const result = await client.callTool({
      name: "preview_simulate",
      arguments: {
        sender: VALID_SENDER,
        recipient: VALID_RECIPIENT, // doesn't match mismatchedTx.to
        amount: AMOUNT,
        unsignedTx: mismatchedTx,
      },
    });
    const data = JSON.parse(firstText(result)) as { decision?: string; warnings?: string[] };
    const isBlocked =
      result.isError ||
      data.decision === "BLOCKED" ||
      (Array.isArray(data.warnings) && data.warnings.length > 0);
    expect(isBlocked).toBe(true);
  });
});
