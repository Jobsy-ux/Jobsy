#!/usr/bin/env tsx
/**
 * Inspects a folder of supplied media and reports what the record needs to know about it.
 *
 *   npm run prepare:media -- ~/house-of-nucci-media
 *   npm run prepare:media -- ~/media --out intake.csv
 *
 * For each file it records the true dimensions, duration, audio and a SHA-256 checksum —
 * the facts the manifest asks for and nobody should be typing by hand — and flags what
 * needs a human decision: a file above the public display cap, media whose dimensions
 * cannot be read, or time-based work with no poster frame beside it.
 *
 * It does not import, modify, move or publish anything. It reads files and writes a CSV
 * of what it found, ready to be filled in with the parts only a person knows: the title,
 * the artist, the year, the provenance, the rights, and why the work is in the House.
 */
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import { PUBLIC_DISPLAY_MAX_EDGE } from '../src/domain';

const run = promisify(execFile);

const MEDIA_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov', '.tif', '.tiff',
]);

const TIME_BASED = new Set(['.gif', '.mp4', '.webm', '.mov']);

interface Inspection {
  file: string;
  relativePath: string;
  bytes: number;
  sha256: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  hasAudio: boolean;
  notes: string[];
}

async function main(): Promise<void> {
  const [, , inputPath, ...rest] = process.argv;
  if (!inputPath) {
    console.error('Usage: npm run prepare:media -- <folder> [--out <file.csv>]');
    process.exit(2);
  }
  const outIndex = rest.indexOf('--out');
  const outPath = outIndex >= 0 ? rest[outIndex + 1] : null;

  const root = resolve(inputPath);
  const files = collectFiles(root);

  if (files.length === 0) {
    console.error(`No media found under ${root}`);
    process.exit(1);
  }

  const inspections: Inspection[] = [];
  for (const file of files) {
    inspections.push(await inspect(file, root));
  }

  /* Flag what a person has to decide, rather than deciding it here. */
  const posters = new Set(inspections.map((entry) => stem(entry.file)));
  for (const entry of inspections) {
    const extension = extname(entry.file).toLowerCase();

    if (entry.width === null || entry.height === null) {
      entry.notes.push('dimensions unreadable — record them by hand, or the museum cannot hang it faithfully');
    } else if (Math.max(entry.width, entry.height) > PUBLIC_DISPLAY_MAX_EDGE) {
      entry.notes.push(
        `${Math.max(entry.width, entry.height)}px: above the ${PUBLIC_DISPLAY_MAX_EDGE}px public cap — archive this as the original and supply a viewing copy, or record permission (docs/rights.md)`,
      );
    }

    if (TIME_BASED.has(extension) && !posters.has(`${stem(entry.file)}--poster`)) {
      entry.notes.push('time-based work with no poster frame beside it — add <name>--poster.png');
    }

    if (extension === '.tif' || extension === '.tiff') {
      entry.notes.push('TIFF: archive as the original, convert to a web derivative for delivery (§15)');
    }
  }

  /* ----------------------------------------------------------------- report */

  const flagged = inspections.filter((entry) => entry.notes.length > 0);

  console.log('');
  console.log(`  Inspected ${inspections.length} file(s) under ${root}`);
  console.log('');
  for (const entry of inspections) {
    const size = entry.width && entry.height ? `${entry.width}×${entry.height}` : 'dimensions unknown';
    const duration = entry.durationSeconds ? ` · ${entry.durationSeconds.toFixed(2)}s` : '';
    const audio = entry.hasAudio ? ' · audio' : '';
    console.log(`  ${entry.relativePath}`);
    console.log(`    ${size}${duration}${audio} · ${(entry.bytes / 1024).toFixed(0)} KB · ${entry.sha256.slice(0, 12)}…`);
    for (const note of entry.notes) console.log(`    ! ${note}`);
  }

  console.log('');
  console.log(`  ${flagged.length} file(s) need a decision before import.`);

  if (outPath) {
    writeFileSync(resolve(outPath), toCsv(inspections), 'utf8');
    console.log(`  Wrote ${outPath} — fill in the title, artist, year, rights and the rest by hand.`);
  }
  console.log('');
}

void main();

