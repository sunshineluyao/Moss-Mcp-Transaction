/**
 * Captures a walkthrough of the Moss MCP Transaction Preview app.
 * Outputs frames to /tmp/demo-frames/, then ffmpeg stitches them into a GIF.
 *
 * Usage:
 *   APP_URL=http://localhost:23076/ node scripts/capture-demo.mjs
 *
 * Optional env:
 *   SCENARIO="Success" | "User Rejected" | "On-chain Reverted" | "System Error"
 *   OUTPUT_GIF=/abs/path/to/output.gif
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
  : path.resolve(__dirname, '..', 'assets', 'moss-mcp-transaction-preview-demo.gif');
const SCENARIO = process.env.SCENARIO || 'Success';
const FPS = 8;
const FRAME_DELAY_MS = Math.round(1000 / FPS);
const OUTPUT_WIDTH = 680;
const PALETTE_COLORS = 72;
const FFMPEG_STATIC_BIN = path.resolve(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg');
const FFMPEG_BIN = process.env.FFMPEG_BIN || (fs.existsSync(FFMPEG_STATIC_BIN)
  ? FFMPEG_STATIC_BIN
  : fs.existsSync('/home/codespace/.cache/ms-playwright/ffmpeg-1011/ffmpeg-linux')
    ? '/home/codespace/.cache/ms-playwright/ffmpeg-1011/ffmpeg-linux'
    : 'ffmpeg');

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

  // Step 1: open the page and hold hero/intro
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('heading', { name: 'Moss MCP Transaction Preview' }).first().waitFor({ timeout: 8000 });
  await sleep(600);
  await shot(page, 18);

  // Step 2: read intro and open What is Moss MCP
  await smoothScroll(page, 0, 180, 12, 1);
  const mossMcpToggle = page.getByRole('button', { name: /What is Moss MCP\?/i });
  if (await mossMcpToggle.isVisible()) {
    await mossMcpToggle.click();
    await sleep(450);
    await shot(page, 14);
  }

  // Step 3: focus simulation parameters and configure values
  await smoothScroll(page, 180, 420, 10, 1);
  const operationSelect = page.getByTestId('operation-select-trigger');
  await operationSelect.click();
  await sleep(250);
  await page.getByRole('option', { name: 'ERC20 Approve' }).click();
  await shot(page, 10);

  await page.locator('#amount').fill('250');
  await shot(page, 8);

  const scenarioSelect = page.getByTestId('scenario-select-trigger');
  await scenarioSelect.click();
  await sleep(220);
  await page.getByRole('option', { name: SCENARIO }).click();
  await shot(page, 10);

  // Step 4: click Generate Preview and capture post-click result
  const generateBtn = page.getByTestId('generate-preview-button');
  await generateBtn.hover();
  await shot(page, 8);
  await generateBtn.click();

  await page.getByTestId('simulation-result-zone').waitFor({ timeout: 10000 });
  await page.getByTestId('preview-result-card').waitFor({ timeout: 10000 });
  await shot(page, 30);

  // Step 5: reveal more result details after Generate Preview
  await smoothScroll(page, 420, 780, 10, 1);
  await shot(page, 36);

  await smoothScroll(page, 780, 1080, 12, 1);
  await page.getByTestId('status-lifecycle-panel').scrollIntoViewIfNeeded();
  await shot(page, 42);

  // Step 6: return to top for end frame
  await smoothScroll(page, 1080, 0, 20, 1);
  await shot(page, 18);

  await browser.close();

  const durationSec = ((frameIndex * FRAME_DELAY_MS) / 1000).toFixed(1);
  console.log(`Captured ${frameIndex} frames (~${durationSec}s) for scenario: ${SCENARIO}.`);

  // Encode GIF with ffmpeg and generated palette
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
