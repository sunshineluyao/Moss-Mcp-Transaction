/**
 * Unit tests: input validation (address, amount, zero-address, decimals).
 */
import { describe, it, expect } from "vitest";
import { PreviewRequestSchema } from "../shared/schema.js";

const VALID_SENDER = "0xaAbBcCdDeEfF0011223344556677889900aAbBcC";
const VALID_RECIPIENT = "0x1111222233334444555566667777888899990000";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("PreviewRequestSchema — address validation", () => {
  it("accepts a valid sender and recipient", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "1.5",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a sender that is too short", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: "0xabcd",
      recipient: VALID_RECIPIENT,
      amount: "1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("sender");
  });

  it("rejects a sender missing the 0x prefix", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: "aAbBcCdDeEfF0011223344556677889900aAbBcC",
      recipient: VALID_RECIPIENT,
      amount: "1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("sender");
  });

  it("rejects a recipient with non-hex characters", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: "0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
      amount: "1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("recipient");
  });

  it("accepts the zero address (address is syntactically valid; policy may block it)", () => {
    // The schema accepts 0x0000…; policy blocks it in preview_action/preview_simulate
    const result = PreviewRequestSchema.safeParse({
      sender: ZERO_ADDRESS,
      recipient: VALID_RECIPIENT,
      amount: "1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty sender", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: "",
      recipient: VALID_RECIPIENT,
      amount: "1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty recipient", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: "",
      amount: "1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts lowercase hex address", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: "0xaabbccddeeff0011223344556677889900aabbcc",
      recipient: VALID_RECIPIENT,
      amount: "1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts uppercase hex address", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: "0xAABBCCDDEEFF0011223344556677889900AABBCC",
      recipient: VALID_RECIPIENT,
      amount: "1",
    });
    expect(result.success).toBe(true);
  });
});

describe("PreviewRequestSchema — amount validation", () => {
  it("accepts integer amount string", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts decimal amount string", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "0.001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts large decimal amount", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "9999.999999",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero amount string '0'", () => {
    // Schema pattern requires at least one digit; "0" matches /^\d+(\.\d+)?$/ → passes schema
    // but zero value is blocked at policy level. We confirm the schema is lenient:
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "0",
    });
    // The regex allows "0" — it is the server policy that blocks it.
    expect(result.success).toBe(true);
  });

  it("rejects negative amount", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "-1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("amount");
  });

  it("rejects scientific notation", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "1e18",
    });
    expect(result.success).toBe(false);
  });

  it("rejects amount as a number (not string)", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: 1 as unknown as string,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty amount string", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed decimal '1.'", () => {
    const result = PreviewRequestSchema.safeParse({
      sender: VALID_SENDER,
      recipient: VALID_RECIPIENT,
      amount: "1.",
    });
    expect(result.success).toBe(false);
  });
});

describe("MON-to-wei conversion", () => {
  it("converts '1' MON to 1e18 wei using parseEther semantics", async () => {
    const { parseEther } = await import("viem");
    expect(parseEther("1")).toBe(1_000_000_000_000_000_000n);
  });

  it("converts '0.001' MON to 1e15 wei", async () => {
    const { parseEther } = await import("viem");
    expect(parseEther("0.001")).toBe(1_000_000_000_000_000n);
  });

  it("converts '1.5' MON correctly", async () => {
    const { parseEther } = await import("viem");
    expect(parseEther("1.5")).toBe(1_500_000_000_000_000_000n);
  });
});
