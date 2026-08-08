/**
 * Monad Testnet Preview MCP Server
 *
 * Exposes four tools over stdio transport:
 *   preview_discover  — returns available action
 *   preview_load      — returns input contract + safety rules
 *   preview_action    — validates addresses/amount, builds unsigned tx (no RPC)
 *   preview_simulate  — requires preview_action output, queries live Monad Testnet RPC
 *
 * Run as a subprocess; the MCP client in client.ts spawns this file.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { parseEther, isAddress, getAddress, formatEther } from "viem";
import {
  ActionInputSchema,
  SimulateInputSchema,
  LoadInputSchema,
  DiscoverInputSchema,
} from "../shared/schema.js";
import { fetchNetworkEvidence, RpcError } from "../rpc/monadTestnet.js";

const MONAD_TESTNET_CHAIN_ID = 10143;

const SKILL_RULE_IDS = [
  "RECORD_INTENT",
  "TESTNET_ONLY",
  "DECIMAL_STRINGS",
  "NO_PRIVATE_KEYS",
  "NO_SIGNING",
  "NO_BROADCAST",
  "SIMULATION_REQUIRED",
  "STOP_ON_WARNING",
  "PRESENT_BEFORE_SIGNING",
];

const server = new Server(
  { name: "monad-testnet-preview", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ── Tool: list ────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [
    {
      name: "preview_discover",
      description:
        "Returns the available preview action for Monad Testnet native MON transfers.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "preview_load",
      description:
        "Returns the input contract (required fields, types) and active safety rule IDs for the given action.",
      inputSchema: {
        type: "object",
        properties: {
          actionId: {
            type: "string",
            description: "The action ID returned by preview_discover.",
          },
        },
        required: ["actionId"],
      },
    },
    {
      name: "preview_action",
      description:
        "Validates sender, recipient, and amount. Constructs an unsigned transaction object with chainId. No RPC call.",
      inputSchema: {
        type: "object",
        properties: {
          sender: { type: "string", description: "Sender Ethereum address" },
          recipient: {
            type: "string",
            description: "Recipient Ethereum address",
          },
          amount: {
            type: "string",
            description: 'Amount as decimal string, e.g. "1.5"',
          },
        },
        required: ["sender", "recipient", "amount"],
      },
    },
    {
      name: "preview_simulate",
      description:
        "Requires preview_action output. Verifies transaction fields match the preflighted intent. Queries live Monad Testnet RPC for balance, gas, block data, and returns network evidence + decision.",
      inputSchema: {
        type: "object",
        properties: {
          sender: { type: "string" },
          recipient: { type: "string" },
          amount: { type: "string" },
          unsignedTx: {
            type: "object",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              value: { type: "string" },
              data: { type: "string" },
              gasLimit: { type: "string" },
              chainId: { type: "number" },
            },
            required: ["from", "to", "value", "data", "gasLimit", "chainId"],
          },
        },
        required: ["sender", "recipient", "amount", "unsignedTx"],
      },
    },
  ],
}));

// ── Tool: call ────────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "preview_discover": {
        DiscoverInputSchema.parse(args ?? {});
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                actions: [
                  {
                    id: "transfer_mon",
                    label: "Transfer MON (native)",
                    description:
                      "Preview a native MON transfer on Monad Testnet",
                    network: "monad-testnet",
                    chainId: MONAD_TESTNET_CHAIN_ID,
                  },
                ],
              }),
            },
          ],
        };
      }

      case "preview_load": {
        const input = LoadInputSchema.parse(args);
        if (input.actionId !== "transfer_mon") {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: `Unknown action: ${input.actionId}`,
                }),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                actionId: "transfer_mon",
                inputContract: {
                  sender: {
                    type: "address",
                    required: true,
                    description: "Sender Ethereum address (0x...)",
                  },
                  recipient: {
                    type: "address",
                    required: true,
                    description: "Recipient Ethereum address (0x...)",
                  },
                  amount: {
                    type: "decimal_string",
                    required: true,
                    description: 'Amount in MON as decimal string, e.g. "1.5"',
                  },
                },
                safetyRuleIds: SKILL_RULE_IDS,
                skillId: "preview_monad_testnet_transfer",
              }),
            },
          ],
        };
      }

      case "preview_action": {
        const input = ActionInputSchema.parse(args);
        const { sender, recipient, amount } = input;

        const warnings: string[] = [];

        // Validate addresses
        if (!isAddress(sender)) {
          warnings.push(`Invalid sender address: ${sender}`);
        }
        if (!isAddress(recipient)) {
          warnings.push(`Invalid recipient address: ${recipient}`);
        }

        // Zero address check
        const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
        if (sender.toLowerCase() === ZERO_ADDRESS) {
          warnings.push("Sender is the zero address");
        }
        if (recipient.toLowerCase() === ZERO_ADDRESS) {
          warnings.push("Recipient is the zero address");
        }

        // Amount check
        let valueWei: bigint;
        try {
          valueWei = parseEther(amount);
          if (valueWei <= 0n) {
            warnings.push("Amount must be positive");
          }
        } catch {
          warnings.push(`Cannot parse amount as ether: ${amount}`);
          valueWei = 0n;
        }

        if (warnings.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  decision: "BLOCKED",
                  warnings,
                  unsignedTx: null,
                }),
              },
            ],
          };
        }

        const senderAddr = getAddress(sender);
        const recipientAddr = getAddress(recipient);

        // Construct unsigned tx with chainId (no RPC call)
        // gasLimit is a placeholder; preview_simulate will update it with the live estimate
        const unsignedTx = {
          from: senderAddr,
          to: recipientAddr,
          value: valueWei.toString(),
          data: "0x",
          gasLimit: "21000",
          chainId: MONAD_TESTNET_CHAIN_ID,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                decision: "PENDING_SIMULATION",
                warnings: [],
                unsignedTx,
              }),
            },
          ],
        };
      }

      case "preview_simulate": {
        const input = SimulateInputSchema.parse(args);
        const { sender, recipient, amount, unsignedTx } = input;

        const warnings: string[] = [];

        // ── Transaction integrity verification ────────────────────────────────
        // Verify that the unsignedTx was produced for exactly this sender/recipient/amount.
        // This prevents a caller from obtaining READY_FOR_WALLET_REVIEW for a transaction
        // whose destination or value differs from the preflighted intent.
        const senderChecksummed = isAddress(sender)
          ? getAddress(sender)
          : sender;
        const recipientChecksummed = isAddress(recipient)
          ? getAddress(recipient)
          : recipient;

        let expectedValueWei: bigint;
        try {
          expectedValueWei = parseEther(amount);
        } catch {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  decision: "BLOCKED",
                  warnings: [`Cannot parse amount: ${amount}`],
                  networkEvidence: null,
                }),
              },
            ],
          };
        }

        const txFromMismatch =
          unsignedTx.from.toLowerCase() !== senderChecksummed.toLowerCase();
        const txToMismatch =
          unsignedTx.to.toLowerCase() !== recipientChecksummed.toLowerCase();
        const txValueMismatch =
          unsignedTx.value !== expectedValueWei.toString();
        const txChainIdMismatch = unsignedTx.chainId !== MONAD_TESTNET_CHAIN_ID;

        if (txFromMismatch) {
          warnings.push(
            `Transaction integrity violation: unsignedTx.from (${unsignedTx.from}) does not match sender (${senderChecksummed})`
          );
        }
        if (txToMismatch) {
          warnings.push(
            `Transaction integrity violation: unsignedTx.to (${unsignedTx.to}) does not match recipient (${recipientChecksummed})`
          );
        }
        if (txValueMismatch) {
          warnings.push(
            `Transaction integrity violation: unsignedTx.value (${unsignedTx.value}) does not match amount ${amount} (expected ${expectedValueWei})`
          );
        }
        if (txChainIdMismatch) {
          warnings.push(
            `Transaction integrity violation: unsignedTx.chainId (${unsignedTx.chainId}) must be ${MONAD_TESTNET_CHAIN_ID}`
          );
        }

        if (warnings.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  decision: "BLOCKED",
                  warnings,
                  networkEvidence: null,
                }),
              },
            ],
          };
        }

        // ── Live RPC call ────────────────────────────────────────────────────
        let networkEvidence;
        try {
          networkEvidence = await fetchNetworkEvidence({
            sender,
            recipient,
            amount,
          });
        } catch (err) {
          if (err instanceof RpcError) {
            warnings.push(`RPC error (${err.code}): ${err.message}`);
          } else {
            warnings.push(
              `Unexpected RPC failure: ${err instanceof Error ? err.message : String(err)}`
            );
          }
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  decision: "BLOCKED",
                  warnings,
                  networkEvidence: null,
                }),
              },
            ],
          };
        }

        // ── Balance check ────────────────────────────────────────────────────
        const senderBalance = BigInt(networkEvidence.senderBalance);
        const valueWei = parseEther(amount);
        const gasPrice = BigInt(networkEvidence.gasPrice);
        const estimatedGas = BigInt(networkEvidence.estimatedGas);
        const gasCost = gasPrice * estimatedGas;
        const required = valueWei + gasCost;

        if (senderBalance < required) {
          warnings.push(
            `Insufficient balance: have ${formatEther(senderBalance)} MON, need ~${formatEther(required)} MON (value + gas)`
          );
        }

        // Update unsigned tx with live gas estimate and verified chainId
        const updatedUnsignedTx = {
          ...unsignedTx,
          gasLimit: networkEvidence.estimatedGas,
          chainId: MONAD_TESTNET_CHAIN_ID,
        };

        const decision =
          warnings.length === 0 ? "READY_FOR_WALLET_REVIEW" : "BLOCKED";

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                decision,
                warnings,
                networkEvidence,
                unsignedTx: updatedUnsignedTx,
              }),
            },
          ],
        };
      }

      default:
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
        };
    }
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? `Validation error: ${err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ")}`
        : err instanceof Error
          ? err.message
          : String(err);

    return {
      isError: true,
      content: [{ type: "text", text: JSON.stringify({ error: message }) }],
    };
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("MCP server monad-testnet-preview v1.0.0 running on stdio\n");
}

main().catch((err) => {
  process.stderr.write(`MCP server fatal error: ${err}\n`);
  process.exit(1);
});
