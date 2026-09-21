import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MuseumLoader } from './MuseumLoader';
import { getRepository } from '@/data';

export const metadata: Metadata = {
  title: 'The Museum',
  description:
    'Walk through the House of Nucci: an entry, a great room and a black box, hung with works from the collection.',
  /* The museum is an interface to the institution, not its indexable content (§55). */
  robots: { index: false, follow: true },
};

/**
 * The museum route. Three.js is loaded only here and only in the browser, so no page
 * that a search engine or a text reader cares about ever carries it (§55, §58).
 */
export default function MuseumPage() {
  const repo = getRepository();

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
          <p className="hon-label">Opening the House</p>
        </div>
      }
    >
      <MuseumLoader
        rooms={repo.listRooms()}
        artworks={repo.listArtworks()}
        pathways={repo.listPathways()}
      />
    </Suspense>
  );
}
