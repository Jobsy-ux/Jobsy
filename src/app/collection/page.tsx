import type { Metadata } from 'next';
import { CollectionBrowser } from '@/components/collection/CollectionBrowser';
import { DemoNotice } from '@/components/primitives/DemoMarker';
import { getRepository } from '@/data';

export const metadata: Metadata = {
  title: 'The Collection',
  description:
    'Every work in the House of Nucci Collection, with its artist, series, year and record.',
};

/**
 * The archive (§18). Server-rendered in full so it is indexable and usable without
 * JavaScript; the browser layer adds instant search and filtering on top.
 */
export default function CollectionPage() {
  const repo = getRepository();
  const artworks = repo.listArtworks();

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)', marginBottom: 'var(--hon-space-7)' }}>
        <p className="hon-eyebrow">The House of Nucci Collection</p>
        <h1 className="hon-display">The Collection</h1>
        <p className="hon-prose hon-measure">
          Everything the House holds, in one place. Each work has a record: who made it,
          when, in what medium, and how it came to be here.
        </p>
        {repo.hasPlaceholders() ? (
          <div className="hon-measure">
            <DemoNotice />
          </div>
        ) : null}
      </header>

      <CollectionBrowser artworks={artworks} artists={repo.listArtists()} series={repo.listSeries()} />
    </div>
  );
}
