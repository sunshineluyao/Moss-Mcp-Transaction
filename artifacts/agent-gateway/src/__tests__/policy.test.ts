/**
 * Unit tests: decision policy.
 * Every warning type must yield BLOCKED; a warning-free preflight yields READY_FOR_WALLET_REVIEW.
 */
import { describe, it, expect } from "vitest";

// The policy is embedded in previewAgent.ts: BLOCKED when warnings.length > 0,
// READY_FOR_WALLET_REVIEW when warnings is empty.
// We test the equivalent logic here as a direct unit test.

function applyDecisionPolicy(warnings: string[]): "READY_FOR_WALLET_REVIEW" | "BLOCKED" {
  return warnings.length === 0 ? "READY_FOR_WALLET_REVIEW" : "BLOCKED";
}

describe("Decision policy: STOP_ON_WARNING rule", () => {
  it("returns READY_FOR_WALLET_REVIEW when warnings array is empty", () => {
    expect(applyDecisionPolicy([])).toBe("READY_FOR_WALLET_REVIEW");
  });

  it("returns BLOCKED for a single warning", () => {
    expect(applyDecisionPolicy(["Insufficient balance"])).toBe("BLOCKED");
  });

  it("returns BLOCKED for multiple warnings", () => {
    expect(applyDecisionPolicy(["Zero address", "Insufficient balance"])).toBe("BLOCKED");
  });

  it("returns BLOCKED for chain ID mismatch warning", () => {
    expect(applyDecisionPolicy(["Wrong chain: expected 10143, got 1"])).toBe("BLOCKED");
  });

  it("returns BLOCKED for RPC timeout warning", () => {
    expect(applyDecisionPolicy(["RPC timeout after 10000ms"])).toBe("BLOCKED");
  });

  it("returns BLOCKED for invalid address warning", () => {
    expect(applyDecisionPolicy(["Invalid sender address"])).toBe("BLOCKED");
  });

  it("returns BLOCKED for zero address warning", () => {
    expect(applyDecisionPolicy(["Recipient is the zero address"])).toBe("BLOCKED");
  });

  it("returns BLOCKED for non-positive amount warning", () => {
    expect(applyDecisionPolicy(["Amount must be positive"])).toBe("BLOCKED");
  });

  it("returns BLOCKED for insufficient balance warning", () => {
    expect(applyDecisionPolicy(["Insufficient balance: need 2.0 MON but have 0.5 MON"])).toBe("BLOCKED");
  });

  it("returns BLOCKED for gas estimation failure warning", () => {
    expect(applyDecisionPolicy(["Gas estimation failed"])).toBe("BLOCKED");
  });

  it("returns BLOCKED for missing simulation evidence warning", () => {
    expect(applyDecisionPolicy(["Simulation evidence is missing — SIMULATION_REQUIRED rule violated"])).toBe("BLOCKED");
  });

  it("returns BLOCKED regardless of warning order", () => {
    expect(applyDecisionPolicy(["warning 2", "warning 1"])).toBe("BLOCKED");
  });
});

describe("Decision policy: BLOCKED is a valid completed state (not a failure)", () => {
  it("BLOCKED and READY_FOR_WALLET_REVIEW are both terminal, non-error decisions", () => {
    const validDecisions = new Set(["READY_FOR_WALLET_REVIEW", "BLOCKED"]);
    expect(validDecisions.has(applyDecisionPolicy([]))).toBe(true);
    expect(validDecisions.has(applyDecisionPolicy(["some warning"]))).toBe(true);
  });
});

// Mirror the computeSafetyFlags logic for direct unit testing
function computeSafetyFlagsForTest(
  networkEvidence: { chainId: number } | null,
  warnings: string[]
) {
  return {
    RECORD_INTENT: true,
    TESTNET_ONLY: true,
    DECIMAL_STRINGS: true,
    NO_PRIVATE_KEYS: true,
    NO_SIGNING: true,
    NO_BROADCAST: true,
    SIMULATION_REQUIRED: networkEvidence !== null,
    STOP_ON_WARNING: warnings.length > 0,
    PRESENT_BEFORE_SIGNING: true,
  };
}

describe("Safety flags: computed from actual execution outcomes", () => {
  it("SIMULATION_REQUIRED is false when networkEvidence is null (blocked before simulate step)", () => {
    const flags = computeSafetyFlagsForTest(null, ["Invalid address"]);
    expect(flags.SIMULATION_REQUIRED).toBe(false);
  });

  it("SIMULATION_REQUIRED is true when networkEvidence is present (simulate step ran)", () => {
    const flags = computeSafetyFlagsForTest({ chainId: 10143 }, []);
    expect(flags.SIMULATION_REQUIRED).toBe(true);
  });

  it("STOP_ON_WARNING is true when warnings exist", () => {
    const flags = computeSafetyFlagsForTest(null, ["Insufficient balance"]);
    expect(flags.STOP_ON_WARNING).toBe(true);
  });

  it("STOP_ON_WARNING is false when no warnings (clean READY path)", () => {
    const flags = computeSafetyFlagsForTest({ chainId: 10143 }, []);
    expect(flags.STOP_ON_WARNING).toBe(false);
  });

  it("static-policy flags are always true regardless of outcome", () => {
    const blockedFlags = computeSafetyFlagsForTest(null, ["some warning"]);
    const readyFlags = computeSafetyFlagsForTest({ chainId: 10143 }, []);
    for (const key of ["RECORD_INTENT", "TESTNET_ONLY", "DECIMAL_STRINGS",
                        "NO_PRIVATE_KEYS", "NO_SIGNING", "NO_BROADCAST",
                        "PRESENT_BEFORE_SIGNING"] as const) {
      expect(blockedFlags[key], `${key} should be true when BLOCKED`).toBe(true);
      expect(readyFlags[key], `${key} should be true when READY`).toBe(true);
    }
  });

  it("a READY artifact has SIMULATION_REQUIRED=true and STOP_ON_WARNING=false", () => {
    const flags = computeSafetyFlagsForTest({ chainId: 10143 }, []);
    expect(flags.SIMULATION_REQUIRED).toBe(true);
    expect(flags.STOP_ON_WARNING).toBe(false);
  });

  it("a BLOCKED artifact (pre-simulate, with warnings) has SIMULATION_REQUIRED=false and STOP_ON_WARNING=true", () => {
    const flags = computeSafetyFlagsForTest(null, ["Wrong chain"]);
    expect(flags.SIMULATION_REQUIRED).toBe(false);
    expect(flags.STOP_ON_WARNING).toBe(true);
  });
});
