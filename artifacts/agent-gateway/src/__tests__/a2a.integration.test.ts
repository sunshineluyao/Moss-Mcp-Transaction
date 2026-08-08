/**
 * A2A integration tests.
 * - Agent Card: /.well-known/agent-card.json returns valid JSON with required fields.
 * - A2A task/artifact: a valid request returns a completed task with all required schema fields.
 *
 * Spawns the built dist/index.mjs as a subprocess with a fake RPC server,
 * communicates via HTTP on a randomly-selected port.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { spawn, type ChildProcess } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Valid EIP-55 checksummed addresses (Hardhat built-in accounts)
const VALID_SENDER    = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const VALID_RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

// ── Fake Monad Testnet RPC ────────────────────────────────────────────────────

let fakeRpcServer: Server;
let fakeRpcPort: number;
let gatewayProcess: ChildProcess;
let gatewayPort: number;

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
              result = "0x" + (9_999_999).toString(16);
              break;
            case "eth_getBalance":
              // 50 MON in wei
              result = "0x" + (50_000_000_000_000_000_000n).toString(16);
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
                number: "0x98967f",
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

/** Find a free port by binding to port 0 briefly */
function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.listen(0, "127.0.0.1", () => {
      const port = (srv.address() as { port: number }).port;
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });
}

