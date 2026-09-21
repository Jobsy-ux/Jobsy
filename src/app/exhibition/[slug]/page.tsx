import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArtworkPlate } from '@/components/artwork/ArtworkPlate';
import { getRepository } from '@/data';
import { absoluteUrl, routes, SITE_NAME } from '@/lib/site';

export function generateStaticParams() {
  return getRepository()
    .listExhibitions()
    .map((exhibition) => ({ slug: exhibition.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = getRepository().getExhibition(slug);
  if (!exhibition) return { title: 'Not found' };
  const description = exhibition.subtitle ?? exhibition.curatorialStatement.slice(0, 180);

  return {
    title: exhibition.title,
    description,
    alternates: { canonical: absoluteUrl(routes.exhibition(exhibition.slug)) },
    openGraph: {
      title: `${exhibition.title} · ${SITE_NAME}`,
      description,
      url: absoluteUrl(routes.exhibition(exhibition.slug)),
      siteName: SITE_NAME,
      type: 'article',
      images: exhibition.coverImageUrl ? [{ url: exhibition.coverImageUrl }] : undefined,
    },
  };
}

/** An exhibition is an argument with an order, not a filter (§50). */
export default async function ExhibitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = getRepository();
  const exhibition = repo.getExhibition(slug);
  if (!exhibition) notFound();

  const works = exhibition.artworkSlugs
    .map((artworkSlug) => repo.getArtwork(artworkSlug))
    .filter((artwork): artwork is NonNullable<typeof artwork> => artwork !== null);
  const rooms = exhibition.roomSlugs
    .map((roomSlug) => repo.getRoom(roomSlug))
    .filter((room): room is NonNullable<typeof room> => room !== null);

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <p className="hon-eyebrow">Exhibition</p>
        <h1 className="hon-display">{exhibition.title}</h1>
        {exhibition.subtitle ? <p className="hon-title" style={{ fontSize: 'var(--hon-size-heading)' }}>{exhibition.subtitle}</p> : null}
        <p className="hon-prose hon-measure">{exhibition.curatorialStatement}</p>
        {rooms.length > 0 ? (
          <p className="hon-label">
            In {rooms.map((room) => room.name).join(' and ')} ·{' '}
            <Link href={`/museum?room=${rooms[0]?.slug ?? ''}`} style={{ textDecoration: 'underline' }}>
              Walk the exhibition
            </Link>
          </p>
        ) : null}
      </header>

      <ol
        style={{
          display: 'grid',
          gap: 'var(--hon-space-7) var(--hon-space-5)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(16rem, 100%), 1fr))',
        }}
      >
        {works.map((artwork, position) => (
          <li key={artwork.slug}>
            <ArtworkPlate artwork={artwork} artist={repo.getArtist(artwork.artistSlug)} priority={position < 3} />
          </li>
        ))}
      </ol>
    </div>
  );
}
