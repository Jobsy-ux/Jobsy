import { describe, expect, it } from 'vitest';
import { FileCollectionRepository } from '@/data';
import { buildSearchIndex, search } from '@/lib/search';
import { applyFilters, EMPTY_FILTERS } from '@/lib/filters';
import { safeExternalUrl } from '@/lib/url';

const repo = new FileCollectionRepository();
const index = buildSearchIndex(repo.listArtworks(), repo.listArtists(), repo.listSeries());

describe('search', () => {
  it('finds a work by its title', () => {
    const hits = search(index, 'strata');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.map((hit) => hit.slug)).toContain('strata-ember');
  });

  it('finds every work by an artist', () => {
    const hits = search(index, 'pixel ordnance');
    expect(hits.map((hit) => hit.slug).sort()).toEqual(['grid-cobalt', 'grid-magenta']);
  });

  it('ranks a title match above a description match', () => {
    const hits = search(index, 'interference');
    expect(hits[0]?.slug.startsWith('interference')).toBe(true);
  });

  it('requires every term to match', () => {
    expect(search(index, 'strata nonexistentterm')).toEqual([]);
  });

  it('returns nothing for an empty query rather than everything', () => {
    expect(search(index, '   ')).toEqual([]);
  });

  it('finds a work by year', () => {
    const hits = search(index, '2022');
    expect(hits.length).toBeGreaterThan(0);
  });
});

describe('filters', () => {
  const artworks = repo.listArtworks();

  it('returns everything when nothing is chosen', () => {
    expect(applyFilters(artworks, EMPTY_FILTERS)).toHaveLength(artworks.length);
  });

  it('separates unique works from editions', () => {
    const unique = applyFilters(artworks, { ...EMPTY_FILTERS, uniqueOnly: true });
    const editions = applyFilters(artworks, { ...EMPTY_FILTERS, editionsOnly: true });
    expect(unique.every((artwork) => artwork.artworkType === 'unique')).toBe(true);
    expect(editions.every((artwork) => artwork.artworkType !== 'unique')).toBe(true);
    expect(unique.some((artwork) => editions.includes(artwork))).toBe(false);
  });

  it('finds moving image across media types', () => {
    const moving = applyFilters(artworks, { ...EMPTY_FILTERS, movingImageOnly: true });
    expect(moving.map((artwork) => artwork.mediaType).sort()).toEqual(['animated', 'video']);
  });
});

describe('outbound links', () => {
  it('passes through ordinary web addresses', () => {
    expect(safeExternalUrl('https://example.com/a')).toBe('https://example.com/a');
  });

  it('refuses anything that is not http(s)', () => {
     
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('data:text/html,<script>')).toBeNull();
    expect(safeExternalUrl('not a url')).toBeNull();
    expect(safeExternalUrl(null)).toBeNull();
  });
});
