/**
 * GIF capture script — Moss MCP Transaction Preview
 *
 * NOTICE: The old Scenario selector and Confirmed/Rejected lifecycle no longer
 * exist in the UI. This script is updated to capture the new single gold-path
 * flow (MON transfer preview on Monad Testnet).
 *
 * A truthful new GIF requires a live Monad Testnet RPC connection at capture time.
 * If the RPC is unavailable, the capture will show an error state — which is
 * accurate but not suitable for README use.
 *
 * TODO: Regenerate assets/moss-monad-testnet-preview.gif once a reliable
 * Monad Testnet address with testnet balance is available for the demo.
 *
 * Usage:
 *   APP_URL=http://localhost:<PORT>/<BASE_PATH> node scripts/capture-demo.mjs
 *
 * Optional env:
 *   OUTPUT_GIF=/abs/path/to/output.gif
 *   SENDER=0x...    (valid Monad Testnet address with balance)
 *   RECIPIENT=0x... (valid Monad Testnet address)
 *   AMOUNT=0.1
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = process.env.APP_URL || 'http://localhost:23076/';
const FRAMES_DIR = '/tmp/demo-frames';
const OUTPUT_GIF = process.env.OUTPUT_GIF
  ? path.resolve(process.env.OUTPUT_GIF)
  : path.resolve(__dirname, '..', 'assets', 'moss-monad-testnet-preview.gif');
const FPS = 8;
const FRAME_DELAY_MS = Math.round(1000 / FPS);
const OUTPUT_WIDTH = 680;
const PALETTE_COLORS = 72;
const FFMPEG_STATIC_BIN = path.resolve(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg');
const FFMPEG_BIN = process.env.FFMPEG_BIN || (fs.existsSync(FFMPEG_STATIC_BIN)
  ? FFMPEG_STATIC_BIN
  : 'ffmpeg');

// Default test addresses (no balance — will show BLOCKED, which is truthful)
const SENDER = process.env.SENDER || '0xaAbBcCdDeEfF0011223344556677889900aAbBcC';
const RECIPIENT = process.env.RECIPIENT || '0x1111222233334444555566667777888899990000';
const AMOUNT = process.env.AMOUNT || '0.1';

fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });

let frameIndex = 0;

async function shot(page, holdFrames = 15) {
  for (let i = 0; i < holdFrames; i++) {
    const file = path.join(FRAMES_DIR, `frame_${String(frameIndex++).padStart(5, '0')}.png`);
    await page.screenshot({ path: file, type: 'png' });
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function smoothScroll(page, from, to, step = 12, hold = 1) {
  const dir = to >= from ? 1 : -1;
  const distance = Math.abs(to - from);
  const ticks = Math.max(1, Math.floor(distance / step));
  for (let i = 0; i <= ticks; i++) {
    const y = from + dir * i * step;
    await page.evaluate(scrollY => window.scrollTo({ top: scrollY, behavior: 'instant' }), y);
    await shot(page, hold);
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1100, height: 720 });

  // Step 1: load page and capture header + status chips
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('heading', { name: 'Understand an unsigned MON transfer before signing.' }).waitFor({ timeout: 8000 });
  await sleep(600);
  await shot(page, 18);

  // Step 2: scroll to form and fill fields
  await smoothScroll(page, 0, 250, 12, 1);
  await page.locator('#sender').fill(SENDER);
  await shot(page, 8);
  await page.locator('#recipient').fill(RECIPIENT);
  await shot(page, 8);
  await page.locator('#amount').fill(AMOUNT);
  await shot(page, 8);

  // Step 3: click Preview on Monad Testnet
  const previewBtn = page.getByRole('button', { name: /Preview on Monad Testnet/i });
  await previewBtn.hover();
  await shot(page, 8);
  await previewBtn.click();

  // Step 4: wait for loading state and capture pipeline spinner
  await sleep(800);
  await shot(page, 20);

  // Step 5: wait for result (up to 15s) and capture
  try {
    await page.locator('[data-testid="preview-result"]').waitFor({ timeout: 15000 });
    await shot(page, 30);

    // Scroll through the result
    await smoothScroll(page, 250, 800, 10, 1);
    await shot(page, 36);

    await smoothScroll(page, 800, 1400, 12, 1);
    await shot(page, 36);

    // Return to top
    await smoothScroll(page, 1400, 0, 20, 1);
    await shot(page, 18);
  } catch {
    // RPC unavailable — capture whatever state is shown
    await shot(page, 30);
  }

  await browser.close();

  const durationSec = ((frameIndex * FRAME_DELAY_MS) / 1000).toFixed(1);
  console.log(`Captured ${frameIndex} frames (~${durationSec}s).`);

  const palette = '/tmp/demo-palette.png';
  console.log('Generating palette...');
  execSync(
    `"${FFMPEG_BIN}" -y -framerate ${FPS} -start_number 0 -i "${FRAMES_DIR}/frame_%05d.png" ` +
    `-vf "scale=${OUTPUT_WIDTH}:-1:flags=lanczos,palettegen=max_colors=${PALETTE_COLORS}:stats_mode=diff" "${palette}"`,
    { stdio: 'inherit' }
  );

  console.log('Encoding GIF...');
  execSync(
    `"${FFMPEG_BIN}" -y -framerate ${FPS} -start_number 0 -i "${FRAMES_DIR}/frame_%05d.png" -i "${palette}" ` +
    `-lavfi "scale=${OUTPUT_WIDTH}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" ` +
    `"${OUTPUT_GIF}"`,
    { stdio: 'inherit' }
  );

  const stats = fs.statSync(OUTPUT_GIF);
  console.log(`GIF created: ${OUTPUT_GIF} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
})();
