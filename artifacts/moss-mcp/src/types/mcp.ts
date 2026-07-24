export interface MCPSimulationResult {
  protocol: string;
  method: string;
  params: Record<string, string>;
  intent: string;
  riskLabels: string[];
  receiptTexts: string[];
  warnings: string[];
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  status: "IDLE" | "AWAITING_SIGNATURE" | "PENDING" | "CONFIRMING" | "CONFIRMED" | "REJECTED" | "REVERTED" | "SYSTEM_ERROR";
}

export type OperationType = "ERC20 Transfer" | "ERC20 Approve" | "Mock Swap Preview";
export type ScenarioType = "Success" | "User Rejected" | "On-chain Reverted" | "System Error";

export interface SimulationFormParams {
  accountAddress: string;
  operationType: OperationType;
  tokenAddress: string;
  recipientAddress: string;
  amount: number;
  scenario: ScenarioType;
}
