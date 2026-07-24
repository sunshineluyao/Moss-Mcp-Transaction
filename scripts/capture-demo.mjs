/**
 * Captures a 30-second walkthrough of the Moss MCP Transaction Preview app.
 * Outputs frames to /tmp/demo-frames/, then ffmpeg stitches them into a GIF.
 *
 * Usage: node scripts/capture-demo.mjs
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = 'http://localhost:23076/';
const FRAMES_DIR = '/tmp/demo-frames';
const OUTPUT_GIF = path.resolve(__dirname, '..', 'assets', 'moss-mcp-transaction-preview-demo.gif');
const FRAME_DELAY_MS = 80; // ~12.5 fps

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

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/runner/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1100, height: 720 });

  // ─── Step 1: Open the page ───────────────────────────────────────────────
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await sleep(800);

  // Hold on initial load — title visible
  await shot(page, 20); // ~1.6s

  // ─── Step 2: Read intro ──────────────────────────────────────────────────
  // Smoothly scroll down a bit to show full intro text
  for (let y = 0; y <= 160; y += 10) {
    await page.evaluate(s => window.scrollTo({ top: s }), y);
    await shot(page, 2);
  }
  await shot(page, 15); // pause on intro

  // ─── Step 3: Expand "What is Moss MCP?" ─────────────────────────────────
  const mossMcpToggle = await page.$('text=What is Moss MCP?');
  if (mossMcpToggle) {
    await mossMcpToggle.click();
    await sleep(400);
    await shot(page, 15);
  }

  // ─── Step 4: Scroll to Simulation Parameters form ───────────────────────
  for (let y = 160; y <= 380; y += 10) {
    await page.evaluate(s => window.scrollTo({ top: s }), y);
    await shot(page, 2);
  }
  await shot(page, 15); // pause on form

  // ─── Step 5: Choose operation type (click dropdown) ─────────────────────
  // Click the Operation Type select trigger
  const opSelect = await page.$('[data-testid="operation-select"], [role="combobox"]');
  if (opSelect) {
    await opSelect.click();
    await sleep(300);
    await shot(page, 10);
    // Choose "Token Approval"
    const approvalOption = await page.$('text=Token Approval');
    if (approvalOption) {
      await approvalOption.click();
      await sleep(300);
    } else {
      // Close dropdown
      await page.keyboard.press('Escape');
    }
    await shot(page, 15);
  }

  // ─── Step 6: Hover over Generate Preview button ──────────────────────────
  const generateBtn = await page.$('text=Generate Preview');
  if (generateBtn) {
    await generateBtn.hover();
    await shot(page, 10);
  }

  // ─── Step 7: Click Generate Preview ─────────────────────────────────────
  if (generateBtn) {
    await generateBtn.click();
    await sleep(1200);
    await shot(page, 20); // ~1.6s on result appearing
  }

  // ─── Step 8: Read the result — scroll right panel into view ─────────────
  // Scroll to show full preview card
  for (let y = 380; y <= 550; y += 10) {
    await page.evaluate(s => window.scrollTo({ top: s }), y);
    await shot(page, 2);
  }
  await shot(page, 20); // pause on result card

  // ─── Step 9: Scroll to show status badge / timeline ─────────────────────
  for (let y = 550; y <= 900; y += 15) {
    await page.evaluate(s => window.scrollTo({ top: s }), y);
    await shot(page, 2);
  }
  await shot(page, 25); // hold on status badge

  // ─── Step 10: Scroll back to top ─────────────────────────────────────────
  for (let y = 900; y >= 0; y -= 30) {
    await page.evaluate(s => window.scrollTo({ top: s }), y);
    await shot(page, 1);
  }
  await shot(page, 15); // final hold

  await browser.close();

  console.log(`Captured ${frameIndex} frames.`);

  // ─── Encode GIF with ffmpeg ───────────────────────────────────────────────
  // Generate palette for quality GIF
  const palette = '/tmp/demo-palette.png';
  console.log('Generating palette...');
  execSync(
    `ffmpeg -y -framerate 12.5 -i "${FRAMES_DIR}/frame_%05d.png" ` +
    `-vf "scale=900:-1:flags=lanczos,palettegen=max_colors=128:stats_mode=diff" "${palette}"`,
    { stdio: 'inherit' }
  );

  console.log('Encoding GIF...');
  execSync(
    `ffmpeg -y -framerate 12.5 -i "${FRAMES_DIR}/frame_%05d.png" -i "${palette}" ` +
    `-lavfi "scale=900:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" ` +
    `"${OUTPUT_GIF}"`,
    { stdio: 'inherit' }
  );

  const stats = fs.statSync(OUTPUT_GIF);
  console.log(`GIF created: ${OUTPUT_GIF} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
})();
