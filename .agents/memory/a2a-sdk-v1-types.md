---
name: A2A SDK v1.0.1 type shapes
description: Correct TypeScript interfaces for @a2a-js/sdk@1.0.1 — differs significantly from v0.3 docs.
---

## Part interface

```typescript
interface Part {
  content?: 
    | { $case: "text"; value: string }
    | { $case: "raw"; value: Buffer }
    | { $case: "url"; value: string }
    | { $case: "data"; value: any }
    | undefined;
  metadata: Record<string, any> | undefined;
  filename: string;
  mediaType: string;
}
```

**Why:** The old v0.3 shape had `{ $case, text: { text } }` / `{ $case, data: { data } }` — the v1.0 shape is `{ $case, value }` directly.

## TaskStatusUpdateEvent

No `final` or `kind` fields in v1.0. Just `{ taskId, contextId, status, metadata }`.

**Why:** The event bus design changed; terminal state is determined by `status.state`, not a `final` flag.

## TaskArtifactUpdateEvent

`append` and `lastChunk` live on the event, not on the `Artifact`:
```typescript
{ taskId, contextId, artifact: Artifact, append: boolean, lastChunk: boolean, metadata }
```
The `Artifact` type has `{ artifactId, name, description, parts, metadata, extensions }` — no `index` or `lastChunk`.

## Task

No `kind` field. Just `{ id, contextId, status, artifacts, history, metadata }`.

## AgentCard

No `url` field. The agent URL is derived from `supportedInterfaces[0].url` by clients. `AgentCapabilities` has no `stateTransitionHistory`.

## AgentInterface

Use `protocolBinding: "JSONRPC"` (not `transport`). Full shape: `{ url, protocolBinding, protocolVersion, tenant }`.

## TaskState / Role

These are numeric enums (protobuf-style):
- `TaskState.TASK_STATE_SUBMITTED`, `TASK_STATE_WORKING`, `TASK_STATE_COMPLETED`, `TASK_STATE_FAILED`, `TASK_STATE_CANCELED`
- `Role.ROLE_AGENT`, `Role.ROLE_USER`

## agentCardHandler

Takes `{ agentCardProvider: AgentCardProvider }` not `{ agentCard }`. Pass the `DefaultRequestHandler` as the provider (it implements `getAgentCard()`).
