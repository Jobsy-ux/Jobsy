import Link from 'next/link';
import { DemoNotice } from '@/components/primitives/DemoMarker';
import { getRepository } from '@/data';
import { displayAsset } from '@/domain';

/**
 * The entrance (§09).
 *
 * Two doors of equal weight, one quiet third way in for a visitor who is new to this,
 * and a single work held at architectural scale. No statistics, no wallet, no carousel,
 * no forced animation.
 */
export default function HomePage() {
  const repo = getRepository();
  const collection = repo.getCollection();
  const artworks = repo.listArtworks();
  const isDemo = repo.hasPlaceholders();

  /* The opening work is a curatorial choice, expressed as data (featured + priority). */
  const opening = artworks.find((artwork) => artwork.featured) ?? artworks[0] ?? null;
  const openingAsset = opening ? displayAsset(opening) : null;
  const artists = repo.listArtists();

  return (
    <>
      <section
        className="hon-shell"
        style={{
          minHeight: 'min(86vh, 54rem)',
          display: 'grid',
          alignContent: 'center',
          gap: 'var(--hon-space-8)',
          paddingBlock: 'var(--hon-space-9)',
        }}
      >
        <div style={{ display: 'grid', gap: 'var(--hon-space-5)' }}>
          <h1 style={{ display: 'grid', gap: 'var(--hon-space-3)' }}>
            <span className="hon-monument">House of Nucci</span>
            <span
              className="hon-eyebrow"
              style={{ color: 'var(--hon-bone-dim)', letterSpacing: '0.34em' }}
            >
              The Collection
            </span>
          </h1>
          <p className="hon-prose hon-measure">
            A private collection of digital art, kept as an institution keeps things: with
            a room to see it in, a record of where each work came from, and an account of
            the people who made it.
          </p>
        </div>

        <nav
          aria-label="Ways in"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--hon-space-4)' }}
        >
          <Link href="/museum" className="hon-door">
            Enter the Museum
            <span className="hon-door__mark" aria-hidden="true">→</span>
          </Link>
          <Link href="/collection" className="hon-door">
            Explore the Collection
            <span className="hon-door__mark" aria-hidden="true">→</span>
          </Link>
        </nav>

        <div style={{ display: 'flex', gap: 'var(--hon-space-5)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/start-here" className="hon-action">
            New to digital art? Start here
          </Link>
          <span className="hon-label" style={{ color: 'var(--hon-faint)' }}>
            {artworks.length} works · {artists.length} artists
          </span>
        </div>

        {isDemo ? <div className="hon-measure"><DemoNotice /></div> : null}
      </section>

      {opening && openingAsset ? (
        <section aria-label="Currently in the Great Room" style={{ paddingBottom: 'var(--hon-space-9)' }}>
          <div className="hon-shell">
            <hr className="hon-rule" />
          </div>
          <div
            className="hon-shell"
            style={{
              paddingTop: 'var(--hon-space-7)',
              display: 'grid',
              gap: 'var(--hon-space-6)',
              gridTemplateColumns: 'minmax(0, 1fr)',
            }}
          >
            <Link href={`/artwork/${opening.slug}`} className="hon-artwork-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={openingAsset.url}
                alt={`${opening.title} — ${opening.medium}`}
                width={openingAsset.width ?? undefined}
                height={openingAsset.height ?? undefined}
                fetchPriority="high"
                className={opening.mediaType === 'pixel' ? 'hon-pixel-media' : undefined}
                style={{ width: '100%', height: 'auto' }}
              />
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--hon-space-5)', flexWrap: 'wrap' }}>
              <div>
                <p className="hon-title">{opening.displayTitle ?? opening.title}</p>
                <p className="hon-label" style={{ marginTop: 'var(--hon-space-2)' }}>
                  {repo.getArtist(opening.artistSlug)?.name ?? 'Unattributed'}
                  {opening.year ? ` · ${opening.year}` : ''} · {collection.formalName}
                </p>
              </div>
              <Link href={`/artwork/${opening.slug}`} className="hon-action">
                View the record
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
