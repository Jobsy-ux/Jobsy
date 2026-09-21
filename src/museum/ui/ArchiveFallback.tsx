import Link from 'next/link';
import type { Artwork, Room } from '@/domain';

/**
 * What a visitor without WebGL gets (§59, §63, §85).
 *
 * Not an apology and not a dead end: the rooms, what hangs in each, and a way into every
 * record. The archive is a complete product; this is its doorway.
 */
export function ArchiveFallback({
  reason,
  artworks,
  rooms,
}: {
  reason: string;
  artworks: Artwork[];
  rooms: Room[];
}) {
  const bySlug = new Map(artworks.map((artwork) => [artwork.slug, artwork]));

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <p className="hon-eyebrow">The House, in plan</p>
        <h1 className="hon-display">The museum needs 3D graphics this browser cannot give it.</h1>
        <p className="hon-prose hon-measure">
          {reason}. Everything in the building is still here: the rooms below list what
          hangs in each, and every work has its full record.
        </p>
        <Link href="/collection" className="hon-door" style={{ justifySelf: 'start' }}>
          Explore the Collection
          <span className="hon-door__mark" aria-hidden="true">→</span>
        </Link>
      </header>

      {rooms.map((room) => (
        <section key={room.slug} style={{ display: 'grid', gap: 'var(--hon-space-3)' }}>
          <h2 className="hon-title">{room.name}</h2>
          {room.subtitle ? <p className="hon-label">{room.subtitle}</p> : null}
          <ul style={{ display: 'grid' }}>
            {room.walls.flatMap((wall) =>
              wall.placements.map((placement) => {
                const artwork = bySlug.get(placement.artworkSlug);
                if (!artwork) return null;
                return (
                  <li key={placement.id} style={{ borderTop: '1px solid var(--hon-edge-faint)' }}>
                    <Link
                      href={`/artwork/${artwork.slug}`}
                      style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--hon-space-4)', paddingBlock: 'var(--hon-space-3)', flexWrap: 'wrap' }}
                    >
                      <span>{artwork.displayTitle ?? artwork.title}</span>
                      <span className="hon-label">
                        {wall.label ? `${wall.label} wall` : 'On view'} · {artwork.medium}
                      </span>
                    </Link>
                  </li>
                );
              }),
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
