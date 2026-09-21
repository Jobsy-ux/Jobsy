import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArtworkPlate } from '@/components/artwork/ArtworkPlate';
import { ExternalLink } from '@/components/primitives/ExternalLink';
import { getRepository } from '@/data';

export function generateStaticParams() {
  return getRepository()
    .listSeries()
    .map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const series = getRepository().getSeries(slug);
  if (!series) return { title: 'Not found' };
  return {
    title: series.title,
    description: series.description ?? `${series.title} in the House of Nucci Collection.`,
    alternates: { canonical: `/series/${series.slug}` },
    robots: series.isPlaceholder ? { index: false, follow: false } : undefined,
  };
}

/**
 * A series page shows only the part of the series the House holds (§06). Where the rest
 * of the series lives is an external link, clearly labelled as not owned.
 */
export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = getRepository();
  const series = repo.getSeries(slug);
  if (!series) notFound();

  const artist = repo.getArtist(series.artistSlug);
  const works = repo.listArtworksBySeries(series.slug);

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <p className="hon-eyebrow">Series</p>
        <h1 className="hon-display">{series.title}</h1>
        {artist ? (
          <p className="hon-title" style={{ fontSize: 'var(--hon-size-heading)' }}>
            <Link href={`/artist/${artist.slug}`} style={{ borderBottom: '1px solid var(--hon-edge)' }}>
              {artist.name}
            </Link>
            {series.year ? <span className="hon-quiet"> · {series.year}</span> : null}
          </p>
        ) : null}
        {series.description ? <p className="hon-prose hon-measure">{series.description}</p> : null}
        <p className="hon-label">
          {works.length} {works.length === 1 ? 'work' : 'works'} from this series in the House
        </p>
      </header>

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

      {series.externalUrl ? (
        <section style={{ borderTop: '1px solid var(--hon-edge-strong)', paddingTop: 'var(--hon-space-5)' }}>
          <h2 className="hon-label">The wider series</h2>
          <p className="hon-prose" style={{ fontSize: 'var(--hon-size-small)', marginBlock: 'var(--hon-space-2)' }}>
            The full series, including works the House does not hold.
          </p>
          <ExternalLink href={series.externalUrl} platform="artist-site" showHost>
            View the series
          </ExternalLink>
        </section>
      ) : null}
    </div>
  );
}
