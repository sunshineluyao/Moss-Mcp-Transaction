# Animations Not Yet Rendered

The Manim animation scripts exist in `animations/` but could not be pre-rendered in this environment because Manim's system dependencies (Cairo, Pango, FFmpeg, LaTeX) are not available in the Replit NixOS container.

## How to render locally

### 1. Install Manim CE

**macOS (Homebrew):**
```bash
brew install cairo pango ffmpeg
pip install manim
```

**Ubuntu / Debian:**
```bash
sudo apt install libcairo2-dev libpango1.0-dev ffmpeg
pip install manim
```

**Windows:** Follow the [official guide](https://docs.manim.community/en/stable/installation/windows.html).

### 2. Render all four animations

```bash
bash animations/render_all.sh
```

MP4s will appear in `animations/output/`.

### 3. Render a single scene

```bash
manim -qh animations/architecture.py          ArchitectureFlow
manim -qh animations/transaction_lifecycle.py TransactionLifecycle
manim -qh animations/concepts.py              ConceptsOverview
manim -qh animations/moss_monad.py            MossMonadRelation
```

## Scene overview

| File | Scene | What it shows |
|------|-------|---------------|
| `architecture.py` | `ArchitectureFlow` | Live preview data flow: React UI → Agent Gateway → A2A → MCP stdio → Monad Testnet RPC |
| `transaction_lifecycle.py` | `TransactionLifecycle` | Transfer preview lifecycle with four MCP tools, live data, and nine safety rules |
| `concepts.py` | `ConceptsOverview` | Four-quadrant protocol stack: A2A, MCP, Agent Skills, Agent Stack |
| `moss_monad.py` | `MossMonadRelation` | Side-by-side: official Moss (mainnet) vs. this Testnet adapter |