/* ------------------------------------------------------------- inspection */

async function inspect(file: string, base: string): Promise<Inspection> {
  const bytes = statSync(file).size;
  const contents = readFileSync(file);
  const sha256 = createHash('sha256').update(contents).digest('hex');
  const extension = extname(file).toLowerCase();

  const inspection: Inspection = {
    file,
    relativePath: file.slice(base.length + 1),
    bytes,
    sha256,
    mimeType: mimeFor(extension),
    width: null,
    height: null,
    durationSeconds: null,
    hasAudio: false,
    notes: [],
  };

  /* Vector work has no pixel dimensions; read the declared viewBox instead. */
  if (extension === '.svg') {
    const text = contents.toString('utf8');
    const width = /width="([\d.]+)"/.exec(text)?.[1];
    const height = /height="([\d.]+)"/.exec(text)?.[1];
    const viewBox = /viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/.exec(text);
    inspection.width = width ? Math.round(Number(width)) : viewBox ? Math.round(Number(viewBox[1])) : null;
    inspection.height = height ? Math.round(Number(height)) : viewBox ? Math.round(Number(viewBox[2])) : null;
    return inspection;
  }

  try {
    /* ffmpeg reports stream details on stderr and exits non-zero with no output file,
       which is exactly what we want: inspection without transcoding. */
    await run(ffmpegPath as string, ['-hide_banner', '-i', file]);
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr ?? '';
    const video = /Stream #\d+:\d+.*?: Video:.*?(\d{2,5})x(\d{2,5})/.exec(stderr);
    if (video) {
      inspection.width = Number(video[1]);
      inspection.height = Number(video[2]);
    }
    const duration = /Duration: (\d+):(\d+):([\d.]+)/.exec(stderr);
    if (duration) {
      const seconds = Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]);
      if (seconds > 0) inspection.durationSeconds = seconds;
    }
    inspection.hasAudio = /Stream #\d+:\d+.*?: Audio:/.test(stderr);
  }

  return inspection;
}

function collectFiles(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) found.push(...collectFiles(path));
    else if (MEDIA_EXTENSIONS.has(extname(entry).toLowerCase())) found.push(path);
  }
  return found.sort();
}

function stem(file: string): string {
  return basename(file, extname(file));
}

function mimeFor(extension: string): string {
  switch (extension) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.mp4':
    case '.mov': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.tif':
    case '.tiff': return 'image/tiff';
    default: return 'application/octet-stream';
  }
}

/** Manifest-shaped output: the columns a machine can fill, and empty ones for the rest. */
function toCsv(entries: readonly Inspection[]): string {
  const columns = [
    'slug', 'title', 'artist_id', 'year', 'medium', 'artwork_type', 'media_type',
    'media_source_kind', 'canonical_media_url', 'media_mime_type', 'width', 'height',
    'duration', 'has_audio', 'sha256', 'why_in_the_house', 'rights_status',
    'is_placeholder', 'needs_decision',
  ];
  const rows = entries.map((entry) =>
    [
      slugify(stem(entry.file)),
      '',
      '',
      '',
      '',
      '',
      guessMediaType(entry),
      'owner-original',
      `/media/${entry.relativePath.split('\\').join('/')}`,
      entry.mimeType,
      entry.width ?? '',
      entry.height ?? '',
      entry.durationSeconds?.toFixed(2) ?? '',
      String(entry.hasAudio),
      entry.sha256,
      '',
      'not-established',
      'false',
      entry.notes.join('; '),
    ]
      .map((value) => (String(value).includes(',') ? `"${String(value).replace(/"/g, '""')}"` : String(value)))
      .join(','),
  );
  return `${columns.join(',')}\n${rows.join('\n')}\n`;
}

function guessMediaType(entry: Inspection): string {
  const extension = extname(entry.file).toLowerCase();
  if (extension === '.svg') return 'svg';
  if (extension === '.gif') return 'animated';
  if (['.mp4', '.webm', '.mov'].includes(extension)) return 'video';
  /* A small raster is usually pixel work, but that is a curatorial call, not a file fact. */
  if (entry.width && entry.height && Math.max(entry.width, entry.height) <= 256) return 'pixel';
  return 'still';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
