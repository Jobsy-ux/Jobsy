import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArtworkPlate } from '@/components/artwork/ArtworkPlate';
import { DemoMarker } from '@/components/primitives/DemoMarker';
import { ExternalLink } from '@/components/primitives/ExternalLink';
import { getRepository } from '@/data';
import { absoluteUrl, routes, SITE_NAME } from '@/lib/site';

export function generateStaticParams() {
  return getRepository()
    .listArtists()
    .map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artist = getRepository().getArtist(slug);
  if (!artist) return { title: 'Not found' };
  const description = artist.overview ?? `${artist.name} in the House of Nucci Collection.`;

  return {
    title: artist.name,
    description,
    alternates: { canonical: absoluteUrl(routes.artist(artist.slug)) },
    openGraph: {
      title: `${artist.name} · ${SITE_NAME}`,
      description,
      url: absoluteUrl(routes.artist(artist.slug)),
      siteName: SITE_NAME,
      type: 'profile',
    },
    twitter: { card: 'summary_large_image', title: artist.name, description },
    robots: artist.isPlaceholder ? { index: false, follow: false } : undefined,
  };
}

/**
 * The Artist Passport (§25–26).
 *
 * Two zones, separated by an unmistakable break: IN THE HOUSE, which is what the House
 * owns, and EXPLORE THE ARTIST, which is everything else. Prose fields render only when
 * they have been sourced — an empty passport is honest, an invented one is not (§104).
 */
export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = getRepository();
  const artist = repo.getArtist(slug);
  if (!artist) notFound();

  const works = repo.listArtworksByArtist(artist.slug);
  const collector = repo.getCollector();
  const series = repo.listSeriesByArtist(artist.slug);
  const hasProse = Boolean(artist.biography || artist.artistStatement || artist.process);

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-8)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--hon-space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
          <p className="hon-eyebrow">Artist</p>
          {artist.isPlaceholder ? <DemoMarker /> : null}
        </div>
        <h1 className="hon-display">{artist.name}</h1>
        {artist.overview ? <p className="hon-prose hon-measure">{artist.overview}</p> : null}
        <p className="hon-label">
          {works.length} {works.length === 1 ? 'work' : 'works'} in the House
          {series.length > 0 ? ` · ${series.length} ${series.length === 1 ? 'series' : 'series'} represented` : ''}
          {artist.verification === 'verified' ? ' · Verified artist' : ''}
        </p>
      </header>

      {artist.whyInTheHouse ? (
        /* Why this artist is collected — the collector speaking, clearly attributed. */
        <section
          className="hon-measure"
          style={{ borderLeft: '1px solid var(--hon-brass-dim)', paddingLeft: 'var(--hon-space-5)' }}
        >
          <h2 className="hon-label" style={{ color: 'var(--hon-brass)' }}>
            Why they’re in the House
            <span className="hon-quiet"> — {collector.name}</span>
          </h2>
          <p className="hon-prose" style={{ marginTop: 'var(--hon-space-3)', color: 'var(--hon-bone)' }}>
            {artist.whyInTheHouse}
          </p>
        </section>
      ) : null}

      {/* ------------------------------------------------- IN THE HOUSE */}
      <section style={{ display: 'grid', gap: 'var(--hon-space-5)' }}>
        <div>
          <h2 className="hon-title">In the House</h2>
          <p className="hon-prose" style={{ fontSize: 'var(--hon-size-small)', marginTop: 'var(--hon-space-2)' }}>
            Works by {artist.name} held in the House of Nucci Collection.
          </p>
        </div>
        {works.length === 0 ? (
          <p className="hon-prose">No works by this artist are currently in the House.</p>
        ) : (
          <ul
            style={{
              display: 'grid',
              gap: 'var(--hon-space-7) var(--hon-space-5)',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(16rem, 100%), 1fr))',
            }}
          >
            {works.map((artwork, position) => (
              <li key={artwork.slug}>
                <ArtworkPlate artwork={artwork} artist={artist} priority={position < 3} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {series.length > 0 ? (
        <section style={{ display: 'grid', gap: 'var(--hon-space-3)' }}>
          <h2 className="hon-label">Series represented</h2>
          <ul style={{ display: 'flex', gap: 'var(--hon-space-4)', flexWrap: 'wrap' }}>
            {series.map((entry) => (
              <li key={entry.slug}>
                <Link href={`/series/${entry.slug}`} className="hon-action">
                  {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasProse ? (
        <section style={{ display: 'grid', gap: 'var(--hon-space-6)' }} className="hon-measure">
          {artist.biography ? (
            <div>
              <h2 className="hon-label">Biography</h2>
              <p className="hon-prose" style={{ marginTop: 'var(--hon-space-3)' }}>{artist.biography}</p>
            </div>
          ) : null}
          {artist.artistStatement ? (
            <div>
              <h2 className="hon-label">Artist statement</h2>
              <p className="hon-prose" style={{ marginTop: 'var(--hon-space-3)' }}>{artist.artistStatement}</p>
            </div>
          ) : null}
          {artist.process ? (
            <div>
              <h2 className="hon-label">Process</h2>
              <p className="hon-prose" style={{ marginTop: 'var(--hon-space-3)' }}>{artist.process}</p>
            </div>
          ) : null}
          {artist.sources.length > 0 ? (
            <div>
              <h2 className="hon-label">Sources</h2>
              <ul style={{ display: 'grid', gap: 'var(--hon-space-2)', marginTop: 'var(--hon-space-3)' }}>
                {artist.sources.map((source) => (
                  <li key={source.url}>
                    <ExternalLink href={source.url} platform="artist-source" showHost>
                      {source.label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <p className="hon-prose hon-measure">
          The House has not yet published sourced biographical material for this artist.
          Nothing is written here that has not come from the artist or from a documented
          source.
        </p>
      )}

      {/* ------------------------------------- EXPLORE THE ARTIST (not owned) */}
      <section
        style={{
          borderTop: '1px solid var(--hon-edge-strong)',
          paddingTop: 'var(--hon-space-6)',
          display: 'grid',
          gap: 'var(--hon-space-4)',
        }}
      >
        <div>
          <h2 className="hon-title">Explore the artist</h2>
          <p className="hon-prose" style={{ fontSize: 'var(--hon-size-small)', marginTop: 'var(--hon-space-2)' }}>
            Beyond the House. Everything below belongs to the artist’s wider practice and
            is <strong>not</strong> part of the House of Nucci Collection.
          </p>
        </div>
        {artist.links.length === 0 && artist.press.length === 0 && artist.talks.length === 0 ? (
          <p className="hon-prose">No verified external links have been recorded yet.</p>
        ) : (
          <ul style={{ display: 'grid', gap: 'var(--hon-space-2)' }}>
            {artist.links.map((link) => (
              <li key={link.url}>
                <ExternalLink href={link.url} platform={link.platform} showHost>
                  {link.label}
                </ExternalLink>
              </li>
            ))}
            {artist.press.map((item) => (
              <li key={item.url}>
                <ExternalLink href={item.url} platform="press" showHost>
                  {item.label}
                </ExternalLink>
              </li>
            ))}
            {artist.talks.map((item) => (
              <li key={item.url}>
                <ExternalLink href={item.url} platform="interview" showHost>
                  {item.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
