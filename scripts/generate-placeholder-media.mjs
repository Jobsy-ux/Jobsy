/**
 * Generates the abstract placeholder media used by the demo records in `content/`.
 *
 * These files are NOT artworks and are not stand-ins for any real work in the House of
 * Nucci Collection. They exist so the museum, the renderers and the media state machine
 * can be built and tested before the real collection is supplied (see DECISIONS.md D-7,
 * O-2). Everything produced here lands in `public/media/demo/` and is deleted — not
 * edited — when real assets arrive.
 *
 * Deterministic: same seed in, same bytes out. Run with `node scripts/generate-placeholder-media.mjs`.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'media', 'demo');
mkdirSync(OUT, { recursive: true });

/* ---------------------------------------------------------------- generators */

/** Small deterministic PRNG so runs are reproducible. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

/**
 * Renders one RGBA frame. `composition` receives normalized coordinates and time and
 * returns [r, g, b] in 0..255.
 */
function renderFrame(width, height, time, composition) {
  const buf = Buffer.allocUnsafe(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = composition(x / width, y / height, time, x, y);
      const i = (y * width + x) * 4;
      buf[i] = clamp255(r);
      buf[i + 1] = clamp255(g);
      buf[i + 2] = clamp255(b);
      buf[i + 3] = 255;
    }
  }
  return buf;
}

function runFfmpeg(args, frames) {
  return new Promise((resolvePromise, reject) => {
    const proc = spawn(ffmpegPath, ['-hide_banner', '-loglevel', 'error', ...args]);
    proc.on('error', reject);
    proc.on('close', (code) => (code === 0 ? resolvePromise() : reject(new Error(`ffmpeg exited ${code}`))));
    for (const frame of frames) proc.stdin.write(frame);
    proc.stdin.end();
  });
}

async function writeStill(name, width, height, composition) {
  const frame = renderFrame(width, height, 0, composition);
  await runFfmpeg(
    ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${width}x${height}`, '-i', '-',
     '-frames:v', '1', join(OUT, name)],
    [frame],
  );
  console.log(`  ${name}  ${width}x${height}`);
}

async function writeSequence(name, width, height, frameCount, fps, composition, extraArgs) {
  const frames = [];
  for (let f = 0; f < frameCount; f += 1) {
    frames.push(renderFrame(width, height, f / frameCount, composition));
  }
  await runFfmpeg(
    ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${width}x${height}`, '-r', String(fps),
     '-i', '-', ...extraArgs, join(OUT, name)],
    frames,
  );
  console.log(`  ${name}  ${width}x${height} · ${frameCount}f @ ${fps}fps`);
}

/* -------------------------------------------------------------- compositions */

/** Stratified bands with a slow vertical falloff — quiet, architectural. */
function strata(seed, palette) {
  const rand = mulberry32(seed);
  const bands = Array.from({ length: 9 }, () => ({
    at: rand(),
    weight: 0.02 + rand() * 0.09,
    colour: palette[Math.floor(rand() * palette.length)],
  })).sort((a, b) => a.at - b.at);
  return (u, v) => {
    let r = 10 + v * 12;
    let g = 10 + v * 11;
    let b = 12 + v * 14;
    for (const band of bands) {
      const d = Math.abs(v - band.at);
      if (d < band.weight) {
        const k = 1 - d / band.weight;
        const e = k * k * (0.35 + 0.65 * Math.sin(u * Math.PI));
        r += band.colour[0] * e;
        g += band.colour[1] * e;
        b += band.colour[2] * e;
      }
    }
    return [r, g, b];
  };
}

/** Interference of two radial fields — reads as a single luminous event. */
function interference(seed, palette) {
  const rand = mulberry32(seed);
  const cx1 = 0.25 + rand() * 0.2;
  const cy1 = 0.3 + rand() * 0.3;
  const cx2 = 0.6 + rand() * 0.25;
  const cy2 = 0.4 + rand() * 0.3;
  const a = palette[0];
  const b = palette[1 % palette.length];
  return (u, v, t) => {
    const d1 = Math.hypot(u - cx1, v - cy1);
    const d2 = Math.hypot(u - cx2, v - cy2);
    const w = Math.sin(d1 * 38 - t * Math.PI * 2) * Math.sin(d2 * 26 + t * Math.PI * 2);
    const k = (w + 1) / 2;
    const fall = Math.max(0, 1 - Math.min(d1, d2) * 1.5);
    return [
      8 + (a[0] * k + b[0] * (1 - k)) * fall * 0.9,
      8 + (a[1] * k + b[1] * (1 - k)) * fall * 0.9,
      12 + (a[2] * k + b[2] * (1 - k)) * fall * 0.9,
    ];
  };
}

/** Hard-edged blocks on a coarse grid — used for the nearest-neighbour test record. */
function blocks(seed, palette, grid) {
  const rand = mulberry32(seed);
  const cells = new Array(grid * grid).fill(0).map(() => {
    const roll = rand();
    if (roll < 0.52) return [14, 14, 17];
    return palette[Math.floor(rand() * palette.length)];
  });
  return (u, v) => {
    const gx = Math.min(grid - 1, Math.floor(u * grid));
    const gy = Math.min(grid - 1, Math.floor(v * grid));
    return cells[gy * grid + gx];
  };
}

