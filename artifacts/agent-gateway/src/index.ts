/**
 * Agent Gateway — Express server
 *
 * Routes:
 *   POST /api/preview                    — run the preview via the A2A client calling /a2a
 *   GET  /.well-known/agent-card.json    — A2A Agent Card (cross-origin)
 *   GET  /healthz                        — health check
 *   GET  /api/network                    — live chain ID + latest block
 *   GET  /api/skill                      — loaded skill metadata
 *   POST /a2a                            — A2A JSON-RPC endpoint
 */
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import {
  DefaultRequestHandler,
  InMemoryTaskStore,
  DefaultExecutionEventBusManager,
} from "@a2a-js/sdk/server";
import {
  jsonRpcHandler,
  agentCardHandler,
  UserBuilder,
} from "@a2a-js/sdk/server/express";
import {
  ClientFactory,
  DefaultAgentCardResolver,
} from "@a2a-js/sdk/client";
import type { AgentCard, Task, Message } from "@a2a-js/sdk";
import { Role } from "@a2a-js/sdk";
import { loadSkill } from "./skills/loadSkill.js";
import { fetchNetworkStatus } from "./rpc/monadTestnet.js";
import { PreviewAgentExecutor } from "./a2a/previewAgent.js";
import {
  PreviewRequestSchema,
  type PreviewArtifact,
} from "./shared/schema.js";

const PORT = Number(process.env.PORT ?? 3100);
const NODE_ENV = process.env.NODE_ENV ?? "production";

/**
 * Resolve the canonical public HTTPS base URL used in the Agent Card.
 * Priority:
 *   1. PUBLIC_BASE_URL env var (explicit override — required for production deployment)
 *   2. REPLIT_DEV_DOMAIN env var (Replit workspace dev domain — set automatically by Replit)
 *      → agent-gateway is served at the /agent-gateway path prefix via Replit's path router
 *   3. Local fallback (http://localhost:<PORT>)
 */
function resolvePublicBaseUrl(): string {
  if (process.env.PUBLIC_BASE_URL) {
    // Remove trailing slash for consistency
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    // Path-based routing: the workflow is registered under /agent-gateway
    return `https://${process.env.REPLIT_DEV_DOMAIN}/agent-gateway`;
  }
  return `http://localhost:${PORT}`;
}

const PUBLIC_BASE_URL = resolvePublicBaseUrl();

// ── Agent Card ────────────────────────────────────────────────────────────────

function buildAgentCard(baseUrl: string): AgentCard {
  return {
    name: "Monad Testnet Safe Preview Agent",
    description:
      "Preview-only agent for native MON transfers on Monad Testnet (chain ID 10143). " +
      "Runs safety checks, fetches live on-chain data, and returns a structured preview artifact. " +
      "No signing, no broadcasting, no private keys required.",
    version: "1.0.0",
    provider: {
      organization: "agent-gateway",
      url: baseUrl,
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
      extensions: [],
    },
    defaultInputModes: ["text", "application/json"],
    defaultOutputModes: ["application/json"],
    skills: [
      {
        id: "preview_monad_testnet_transfer",
        name: "Monad Testnet Safe Transfer Preview",
        description:
          "Previews a native MON transfer: validates addresses and amount, " +
          "fetches live balance/gas/block data from Monad Testnet RPC, " +
          "and returns READY_FOR_WALLET_REVIEW or BLOCKED with warnings. " +
          "Preview only — not autonomous execution.",
        tags: ["monad", "testnet", "preview", "transfer", "safety"],
        examples: [
          '{"sender":"0xabc...","recipient":"0xdef...","amount":"1.5"}',
        ],
        inputModes: ["text", "application/json"],
        outputModes: ["application/json"],
        securityRequirements: [],
      },
    ],
    supportedInterfaces: [
      {
        url: `${baseUrl}/a2a`,
        protocolBinding: "JSONRPC",
        protocolVersion: "1.0",
        tenant: "",
      },
    ],
    securitySchemes: {},
    securityRequirements: [],
    signatures: [],
  };
}

// ── A2A Client helper — calls the local /a2a endpoint via official A2A SDK ────

/**
 * Build a variant of the agent card that points to the local loopback URL.
 * Used for internal A2A client calls within the same process — the public card
 * (with the HTTPS URL) is served externally, but the internal client must reach
 * the server via localhost to avoid network-unreachable issues inside the container.
 */
function buildLocalAgentCard(port: number, publicCard: AgentCard): AgentCard {
  const localBaseUrl = `http://localhost:${port}`;
  return {
    ...publicCard,
    provider: {
      url: localBaseUrl,
      organization: publicCard.provider?.organization ?? "agent-gateway",
    },
    supportedInterfaces: publicCard.supportedInterfaces.map((iface) => ({
      ...iface,
      url: `${localBaseUrl}/a2a`,
    })),
  };
}

/**
 * Runs the preview pipeline through the official A2A client:
 *   client.sendMessage() → /a2a (JSON-RPC, loopback) → DefaultRequestHandler
 *   → PreviewAgentExecutor → MCP tools → live Monad Testnet RPC
 *
 * Returns the PreviewArtifact from the completed task, or throws on failure.
 */