/** Spawn the built agent-gateway and wait until it's ready */
async function startGateway(): Promise<void> {
  const port = await findFreePort();
  gatewayPort = port;

  const distIndex = join(__dirname, "..", "..", "dist", "index.mjs");

  gatewayProcess = spawn("node", ["--enable-source-maps", distIndex], {
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "test",
      MONAD_TESTNET_RPC_URL: `http://127.0.0.1:${fakeRpcPort}`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  // Wait for the "listening on port" message
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Gateway did not start within 15s")),
      15_000
    );

    gatewayProcess.stdout?.on("data", (chunk: Buffer) => {
      if (chunk.toString().includes("listening on port")) {
        clearTimeout(timeout);
        resolve();
      }
    });

    gatewayProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    gatewayProcess.on("exit", (code) => {
      if (code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Gateway exited with code ${code}`));
      }
    });
  });
}

async function fetchJson(path: string, opts?: RequestInit): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`http://127.0.0.1:${gatewayPort}${path}`, opts);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await startFakeRpc();
  await startGateway();
}, 30_000);

afterAll(async () => {
  gatewayProcess?.kill("SIGTERM");
  await new Promise<void>((r) => {
    gatewayProcess?.on("exit", () => r());
    setTimeout(r, 3000); // fallback
  });
  await new Promise<void>((r) => fakeRpcServer?.close(() => r()));
});

describe("Agent Card — GET /.well-known/agent-card.json", () => {
  it("returns HTTP 200 with JSON content-type", async () => {
    const res = await fetch(`http://127.0.0.1:${gatewayPort}/.well-known/agent-card.json`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("has required top-level fields: name, version, description, skills", async () => {
    const { body } = await fetchJson("/.well-known/agent-card.json");
    const card = body as Record<string, unknown>;
    expect(typeof card.name).toBe("string");
    expect(typeof card.version).toBe("string");
    expect(typeof card.description).toBe("string");
    expect(Array.isArray(card.skills)).toBe(true);
  });

  it("skills array contains the preview_monad_testnet_transfer skill", async () => {
    const { body } = await fetchJson("/.well-known/agent-card.json");
    const card = body as { skills: Array<{ id: string }> };
    const skill = card.skills.find((s) => s.id === "preview_monad_testnet_transfer");
    expect(skill).toBeDefined();
  });

  it("has a supportedInterfaces array with at least one entry", async () => {
    const { body } = await fetchJson("/.well-known/agent-card.json");
    const card = body as { supportedInterfaces: unknown[] };
    expect(Array.isArray(card.supportedInterfaces)).toBe(true);
    expect(card.supportedInterfaces.length).toBeGreaterThan(0);
  });

  it("capabilities.streaming is false (no streaming support)", async () => {
    const { body } = await fetchJson("/.well-known/agent-card.json");
    const card = body as { capabilities: { streaming: boolean } };
    expect(card.capabilities.streaming).toBe(false);
  });
});

describe("A2A task/artifact — POST /api/preview", () => {
  it("returns 400 for invalid input (bad sender address)", async () => {
    const { status, body } = await fetchJson("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: "not-an-address",
        recipient: VALID_RECIPIENT,
        amount: "1",
      }),
    });
    expect(status).toBe(400);
    const b = body as { error: string };
    expect(b.error).toBeTruthy();
  });

  it("returns 400 for missing fields", async () => {
    const { status } = await fetchJson("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(status).toBe(400);
  });

  it("returns 200 with a PreviewArtifact for valid input", async () => {
    const { status, body } = await fetchJson("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: VALID_SENDER,
        recipient: VALID_RECIPIENT,
        amount: "0.1",
      }),
    });
    expect(status).toBe(200);
    const artifact = body as Record<string, unknown>;
    // Required fields from PreviewArtifactSchema
    expect(typeof artifact.a2aTaskId).toBe("string");
    expect(typeof artifact.a2aContextId).toBe("string");
    expect(typeof artifact.a2aArtifactId).toBe("string");
    expect(typeof artifact.sender).toBe("string");
    expect(typeof artifact.recipient).toBe("string");
    expect(typeof artifact.amount).toBe("string");
    expect(["READY_FOR_WALLET_REVIEW", "BLOCKED"]).toContain(artifact.decision);
    expect(Array.isArray(artifact.warnings)).toBe(true);
    expect(typeof artifact.safetyFlags).toBe("object");
    expect(typeof artifact.skill).toBe("object");
    expect(Array.isArray(artifact.mcpTrace)).toBe(true);
    expect(typeof artifact.createdAt).toBe("string");
  }, 30_000);

  it("returned artifact safetyFlags has all 9 rule keys with boolean values", async () => {
    const { status, body } = await fetchJson("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: VALID_SENDER,
        recipient: VALID_RECIPIENT,
        amount: "0.1",
      }),
    });
    if (status !== 200) return;
    const artifact = body as { safetyFlags: Record<string, boolean> };
    const expectedKeys = [
      "RECORD_INTENT", "TESTNET_ONLY", "DECIMAL_STRINGS",
      "NO_PRIVATE_KEYS", "NO_SIGNING", "NO_BROADCAST",
      "SIMULATION_REQUIRED", "STOP_ON_WARNING", "PRESENT_BEFORE_SIGNING",
    ];
    for (const key of expectedKeys) {
      expect(typeof artifact.safetyFlags[key], `safetyFlags.${key} should be boolean`).toBe("boolean");
    }
  }, 30_000);

  it("safetyFlags SIMULATION_REQUIRED matches whether networkEvidence is non-null", async () => {
    const { status, body } = await fetchJson("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: VALID_SENDER,
        recipient: VALID_RECIPIENT,
        amount: "0.1",
      }),
    });
    if (status !== 200) return;
    const artifact = body as {
      safetyFlags: Record<string, boolean>;
      networkEvidence: unknown | null;
    };
    const simulationRan = artifact.networkEvidence !== null;
    expect(artifact.safetyFlags["SIMULATION_REQUIRED"]).toBe(simulationRan);
  }, 30_000);

  it("safetyFlags STOP_ON_WARNING matches whether warnings array is non-empty", async () => {
    const { status, body } = await fetchJson("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: VALID_SENDER,
        recipient: VALID_RECIPIENT,
        amount: "0.1",
      }),
    });
    if (status !== 200) return;
    const artifact = body as {
      safetyFlags: Record<string, boolean>;
      warnings: string[];
    };
    expect(artifact.safetyFlags["STOP_ON_WARNING"]).toBe(artifact.warnings.length > 0);
  }, 30_000);

  it("returned artifact mcpTrace has 4 entries (one per MCP tool)", async () => {
    const { status, body } = await fetchJson("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: VALID_SENDER,
        recipient: VALID_RECIPIENT,
        amount: "0.1",
      }),
    });
    if (status !== 200) return;
    const artifact = body as { mcpTrace: unknown[] };
    expect(artifact.mcpTrace.length).toBe(4);
  }, 30_000);
});
