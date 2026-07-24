#!/usr/bin/env bash
# Generates assets/moss-mcp-transaction-preview-demo.gif
# Requires: ImageMagick 7 (magick), ffmpeg
set -euo pipefail

FULL_SHOT="/tmp/replit-screenshots/moss-mcp_Skad.jpg"
FRAMES_DIR="/tmp/gif-frames"
OUT_GIF="assets/moss-mcp-transaction-preview-demo.gif"

W=1100
H=620

BG="#0f1117"
ACCENT="#00e5cc"
TEXT_MAIN="#e2e8f0"
TEXT_DIM="#6b7280"
BADGE_GREEN="#16a34a"
BADGE_BLUE="#2563eb"

mkdir -p "$FRAMES_DIR"
rm -f "$FRAMES_DIR"/*.png

IDX=0

# ── helpers ───────────────────────────────────────────────────────────────────

# add_label <file> <label> <step>
add_label() {
  local f="$1" label="$2" step="$3"
  local bar_y1=$(( H - 48 ))
  local bar_y2=$(( H - 10 ))
  local step_x=$(( W - 90 ))
  local text_y=$(( H - 18 ))
  magick "$f" \
    -fill "#0f111799" \
    -draw "rectangle 0,${bar_y1} ${W},${bar_y2}" \
    -fill "$ACCENT" -font "DejaVu-Sans-Bold" -pointsize 14 \
    -annotate +20+${text_y} "● ${label}" \
    -fill "$TEXT_DIM" -font "DejaVu-Sans" -pointsize 13 \
    -annotate +${step_x}+${text_y} "${step}" \
    "$f"
}

# dup <src> <count> — appends count copies as sequentially numbered frames
dup() {
  local src="$1" n="$2"
  for _ in $(seq 1 "$n"); do
    IDX=$(( IDX + 1 ))
    cp "$src" "$(printf "%s/f%05d.png" "$FRAMES_DIR" "$IDX")"
  done
}

# ── SCENE 1: Open page — header + intro ──────────────────────────────────────
S1="$FRAMES_DIR/_s1.png"
magick "$FULL_SHOT" \
  -crop "${W}x580+90+0" +repage \
  -resize "${W}x${H}!" \
  "$S1"
add_label "$S1" "Open page · read the introduction" "1 / 6"
dup "$S1" 48

# ── SCENE 2: What is Moss MCP? ───────────────────────────────────────────────
S2="$FRAMES_DIR/_s2.png"
magick "$FULL_SHOT" \
  -crop "${W}x340+90+195" +repage \
  -resize "${W}x${H}!" \
  "$S2"
# cyan border around the Moss MCP info card
magick "$S2" \
  -fill none -stroke "$ACCENT" -strokewidth 3 \
  -draw "roundrectangle 12,20 $((W-12)),260 10,10" \
  "$S2"
add_label "$S2" "Understand what Moss MCP does" "2 / 6"
dup "$S2" 44

# ── SCENE 3: Simulation Parameters form ──────────────────────────────────────
S3="$FRAMES_DIR/_s3.png"
magick "$FULL_SHOT" \
  -crop "${W}x660+90+255" +repage \
  -resize "${W}x${H}!" \
  "$S3"
# highlight the Operation Type dropdown
magick "$S3" \
  -fill none -stroke "$ACCENT" -strokewidth 2 \
  -draw "roundrectangle 58,56 278,108 6,6" \
  "$S3"
add_label "$S3" "Choose operation type · fill in parameters" "3 / 6"
dup "$S3" 50

# ── SCENE 4: Generate Preview button ─────────────────────────────────────────
S4="$FRAMES_DIR/_s4.png"
magick "$FULL_SHOT" \
  -crop "${W}x660+90+255" +repage \
  -resize "${W}x${H}!" \
  "$S4"
# highlight the Generate Preview button (bottom of form)
magick "$S4" \
  -fill "#00e5cc33" \
  -draw "roundrectangle 58,524 278,572 8,8" \
  -fill none -stroke "$ACCENT" -strokewidth 3 \
  -draw "roundrectangle 58,524 278,572 8,8" \
  "$S4"
add_label "$S4" "Click 'Generate Preview'" "4 / 6"
dup "$S4" 34

# ── SCENE 5: Preview result panel (composited) ───────────────────────────────
# Left strip: the real form from the screenshot
LEFT="$FRAMES_DIR/_left.png"
magick "$FULL_SHOT" \
  -crop "330x660+90+255" +repage \
  -resize "330x${H}!" \
  "$LEFT"

RW=$(( W - 330 ))   # result card width = 770

# Build the result card
RC="$FRAMES_DIR/_rc.png"
magick -size ${RW}x${H} xc:"$BG" \
  -fill "#1a2030" \
  -draw "roundrectangle 12,12 $((RW-12)),$((H-12)) 12,12" \
  \
  -fill "$BADGE_BLUE" \
  -draw "roundrectangle 26,26 120,52 5,5" \
  -fill "white" -font "DejaVu-Sans-Bold" -pointsize 12 \
  -annotate +36+44 "ERC20" \
  \
  -fill "#374151" \
  -draw "roundrectangle 128,26 370,52 5,5" \
  -fill "$TEXT_DIM" -font "DejaVu-Sans" -pointsize 12 \
  -annotate +138+44 "transfer(address,uint256)" \
  \
  -fill "$BADGE_GREEN" \
  -draw "roundrectangle 378,26 460,52 5,5" \
  -fill "white" -font "DejaVu-Sans-Bold" -pointsize 12 \
  -annotate +388+44 "HIGH" \
  \
  -fill "$TEXT_MAIN" -font "DejaVu-Sans-Bold" -pointsize 20 \
  -annotate +26+96 "Transfer 100 tokens to recipient" \
  -fill "$TEXT_DIM" -font "DejaVu-Sans" -pointsize 13 \
  -annotate +26+120 "Decoded intent from MCP simulation" \
  \
  -fill "#1f2937" \
  -draw "roundrectangle 26,140 $((RW-26)),278 8,8" \
  -fill "$TEXT_DIM" -font "DejaVu-Sans-Bold" -pointsize 11 \
  -annotate +40+164 "DECODED PARAMETERS" \
  -fill "$ACCENT"   -font "DejaVu-Sans" -pointsize 13 \
  -annotate +40+190 "to" \
  -fill "$TEXT_MAIN" -annotate +110+190 "0x1111...9999a" \
  -fill "$ACCENT"   -annotate +40+214 "token" \
  -fill "$TEXT_MAIN" -annotate +110+214 "0xA0b8...606e" \
  -fill "$ACCENT"   -annotate +40+238 "amount" \
  -fill "$TEXT_MAIN" -annotate +110+238 "100" \
  -fill "$ACCENT"   -annotate +40+262 "spender" \
  -fill "$TEXT_MAIN" -annotate +110+262 "0x1111...9999a" \
  \
  -fill "#1f2937" \
  -draw "roundrectangle 26,290 $((RW-26)),366 8,8" \
  -fill "$TEXT_DIM" -font "DejaVu-Sans-Bold" -pointsize 11 \
  -annotate +40+314 "RISK ASSESSMENT" \
  -fill "$BADGE_GREEN" \
  -draw "roundrectangle 40,326 218,354 5,5" \
  -fill "white" -font "DejaVu-Sans" -pointsize 12 \
  -annotate +50+344 "VERIFIED_CONTRACT" \
  \
  -fill "#1f2937" \
  -draw "roundrectangle 26,378 $((RW-26)),454 8,8" \
  -fill "$TEXT_DIM" -font "DejaVu-Sans-Bold" -pointsize 11 \
  -annotate +40+402 "SIMULATED OUTCOME" \
  -fill "$TEXT_MAIN" -font "DejaVu-Sans" -pointsize 13 \
  -annotate +40+432 "● Recipient balance will increase by 100 tokens" \
  \
  -fill "$BADGE_GREEN" \
  -draw "roundrectangle 26,466 $((RW-26)),534 8,8" \
  -fill "white" -font "DejaVu-Sans-Bold" -pointsize 18 \
  -annotate +$((RW/2-60))+510 "✓  CONFIRMED" \
  \
  "$RC"

S5="$FRAMES_DIR/_s5.png"
magick -size ${W}x${H} xc:"$BG" \
  "$LEFT" -geometry +0+0   -composite \
  "$RC"   -geometry +330+0 -composite \
  "$S5"
add_label "$S5" "Read the preview result · protocol, intent, risk" "5 / 6"
dup "$S5" 60

# ── SCENE 6: Status badge / lifecycle timeline ────────────────────────────────
S6="$FRAMES_DIR/_s6.png"
magick -size ${W}x${H} xc:"$BG" \
  -fill "$TEXT_MAIN" -font "DejaVu-Sans-Bold" -pointsize 20 \
  -annotate +40+52 "Transaction Status Lifecycle" \
  -fill "$TEXT_DIM"  -font "DejaVu-Sans" -pointsize 14 \
  -annotate +40+78  "8 states track every step — from idle to confirmed (or failed)" \
  "$S6"

# Draw the 8 status badges
STATES=("Idle:#374151:0" "Generated:#2563eb:0" "Awaiting Sig:#7c3aed:0" "Pending:#d97706:0" "Confirming:#0891b2:0" "Confirmed:#16a34a:1" "Rejected:#dc2626:0" "Reverted:#b45309:0")
BW=118; BH=52; GAP=12
PX=26; PY=108

for STATE in "${STATES[@]}"; do
  IFS=":" read -r label color active <<< "$STATE"
  if [[ "$active" == "1" ]]; then
    FILL="$color"; TFILL="white"; SW=0
  else
    FILL="#1f2937"; TFILL="$TEXT_DIM"; SW=0
  fi
  x2=$(( PX + BW )); y2=$(( PY + BH ))
  magick "$S6" \
    -fill "$FILL" \
    -draw "roundrectangle ${PX},${PY} ${x2},${y2} 8,8" \
    -fill none -stroke "$color" -strokewidth 1 \
    -draw "roundrectangle ${PX},${PY} ${x2},${y2} 8,8" \
    -fill "$TFILL" -font "DejaVu-Sans-Bold" -pointsize 12 \
    -annotate +$(( PX + 10 ))+$(( PY + BH - 14 )) "$label" \
    "$S6"
  PX=$(( PX + BW + GAP ))
  if (( PX + BW > W - 20 )); then
    PX=26
    PY=$(( PY + BH + GAP ))
  fi
done

DETAIL_Y=$(( PY + BH + 32 ))
magick "$S6" \
  -fill "$TEXT_MAIN" -font "DejaVu-Sans-Bold" -pointsize 14 \
  -annotate +40+${DETAIL_Y} "Current: CONFIRMED — on-chain state changed successfully." \
  -fill "$TEXT_DIM" -font "DejaVu-Sans" -pointsize 13 \
  -annotate +40+$(( DETAIL_Y + 26 )) "Rejected = user declined · Reverted = EVM rolled back · System Error = RPC failure" \
  -annotate +40+$(( DETAIL_Y + 52 )) "All data is mocked — nothing is broadcast to any network." \
  "$S6"

add_label "$S6" "Check the status badge · follow the lifecycle" "6 / 6"
dup "$S6" 60

echo "Total frames: $IDX"

# ── Encode with ffmpeg ────────────────────────────────────────────────────────
PALETTE="/tmp/gif-palette.png"

echo "→ encoding GIF…"
ffmpeg -y -loglevel warning \
  -framerate 12 -start_number 1 \
  -i "${FRAMES_DIR}/f%05d.png" \
  -vf "scale=${W}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  "$OUT_GIF"

SIZE=$(du -sh "$OUT_GIF" | cut -f1)
DURATION=$(( IDX / 12 ))
echo "✓ GIF written: $OUT_GIF  (${SIZE}, ~${DURATION}s @ 12fps)"
