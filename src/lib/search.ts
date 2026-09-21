import type { Artist, Artwork, Series } from '@/domain';

export interface SearchDocument {
  slug: string;
  title: string;
  artistName: string;
  seriesTitle: string | null;
  year: number | null;
  /** Everything searchable, lowercased once at build time. */
  haystack: string;
}

export interface SearchHit {
  slug: string;
  score: number;
}

/**
 * The collection is a few hundred works, so a prepared in-memory index is both instant
 * and completely explainable (§20). No ranking signal here is derived from market data
 * or popularity (§36) — only from where the term matched.
 */
export function buildSearchIndex(
  artworks: readonly Artwork[],
  artists: readonly Artist[],
  series: readonly Series[],
): SearchDocument[] {
  const artistName = new Map(artists.map((artist) => [artist.slug, artist.name]));
  const seriesTitle = new Map(series.map((entry) => [entry.slug, entry.title]));

  return artworks.map((artwork) => {
    const artist = artistName.get(artwork.artistSlug) ?? '';
    const seriesName = artwork.seriesSlug ? (seriesTitle.get(artwork.seriesSlug) ?? null) : null;
    const parts = [
      artwork.title,
      artwork.displayTitle ?? '',
      artist,
      seriesName ?? '',
      artwork.year?.toString() ?? '',
      artwork.medium,
      artwork.editionLabel ?? '',
      artwork.description ?? '',
      artwork.tags.join(' '),
      artwork.token?.tokenId ?? '',
      artwork.mediaType,
      artwork.artworkType,
    ];
    return {
      slug: artwork.slug,
      title: artwork.title,
      artistName: artist,
      seriesTitle: seriesName,
      year: artwork.year,
      haystack: parts.join(' \u0001 ').toLowerCase(),
    };
  });
}

const FIELD_WEIGHTS = { title: 8, artist: 6, series: 4, year: 3, other: 1 } as const;

export function search(index: readonly SearchDocument[], rawQuery: string): SearchHit[] {
  const query = rawQuery.trim().toLowerCase();
  if (query.length === 0) return [];
  const terms = query.split(/\s+/).filter(Boolean);

  const hits: SearchHit[] = [];
  for (const doc of index) {
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      const termScore = scoreTerm(doc, term);
      if (termScore === 0) {
        matchedAll = false;
        break;
      }
      score += termScore;
    }
    if (matchedAll) hits.push({ slug: doc.slug, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
}

function scoreTerm(doc: SearchDocument, term: string): number {
  const title = doc.title.toLowerCase();
  const artist = doc.artistName.toLowerCase();
  const series = doc.seriesTitle?.toLowerCase() ?? '';

  if (title.startsWith(term)) return FIELD_WEIGHTS.title * 2;
  if (title.includes(term)) return FIELD_WEIGHTS.title;
  if (artist.startsWith(term)) return FIELD_WEIGHTS.artist * 2;
  if (artist.includes(term)) return FIELD_WEIGHTS.artist;
  if (series.includes(term)) return FIELD_WEIGHTS.series;
  if (doc.year !== null && doc.year.toString() === term) return FIELD_WEIGHTS.year;
  if (doc.haystack.includes(term)) return FIELD_WEIGHTS.other;
  return 0;
}
