import type { Artwork, MediaType } from '@/domain';

/**
 * Archive filtering (§19). Technical facets exist but are not shown by default —
 * `isTechnical` marks the ones kept behind "More".
 */
export interface FilterState {
  artists: string[];
  series: string[];
  years: number[];
  mediaTypes: MediaType[];
  /** 1/1 versus editioned, in art-world terms rather than token terms (§77). */
  uniqueOnly: boolean;
  editionsOnly: boolean;
  movingImageOnly: boolean;
  availableExternally: boolean;
  tags: string[];
  acquisitionYears: number[];
  exhibition: string | null;
}

export const EMPTY_FILTERS: FilterState = {
  artists: [],
  series: [],
  years: [],
  mediaTypes: [],
  uniqueOnly: false,
  editionsOnly: false,
  movingImageOnly: false,
  availableExternally: false,
  tags: [],
  acquisitionYears: [],
  exhibition: null,
};

const MOVING_IMAGE: ReadonlySet<MediaType> = new Set<MediaType>([
  'animated',
  'video',
  'generative',
  'shader',
  'interactive',
]);

export function isFilterActive(filters: FilterState): boolean {
  return (
    filters.artists.length > 0 ||
    filters.series.length > 0 ||
    filters.years.length > 0 ||
    filters.mediaTypes.length > 0 ||
    filters.tags.length > 0 ||
    filters.acquisitionYears.length > 0 ||
    filters.uniqueOnly ||
    filters.editionsOnly ||
    filters.movingImageOnly ||
    filters.availableExternally ||
    filters.exhibition !== null
  );
}

export function applyFilters(
  artworks: readonly Artwork[],
  filters: FilterState,
  exhibitionMembership?: ReadonlyMap<string, readonly string[]>,
): Artwork[] {
  return artworks.filter((artwork) => {
    if (filters.artists.length > 0 && !filters.artists.includes(artwork.artistSlug)) return false;
    if (filters.series.length > 0 && (!artwork.seriesSlug || !filters.series.includes(artwork.seriesSlug))) {
      return false;
    }
    if (filters.years.length > 0 && (artwork.year === null || !filters.years.includes(artwork.year))) {
      return false;
    }
    if (filters.mediaTypes.length > 0 && !filters.mediaTypes.includes(artwork.mediaType)) return false;
    if (filters.uniqueOnly && artwork.artworkType !== 'unique') return false;
    if (filters.editionsOnly && artwork.artworkType !== 'edition' && artwork.artworkType !== 'open-edition') {
      return false;
    }
    if (filters.movingImageOnly && !MOVING_IMAGE.has(artwork.mediaType)) return false;
    if (filters.availableExternally && artwork.marketStatus !== 'available-externally') return false;
    if (filters.tags.length > 0 && !filters.tags.some((tag) => artwork.tags.includes(tag))) return false;
    if (filters.acquisitionYears.length > 0) {
      const year = artwork.acquisition?.date ? Number.parseInt(artwork.acquisition.date.slice(0, 4), 10) : null;
      if (year === null || !filters.acquisitionYears.includes(year)) return false;
    }
    if (filters.exhibition) {
      const members = exhibitionMembership?.get(filters.exhibition);
      if (!members || !members.includes(artwork.slug)) return false;
    }
    return true;
  });
}