/** Slow drift of luminous horizontal rules — the moving-image demo. */
function drift(seed, palette) {
  const rand = mulberry32(seed);
  const rules = Array.from({ length: 14 }, () => ({
    at: rand(),
    speed: (rand() - 0.5) * 0.5,
    width: 0.004 + rand() * 0.02,
    colour: palette[Math.floor(rand() * palette.length)],
  }));
  return (u, v, t) => {
    let r = 9 + v * 6;
    let g = 9 + v * 6;
    let b = 11 + v * 8;
    for (const rule of rules) {
      const pos = (rule.at + rule.speed * t + 1) % 1;
      const d = Math.abs(v - pos);
      if (d < rule.width) {
        const k = (1 - d / rule.width) ** 1.5;
        const across = 0.25 + 0.75 * Math.sin(Math.PI * Math.min(1, Math.max(0, u * 1.1 - 0.05)));
        r += rule.colour[0] * k * across;
        g += rule.colour[1] * k * across;
        b += rule.colour[2] * k * across;
      }
    }
    return [r, g, b];
  };
}

/* ------------------------------------------------------------------ palettes */

const EMBER = [[196, 84, 38], [232, 150, 72], [96, 36, 24]];
const VERDIGRIS = [[42, 132, 122], [128, 196, 180], [24, 72, 74]];
const COBALT = [[46, 76, 188], [126, 158, 232], [22, 30, 86]];
const BONE = [[214, 206, 190], [156, 146, 128], [86, 80, 70]];
const MAGENTA = [[186, 48, 118], [236, 128, 176], [82, 22, 58]];

/* ---------------------------------------------------------------------- run */

const MP4 = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow',
             '-movflags', '+faststart'];
const WEBM = ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', '-crf', '34', '-b:v', '0',
              '-row-mt', '1'];
const GIF = ['-vf', 'split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=none',
             '-loop', '0'];

console.log('Generating placeholder media (abstract, demo-only) …');

// Still works, several aspect ratios (§91: multiple aspect ratios in the slice).
await writeStill('still-strata-ember.png', 2048, 1365, strata(1207, EMBER));
await writeStill('still-strata-ember--thumb.png', 640, 427, strata(1207, EMBER));
await writeStill('still-interference-verdigris.png', 1600, 2000, interference(5511, VERDIGRIS));
await writeStill('still-interference-verdigris--thumb.png', 512, 640, interference(5511, VERDIGRIS));
await writeStill('still-strata-bone.png', 1800, 1800, strata(9004, BONE));
await writeStill('still-strata-bone--thumb.png', 600, 600, strata(9004, BONE));
await writeStill('still-interference-cobalt.png', 2400, 1000, interference(3320, COBALT));
await writeStill('still-interference-cobalt--thumb.png', 720, 300, interference(3320, COBALT));

await writeStill('still-drift-magenta.png', 1400, 1750, drift(2215, MAGENTA));
await writeStill('still-drift-magenta--thumb.png', 480, 600, drift(2215, MAGENTA));
await writeStill('still-blocks-bone.png', 2000, 1334, blocks(6640, BONE, 11));
await writeStill('still-blocks-bone--thumb.png', 600, 400, blocks(6640, BONE, 11));
await writeStill('still-interference-magenta.png', 1000, 1500, interference(1180, MAGENTA));
await writeStill('still-interference-magenta--thumb.png', 400, 600, interference(1180, MAGENTA));
await writeStill('still-strata-cobalt.png', 2560, 1080, strata(4470, COBALT));
await writeStill('still-strata-cobalt--thumb.png', 768, 324, strata(4470, COBALT));

// Pixel work: genuinely small, so nearest-neighbour rendering is visible and testable.
await writeStill('pixel-grid-magenta.png', 64, 64, blocks(77, MAGENTA, 16));
await writeStill('pixel-grid-cobalt.png', 96, 96, blocks(421, COBALT, 24));

// Animated (GIF) and moving image (MP4 + WEBM), with posters.
await writeSequence('animated-drift-verdigris.gif', 480, 480, 36, 12, drift(8821, VERDIGRIS), GIF);
await writeStill('animated-drift-verdigris--poster.png', 480, 480, drift(8821, VERDIGRIS));

await writeSequence('video-interference-ember.mp4', 1280, 720, 150, 30, interference(6102, EMBER), MP4);
await writeSequence('video-interference-ember.webm', 1280, 720, 150, 30, interference(6102, EMBER), WEBM);
await writeStill('video-interference-ember--poster.png', 1280, 720, interference(6102, EMBER));

// Vector work, handwritten so the SVG renderer path has real vector input.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1250" width="1000" height="1250" role="img" aria-label="Placeholder vector composition">
  <title>Placeholder vector composition (demo record)</title>
  <rect width="1000" height="1250" fill="#0d0d0f"/>
  <g fill="none" stroke="#d6cebe" stroke-width="1.25" opacity="0.5">
    ${Array.from({ length: 28 }, (_, i) => `<line x1="90" y1="${120 + i * 36}" x2="910" y2="${120 + i * 36}"/>`).join('\n    ')}
  </g>
  <rect x="150" y="260" width="380" height="620" fill="#2a847a"/>
  <rect x="470" y="430" width="400" height="250" fill="#c45426"/>
  <circle cx="470" cy="430" r="86" fill="#0d0d0f"/>
</svg>
`;
writeFileSync(join(OUT, 'vector-fields.svg'), svg, 'utf8');
console.log('  vector-fields.svg  1000x1250');

console.log('Done. These files are demo placeholders, not collection works.');
