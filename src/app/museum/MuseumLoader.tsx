'use client';

import dynamic from 'next/dynamic';
import type { Artwork, Pathway, Room } from '@/domain';

/**
 * The 3D bundle is code-split and client-only: it is fetched when someone chooses to
 * enter, never as part of arriving at the site (§58, §61).
 */
const MuseumExperience = dynamic(
  () => import('@/museum/MuseumExperience').then((module) => module.MuseumExperience),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        {/* The loading state belongs to the institution, not to a game engine (§61). */}
        <p className="hon-label">Opening the House</p>
      </div>
    ),
  },
);

export function MuseumLoader({
  rooms,
  artworks,
  pathways,
}: {
  rooms: Room[];
  artworks: Artwork[];
  pathways: Pathway[];
}) {
  return <MuseumExperience rooms={rooms} artworks={artworks} pathways={pathways} />;
}
