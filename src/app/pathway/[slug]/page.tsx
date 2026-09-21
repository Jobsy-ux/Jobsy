import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArtworkMedia } from '@/components/artwork/ArtworkMedia';
import { getRepository } from '@/data';
import { displayTitle } from '@/domain';
import { absoluteUrl, routes, SITE_NAME } from '@/lib/site';

export function generateStaticParams() {
  return getRepository()
    .listPathways()
    .map((pathway) => ({ slug: pathway.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pathway = getRepository().getPathway(slug);
  if (!pathway) return { title: 'Not found' };
  const description = pathway.subtitle ?? pathway.introduction.slice(0, 180);

  return {
    title: pathway.title,
    description,
    alternates: { canonical: absoluteUrl(routes.pathway(pathway.slug)) },
    openGraph: {
      title: `${pathway.title} · ${SITE_NAME}`,
      description,
      url: absoluteUrl(routes.pathway(pathway.slug)),
      siteName: SITE_NAME,
      type: 'article',
    },
  };
}

/**
 * A Nucci Pathway (§32): an essay, then an ordered set of stops, each with the reason it
 * is here. Reading it is a complete experience; walking it in the museum is optional.
 */
export default async function PathwayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = getRepository();
  const pathway = repo.getPathway(slug);
  if (!pathway) notFound();

  const stops = pathway.stops
    .map((stop) => ({ stop, artwork: repo.getArtwork(stop.artworkSlug) }))
    .filter((entry): entry is { stop: typeof entry.stop; artwork: NonNullable<typeof entry.artwork> } =>
      entry.artwork !== null,
    );

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-8)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <p className="hon-eyebrow">Pathway</p>
        <h1 className="hon-display">{pathway.title}</h1>
        {pathway.subtitle ? <p className="hon-title" style={{ fontSize: 'var(--hon-size-heading)' }}>{pathway.subtitle}</p> : null}
        <p className="hon-prose hon-measure">{pathway.introduction}</p>
        <div style={{ display: 'flex', gap: 'var(--hon-space-5)', flexWrap: 'wrap' }}>
          <span className="hon-label">
            {stops.length} stops
            {pathway.estimatedMinutes ? ` · about ${pathway.estimatedMinutes} minutes` : ''}
          </span>
          {pathway.routeRoomSlugs.length > 0 ? (
            <Link href={`/museum?tour=${pathway.slug}`} className="hon-action">
              Take the tour in the museum
            </Link>
          ) : null}
        </div>
      </header>

      <ol style={{ display: 'grid', gap: 'var(--hon-space-9)' }}>
        {stops.map(({ stop, artwork }, position) => (
          <li key={artwork.slug} style={{ display: 'grid', gap: 'var(--hon-space-5)' }}>
            <div style={{ display: 'flex', gap: 'var(--hon-space-4)', alignItems: 'baseline' }}>
              <span className="hon-label">{String(position + 1).padStart(2, '0')}</span>
              <Link href={`/artwork/${artwork.slug}`} className="hon-title">
                {displayTitle(artwork)}
              </Link>
            </div>
            <div
              style={{
                display: 'grid',
                gap: 'var(--hon-space-6)',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(20rem, 100%), 1fr))',
                alignItems: 'center',
              }}
            >
              <ArtworkMedia artwork={artwork} mode="plate" />
              <p className="hon-prose">{stop.context}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
