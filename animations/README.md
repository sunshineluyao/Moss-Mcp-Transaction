# Moss MCP — Scientific Animations

Publication-quality MP4 animations created with [Manim Community Edition](https://www.manim.community/) for competition submission. Each script is fully reproducible — judges can re-render locally.

---

## Prerequisites

- **Python 3.10+**
- **Manim CE** (tested with v0.18+)

```bash
pip install manim
```

Manim also requires **Cairo**, **Pango**, **FFmpeg**, and **LaTeX** (optional, not used here). See the [official installation guide](https://docs.manim.community/en/stable/installation.html) for your OS.

---

## Render a single scene

Each script contains a `# RENDER:` comment at the top with the exact command:

```bash
# High-quality 1080p60
manim -qh animations/architecture.py         ArchitectureFlow
manim -qh animations/transaction_lifecycle.py TransactionLifecycle
manim -qh animations/concepts.py             ConceptsOverview
manim -qh animations/moss_monad.py           MossMonadRelation
```

Output lands in `media/videos/<script>/1080p60/<Scene>.mp4`.

---

## Render all at once

```bash
bash animations/render_all.sh
```

This renders all four scenes and copies the MP4s to `animations/output/`.

---

## Pre-rendered MP4s

Pre-rendered MP4s are in `animations/output/` when manim is available in the build environment. If that directory contains only `NOT_YET_RENDERED.md`, run the render script above.

---

## Scene descriptions

| File | Scene | Duration | What it shows |
|------|-------|----------|---------------|
| `architecture.py` | `ArchitectureFlow` | ~45 s | End-to-end data flow: React UI → Agent Gateway → A2A → MCP stdio → Monad Testnet RPC. Nodes appear one by one with arrows and role annotations. Final frame shows `READY_FOR_WALLET_REVIEW` badge. |
| `transaction_lifecycle.py` | `TransactionLifecycle` | ~55 s | Single transfer preview lifecycle. User intent → four MCP tools in sequence → live data box (block, balance, gas) → nine safety rules turning green → final decision badge. |
| `concepts.py` | `ConceptsOverview` | ~50 s | Four-quadrant layout: A2A protocol, MCP tool call sequence, Agent Skills (SKILL.md hash → rules), Agent Stack registration & discovery. |
| `moss_monad.py` | `MossMonadRelation` | ~40 s | Side-by-side: official Moss (mainnet, chain 143, full DeFi) vs. this adapter (Testnet, chain 10143, MON transfer preview). Inspiration arrow with disclaimer. |

---

## Color palette

All animations use the app's dark Web3 palette:

| Name | Hex | Usage |
|------|-----|-------|
| Navy background | `#040d1a` | Background |
| Teal primary | `#00ccaa` | React UI, Monad RPC, key nodes |
| Violet accent | `#7c3aed` | A2A / Agent Gateway / Moss |
| Amber warning | `#f59e0b` | MCP tools, SKILL.md |
| Slate gray | `#334155` | Dividers, secondary labels |
| Green | `#22c55e` | Success / safety-rule checks |
| Red | `#ef4444` | Blocked / error states |

---

## Notes

- All scenes are **silent** (no audio/voiceover).
- No external assets or paid fonts — only Manim CE built-ins.
- All scripts use standard `manim` Community Edition APIs; no third-party Manim plugins.
