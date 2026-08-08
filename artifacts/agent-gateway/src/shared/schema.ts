import { z } from "zod";

// ── Input validation ──────────────────────────────────────────────────────────

/** Ethereum address: 0x + 40 hex chars (EIP-55 or lowercase) */
const addressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "Invalid Ethereum address");

/** Decimal string: positive number as string, e.g. "1.5", "0.001" */
const decimalStringSchema = z
  .string()
  .regex(
    /^\d+(\.\d+)?$/,
    'Amount must be a positive decimal string, e.g. "1.5"'
  );

export const PreviewRequestSchema = z.object({
  sender: addressSchema,
  recipient: addressSchema,
  amount: decimalStringSchema,
});
export type PreviewRequest = z.infer<typeof PreviewRequestSchema>;

// ── MCP tool input schemas ────────────────────────────────────────────────────

export const DiscoverInputSchema = z.object({});
export type DiscoverInput = z.infer<typeof DiscoverInputSchema>;

export const LoadInputSchema = z.object({
  actionId: z.string(),
});
export type LoadInput = z.infer<typeof LoadInputSchema>;

export const ActionInputSchema = z.object({
  sender: addressSchema,
  recipient: addressSchema,
  amount: decimalStringSchema,
});
export type ActionInput = z.infer<typeof ActionInputSchema>;

export const SimulateInputSchema = z.object({
  sender: addressSchema,
  recipient: addressSchema,
  amount: decimalStringSchema,
  unsignedTx: z.object({
    from: addressSchema,
    to: addressSchema,
    value: z.string(),
    data: z.string(),
    gasLimit: z.string(),
    chainId: z.number(),
  }),
});
export type SimulateInput = z.infer<typeof SimulateInputSchema>;

// ── Network evidence ──────────────────────────────────────────────────────────

export const NetworkEvidenceSchema = z.object({
  chainId: z.number(),
  chainIdVerified: z.boolean(),
  blockNumber: z.string(),
  blockTimestamp: z.number(),
  senderBalance: z.string(),
  senderBalanceEth: z.string(),
  estimatedGas: z.string(),
  gasPrice: z.string(),
  gasCostEth: z.string(),
  recipientIsContract: z.boolean(),
  rpcUrl: z.string(),
  queriedAt: z.string(),
});
export type NetworkEvidence = z.infer<typeof NetworkEvidenceSchema>;

// ── Safety flags ──────────────────────────────────────────────────────────────

export const SafetyFlagsSchema = z.object({
  RECORD_INTENT: z.boolean(),
  TESTNET_ONLY: z.boolean(),
  DECIMAL_STRINGS: z.boolean(),
  NO_PRIVATE_KEYS: z.boolean(),
  NO_SIGNING: z.boolean(),
  NO_BROADCAST: z.boolean(),
  SIMULATION_REQUIRED: z.boolean(),
  STOP_ON_WARNING: z.boolean(),
  PRESENT_BEFORE_SIGNING: z.boolean(),
});
export type SafetyFlags = z.infer<typeof SafetyFlagsSchema>;

// ── MCP trace entry ───────────────────────────────────────────────────────────

export const McpTraceEntrySchema = z.object({
  serverName: z.string(),
  serverVersion: z.string(),
  transport: z.string(),
  tool: z.string(),
  startedAt: z.string(),
  completedAt: z.string(),
  durationMs: z.number(),
  success: z.boolean(),
  inputSummary: z.string(),
  dataSource: z.string(),
  error: z.string().optional(),
});
export type McpTraceEntry = z.infer<typeof McpTraceEntrySchema>;

// ── Unsigned transaction (with chain ID) ──────────────────────────────────────

export const UnsignedTxSchema = z.object({
  from: addressSchema,
  to: addressSchema,
  value: z.string(),
  data: z.string(),
  gasLimit: z.string(),
  chainId: z.number(),
});
export type UnsignedTx = z.infer<typeof UnsignedTxSchema>;

// ── Skill metadata ────────────────────────────────────────────────────────────

export const SkillMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  sourceUrl: z.string(),
  path: z.string(),
  contentHash: z.string(),
  appliedRuleIds: z.array(z.string()),
});
export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;

// ── Full preview artifact ─────────────────────────────────────────────────────

export type PreviewDecision = "READY_FOR_WALLET_REVIEW" | "BLOCKED";

export const PreviewArtifactSchema = z.object({
  // A2A identifiers
  a2aTaskId: z.string(),
  a2aContextId: z.string(),
  a2aArtifactId: z.string(),
  // Request echo
  sender: addressSchema,
  recipient: addressSchema,
  amount: decimalStringSchema,
  // Unsigned transaction (null when BLOCKED before action step)
  unsignedTx: UnsignedTxSchema.nullable(),
  // Live chain data (null when BLOCKED before simulate step)
  networkEvidence: NetworkEvidenceSchema.nullable(),
  // Decision
  decision: z.enum(["READY_FOR_WALLET_REVIEW", "BLOCKED"]),
  warnings: z.array(z.string()),
  // Safety rules applied
  safetyFlags: SafetyFlagsSchema,
  // Skill metadata
  skill: SkillMetadataSchema,
  // MCP execution trace
  mcpTrace: z.array(McpTraceEntrySchema),
  // Timestamps
  createdAt: z.string(),
});
export type PreviewArtifact = z.infer<typeof PreviewArtifactSchema>;
