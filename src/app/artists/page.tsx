import type { Metadata } from 'next';
import Link from 'next/link';
import { getRepository } from '@/data';

export const metadata: Metadata = {
  title: 'Artists',
  description: 'The artists represented in the House of Nucci Collection.',
};

export default function ArtistsPage() {
  const repo = getRepository();
  const artists = repo.listArtists();

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <p className="hon-eyebrow">The House of Nucci Collection</p>
        <h1 className="hon-display">Artists</h1>
        <p className="hon-prose hon-measure">
          Every artist with work in the House. Each has a record of what the House holds
          and where their wider practice can be found.
        </p>
      </header>
      <ul style={{ display: 'grid' }}>
        {artists.map((artist) => {
          const works = repo.listArtworksByArtist(artist.slug);
          return (
            <li key={artist.slug} style={{ borderTop: '1px solid var(--hon-edge)' }}>
              <Link
                href={`/artist/${artist.slug}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 'var(--hon-space-5)',
                  paddingBlock: 'var(--hon-space-5)',
                  flexWrap: 'wrap',
                }}
              >
                <span className="hon-title">{artist.name}</span>
                <span className="hon-label">
                  {works.length} {works.length === 1 ? 'work' : 'works'} in the House
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
