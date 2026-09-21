#!/usr/bin/env node
/**
 * Browser smoke test (§84, §86).
 *
 * Drives a running build through the surfaces that are easy to break and hard to notice:
 * the homepage, the archive's instant search, an artwork passport, an artist passport's
 * ownership separation, the museum (canvas, room labels, walking, selecting a work), and
 * the non-WebGL fallback.
 *
 *   npm run build && npm run start
 *   npm run smoke                       # or: BASE_URL=http://localhost:3100 npm run smoke
 *
 * This is a smoke test, not a performance test: a headless software renderer says nothing
 * useful about frame rate. Real-device QA is a separate, manual gate.
 */
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = process.env.SMOKE_OUT ?? null;

/*
 * Browser resolution, in order: an explicit PLAYWRIGHT_CHROMIUM, a pre-installed browser
 * where container images usually put one, then Playwright's own download.
 */
const PREINSTALLED = '/opt/pw-browsers/chromium';
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM || (existsSync(PREINSTALLED) ? PREINSTALLED : undefined);

const browser = await chromium.launch({
  executablePath,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

let failures = 0;
function assert(condition, description) {
  if (condition) {
    console.log(`  ✓ ${description}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${description}`);
  }
}

const shot = async (name) => (OUT ? page.screenshot({ path: `${OUT}/${name}.png` }) : undefined);

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await shot('01-home');
assert((await page.title()).includes('House of Nucci'), 'homepage title');

await page.goto(`${BASE}/collection`, { waitUntil: 'networkidle' });
await page.fill('input[type=search]', 'pixel');
await page.waitForTimeout(400);
const plates = await page.locator('article').count();
assert(plates > 0 && plates < 13, `search narrowed the archive (got ${plates} plates)`);
await shot('02-collection');

await page.goto(`${BASE}/artwork/interference-ember`, { waitUntil: 'networkidle' });
await shot('03-artwork');

await page.goto(`${BASE}/artist/pixel-ordnance`, { waitUntil: 'networkidle' });
assert((await page.locator('text=In the House').count()) > 0, 'artist page shows IN THE HOUSE');
assert(
  (await page.locator('text=Explore the artist').count()) > 0,
  'artist page separates the artist’s wider practice from what the House owns',
);
await shot('04-artist');

// The museum.
await page.goto(`${BASE}/museum`, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas', { timeout: 30000 });
await page.waitForTimeout(4000);
assert((await page.locator('canvas').count()) === 1, 'the museum renders a canvas');
assert((await page.locator('.hon-title').first().textContent()) === 'The Entry', 'arrives in the Entry');
await shot('05-museum-entry');

// Walk forward into the Great Room.
await page.mouse.move(720, 450);
for (let i = 0; i < 4; i += 1) {
  await page.keyboard.down('w');
  await page.waitForTimeout(1200);
  await page.keyboard.up('w');
  await page.waitForTimeout(250);
}
await page.waitForTimeout(1500);
/* Software rendering here is slow, so this checks that walking moved the visitor at all,
   not how far. */
const moved = await page.evaluate(() => {
  const raw = sessionStorage.getItem('house-of-nucci.museum-session.v1');
  return raw ? JSON.parse(raw).position[2] : null;
});
assert(moved !== null && moved < 5, `walking moved the visitor (z=${moved})`);
await shot('06-museum-great-room');

// Deep link straight to a work.
await page.goto(`${BASE}/museum?work=interference-ember`, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
await page.waitForTimeout(5000);
await shot('07-museum-black-box');
assert((await page.locator('[role=dialog]').count()) === 1, 'a deep link opens the work’s record in place');

// A device without WebGL still gets the building.
const noGl = await browser.newContext();
await noGl.addInitScript(() => {
  HTMLCanvasElement.prototype.getContext = () => null;
});
const plain = await noGl.newPage();
await plain.goto(`${BASE}/museum`, { waitUntil: 'networkidle' });
await plain.waitForTimeout(1500);
const fallback = (await plain.locator('h1').first().textContent()) ?? '';
assert(fallback.includes('3D graphics'), 'a browser without WebGL still gets the building');
if (OUT) await plain.screenshot({ path: `${OUT}/08-no-webgl.png` });
await noGl.close();

if (errors.length > 0) {
  failures += 1;
  console.error('  ✗ no console errors — saw:', errors.slice(0, 8));
} else {
  console.log('  ✓ no console errors');
}

await browser.close();
process.exit(failures > 0 ? 1 : 0);
