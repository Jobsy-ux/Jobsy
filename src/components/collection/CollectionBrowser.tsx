'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import type { Artist, Artwork, Series } from '@/domain';
import { ArtworkPlate } from '@/components/artwork/ArtworkPlate';
import { applyFilters, EMPTY_FILTERS, isFilterActive, type FilterState } from '@/lib/filters';
import { buildSearchIndex, search } from '@/lib/search';
import { track } from '@/lib/analytics';

/**
 * The archive (§18–20).
 *
 * Search and filtering happen in the browser over a prepared index, because a few
 * hundred works fit comfortably in memory and instant is the only acceptable speed. The
 * server has already rendered the full grid, so this component enhances a page that
 * works without it.
 *
 * Technical facets are kept behind "More ways in" — they exist for the people who want
 * them and are not the first thing anyone is shown (§19).
 */
export function CollectionBrowser({
  artworks,
  artists,
  series,
}: {
  artworks: Artwork[];
  artists: Artist[];
  series: Series[];
}) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [showTechnical, setShowTechnical] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const artistBySlug = useMemo(
    () => new Map(artists.map((artist) => [artist.slug, artist])),
    [artists],
  );
  const index = useMemo(
    () => buildSearchIndex(artworks, artists, series),
    [artworks, artists, series],
  );

  const years = useMemo(
    () =>
      [...new Set(artworks.map((artwork) => artwork.year).filter((year): year is number => year !== null))].sort(
        (a, b) => b - a,
      ),
    [artworks],
  );

  const visible = useMemo(() => {
    const filtered = applyFilters(artworks, filters);
    if (deferredQuery.trim().length === 0) return filtered;
    const ranked = search(index, deferredQuery);
    const order = new Map(ranked.map((hit, position) => [hit.slug, position]));
    return filtered
      .filter((artwork) => order.has(artwork.slug))
      .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
  }, [artworks, filters, deferredQuery, index]);

  const toggle = <K extends 'artists' | 'series' | 'years' | 'mediaTypes'>(
    key: K,
    value: FilterState[K][number],
  ) => {
    setFilters((current) => {
      const list = current[key] as Array<typeof value>;
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [key]: next } as FilterState;
    });
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--hon-space-6)' }}>
      <div
        style={{
          display: 'flex',
          gap: 'var(--hon-space-5)',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <label style={{ display: 'grid', gap: 'var(--hon-space-2)', flex: '1 1 18rem' }}>
          <span className="hon-label">Search the collection</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (event.target.value.length === 1) track({ name: 'search_used' });
            }}
            placeholder="Artist, title, series, year"
            style={{
              background: 'transparent',
              border: 0,
              borderBottom: '1px solid var(--hon-edge-strong)',
              color: 'var(--hon-bone)',
              fontFamily: 'var(--hon-display)',
              fontSize: 'var(--hon-size-heading)',
              padding: 'var(--hon-space-2) 0',
            }}
          />
        </label>
        <span className="hon-label">
          {visible.length === artworks.length
            ? `${artworks.length} works`
            : `${visible.length} of ${artworks.length} works`}
        </span>
      </div>

      <FilterRow label="Artist">
        {artists.map((artist) => (
          <FilterChip
            key={artist.slug}
            active={filters.artists.includes(artist.slug)}
            onClick={() => toggle('artists', artist.slug)}
          >
            {artist.name}
          </FilterChip>
        ))}
      </FilterRow>

      <FilterRow label="Kind">
        <FilterChip
          active={filters.uniqueOnly}
          onClick={() => setFilters((c) => ({ ...c, uniqueOnly: !c.uniqueOnly, editionsOnly: false }))}
        >
          Unique works
        </FilterChip>
        <FilterChip
          active={filters.editionsOnly}
          onClick={() => setFilters((c) => ({ ...c, editionsOnly: !c.editionsOnly, uniqueOnly: false }))}
        >
          Editions
        </FilterChip>
        <FilterChip
          active={filters.movingImageOnly}
          onClick={() => setFilters((c) => ({ ...c, movingImageOnly: !c.movingImageOnly }))}
        >
          Moving image
        </FilterChip>
        <FilterChip
          active={filters.mediaTypes.includes('pixel')}
          onClick={() => toggle('mediaTypes', 'pixel')}
        >
          Pixel
        </FilterChip>
      </FilterRow>

      {showTechnical ? (
        <>
          <FilterRow label="Series">
            {series.map((entry) => (
              <FilterChip
                key={entry.slug}
                active={filters.series.includes(entry.slug)}
                onClick={() => toggle('series', entry.slug)}
              >
                {entry.title}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="Year of creation">
            {years.map((year) => (
              <FilterChip key={year} active={filters.years.includes(year)} onClick={() => toggle('years', year)}>
                {year}
              </FilterChip>
            ))}
          </FilterRow>
        </>
      ) : null}

      <div style={{ display: 'flex', gap: 'var(--hon-space-5)' }}>
        <button type="button" className="hon-action" onClick={() => setShowTechnical((value) => !value)}>
          {showTechnical ? 'Fewer ways in' : 'More ways in'}
        </button>
        {isFilterActive(filters) || query ? (
          <button
            type="button"
            className="hon-action"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setQuery('');
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      <hr className="hon-rule" />

      {visible.length === 0 ? (
        <p className="hon-prose">
          Nothing in the collection matches that. The House holds {artworks.length} works;
          try an artist or a year.
        </p>
      ) : (
        <ul
          style={{
            display: 'grid',
            gap: 'var(--hon-space-7) var(--hon-space-5)',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(16rem, 100%), 1fr))',
          }}
        >
          {visible.map((artwork, position) => (
            <li key={artwork.slug}>
              <ArtworkPlate
                artwork={artwork}
                artist={artistBySlug.get(artwork.artistSlug) ?? null}
                priority={position < 4}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--hon-space-3)' }}>
      <span className="hon-label">{label}</span>
      <div style={{ display: 'flex', gap: 'var(--hon-space-2)', flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '0.35rem var(--hon-space-3)',
        border: `1px solid ${active ? 'var(--hon-bone-dim)' : 'var(--hon-edge)'}`,
        color: active ? 'var(--hon-bone)' : 'var(--hon-quiet)',
        background: active ? 'var(--hon-graphite)' : 'transparent',
        fontSize: 'var(--hon-size-label)',
        letterSpacing: 'var(--hon-tracking-wide)',
        textTransform: 'uppercase',
        transition: 'color var(--hon-duration-quick) var(--hon-ease), border-color var(--hon-duration-quick) var(--hon-ease)',
      }}
    >
      {children}
    </button>
  );
}
