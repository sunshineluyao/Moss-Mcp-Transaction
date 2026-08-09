/**
 * HealthStatus — small header badge fed by GET /agent-gateway/api/smoke-status.
 *
 * The gateway runs a scheduled production smoke check (scripts/smoke-prod.mjs)
 * and exposes the latest result + history. This badge shows at a glance whether
 * production is healthy; on failure it shows when the check failed and which
 * named checks failed (parsed from the script's "  FAIL  <name> — ..." lines).
 */
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, CircleDashed, Activity } from "lucide-react";

import { GATEWAY_BASE } from "@/lib/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SmokeRunResult {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode: number | null;
  base: string;
  output: string;
}

interface SmokeStatus {
  enabled: boolean;
  intervalMs: number;
  base: string;
  running: boolean;
  lastResult: SmokeRunResult | null;
  history: SmokeRunResult[];
}

/** Extract failing check names from smoke script output ("  FAIL  name — detail"). */
export function parseFailedChecks(output: string): string[] {
  const names = new Set<string>();
  for (const line of output.split("\n")) {
    const m = line.match(/^\s*FAIL\s+(\S+)/);
    if (m) names.add(m[1]);
  }
  return [...names];
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

async function fetchSmokeStatus(): Promise<SmokeStatus> {
  const res = await fetch(`${GATEWAY_BASE}/api/smoke-status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as SmokeStatus;
}

export default function HealthStatus() {
  const { data, isError } = useQuery({
    queryKey: ["smoke-status"],
    queryFn: fetchSmokeStatus,
    refetchInterval: 60_000,
    retry: 1,
  });

  // Gateway unreachable — that itself is a health signal.
  if (isError) {
    return (
      <span
        data-testid="badge-health"
        className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-md border border-red-500/40 bg-red-500/10 text-red-400"
        title="The gateway API is unreachable from this page."
      >
        <XCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">GATEWAY OFFLINE</span>
        <span className="sm:hidden">OFFLINE</span>
      </span>
    );
  }

  const last = data?.lastResult ?? null;

  // No result yet (monitor disabled in dev, or first run pending).
  if (!data || !last) {
    return (
      <span
        data-testid="badge-health"
        className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-md border border-border bg-background text-muted-foreground"
        title={
          data && !data.enabled
            ? "Scheduled health checks run in production only."
            : "Waiting for the first health check to complete."
        }
      >
        <CircleDashed className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">HEALTH: PENDING</span>
        <span className="sm:hidden">PENDING</span>
      </span>
    );
  }

  const failedChecks = last.ok ? [] : parseFailedChecks(last.output);
  const recentFailures = data.history.filter((r) => !r.ok).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          data-testid="badge-health"
          className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-md border transition-colors cursor-pointer ${
            last.ok
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          }`}
        >
          {last.ok ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {last.ok ? "PROD HEALTHY" : "PROD FAILING"}
          </span>
          <span className="sm:hidden">{last.ok ? "OK" : "FAIL"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 text-sm" data-testid="popover-health">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">Production health</span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Status</span>
            <span className={last.ok ? "text-emerald-400" : "text-red-400"}>
              {last.ok ? "PASSED" : "FAILED"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">
              {last.ok ? "Last checked" : "Failed at"}
            </span>
            <span data-testid="text-health-time">{formatTime(last.finishedAt)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Target</span>
            <span className="truncate max-w-[180px]" title={last.base}>
              {last.base.replace(/^https?:\/\//, "")}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Recent runs</span>
            <span>
              {data.history.length - recentFailures}/{data.history.length} passed
            </span>
          </div>
        </div>

        {!last.ok && (
          <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/5 p-2">
            <p className="text-xs font-semibold text-red-400 mb-1">
              Failing checks
            </p>
            {failedChecks.length > 0 ? (
              <ul className="text-xs font-mono text-red-300 space-y-0.5" data-testid="list-failing-checks">
                {failedChecks.map((name) => (
                  <li key={name}>• {name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-mono text-red-300">
                Check did not complete (exit code{" "}
                {last.exitCode === null ? "none" : last.exitCode}). See
                deployment logs for details.
              </p>
            )}
          </div>
        )}

        {/* History strip: newest first */}
        {data.history.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] text-muted-foreground mb-1 font-mono">
              HISTORY (newest first)
            </p>
            <div className="flex gap-1" data-testid="row-health-history">
              {data.history.map((r, i) => (
                <span
                  key={r.startedAt + i}
                  title={`${r.ok ? "PASS" : "FAIL"} — ${formatTime(r.finishedAt)}`}
                  className={`w-2.5 h-2.5 rounded-sm ${
                    r.ok ? "bg-emerald-500/70" : "bg-red-500/80"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
