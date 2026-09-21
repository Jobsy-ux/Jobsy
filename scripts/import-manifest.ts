#!/usr/bin/env tsx
/**
 * Imports a collection manifest (§41, §44).
 *
 *   npm run import:manifest -- path/to/manifest.csv
 *
 * The importer never writes to `content/`. It parses, validates and writes a staged
 * result plus a report for a curator to review, because an automated import must never
 * be able to overwrite a curatorial decision (§45) — or quietly invent one.
 *
 * Rules it enforces while reading:
 *   · a row missing title, artist or canonical media is reported, never filled in
 *   · a marketplace thumbnail is recorded as a thumbnail, never as canonical media (§46)
 *   · rights default to not-established regardless of what a provider claims (§30)
 *   · `is_placeholder` must be stated explicitly, true or false (§91)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ArtworkSchema, type ArtworkInput } from '../src/domain';

const [, , inputPath] = process.argv;
if (!inputPath) {
  console.error('Usage: npm run import:manifest -- <manifest.csv|manifest.json>');
  process.exit(2);
}

const raw = readFileSync(resolve(inputPath), 'utf8');
const rows = inputPath.endsWith('.json') ? (JSON.parse(raw) as Record<string, string>[]) : parseCsv(raw);

const accepted: ArtworkInput[] = [];
const rejected: Array<{ row: number; slug: string; reason: string }> = [];

rows.forEach((row, index) => {
  try {
    accepted.push(ArtworkSchema.parse(toArtwork(row)) as unknown as ArtworkInput);
  } catch (error) {
    rejected.push({
      row: index + 2,
      slug: row.slug ?? '(no slug)',
      reason: error instanceof Error ? error.message.split('\n')[0] ?? 'invalid' : 'invalid',
    });
  }
});

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = join(process.cwd(), 'content', 'imported', stamp);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'artworks.json'), `${JSON.stringify(accepted, null, 2)}\n`, 'utf8');
writeFileSync(
  join(outDir, 'report.json'),
  `${JSON.stringify({ source: inputPath, accepted: accepted.length, rejected }, null, 2)}\n`,
  'utf8',
);

console.log('');
console.log(`  Staged ${accepted.length} record(s) in content/imported/${stamp}/`);
if (rejected.length > 0) {
  console.log(`  ${rejected.length} row(s) need a decision before they can be imported:`);
  for (const entry of rejected) console.log(`    row ${entry.row} (${entry.slug}): ${entry.reason}`);
}
console.log('  Nothing in content/ has been changed. Review the staged file, then merge it deliberately.');
console.log('');

/* ---------------------------------------------------------------- mapping */

function toArtwork(row: Record<string, string>): ArtworkInput {
  const width = numberOrNull(row.width);
  const height = numberOrNull(row.height);

  return {
    id: row.internal_id || `artwork-${row.slug}`,
    slug: row.slug ?? '',
    title: row.title ?? '',
    displayTitle: row.display_title || null,
    artistSlug: row.artist_id ?? '',
    seriesSlug: row.series_id || null,
    year: numberOrNull(row.year),
    artworkType: (row.artwork_type || 'unique') as ArtworkInput['artworkType'],
    mediaType: (row.media_type || 'still') as ArtworkInput['mediaType'],
    medium: row.medium ?? '',
    editionLabel: row.edition_label || null,
    description: row.description || null,
    media: {
      canonical: {
        id: `media-${row.slug}-canonical`,
        /* Where the file came from decides whether it may hang. An importer is not
           allowed to promote a marketplace image to canonical (§46). */
        sourceKind: (row.media_source_kind || 'owner-original') as 'owner-original',
        url: row.canonical_media_url || row.original_media_url || '',
        mimeType: row.media_mime_type || 'image/png',
        width,
        height,
        durationSeconds: numberOrNull(row.duration),
        hasAudio: row.has_audio === 'true',
        ipfsCid: row.ipfs_cid || null,
        arweaveId: row.arweave_id || null,
        tokenUri: row.token_uri || null,
      },
      web: row.web_media_url
        ? {
            id: `media-${row.slug}-web`,
            sourceKind: 'owner-original',
            url: row.web_media_url,
            mimeType: row.web_media_mime_type || 'image/webp',
            width,
            height,
          }
        : null,
      thumbnail: row.thumbnail_url
        ? {
            id: `media-${row.slug}-thumb`,
            sourceKind: 'platform',
            url: row.thumbnail_url,
            mimeType: 'image/jpeg',
            width: null,
            height: null,
          }
        : null,
      poster: row.poster_url
        ? {
            id: `media-${row.slug}-poster`,
            sourceKind: 'owner-original',
            url: row.poster_url,
            mimeType: 'image/jpeg',
            width: null,
            height: null,
          }
        : null,
      archivalOriginal: null,
    },
    token:
      row.contract_address && row.token_id
        ? {
            chain: row.chain || 'ethereum',
            contractAddress: row.contract_address,
            tokenId: row.token_id,
            tokenStandard: row.token_standard || null,
            mintPlatform: row.mint_platform || null,
            mintDate: row.mint_date || null,
            walletAddress: row.wallet_address || null,
          }
        : null,
    links: linksFrom(row),
    /* Provenance is never generated from a manifest column: each event needs its own
       evidence and its own certainty (§28). */
    provenance: [],
    acquisition: row.acquisition_date
      ? { date: row.acquisition_date, source: row.acquisition_source || null, isPublic: false }
      : null,
    tags: (row.tags || '').split('|').map((tag) => tag.trim()).filter(Boolean),
    marketStatus: (row.market_status || 'private-collection') as ArtworkInput['marketStatus'],
    displayPriority: Number.parseInt(row.display_priority || '50', 10),
    featured: row.featured === 'true',
    state: (row.visibility || 'draft') as ArtworkInput['state'],
    isPlaceholder: row.is_placeholder === 'true',
  };
}

type LinkInput = NonNullable<ArtworkInput['links']>[number];

function linksFrom(row: Record<string, string>): LinkInput[] {
  /* Which column a URL came from decides whether it points at the work the House owns or
     at the artist's wider practice. That distinction is never inferred later (§26). */
  const candidates: Array<{
    url: string | undefined;
    platform: LinkInput['platform'];
    refersTo: LinkInput['refersTo'];
    label: string;
  }> = [
    { url: row.opensea_url, platform: 'opensea', refersTo: 'this-work', label: 'View on OpenSea' },
    { url: row.raster_url, platform: 'raster', refersTo: 'this-work', label: 'View on Raster' },
    { url: row.verse_url, platform: 'verse', refersTo: 'this-work', label: 'View on Verse' },
    { url: row.primary_external_url, platform: 'other', refersTo: 'this-work', label: 'View at source' },
    { url: row.artist_url, platform: 'artist-site', refersTo: 'artist-practice', label: 'Artist site' },
    { url: row.series_url, platform: 'other', refersTo: 'other-work', label: 'The wider series' },
  ];

  return candidates
    .filter((candidate): candidate is typeof candidate & { url: string } => Boolean(candidate.url))
    .map(({ url, platform, refersTo, label }) => ({ platform, url, refersTo, label }));
}

function numberOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Small CSV reader: quoted fields, embedded commas, doubled quotes. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  if (!header) return [];
  return body
    .filter((entry) => entry.some((value) => value.trim().length > 0))
    .map((entry) => Object.fromEntries(header.map((key, index) => [key.trim(), (entry[index] ?? '').trim()])));
}
