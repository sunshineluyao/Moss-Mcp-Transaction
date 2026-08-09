/**
 * Scheduled production smoke monitor.
 *
 * Reuses scripts/smoke-prod.mjs (spawned as a child process) to check the
 * published app on a schedule. Because this repl's single deployment slot is
 * used by the autoscale app itself, the schedule runs inside the gateway:
 *   - one run shortly after startup (every autoscale wake-up triggers this)
 *   - repeat runs every SMOKE_MONITOR_INTERVAL_MS while the instance is warm
 *
 * Failures are logged with a "SMOKE CHECK FAILED" prefix so they are visible
 * in deployment logs, and the latest results are exposed via getSmokeStatus()
 * for the /api/smoke-status endpoint.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface SmokeRunResult {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode: number | null;
  base: string;
  /** Tail of combined stdout+stderr from the smoke script. */
  output: string;
}

export interface SmokeStatus {
  enabled: boolean;
  intervalMs: number;
  base: string;
  running: boolean;
  lastResult: SmokeRunResult | null;
  /** Most recent runs, newest first (bounded). */
  history: SmokeRunResult[];
}

const DEFAULT_BASE = "https://moss-mcp-transaction.replit.app";
const DEFAULT_INTERVAL_MS = 15 * 60_000; // 15 minutes
const RUN_TIMEOUT_MS = 3 * 60_000; // smoke script retries readiness up to ~25s per check
const HISTORY_LIMIT = 20;
const OUTPUT_TAIL_CHARS = 4_000;

/**
 * Locate scripts/smoke-prod.mjs relative to this module (never process.cwd(),
 * which differs between dev and prod). Candidates cover:
 *   - prod bundle:  artifacts/agent-gateway/dist/index.mjs → ../../../scripts
 *   - dev (tsx):    artifacts/agent-gateway/src/monitor/…  → ../../../../scripts
 */
export function findSmokeScript(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "../../../scripts/smoke-prod.mjs"),
    path.resolve(here, "../../../../scripts/smoke-prod.mjs"),
    path.resolve(here, "../../scripts/smoke-prod.mjs"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

const state: SmokeStatus = {
  enabled: false,
  intervalMs: DEFAULT_INTERVAL_MS,
  base: DEFAULT_BASE,
  running: false,
  lastResult: null,
  history: [],
};

let timer: ReturnType<typeof setInterval> | null = null;

export function getSmokeStatus(): SmokeStatus {
  return {
    ...state,
    history: [...state.history],
  };
}

function runSmokeScript(scriptPath: string, base: string): Promise<SmokeRunResult> {
  return new Promise((resolve) => {
    const startedAt = new Date();
    const child = spawn(
      process.execPath,
      [scriptPath, "--base", base],
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    let output = "";
    const append = (chunk: Buffer) => {
      output += chunk.toString("utf8");
      if (output.length > OUTPUT_TAIL_CHARS * 2) {
        output = output.slice(-OUTPUT_TAIL_CHARS * 2);
      }
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);

    const killTimer = setTimeout(() => {
      output += `\n[monitor] smoke script exceeded ${RUN_TIMEOUT_MS / 1000}s timeout — killed\n`;
      child.kill("SIGKILL");
    }, RUN_TIMEOUT_MS);

    const finish = (exitCode: number | null) => {
      clearTimeout(killTimer);
      const finishedAt = new Date();
      resolve({
        ok: exitCode === 0,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        exitCode,
        base,
        output: output.slice(-OUTPUT_TAIL_CHARS),
      });
    };

    child.on("error", (err) => {
      output += `\n[monitor] failed to spawn smoke script: ${err.message}\n`;
      finish(null);
    });
    child.on("close", (code) => finish(code));
  });
}

export async function runSmokeCheckOnce(): Promise<SmokeRunResult> {
  const scriptPath = findSmokeScript();
  const base = state.base;
  let result: SmokeRunResult;

  if (!scriptPath) {
    const now = new Date().toISOString();
    result = {
      ok: false,
      startedAt: now,
      finishedAt: now,
      durationMs: 0,
      exitCode: null,
      base,
      output: "[monitor] scripts/smoke-prod.mjs not found relative to module",
    };
  } else if (state.running) {
    // Never overlap runs; report the last known result instead.
    return (
      state.lastResult ?? {
        ok: false,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 0,
        exitCode: null,
        base,
        output: "[monitor] a smoke run is already in progress",
      }
    );
  } else {
    state.running = true;
    try {
      result = await runSmokeScript(scriptPath, base);
    } finally {
      state.running = false;
    }
  }

  state.lastResult = result;
  state.history.unshift(result);
  if (state.history.length > HISTORY_LIMIT) {
    state.history.length = HISTORY_LIMIT;
  }

  if (result.ok) {
    console.log(
      `[smoke-monitor] SMOKE CHECK PASSED against ${base} in ${result.durationMs}ms`
    );
  } else {
    console.error(
      `[smoke-monitor] SMOKE CHECK FAILED against ${base} (exit=${result.exitCode})\n${result.output}`
    );
  }
  return result;
}

export interface StartSmokeMonitorOptions {
  base?: string;
  intervalMs?: number;
  /** Delay before the first run after startup (default 15s, lets the server settle). */
  initialDelayMs?: number;
}

export function startSmokeMonitor(options: StartSmokeMonitorOptions = {}): void {
  if (timer) return; // already started

  state.base = (
    options.base ??
    process.env.SMOKE_MONITOR_BASE ??
    DEFAULT_BASE
  ).replace(/\/+$/, "");
  state.intervalMs =
    options.intervalMs ??
    Number(process.env.SMOKE_MONITOR_INTERVAL_MS ?? DEFAULT_INTERVAL_MS);
  state.enabled = true;

  const initialDelayMs = options.initialDelayMs ?? 15_000;

  const initialTimer = setTimeout(() => {
    void runSmokeCheckOnce();
  }, initialDelayMs);
  initialTimer.unref?.();

  timer = setInterval(() => {
    void runSmokeCheckOnce();
  }, state.intervalMs);
  timer.unref?.();

  console.log(
    `[smoke-monitor] scheduled: every ${state.intervalMs / 60_000}min against ${state.base} (first run in ${initialDelayMs / 1000}s)`
  );
}

export function stopSmokeMonitor(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  state.enabled = false;
}
