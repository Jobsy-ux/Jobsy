'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArtworkPlate } from '@/components/artwork/ArtworkPlate';
import { getSavedSnapshot, getServerSavedSnapshot, readTaste, subscribe } from '@/lib/my-house';
import type { Artist, Artwork } from '@/domain';

export function MyHouseView({ artworks, artists }: { artworks: Artwork[]; artists: Artist[] }) {
  /* What has been saved lives in this browser and nowhere else (§71). */
  const saved = useSyncExternalStore(subscribe, getSavedSnapshot, getServerSavedSnapshot);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const bySlug = new Map(artworks.map((artwork) => [artwork.slug, artwork]));
  const artistBySlug = new Map(artists.map((artist) => [artist.slug, artist]));
  const works = saved
    .map((entry) => bySlug.get(entry.slug))
    .filter((artwork): artwork is Artwork => artwork !== undefined);
  const taste = readTaste(works);

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <p className="hon-eyebrow">Yours, on this device</p>
        <h1 className="hon-display">My House</h1>
        <p className="hon-prose hon-measure">
          Works you have saved while visiting. Kept in this browser only — no account, no
          wallet, nothing sent anywhere.
        </p>
      </header>

      {!ready ? null : works.length === 0 ? (
        <p className="hon-prose hon-measure">
          Nothing saved yet. Anywhere you see a work, there is a way to keep it here.{' '}
          <Link href="/collection" style={{ borderBottom: '1px solid var(--hon-edge)' }}>
            Start with the collection
          </Link>
          .
        </p>
      ) : (
        <>
          <section
            style={{
              display: 'flex',
              gap: 'var(--hon-space-6)',
              flexWrap: 'wrap',
              borderBlock: '1px solid var(--hon-edge)',
              paddingBlock: 'var(--hon-space-5)',
            }}
          >
            <Stat value={taste.works} label={taste.works === 1 ? 'work' : 'works'} />
            <Stat value={taste.artists} label={taste.artists === 1 ? 'artist' : 'artists'} />
            {taste.movingImage > 0 ? <Stat value={taste.movingImage} label="moving image" /> : null}
            {taste.unique > 0 ? <Stat value={taste.unique} label="unique works" /> : null}
            {taste.editions > 0 ? <Stat value={taste.editions} label="editions" /> : null}
          </section>

          {taste.leanings.length > 0 ? (
            <p className="hon-prose hon-measure">
              So far this leans toward {taste.leanings.join(', ')}.
            </p>
          ) : null}

          <ul
            style={{
              display: 'grid',
              gap: 'var(--hon-space-7) var(--hon-space-5)',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(16rem, 100%), 1fr))',
            }}
          >
            {works.map((artwork) => (
              <li key={artwork.slug}>
                <ArtworkPlate artwork={artwork} artist={artistBySlug.get(artwork.artistSlug) ?? null} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'grid', gap: '0.15rem' }}>
      <span className="hon-display" style={{ fontSize: '2rem' }}>
        {value}
      </span>
      <span className="hon-label">{label}</span>
    </div>
  );
}
