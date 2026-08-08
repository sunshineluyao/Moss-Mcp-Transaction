import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { SkillMetadata } from "../shared/schema.js";

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
] as const;

/** Canonical source: Moss documentation (inspiration for the safety model) */
const SKILL_SOURCE_URL = "https://docs.moss.ag";

let cachedSkill: SkillMetadata | null = null;

/**
 * Reads the SKILL.md file from the workspace skills directory at startup,
 * computes a SHA-256 content hash, and returns the metadata object.
 * The result is cached after the first load.
 */
export async function loadSkill(): Promise<SkillMetadata> {
  if (cachedSkill) return cachedSkill;

  const RELATIVE_SKILL_PATH = join(
    "skills",
    "monad-safe-transfer-preview",
    "SKILL.md"
  );

  // Strategy 1: cwd-based (pnpm --filter sets cwd to artifacts/agent-gateway)
  const cwdRoot = join(process.cwd(), "..", "..");

  // Strategy 2: import.meta.url based (varies by bundle structure)
  const thisFile = fileURLToPath(import.meta.url);
  const thisDir = dirname(thisFile);

  const possibleRoots = [
    cwdRoot,
    join(thisDir, "..", "..", ".."),    // dist/ → agent-gateway/ → artifacts/ → workspace root
    join(thisDir, "..", "..", "..", ".."), // dist/mcp/ → dist/ → ... → workspace root
  ];

  let skillContent: string | null = null;
  let skillPath = "";

  for (const root of possibleRoots) {
    const candidate = join(root, RELATIVE_SKILL_PATH);
    try {
      skillContent = await readFile(candidate, "utf-8");
      skillPath = candidate;
      break;
    } catch {
      // try next
    }
  }

  if (!skillContent || !skillPath) {
    // Walk up from cwd as last resort
    let dir = process.cwd();
    for (let i = 0; i < 6; i++) {
      const candidate = join(dir, RELATIVE_SKILL_PATH);
      try {
        skillContent = await readFile(candidate, "utf-8");
        skillPath = candidate;
        break;
      } catch {
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
    }
  }

  if (!skillContent || !skillPath) {
    throw new Error(
      `Failed to load SKILL.md. cwd=${process.cwd()}, thisDir=${thisDir}`
    );
  }

  const contentHash = createHash("sha256").update(skillContent).digest("hex");

  // Extract description from frontmatter
  const descriptionMatch = skillContent.match(
    /^description:\s*>\n([\s\S]*?)(?=\n\w)/m
  );
  const description = descriptionMatch
    ? descriptionMatch[1]
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join(" ")
    : "Monad Testnet Safe Transfer Preview";

  cachedSkill = {
    name: "Monad Testnet Safe Transfer Preview",
    description,
    sourceUrl: SKILL_SOURCE_URL,
    path: skillPath,
    contentHash,
    appliedRuleIds: [...SKILL_RULE_IDS],
  };

  return cachedSkill;
}
