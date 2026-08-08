/**
 * A2A Agent Executor: Monad Testnet Safe Preview Agent
 *
 * Implements the AgentExecutor interface. On each execute() call:
 *   1. Spawns an MCP client connected to the monad-testnet-preview server
 *   2. Calls preview_discover → preview_load → preview_action → preview_simulate
 *   3. Maps the results to the preview artifact schema
 *   4. Publishes task + statusUpdate events to the event bus
 *
 * A BLOCKED decision is a successfully completed task (not a failure).
 */
import {
  type AgentExecutor,
  type ExecutionEventBus,
  type RequestContext,
  AgentEvent,
} from "@a2a-js/sdk/server";
import {
  type Task,
  type TaskStatusUpdateEvent,
  type TaskArtifactUpdateEvent,
  TaskState,
  Role,
} from "@a2a-js/sdk";
import { randomUUID } from "node:crypto";
import { McpClient } from "../mcp/client.js";
import { loadSkill } from "../skills/loadSkill.js";
import type {
  PreviewArtifact,
  McpTraceEntry,
  UnsignedTx,
  NetworkEvidence,
  SafetyFlags,
  SkillMetadata,
} from "../shared/schema.js";
import { PreviewRequestSchema } from "../shared/schema.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseTextContent(
  result: { content?: Array<{ type: string; text: string }>; isError?: boolean },
  toolName: string
): Record<string, unknown> {
  const first = result.content?.[0];
  if (!first || first.type !== "text") {
    throw new Error(`${toolName}: unexpected content type`);
  }
  try {
    return JSON.parse(first.text) as Record<string, unknown>;
  } catch {
    throw new Error(`${toolName}: failed to parse JSON: ${first.text}`);
  }
}

/**
 * Compute safety flags from actual execution outcomes.
 *
 * Flags represent what the agent DID during this particular run:
 * - Static-policy flags (RECORD_INTENT, TESTNET_ONLY, etc.) are always true —
 *   the agent always applies these regardless of the outcome.
 * - SIMULATION_REQUIRED is true only when the simulate step reached the RPC
 *   (i.e. networkEvidence is not null), preventing misrepresentation on
 *   early-BLOCKED paths.
 * - STOP_ON_WARNING is true when the run was blocked by one or more warnings.
 */
function computeSafetyFlags(
  networkEvidence: NetworkEvidence | null,
  warnings: string[]
): SafetyFlags {
  return {
    RECORD_INTENT: true,         // Intent is always recorded before any MCP call
    TESTNET_ONLY: true,          // Agent only targets Monad Testnet (chain 10143)
    DECIMAL_STRINGS: true,       // Amount is always validated as a decimal string
    NO_PRIVATE_KEYS: true,       // No private key ever enters the agent
    NO_SIGNING: true,            // Transaction is never signed
    NO_BROADCAST: true,          // Transaction is never broadcast
    SIMULATION_REQUIRED: networkEvidence !== null, // true only when simulate step ran
    STOP_ON_WARNING: warnings.length > 0,          // true when we stopped due to warnings
    PRESENT_BEFORE_SIGNING: true, // Results always presented (signing never happens)
  };
}

// ── Agent executor ────────────────────────────────────────────────────────────

export class PreviewAgentExecutor implements AgentExecutor {
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const { taskId, contextId } = requestContext;
    const a2aArtifactId = randomUUID();
    const createdAt = new Date().toISOString();

    // ── Parse input ──────────────────────────────────────────────────────────
    let sender = "";
    let recipient = "";
    let amount = "";

    const userMessage = requestContext.userMessage;
    // Try structured parts
    for (const part of userMessage.parts ?? []) {
      if (part.content?.$case === "data") {
        try {
          const raw = part.content.value;
          const str = typeof raw === "string" ? raw : JSON.stringify(raw);
          const parsed = JSON.parse(str) as {
            sender?: string;
            recipient?: string;
            amount?: string;
          };
          if (parsed.sender) sender = parsed.sender;
          if (parsed.recipient) recipient = parsed.recipient;
          if (parsed.amount) amount = parsed.amount;
        } catch {
          // not JSON
        }
      } else if (part.content?.$case === "text") {
        try {
          const parsed = JSON.parse(part.content.value) as {
            sender?: string;
            recipient?: string;
            amount?: string;
          };
          if (parsed.sender) sender = parsed.sender;
          if (parsed.recipient) recipient = parsed.recipient;
          if (parsed.amount) amount = parsed.amount;
        } catch {
          // not JSON text
        }
      }
    }

    const parseResult = PreviewRequestSchema.safeParse({
      sender,
      recipient,
      amount,
    });

    const skill = await loadSkill();
    const mcpTrace: McpTraceEntry[] = [];

