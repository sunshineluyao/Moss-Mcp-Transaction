/**
 * Skill/runtime rule correspondence test.
 * Every rule ID in SKILL.md frontmatter must appear in the runtime policy table, and vice versa.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Runtime rule IDs from mcp/server.ts (SKILL_RULE_IDS constant)
const RUNTIME_RULE_IDS = [
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

// Safety flags from schema.ts (SafetyFlagsSchema)
const SCHEMA_SAFETY_FLAGS = [
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

let skillMdContent = "";

beforeAll(async () => {
  // Try multiple paths relative to different roots
  const candidates = [
    join(__dirname, "..", "..", "..", "..", "..", "skills", "monad-safe-transfer-preview", "SKILL.md"),
    join(__dirname, "..", "..", "..", "..", "skills", "monad-safe-transfer-preview", "SKILL.md"),
    join(process.cwd(), "skills", "monad-safe-transfer-preview", "SKILL.md"),
    join(process.cwd(), "..", "..", "skills", "monad-safe-transfer-preview", "SKILL.md"),
  ];

  for (const candidate of candidates) {
    try {
      skillMdContent = await readFile(candidate, "utf-8");
      break;
    } catch {
      // try next
    }
  }

  if (!skillMdContent) {
    throw new Error(
      `Could not find SKILL.md. cwd=${process.cwd()}, __dirname=${__dirname}`
    );
  }
});

function parseSkillFrontmatterRuleIds(content: string): string[] {
  // Parse the YAML frontmatter block between --- delimiters
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return [];

  const frontmatter = frontmatterMatch[1];
  // Extract ruleIds list (YAML list with "  - RULE_ID" lines)
  const ruleIdsMatch = frontmatter.match(/ruleIds:\s*\n((?:\s+-\s+\S+\n?)+)/);
  if (!ruleIdsMatch) return [];

  return ruleIdsMatch[1]
    .split("\n")
    .map((line) => line.trim().replace(/^-\s+/, ""))
    .filter(Boolean);
}

describe("SKILL.md frontmatter ↔ runtime rule IDs", () => {
  it("SKILL.md contains a ruleIds list", () => {
    const ruleIds = parseSkillFrontmatterRuleIds(skillMdContent);
    expect(ruleIds.length).toBeGreaterThan(0);
  });

  it("every ruleId in SKILL.md frontmatter is present in the runtime policy table", () => {
    const skillRuleIds = parseSkillFrontmatterRuleIds(skillMdContent);
    const runtimeSet = new Set(RUNTIME_RULE_IDS);
    for (const id of skillRuleIds) {
      expect(runtimeSet.has(id), `Skill rule "${id}" not found in runtime`).toBe(true);
    }
  });

  it("every ruleId in the runtime policy table is present in SKILL.md frontmatter", () => {
    const skillRuleIds = new Set(parseSkillFrontmatterRuleIds(skillMdContent));
    for (const id of RUNTIME_RULE_IDS) {
      expect(skillRuleIds.has(id), `Runtime rule "${id}" not found in SKILL.md`).toBe(true);
    }
  });

  it("SKILL.md and runtime have exactly the same number of rule IDs", () => {
    const skillRuleIds = parseSkillFrontmatterRuleIds(skillMdContent);
    expect(skillRuleIds.length).toBe(RUNTIME_RULE_IDS.length);
  });

  it("schema SafetyFlags keys match the runtime rule IDs", () => {
    const schemaSet = new Set(SCHEMA_SAFETY_FLAGS);
    const runtimeSet = new Set(RUNTIME_RULE_IDS);
    // Every runtime rule must be a safety flag key
    for (const id of RUNTIME_RULE_IDS) {
      expect(schemaSet.has(id), `Rule "${id}" not in SafetyFlagsSchema`).toBe(true);
    }
    // Every safety flag must have a corresponding runtime rule
    for (const id of SCHEMA_SAFETY_FLAGS) {
      expect(runtimeSet.has(id), `SafetyFlag "${id}" not in runtime rules`).toBe(true);
    }
  });

  it("SKILL.md mentions each rule ID in its body (not just frontmatter)", () => {
    const ruleIds = parseSkillFrontmatterRuleIds(skillMdContent);
    for (const id of ruleIds) {
      expect(skillMdContent, `Rule "${id}" not described in SKILL.md body`).toContain(`### ${id}`);
    }
  });
});
