/**
 * Frontend-local mirror of the PreviewArtifact schema from agent-gateway.
 * Keeps the frontend decoupled from the backend package.
 */

export interface NetworkEvidence {
  chainId: number;
  chainIdVerified: boolean;
  blockNumber: string;
  blockTimestamp: number;
  senderBalance: string;
  senderBalanceEth: string;
  estimatedGas: string;
  gasPrice: string;
  gasCostEth: string;
  recipientIsContract: boolean;
  rpcUrl: string;
  queriedAt: string;
}

export interface SafetyFlags {
  RECORD_INTENT: boolean;
  TESTNET_ONLY: boolean;
  DECIMAL_STRINGS: boolean;
  NO_PRIVATE_KEYS: boolean;
  NO_SIGNING: boolean;
  NO_BROADCAST: boolean;
  SIMULATION_REQUIRED: boolean;
  STOP_ON_WARNING: boolean;
  PRESENT_BEFORE_SIGNING: boolean;
}

export interface McpTraceEntry {
  serverName: string;
  serverVersion: string;
  transport: string;
  tool: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  success: boolean;
  inputSummary: string;
  dataSource: string;
  error?: string;
}

export interface UnsignedTx {
  from: string;
  to: string;
  value: string;
  data: string;
  gasLimit: string;
  chainId: number;
}

export interface SkillMetadata {
  name: string;
  description: string;
  sourceUrl: string;
  path: string;
  contentHash: string;
  appliedRuleIds: string[];
}

export type PreviewDecision = "READY_FOR_WALLET_REVIEW" | "BLOCKED";

export interface PreviewArtifact {
  a2aTaskId: string;
  a2aContextId: string;
  a2aArtifactId: string;
  sender: string;
  recipient: string;
  amount: string;
  unsignedTx: UnsignedTx | null;
  networkEvidence: NetworkEvidence | null;
  decision: PreviewDecision;
  warnings: string[];
  safetyFlags: SafetyFlags;
  skill: SkillMetadata;
  mcpTrace: McpTraceEntry[];
  createdAt: string;
}

export interface PreviewRequest {
  sender: string;
  recipient: string;
  amount: string;
}

export interface PreviewError {
  error: string;
  issues?: Array<{ path: string; message: string }>;
}
