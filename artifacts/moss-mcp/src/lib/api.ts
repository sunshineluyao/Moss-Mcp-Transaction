/**
 * usePreview — React hook for calling POST /agent-gateway/api/preview.
 * The agent-gateway is mounted at /agent-gateway in Replit's path-based router.
 */
import { useState, useCallback } from "react";
import type { PreviewArtifact, PreviewRequest, PreviewError } from "@/types/preview";

// In Replit's path-based routing, /agent-gateway is the agent-gateway service.
// VITE_AGENT_GATEWAY_URL can override this for local dev outside Replit.
export const GATEWAY_BASE =
  (import.meta.env.VITE_AGENT_GATEWAY_URL as string | undefined) ??
  "/agent-gateway";

export type PreviewState =
  | { stage: "idle" }
  | { stage: "loading" }
  | { stage: "ready"; artifact: PreviewArtifact }
  | { stage: "error"; message: string; issues?: PreviewError["issues"] };

export function usePreview() {
  const [state, setState] = useState<PreviewState>({ stage: "idle" });

  const submit = useCallback(async (req: PreviewRequest) => {
    setState({ stage: "loading" });
    try {
      const res = await fetch(`${GATEWAY_BASE}/api/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as PreviewError;
        setState({
          stage: "error",
          message: body.error ?? `HTTP ${res.status}`,
          issues: body.issues,
        });
        return;
      }

      const artifact = (await res.json()) as PreviewArtifact;
      setState({ stage: "ready", artifact });
    } catch (err) {
      setState({
        stage: "error",
        message:
          err instanceof Error ? err.message : "Network error — check your connection.",
      });
    }
  }, []);

  const reset = useCallback(() => setState({ stage: "idle" }), []);

  return { state, submit, reset };
}
