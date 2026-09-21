'use client';

import type { Artwork } from '@/domain';

/**
 * MY HOUSE (§34). Saved works live in this visitor's browser and nowhere else: no
 * account, no wallet, no email, nothing sent anywhere (§71). The store is deliberately
 * tiny — a list of slugs and when each was saved.
 */
const STORAGE_KEY = 'house-of-nucci.my-house.v1';

export interface SavedWork {
  slug: string;
  savedAt: string;
}

type Listener = (works: SavedWork[]) => void;

const listeners = new Set<Listener>();

/**
 * A cached snapshot. `useSyncExternalStore` requires a stable reference between changes,
 * and re-parsing localStorage on every render would hand it a new array each time.
 */
const EMPTY: SavedWork[] = [];
let cache: SavedWork[] | null = null;

function read(): SavedWork[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is SavedWork =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as SavedWork).slug === 'string' &&
        typeof (entry as SavedWork).savedAt === 'string',
    );
  } catch {
    // Private browsing, disabled storage, corrupted value: an empty house is fine.
    return [];
  }
}

function write(works: SavedWork[]): void {
  cache = works;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
  } catch {
    // Saving is a convenience; failing to save must never break the visit.
  }
  for (const listener of listeners) listener(works);
}

export function listSaved(): SavedWork[] {
  if (cache === null) cache = read();
  return cache;
}

/** Snapshot pair for `useSyncExternalStore`. The server knows nothing about this. */
export function getSavedSnapshot(): SavedWork[] {
  return listSaved();
}

export function getServerSavedSnapshot(): SavedWork[] {
  return EMPTY;
}

export function isSaved(slug: string): boolean {
  return listSaved().some((work) => work.slug === slug);
}

export function toggleSaved(slug: string): boolean {
  const current = listSaved();
  const existing = current.find((work) => work.slug === slug);
  if (existing) {
    write(current.filter((work) => work.slug !== slug));
    return false;
  }
  write([...current, { slug, savedAt: new Date().toISOString() }]);
  return true;
}

export function subscribe(listener: () => void): () => void {
  const wrapped: Listener = () => listener();
  listeners.add(wrapped);
  return () => {
    listeners.delete(wrapped);
  };
}

export interface TasteReading {
  works: number;
  artists: number;
  series: number;
  movingImage: number;
  unique: number;
  editions: number;
  /** The one or two things this selection leans toward, in plain language. */
  leanings: string[];
}

/**
 * A reading of what someone has saved — descriptive, never a score, never gamified
 * (§34). Says nothing when there is too little to say honestly.
 */
export function readTaste(saved: readonly Artwork[]): TasteReading {
  const artists = new Set(saved.map((artwork) => artwork.artistSlug));
  const series = new Set(saved.map((artwork) => artwork.seriesSlug).filter(Boolean));
  const movingImage = saved.filter((artwork) =>
    ['animated', 'video', 'generative', 'shader', 'interactive'].includes(artwork.mediaType),
  ).length;
  const unique = saved.filter((artwork) => artwork.artworkType === 'unique').length;
  const editions = saved.filter(
    (artwork) => artwork.artworkType === 'edition' || artwork.artworkType === 'open-edition',
  ).length;

  const leanings: string[] = [];
  if (saved.length >= 4) {
    if (movingImage / saved.length >= 0.5) leanings.push('work that moves');
    if (unique / saved.length >= 0.7) leanings.push('unique works over editions');
    if (artists.size === 1) leanings.push('a single artist, so far');
    else if (artists.size <= Math.ceil(saved.length / 3)) leanings.push('a few artists, followed closely');
    const pixel = saved.filter((artwork) => artwork.mediaType === 'pixel').length;
    if (pixel / saved.length >= 0.34) leanings.push('pixel work');
  }

  return {
    works: saved.length,
    artists: artists.size,
    series: series.size,
    movingImage,
    unique,
    editions,
    leanings,
  };
}
