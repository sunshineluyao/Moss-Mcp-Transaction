#!/usr/bin/env bash
# Renders all four Manim animation scenes to animations/output/
#
# Usage:
#   bash animations/render_all.sh            # uses manim on $PATH
#   nix-shell -p python3Packages.manim --run "bash animations/render_all.sh"
#
# Quality flag (default -ql = 480p15, fastest):
#   MANIM_QUALITY=-qh bash animations/render_all.sh   # 1080p60

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/output"
MEDIA_DIR="$SCRIPT_DIR/.manim_media"
QUALITY="${MANIM_QUALITY:--ql}"   # default: low quality (480p15) for speed
mkdir -p "$OUTPUT_DIR"

# Replit NixOS: Python 3.13's pyexpat.so requires expat 2.6+ (XML_SetAllocTrackerActivationThreshold).
# Point LD_LIBRARY_PATH at the correct nix store libexpat so manim's SVG parser works.
EXPAT_LIB="/nix/store/sr4cnxyzx24ylxygfk7d81hy4791l8gm-expat-2.7.3/lib"
if [[ -d "$EXPAT_LIB" ]]; then
  export LD_LIBRARY_PATH="$EXPAT_LIB${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi

# Derive expected resolution subdir from quality flag
case "$QUALITY" in
  -ql) RES="480p15" ;;
  -qm) RES="720p30" ;;
  -qh) RES="1080p60" ;;
  *)   RES="480p15" ;;
esac

render() {
  local file="$1"
  local scene="$2"
  local out_name="$3"

  echo ""
  echo "▶  Rendering $scene from $file  [quality: $QUALITY → $RES] ..."
  manim "$QUALITY" "$SCRIPT_DIR/$file" "$scene" --media_dir "$MEDIA_DIR"

  local stem
  stem="$(basename "$file" .py)"
  local src="$MEDIA_DIR/videos/$stem/$RES/${scene}.mp4"

  if [[ -f "$src" ]]; then
    cp "$src" "$OUTPUT_DIR/$out_name"
    echo "   ✓  Saved to output/$out_name"
  else
    echo "   ✗  Could not find rendered file at $src"
    echo "      Known paths under $MEDIA_DIR/videos/$stem/:"
    find "$MEDIA_DIR/videos/$stem" -name "*.mp4" 2>/dev/null || true
    exit 1
  fi
}

render "architecture.py"          "ArchitectureFlow"      "ArchitectureFlow.mp4"
render "transaction_lifecycle.py" "TransactionLifecycle"  "TransactionLifecycle.mp4"
render "concepts.py"              "ConceptsOverview"      "ConceptsOverview.mp4"
render "moss_monad.py"            "MossMonadRelation"     "MossMonadRelation.mp4"

echo ""
echo "══════════════════════════════════════════"
echo "  All animations rendered to animations/output/"
echo "══════════════════════════════════════════"
