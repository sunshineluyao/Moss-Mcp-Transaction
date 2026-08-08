#!/usr/bin/env bash
# Renders all four Manim animation scenes to animations/output/
# Usage: bash animations/render_all.sh
# Requirements: manim (pip install manim) — see animations/README.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/output"
mkdir -p "$OUTPUT_DIR"

render() {
  local file="$1"
  local scene="$2"
  local out_name="$3"

  echo ""
  echo "▶  Rendering $scene from $file ..."
  manim -qh "$SCRIPT_DIR/$file" "$scene" --media_dir "$SCRIPT_DIR/.manim_media"

  # Manim places output in .manim_media/videos/<file_stem>/1080p60/<scene>.mp4
  local stem
  stem="$(basename "$file" .py)"
  local src="$SCRIPT_DIR/.manim_media/videos/$stem/1080p60/${scene}.mp4"

  if [[ -f "$src" ]]; then
    cp "$src" "$OUTPUT_DIR/$out_name"
    echo "   ✓  Saved to output/$out_name"
  else
    echo "   ✗  Could not find rendered file at $src"
    exit 1
  fi
}

render "architecture.py"         "ArchitectureFlow"      "architecture.mp4"
render "transaction_lifecycle.py" "TransactionLifecycle"  "transaction_lifecycle.mp4"
render "concepts.py"              "ConceptsOverview"      "concepts.mp4"
render "moss_monad.py"            "MossMonadRelation"     "moss_monad.mp4"

echo ""
echo "══════════════════════════════════════════"
echo "  All animations rendered to animations/output/"
echo "══════════════════════════════════════════"
