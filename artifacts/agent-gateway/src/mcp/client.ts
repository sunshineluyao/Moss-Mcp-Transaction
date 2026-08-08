/**
 * MCP client wrapper for the monad-testnet-preview server.
 *
 * Spawns the MCP server as a subprocess over stdio and exposes
 * a callTool() method. Records a real trace entry per call.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join } from "node:path";
import type { McpTraceEntry } from "../shared/schema.js";

const SERVER_NAME = "monad-testnet-preview";
const SERVER_VERSION = "1.0.0";
const TRANSPORT = "stdio";

/** Resolve the MCP server entry point — always from the artifact directory */
function resolveServerPath(): string {
  // process.cwd() == artifacts/agent-gateway when run via pnpm --filter
  // The build places the MCP server at dist/mcp/server.mjs
  return join(process.cwd(), "dist", "mcp", "server.mjs");
}

export interface ToolCallResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export class McpClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  async connect(): Promise<void> {
    const serverPath = resolveServerPath();

    this.transport = new StdioClientTransport({
      command: "node",
      args: ["--enable-source-maps", serverPath],
    });

    this.client = new Client(
      { name: "agent-gateway-client", version: "1.0.0" },
      { capabilities: {} }
    );

    await this.client.connect(this.transport);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    this.transport = null;
  }

  /**
   * Call a tool by name with args. Records a real trace entry.
   * Throws if the client is not connected.
   */
  async callTool(
    toolName: string,
    toolArgs: Record<string, unknown>,
    trace: McpTraceEntry[]
  ): Promise<ToolCallResult> {
    if (!this.client) {
      throw new Error("McpClient not connected — call connect() first");
    }

    const startedAt = new Date().toISOString();
    const startMs = Date.now();
    const inputSummary = sanitizeInputSummary(toolName, toolArgs);

    let result: ToolCallResult;
    let success = false;
    let errorMsg: string | undefined;

    try {
      const raw = await this.client.callTool({
        name: toolName,
        arguments: toolArgs,
      });
      result = raw as unknown as ToolCallResult;
      success = !result.isError;
      if (result.isError) {
        const firstContent = result.content?.[0];
        if (firstContent?.type === "text") {
          try {
            const parsed = JSON.parse(firstContent.text) as { error?: string };
            errorMsg = parsed.error ?? "Tool returned error";
          } catch {
            errorMsg = firstContent.text;
          }
        } else {
          errorMsg = "Tool returned error";
        }
      }
    } catch (err) {
      result = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: err instanceof Error ? err.message : String(err),
            }),
          },
        ],
        isError: true,
      };
      errorMsg = err instanceof Error ? err.message : String(err);
      success = false;
    }

    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startMs;

    const traceEntry: McpTraceEntry = {
      serverName: SERVER_NAME,
      serverVersion: SERVER_VERSION,
      transport: TRANSPORT,
      tool: toolName,
      startedAt,
      completedAt,
      durationMs,
      success,
      inputSummary,
      dataSource:
        toolName === "preview_simulate"
          ? "Monad Testnet RPC (https://testnet-rpc.monad.xyz)"
          : "local-validation",
      ...(errorMsg ? { error: errorMsg } : {}),
    };

    trace.push(traceEntry);
    return result;
  }
}

/** Sanitize tool arguments for logging — truncate long values, redact unsignedTx internals */
function sanitizeInputSummary(
  toolName: string,
  args: Record<string, unknown>
): string {
  const parts: string[] = [`tool=${toolName}`];
  for (const [key, val] of Object.entries(args)) {
    if (key === "unsignedTx") {
      parts.push("unsignedTx={...}");
      continue;
    }
    const str = String(val);
    parts.push(`${key}=${str.length > 80 ? str.slice(0, 80) + "…" : str}`);
  }
  return parts.join(" ");
}
