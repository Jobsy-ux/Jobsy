import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArtworkMedia } from '@/components/artwork/ArtworkMedia';
import { ProvenanceTimeline } from '@/components/artwork/ProvenanceTimeline';
import { RecordDetails } from '@/components/artwork/RecordDetails';
import { SaveToMyHouse } from '@/components/artwork/SaveToMyHouse';
import { DemoMarker } from '@/components/primitives/DemoMarker';
import { ExternalLink } from '@/components/primitives/ExternalLink';
import { getRepository } from '@/data';
import { displayTitle, externalPracticeLinks, isLinkPresentable, ownedWorkLinks } from '@/domain';

export function generateStaticParams() {
  return getRepository()
    .listArtworks()
    .map((artwork) => ({ slug: artwork.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = getRepository().getArtwork(slug);
  if (!artwork) return { title: 'Not found' };
  const artist = getRepository().getArtist(artwork.artistSlug);

  return {
    title: `${displayTitle(artwork)} — ${artist?.name ?? 'Unattributed'}`,
    description: artwork.description ?? `${artwork.medium}. In the House of Nucci Collection.`,
    alternates: { canonical: `/artwork/${artwork.slug}` },
    /* Demo records are never indexed and never given a social card (§91). */
    robots: artwork.isPlaceholder ? { index: false, follow: false } : undefined,
  };
}

/**
 * The Artwork Passport (§21, §27).
 *
 * The work dominates. Then who made it and what it is. Then the House's own reading,
 * marked as the House's. Then provenance. Then, last and plainly, the external
 * destinations — which are a handoff, not a shop (§22).
 */
export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = getRepository();
  const artwork = repo.getArtwork(slug);
  if (!artwork) notFound();

  const artist = repo.getArtist(artwork.artistSlug);
  const series = artwork.seriesSlug ? repo.getSeries(artwork.seriesSlug) : null;
  const placement = repo.findPlacement(artwork.slug);
  const owned = ownedWorkLinks(artwork.links).filter(isLinkPresentable);
  const practice = externalPracticeLinks(artwork.links).filter(isLinkPresentable);
  const related = artwork.relationships
    .map((relation) => ({ relation, artwork: repo.getArtwork(relation.artworkSlug) }))
    .filter((entry): entry is { relation: typeof entry.relation; artwork: NonNullable<typeof entry.artwork> } =>
      entry.artwork !== null,
    );

  return (
    <article style={{ paddingBlock: 'var(--hon-space-7)' }}>
      <div className="hon-shell" style={{ display: 'grid', gap: 'var(--hon-space-7)' }}>
        {/* The work, as large as the viewport sensibly allows. */}
        <ArtworkMedia artwork={artwork} mode="wall" priority />

        <header
          style={{
            display: 'grid',
            gap: 'var(--hon-space-4)',
            gridTemplateColumns: 'minmax(0, 1fr)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--hon-space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="hon-label">In the House</span>
            {artwork.isPlaceholder ? <DemoMarker /> : null}
          </div>
          <h1 className="hon-display">{displayTitle(artwork)}</h1>
          <p className="hon-title" style={{ fontSize: 'var(--hon-size-heading)' }}>
            {artist ? (
              <Link href={`/artist/${artist.slug}`} style={{ borderBottom: '1px solid var(--hon-edge)' }}>
                {artist.name}
              </Link>
            ) : (
              'Unattributed'
            )}
            {artwork.year ? <span className="hon-quiet"> · {artwork.year}</span> : null}
          </p>
          <p className="hon-label">
            {artwork.medium}
            {artwork.editionLabel ? ` · Edition ${artwork.editionLabel}` : ''}
            {series ? ' · ' : ''}
            {series ? (
              <Link href={`/series/${series.slug}`} style={{ textDecoration: 'underline' }}>
                {series.title}
              </Link>
            ) : null}
          </p>

          <div style={{ display: 'flex', gap: 'var(--hon-space-5)', flexWrap: 'wrap', marginTop: 'var(--hon-space-2)' }}>
            <SaveToMyHouse slug={artwork.slug} title={artwork.title} />
            {placement ? (
              <Link href={`/museum?room=${placement.room.slug}&work=${artwork.slug}`} className="hon-action">
                View in the museum
              </Link>
            ) : null}
            {artist ? (
              <Link href={`/artist/${artist.slug}`} className="hon-action">
                About the artist
              </Link>
            ) : null}
          </div>
        </header>

        <div
          style={{
            display: 'grid',
            gap: 'var(--hon-space-8)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(22rem, 100%), 1fr))',
            alignItems: 'start',
          }}
        >
          <section style={{ display: 'grid', gap: 'var(--hon-space-5)' }}>
            {artwork.description ? (
              <div>
                <h2 className="hon-label">About this work</h2>
                <p className="hon-prose" style={{ marginTop: 'var(--hon-space-3)' }}>
                  {artwork.description}
                </p>
              </div>
            ) : null}

            {artwork.notes.map((note, position) => (
              <div key={`${note.kind}-${position}`}>
                {/* The House's reading is always attributed, never presented as fact (§38). */}
                <h2 className="hon-label">
                  {note.kind === 'collector-note'
                    ? 'Collector’s note'
                    : note.kind === 'historical-context'
                      ? 'Historical context'
                      : 'Curatorial note'}
                  <span className="hon-quiet"> — {note.author}</span>
                </h2>
                <p className="hon-prose" style={{ marginTop: 'var(--hon-space-3)' }}>
                  {note.body}
                </p>
              </div>
            ))}

            <div>
              <h2 className="hon-label">Provenance</h2>
              <div style={{ marginTop: 'var(--hon-space-4)' }}>
                <ProvenanceTimeline artwork={artwork} />
              </div>
            </div>
          </section>

          <section style={{ display: 'grid', gap: 'var(--hon-space-5)' }}>
            <div>
              <h2 className="hon-label">Provenance + details</h2>
              <div style={{ marginTop: 'var(--hon-space-3)' }}>
                <RecordDetails artwork={artwork} />
              </div>
            </div>

            {owned.length > 0 ? (
              <div>
                <h2 className="hon-label">This work elsewhere</h2>
                <p className="hon-prose" style={{ fontSize: 'var(--hon-size-small)', marginTop: 'var(--hon-space-2)' }}>
                  Held in the House of Nucci Collection. These links lead to the same work
                  on external platforms.
                </p>
                <ul style={{ display: 'grid', gap: 'var(--hon-space-2)', marginTop: 'var(--hon-space-3)' }}>
                  {owned.map((link) => (
                    <li key={link.url}>
                      <ExternalLink href={link.url} platform={link.platform} artworkSlug={artwork.slug} showHost>
                        {link.label}
                      </ExternalLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Hard separation: anything below is not owned by the House (§06, §26). */}
            {practice.length > 0 ? (
              <div style={{ borderTop: '1px solid var(--hon-edge-strong)', paddingTop: 'var(--hon-space-4)' }}>
                <h2 className="hon-label">Explore the artist</h2>
                <p className="hon-prose" style={{ fontSize: 'var(--hon-size-small)', marginTop: 'var(--hon-space-2)' }}>
                  Elsewhere in this artist’s practice. Not part of the House of Nucci
                  Collection.
                </p>
                <ul style={{ display: 'grid', gap: 'var(--hon-space-2)', marginTop: 'var(--hon-space-3)' }}>
                  {practice.map((link) => (
                    <li key={link.url}>
                      <ExternalLink href={link.url} platform={link.platform} artworkSlug={artwork.slug} showHost>
                        {link.label}
                      </ExternalLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>

        {related.length > 0 ? (
          <section style={{ borderTop: '1px solid var(--hon-edge)', paddingTop: 'var(--hon-space-6)' }}>
            <h2 className="hon-label">Related in the House</h2>
            <ul
              style={{
                marginTop: 'var(--hon-space-4)',
                display: 'grid',
                gap: 'var(--hon-space-5)',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(18rem, 100%), 1fr))',
              }}
            >
              {related.map(({ relation, artwork: relatedWork }) => (
                <li key={relation.artworkSlug}>
                  <Link href={`/artwork/${relatedWork.slug}`} style={{ display: 'grid', gap: 'var(--hon-space-2)' }}>
                    <span className="hon-title" style={{ fontSize: '1.05rem' }}>
                      {displayTitle(relatedWork)}
                    </span>
                    {/* Every recommendation says why it is here (§35). */}
                    <span className="hon-label">Related by {relation.kind}</span>
                    <span className="hon-prose" style={{ fontSize: 'var(--hon-size-small)' }}>
                      {relation.reason}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