    // ── Publish initial task event ────────────────────────────────────────────
    const initialTask: Task = {
      id: taskId,
      contextId,
      status: {
        state: TaskState.TASK_STATE_SUBMITTED,
        timestamp: createdAt,
        message: undefined,
      },
      artifacts: [],
      metadata: {},
      history: [],
    };
    eventBus.publish(AgentEvent.task(initialTask));

    // ── Status: working ───────────────────────────────────────────────────────
    const workingUpdate: TaskStatusUpdateEvent = {
      taskId,
      contextId,
      status: {
        state: TaskState.TASK_STATE_WORKING,
        timestamp: new Date().toISOString(),
        message: makeAgentMessage(
          "Running Monad Testnet preflight checks…"
        ),
      },
      metadata: undefined,
    };
    eventBus.publish(AgentEvent.statusUpdate(workingUpdate));

    // ── Handle invalid input ──────────────────────────────────────────────────
    if (!parseResult.success) {
      const warnings = parseResult.error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`
      );
      const artifact = buildBlockedArtifact({
        a2aTaskId: taskId,
        a2aContextId: contextId,
        a2aArtifactId,
        sender,
        recipient,
        amount,
        warnings,
        skill,
        mcpTrace,
        createdAt,
      });
      publishArtifactAndComplete(eventBus, taskId, contextId, artifact);
      return;
    }

    const {
      sender: validSender,
      recipient: validRecipient,
      amount: validAmount,
    } = parseResult.data;

    // ── Connect MCP client ────────────────────────────────────────────────────
    const mcpClient = new McpClient();
    try {
      await mcpClient.connect();
    } catch (err) {
      const warnings = [
        `Failed to connect to MCP server: ${err instanceof Error ? err.message : String(err)}`,
      ];
      const artifact = buildBlockedArtifact({
        a2aTaskId: taskId,
        a2aContextId: contextId,
        a2aArtifactId,
        sender: validSender,
        recipient: validRecipient,
        amount: validAmount,
        warnings,
        skill,
        mcpTrace,
        createdAt,
      });
      publishArtifactAndComplete(eventBus, taskId, contextId, artifact);
      return;
    }

    try {
      // ── Step 1: preview_discover ──────────────────────────────────────────
      const discoverResult = await mcpClient.callTool(
        "preview_discover",
        {},
        mcpTrace
      );
      if (discoverResult.isError) {
        const d = parseTextContent(discoverResult, "preview_discover");
        const artifact = buildBlockedArtifact({
          a2aTaskId: taskId,
          a2aContextId: contextId,
          a2aArtifactId,
          sender: validSender,
          recipient: validRecipient,
          amount: validAmount,
          warnings: [`preview_discover failed: ${d["error"] ?? "unknown"}`],
          skill,
          mcpTrace,
          createdAt,
        });
        publishArtifactAndComplete(eventBus, taskId, contextId, artifact);
        return;
      }

      // ── Step 2: preview_load ──────────────────────────────────────────────
      const loadResult = await mcpClient.callTool(
        "preview_load",
        { actionId: "transfer_mon" },
        mcpTrace
      );
      if (loadResult.isError) {
        const d = parseTextContent(loadResult, "preview_load");
        const artifact = buildBlockedArtifact({
          a2aTaskId: taskId,
          a2aContextId: contextId,
          a2aArtifactId,
          sender: validSender,
          recipient: validRecipient,
          amount: validAmount,
          warnings: [`preview_load failed: ${d["error"] ?? "unknown"}`],
          skill,
          mcpTrace,
          createdAt,
        });
        publishArtifactAndComplete(eventBus, taskId, contextId, artifact);
        return;
      }

      // ── Step 3: preview_action ────────────────────────────────────────────
      const actionResult = await mcpClient.callTool(
        "preview_action",
        { sender: validSender, recipient: validRecipient, amount: validAmount },
        mcpTrace
      );
      const actionData = parseTextContent(actionResult, "preview_action");

      if (
        actionData["decision"] === "BLOCKED" ||
        (Array.isArray(actionData["warnings"]) &&
          (actionData["warnings"] as string[]).length > 0)
      ) {
        const artifact = buildBlockedArtifact({
          a2aTaskId: taskId,
          a2aContextId: contextId,
          a2aArtifactId,
          sender: validSender,
          recipient: validRecipient,
          amount: validAmount,
          warnings:
            (actionData["warnings"] as string[]) ?? ["preview_action blocked"],
          skill,
          mcpTrace,
          createdAt,
        });
        publishArtifactAndComplete(eventBus, taskId, contextId, artifact);
        return;
      }

      const unsignedTx = actionData["unsignedTx"] as UnsignedTx;

      // ── Step 4: preview_simulate ──────────────────────────────────────────
      const simulateResult = await mcpClient.callTool(
        "preview_simulate",
        {
          sender: validSender,
          recipient: validRecipient,
          amount: validAmount,
          unsignedTx,
        },
        mcpTrace
      );
      const simData = parseTextContent(simulateResult, "preview_simulate");

      const decision =
        simData["decision"] === "READY_FOR_WALLET_REVIEW"
          ? "READY_FOR_WALLET_REVIEW"
          : "BLOCKED";
      const warnings = (simData["warnings"] as string[]) ?? [];
      const networkEvidence =
        (simData["networkEvidence"] as NetworkEvidence) ?? null;
      const finalUnsignedTx =
        (simData["unsignedTx"] as UnsignedTx) ?? unsignedTx;

      const artifact: PreviewArtifact = {
        a2aTaskId: taskId,
        a2aContextId: contextId,
        a2aArtifactId,
        sender: validSender,
        recipient: validRecipient,
        amount: validAmount,
        unsignedTx: finalUnsignedTx,
        networkEvidence,
        decision,
        warnings,
        safetyFlags: computeSafetyFlags(networkEvidence, warnings),
        skill,
        mcpTrace,
        createdAt,
      };

      publishArtifactAndComplete(eventBus, taskId, contextId, artifact);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const failedStatus: TaskStatusUpdateEvent = {
        taskId,
        contextId,
        status: {
          state: TaskState.TASK_STATE_FAILED,
          timestamp: new Date().toISOString(),
          message: makeAgentMessage(`Internal error: ${errMsg}`),
        },
        metadata: undefined,
      };
      eventBus.publish(AgentEvent.statusUpdate(failedStatus));
    } finally {
      await mcpClient.disconnect().catch(() => {});
    }
  }

  async cancelTask(
    taskId: string,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const canceledUpdate: TaskStatusUpdateEvent = {
      taskId,
      contextId: "",
      status: {
        state: TaskState.TASK_STATE_CANCELED,
        timestamp: new Date().toISOString(),
        message: undefined,
      },
      metadata: undefined,
    };
    eventBus.publish(AgentEvent.statusUpdate(canceledUpdate));
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeAgentMessage(text: string) {
  return {
    role: Role.ROLE_AGENT,
    parts: [
      {
        content: { $case: "text" as const, value: text },
        metadata: undefined,
        filename: "",
        mediaType: "text/plain",
      },
    ],
    messageId: randomUUID(),
    kind: "message" as const,
    contextId: "",
    taskId: "",
    metadata: undefined,
    extensions: [],
    referenceTaskIds: [],
  };
}

function buildBlockedArtifact(params: {
  a2aTaskId: string;
  a2aContextId: string;
  a2aArtifactId: string;
  sender: string;
  recipient: string;
  amount: string;
  warnings: string[];
  skill: SkillMetadata;
  mcpTrace: McpTraceEntry[];
  createdAt: string;
}): PreviewArtifact {
  return {
    a2aTaskId: params.a2aTaskId,
    a2aContextId: params.a2aContextId,
    a2aArtifactId: params.a2aArtifactId,
    sender: params.sender,
    recipient: params.recipient,
    amount: params.amount,
    unsignedTx: null,
    networkEvidence: null,
    decision: "BLOCKED",
    warnings: params.warnings,
    // Blocked before simulate step → SIMULATION_REQUIRED=false; STOP_ON_WARNING=true
    safetyFlags: computeSafetyFlags(null, params.warnings),
    skill: params.skill,
    mcpTrace: params.mcpTrace,
    createdAt: params.createdAt,
  };
}

function publishArtifactAndComplete(
  eventBus: ExecutionEventBus,
  taskId: string,
  contextId: string,
  artifact: PreviewArtifact
): void {
  const artifactUpdate: TaskArtifactUpdateEvent = {
    taskId,
    contextId,
    artifact: {
      artifactId: artifact.a2aArtifactId,
      name: "preview-result",
      description: `Monad Testnet transfer preview: ${artifact.decision}`,
      parts: [
        {
          content: {
            $case: "text" as const,
            value: JSON.stringify(artifact),
          },
          metadata: undefined,
          filename: "",
          mediaType: "application/json",
        },
      ],
      metadata: {},
      extensions: [],
    },
    append: false,
    lastChunk: true,
    metadata: undefined,
  };
  eventBus.publish(AgentEvent.artifactUpdate(artifactUpdate));

  const summary = `Preview complete: ${artifact.decision}. ${
    artifact.warnings.length > 0
      ? "Warnings: " + artifact.warnings.join("; ")
      : "All checks passed."
  }`;

  const completedUpdate: TaskStatusUpdateEvent = {
    taskId,
    contextId,
    status: {
      state: TaskState.TASK_STATE_COMPLETED,
      timestamp: new Date().toISOString(),
      message: makeAgentMessage(summary),
    },
    metadata: undefined,
  };
  eventBus.publish(AgentEvent.statusUpdate(completedUpdate));
}
