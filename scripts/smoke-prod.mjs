#!/usr/bin/env node
/**
 * Post-publish smoke check for the agent-gateway on the production domain.
 *
 * Checks:
 *   1. GET  /agent-gateway/healthz                     → {"ok":true}
 *   2. GET  /agent-gateway/.well-known/agent-card.json → advertises the
 *      production URL (https://moss-mcp-transaction.replit.app/agent-gateway),
 *      NOT a .replit.dev dev-domain URL (the stale-build symptom).
 *   3. POST /agent-gateway/api/preview                 → real decision with a
 *      non-empty mcpTrace and no MCP connection errors.
 *
 * Usage:
 *   node scripts/smoke-prod.mjs
 *   node scripts/smoke-prod.mjs --base https://moss-mcp-transaction.replit.app
 *
 * Exits 0 when all checks pass; exits 1 with a clear message on any failure,
 * so it can run in CI or by hand after each publish.
 */

const DEFAULT_BASE = "https://moss-mcp-transaction.replit.app";
const EXPECTED_CARD_URL = "https://moss-mcp-transaction.replit.app/agent-gateway";

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let base = DEFAULT_BASE;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--base" && args[i + 1]) base = args[++i];
}
base = base.replace(/\/+$/, "");
const GATEWAY = `${base}/agent-gateway`;

// Hardhat well-known accounts (EIP-55 checksummed) — safe test addresses.
const PREVIEW_BODY = {
  sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  amount: "0.01",
};

const TIMEOUT_MS = 30_000;

// Publishing is eventually consistent: retry readiness before running checks.
const READY_RETRIES = 5;
const READY_DELAY_MS = 5_000;

let failures = 0;
const pass = (name, detail = "") =>
  console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
const fail = (name, detail) => {
  failures++;
  console.error(`  FAIL  ${name} — ${detail}`);
};

async function fetchJson(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* non-JSON body */
    }
    return { res, json, text };
  } finally {
    clearTimeout(timer);
  }
}

console.log(`Smoke-checking ${GATEWAY}\n`);

// ── 1. healthz (with readiness retries — publish is eventually consistent) ────
{
  let lastDetail = "";
  let healthy = false;
  for (let attempt = 1; attempt <= READY_RETRIES; attempt++) {
    try {
      const { res, json, text } = await fetchJson(`${GATEWAY}/healthz`);
      if (res.ok && json && json.ok === true) {
        healthy = true;
        break;
      }
      lastDetail = !res.ok
        ? `HTTP ${res.status}: ${text.slice(0, 200)}`
        : `expected {"ok":true}, got: ${text.slice(0, 200)}`;
    } catch (err) {
      lastDetail = `request failed: ${err.message}`;
    }
    if (attempt < READY_RETRIES) {
      console.log(
        `  ....  healthz not ready (attempt ${attempt}/${READY_RETRIES}: ${lastDetail}), retrying in ${READY_DELAY_MS / 1000}s`
      );
      await new Promise((r) => setTimeout(r, READY_DELAY_MS));
    }
  }
  if (healthy) pass("healthz", '{"ok":true}');
  else fail("healthz", `${lastDetail} (after ${READY_RETRIES} attempts)`);
}

// ── 2. agent card advertises the production URL ───────────────────────────────
try {
  const { res, json, text } = await fetchJson(
    `${GATEWAY}/.well-known/agent-card.json`
  );
  if (!res.ok) {
    fail("agent-card", `HTTP ${res.status}: ${text.slice(0, 200)}`);
  } else if (!json) {
    fail("agent-card", `non-JSON response: ${text.slice(0, 200)}`);
  } else {
    const cardText = JSON.stringify(json);
    if (cardText.includes(".replit.dev")) {
      fail(
        "agent-card",
        `stale build: card advertises a .replit.dev dev-domain URL (url=${json.url})`
      );
    } else {
      // A2A SDK v1 card: URLs live in provider.url and supportedInterfaces[].url
      const advertised = [
        json.provider?.url,
        ...(Array.isArray(json.supportedInterfaces)
          ? json.supportedInterfaces.map((i) => i?.url)
          : []),
      ].filter((u) => typeof u === "string");
      const bad = advertised.filter((u) => !u.startsWith(EXPECTED_CARD_URL));
      if (advertised.length === 0) {
        fail("agent-card", "card advertises no URLs (provider.url / supportedInterfaces)");
      } else if (bad.length > 0) {
        fail(
          "agent-card",
          `expected URLs starting with ${EXPECTED_CARD_URL}, got: ${bad.join(", ")}`
        );
      } else {
        pass("agent-card", advertised.join(", "));
      }
    }
  }
} catch (err) {
  fail("agent-card", `request failed: ${err.message}`);
}

// ── 3. preview returns a real decision with a healthy mcpTrace ────────────────
try {
  const { res, json, text } = await fetchJson(`${GATEWAY}/api/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(PREVIEW_BODY),
  });
  if (!res.ok) {
    fail("preview", `HTTP ${res.status}: ${text.slice(0, 300)}`);
  } else if (!json) {
    fail("preview", `non-JSON response: ${text.slice(0, 300)}`);
  } else {
    const problems = [];
    if (
      json.decision !== "READY_FOR_WALLET_REVIEW" &&
      json.decision !== "BLOCKED"
    ) {
      problems.push(`unexpected decision: ${JSON.stringify(json.decision)}`);
    }
    if (!Array.isArray(json.mcpTrace) || json.mcpTrace.length === 0) {
      problems.push("mcpTrace is empty or missing");
    } else {
      const connErrors = json.mcpTrace.filter(
        (e) =>
          e.success === false ||
          (typeof e.error === "string" &&
            /connect|ECONN|refused|timeout|unavailable/i.test(e.error))
      );
      if (connErrors.length > 0) {
        problems.push(
          `MCP errors in trace: ${connErrors
            .map((e) => `${e.tool}: ${e.error ?? "success=false"}`)
            .join("; ")}`
        );
      }
    }
    if (problems.length > 0) {
      fail("preview", problems.join(" | "));
    } else {
      pass(
        "preview",
        `decision=${json.decision}, mcpTrace entries=${json.mcpTrace.length}`
      );
    }
  }
} catch (err) {
  fail("preview", `request failed: ${err.message}`);
}

// ── Result ────────────────────────────────────────────────────────────────────
console.log("");
if (failures > 0) {
  console.error(`SMOKE CHECK FAILED: ${failures} check(s) failed against ${GATEWAY}`);
  process.exit(1);
}
console.log(`SMOKE CHECK PASSED: all 3 checks OK against ${GATEWAY}`);