async function runPreviewViaA2AClient(params: {
  sender: string;
  recipient: string;
  amount: string;
  localAgentCard: AgentCard;
}): Promise<PreviewArtifact> {
  const { sender, recipient, amount, localAgentCard } = params;

  // Build a client from the LOCAL agent card (localhost URL) so the JSON-RPC
  // call reaches the server via loopback, not via the public HTTPS URL which
  // may be unreachable from within the container.
  const factory = new ClientFactory();
  const client = await factory.createFromAgentCard(localAgentCard);

  // Serialize preview params as JSON text in a Message part.
  const messagePayload = JSON.stringify({ sender, recipient, amount });

  const result = await client.sendMessage({
    tenant: "",
    metadata: undefined,
    message: {
      messageId: randomUUID(),
      role: Role.ROLE_USER,
      parts: [
        {
          content: { $case: "text" as const, value: messagePayload },
          metadata: undefined,
          filename: "",
          mediaType: "application/json",
        },
      ],
      metadata: undefined,
      extensions: [],
      referenceTaskIds: [],
      contextId: "",
      taskId: "",
    },
    configuration: {
      acceptedOutputModes: ["application/json"],
      returnImmediately: false,
      taskPushNotificationConfig: undefined,
    },
  });

  // sendMessage returns Task | Message. Distinguish by shape.
  const task = result as Task;
  if (!task.id || !task.status) {
    throw new Error(
      "A2A sendMessage returned a Message instead of a completed Task"
    );
  }

  // Check for failed state
  if (
    task.status.state === 4 /* TASK_STATE_FAILED */ ||
    (task.artifacts ?? []).length === 0
  ) {
    const statusMsg = task.status.message?.parts?.[0]?.content;
    const detail =
      statusMsg?.$case === "text" ? statusMsg.value : "Task failed";
    throw new Error(`A2A task failed: ${detail}`);
  }

  // Extract the artifact JSON from the first text part
  const artifactPart = task.artifacts?.[0]?.parts?.[0]?.content;
  if (!artifactPart || artifactPart.$case !== "text") {
    throw new Error("A2A task artifact contains no text part");
  }

  try {
    return JSON.parse(artifactPart.value) as PreviewArtifact;
  } catch {
    throw new Error(
      `A2A artifact is not valid JSON: ${artifactPart.value.slice(0, 200)}`
    );
  }
}

// ── Express app ───────────────────────────────────────────────────────────────

async function createApp() {
  const skill = await loadSkill();
  // Public card: advertises the HTTPS base URL for external A2A discovery
  const agentCard = buildAgentCard(PUBLIC_BASE_URL);
  // Local card: same shape but points to localhost so the internal A2A client
  // can reach the server via loopback (the public HTTPS URL may be unreachable
  // from inside the container/process)
  const localAgentCard = buildLocalAgentCard(PORT, agentCard);

  // A2A server-side components
  const taskStore = new InMemoryTaskStore();
  const eventBusManager = new DefaultExecutionEventBusManager();
  const executor = new PreviewAgentExecutor();
  const requestHandler = new DefaultRequestHandler(
    agentCard,
    taskStore,
    executor,
    eventBusManager
  );

  const app = express();

  // Trust the Replit / reverse-proxy X-Forwarded-For header so
  // express-rate-limit can identify real client IPs correctly.
  app.set("trust proxy", 1);

  // ── Middleware ──────────────────────────────────────────────────────────────
  app.use(express.json({ limit: "1mb" }));

  // Rate limit all routes
  const limiter = rateLimit({
    windowMs: 60_000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use(limiter);

  // ── Agent Card (cross-origin required for A2A discovery) ──────────────────
  app.use(
    "/.well-known/agent-card.json",
    cors({ origin: "*" }),
    agentCardHandler({ agentCardProvider: requestHandler })
  );

  // ── A2A JSON-RPC endpoint ─────────────────────────────────────────────────
  app.use(
    "/a2a",
    jsonRpcHandler({
      requestHandler,
      userBuilder: UserBuilder.noAuthentication,
    })
  );

  // ── Health check ──────────────────────────────────────────────────────────
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  // ── Live network status ───────────────────────────────────────────────────
  app.get("/api/network", async (_req, res) => {
    try {
      const status = await fetchNetworkStatus();
      res.json(status);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res
        .status(502)
        .json({ error: NODE_ENV === "production" ? "RPC unavailable" : msg });
    }
  });

  // ── Skill metadata ────────────────────────────────────────────────────────
  app.get("/api/skill", (_req, res) => {
    res.json(skill);
  });

  // ── POST /api/preview ─────────────────────────────────────────────────────
  // Routes through the official A2A client → /a2a endpoint → DefaultRequestHandler
  // → PreviewAgentExecutor → MCP tools → live Monad Testnet RPC.
  // Same-origin CORS restriction.
  app.post("/api/preview", cors({ origin: false }), async (req, res) => {
    // Zod validate
    const parsed = PreviewRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request",
        issues: parsed.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }

    try {
      const artifact = await runPreviewViaA2AClient({
        sender: parsed.data.sender,
        recipient: parsed.data.recipient,
        amount: parsed.data.amount,
        localAgentCard,
      });
      res.json(artifact);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        error: NODE_ENV === "production" ? "Internal server error" : msg,
      });
    }
  });

  return app;
}

// ── Start ─────────────────────────────────────────────────────────────────────

createApp()
  .then((app) => {
    app.listen(PORT, () => {
      process.stdout.write(
        `agent-gateway listening on port ${PORT} (${NODE_ENV})\n`
      );
    });
  })
  .catch((err) => {
    process.stderr.write(`Failed to start agent-gateway: ${err}\n`);
    process.exit(1);
  });
