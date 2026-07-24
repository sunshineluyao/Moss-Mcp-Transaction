# Repository Copilot Instructions

## Scope
These rules apply when generating or editing Mermaid diagrams, especially in README files.

## Mermaid Anti-Clipping Rules (GitHub Renderer)

1. Do not put long text on edges.
2. Avoid inline edge labels whenever possible.
3. If an edge label is required, keep it one word and single-line.
4. Prefer moving explanatory text into nodes.
5. Do not use `<br/>` inside edge labels.
6. Keep decision labels short: `Yes`, `No`, `Retry`, `Back`.
7. Keep transition labels short: `Sign`, `Reject`, `Revert`, `Error`.
8. For Chinese labels, keep to 2-4 characters where possible.
9. If clipping appears, first shorten/remove edge labels.
10. Only after label shortening, adjust spacing values:
   - increase `nodeSpacing` slightly
   - increase `rankSpacing` slightly
11. For status diagrams, prefer plain single-line node labels (no emoji, no `<br/>`) for: `Pending`, `System Error`, `Awaiting Signature`.

## Canonical Terminology (Use Exactly)

- `Yes`
- `No`
- `Pending`
- `System Error`
- `UI`

Notes:
- Do not use alternatives like `YES/NO` unless space constraints force it.
- Do not misspell `RPC` as `PRC`.
- Keep `System Error` as a phrase; do not split into separate terms unless required by layout.

## README Diagram Editing Checklist

- Keep English and Chinese diagram logic synchronized.
- Keep node and edge counts aligned across EN/ZH versions.
- Prefer stable GitHub-compatible Mermaid syntax.
- Avoid advanced Mermaid features that render inconsistently on GitHub.

## Preferred Pattern

- Put details in node text blocks.
- Keep arrows mostly unlabeled.
- Use labels only for critical branch decisions.
