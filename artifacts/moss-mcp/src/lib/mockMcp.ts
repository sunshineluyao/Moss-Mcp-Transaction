import { MCPSimulationResult, SimulationFormParams } from "../types/mcp";

/**
 * MOCK MCP SIMULATION ENGINE
 * 
 * In a real environment, this function would:
 * 1. Gather the user's intent and parameters.
 * 2. Send a request to the Moss MCP backend / Monad RPC.
 * 3. The backend would trace the transaction, simulate state changes, and decode logs.
 * 4. The backend would run risk analysis and return a comprehensive payload.
 * 
 * This mock simulates that network delay and returns hardcoded scenarios 
 * for demonstration purposes.
 */
export async function simulateMCP(params: SimulationFormParams): Promise<MCPSimulationResult> {
  // Simulate network delay (800 - 1200ms)
  const delay = Math.floor(Math.random() * 400) + 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const { operationType, scenario, amount, tokenAddress, recipientAddress } = params;

  // Base result skeleton
  const result: MCPSimulationResult = {
    protocol: "Unknown",
    method: "unknown()",
    params: {
      to: recipientAddress || "0x0000000000000000000000000000000000000000",
      amount: amount.toString(),
      token: tokenAddress || "0x0000000000000000000000000000000000000000"
    },
    intent: "Unknown operation",
    riskLabels: [],
    receiptTexts: [],
    warnings: [],
    confidenceLevel: "LOW",
    status: "AWAITING_SIGNATURE" // Initial state after generation
  };

  // Populate based on Operation Type
  if (operationType === "ERC20 Transfer") {
    result.protocol = "ERC20";
    result.method = "transfer(address,uint256)";
    result.intent = `Transfer ${amount} tokens to ${recipientAddress}`;
    result.receiptTexts = [`Balance of ${recipientAddress} will increase by ${amount}`];
    
    if (amount > 10000) {
      result.warnings.push("Unusually large transfer amount detected.");
      result.riskLabels.push("LARGE_AMOUNT");
    }
  } else if (operationType === "ERC20 Approve") {
    result.protocol = "ERC20";
    result.method = "approve(address,uint256)";
    result.intent = `Approve ${recipientAddress} to spend ${amount} tokens`;
    result.receiptTexts = [`Allowance for ${recipientAddress} will be set to ${amount}`];
    
    if (amount > 1000000) {
      result.warnings.push("You are approving a nearly unlimited amount. This allows the spender to drain your tokens.");
      result.riskLabels.push("APPROVE_UNLIMITED");
      result.confidenceLevel = "MEDIUM";
    } else {
      result.confidenceLevel = "HIGH";
    }
  } else if (operationType === "Mock Swap Preview") {
    result.protocol = "Uniswap V3 (Mock)";
    result.method = "exactInputSingle(params)";
    result.intent = `Swap ${amount} input tokens for an estimated amount of output tokens`;
    result.receiptTexts = [
      `Input tokens deducted: ${amount}`,
      `Estimated output tokens received: ~${amount * 1.05}`
    ];
    result.riskLabels.push("SLIPPAGE_RISK");
  }

  // Adjust outcome based on Scenario
  if (scenario === "Success") {
    result.confidenceLevel = "HIGH";
    if (result.warnings.length === 0) {
      result.riskLabels.push("VERIFIED_CONTRACT");
    }
  } else if (scenario === "User Rejected") {
    result.status = "REJECTED";
    result.warnings.push("Transaction was rejected by the user.");
  } else if (scenario === "On-chain Reverted") {
    result.status = "REVERTED";
    result.confidenceLevel = "HIGH";
    result.warnings.push("Simulation indicates this transaction will revert on-chain (e.g., insufficient funds or slippage).");
    result.riskLabels.push("WILL_REVERT");
  } else if (scenario === "System Error") {
    result.status = "SYSTEM_ERROR";
    result.confidenceLevel = "LOW";
    result.warnings.push("RPC endpoint failed to respond during simulation.");
    result.intent = "Simulation unavailable due to system error.";
  }

  return result;
}
