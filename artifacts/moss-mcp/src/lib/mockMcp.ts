import { MCPSimulationResult, SimulationFormParams } from "../types/mcp";

// =============================================================================
// MOCK MCP SIMULATION ENGINE
//
// ⚠️  THIS IS A DEMO STUB — replace the body of `simulateMCP` with real calls
//     to the @moss/mcp-server SDK when integrating for real.
//
// Real integration entry point:
//   https://github.com/nishuzumi/moss/tree/main/packages/mcp-server
//
// The real lifecycle uses four SDK methods:
//   1. discover(walletAddress)         — finds available MCP actions for a wallet
//   2. load(actionId, params)          — loads the action manifest / ABI
//   3. action(manifest, userParams)    — constructs the unsigned transaction
//   4. simulate(unsignedTx, rpcUrl)    — dry-runs the tx and returns risk analysis
//
// Replace the delay + hardcoded returns below with:
//
//   import { MossClient } from "@moss/mcp-server";
//   const client = new MossClient({ rpcUrl: process.env.MONAD_RPC_URL });
//   const actions   = await client.discover(params.accountAddress);
//   const manifest  = await client.load(actions[0].id, params);
//   const tx        = await client.action(manifest, params);
//   const result    = await client.simulate(tx);
//   return result;   // already matches MCPSimulationResult shape
//
// =============================================================================

export async function simulateMCP(params: SimulationFormParams): Promise<MCPSimulationResult> {
  // --- MOCK: simulated network delay (800–1200 ms) ---
  // In production this delay is replaced by the actual MCP round-trip.
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

  // --- Adjust outcome based on Scenario ---
  // In production: the scenario is determined by the actual simulate() call result,
  // not a dropdown. These branches show what each terminal state means in practice.

  if (scenario === "Success") {
    // Happy path: tx simulated, signed, submitted, and confirmed on-chain.
    result.confidenceLevel = "HIGH";
    result.status = "CONFIRMED"; // ← must reach CONFIRMED for the green timeline
    if (result.warnings.length === 0) {
      result.riskLabels.push("VERIFIED_CONTRACT");
    }
  } else if (scenario === "User Rejected") {
    // User declined to sign — nothing was ever submitted to the chain.
    result.status = "REJECTED";
    result.warnings.push("Transaction was rejected by the user.");
  } else if (scenario === "On-chain Reverted") {
    // Tx was submitted but the EVM execution failed (e.g. insufficient funds, bad slippage).
    result.status = "REVERTED";
    result.confidenceLevel = "HIGH";
    result.warnings.push("Simulation indicates this transaction will revert on-chain (e.g., insufficient funds or slippage).");
    result.riskLabels.push("WILL_REVERT");
  } else if (scenario === "System Error") {
    // The MCP pipeline itself failed — RPC timeout, decoding error, etc.
    // No on-chain activity occurred.
    result.status = "SYSTEM_ERROR";
    result.confidenceLevel = "LOW";
    result.warnings.push("RPC endpoint failed to respond during simulation.");
    result.intent = "Simulation unavailable due to system error.";
  }

  return result;
}
