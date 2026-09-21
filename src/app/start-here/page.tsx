import type { Metadata } from 'next';
import Link from 'next/link';
import { ArtworkPlate } from '@/components/artwork/ArtworkPlate';
import { getRepository } from '@/data';
import type { Artwork } from '@/domain';

export const metadata: Metadata = {
  title: 'Start Here',
  description:
    'New to digital art? Six ideas, each taught through a work in the House of Nucci Collection.',
};

/**
 * START HERE (§31).
 *
 * Not a crypto explainer. Each idea is attached to a work that is actually in the House,
 * chosen from the record rather than hardcoded, so this page stays correct as the
 * collection changes. If the House holds nothing that demonstrates an idea, the idea is
 * simply not shown — it is never illustrated with a work the House does not own (§06).
 */
export default function StartHerePage() {
  const repo = getRepository();
  const artworks = repo.listArtworks();

  const first = (predicate: (artwork: Artwork) => boolean): Artwork | null =>
    artworks.find(predicate) ?? null;

  const lessons = [
    {
      question: 'What is digital art?',
      body: 'Work made to be seen on a screen, where the file is the object. It has a maker, a date, a medium and a history, like anything else in a collection.',
      work: artworks[0] ?? null,
    },
    {
      question: 'What is a 1/1?',
      body: 'A unique work: one of it, and no authorised copies. The same idea as a painting, applied to a file.',
      work: first((artwork) => artwork.artworkType === 'unique'),
    },
    {
      question: 'What is an edition?',
      body: 'The same work, released in a fixed number. Each holder has a numbered example — the way a print run has always worked.',
      work: first((artwork) => artwork.artworkType === 'edition' || artwork.artworkType === 'open-edition'),
    },
    {
      question: 'Why does a work move?',
      body: 'Duration is part of the work. A loop has a pace, a beginning it returns to, and a length the artist chose.',
      work: first((artwork) => artwork.mediaType === 'animated' || artwork.mediaType === 'video'),
    },
    {
      question: 'Why must a pixel stay a pixel?',
      body: 'In pixel work, every square is a decision. Smoothing it to fit a screen replaces the artist’s choices with the software’s.',
      work: first((artwork) => artwork.mediaType === 'pixel'),
    },
    {
      question: 'Why does provenance matter?',
      body: 'Knowing who made a work, when, and where it has been is what separates a picture from an object with a history. Every record here says how much of that is documented, and how much is not.',
      work: first((artwork) => artwork.provenance.length >= 2),
    },
  ].filter((lesson): lesson is typeof lesson & { work: Artwork } => lesson.work !== null);

  const newVisitorPathways = repo.listPathways().filter((pathway) => pathway.forNewVisitors);

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-9)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <p className="hon-eyebrow">New to digital art?</p>
        <h1 className="hon-display">Start here</h1>
        <p className="hon-prose hon-measure">
          You do not need to know anything about wallets, chains or marketplaces to look
          at this work. Six questions, each answered by something hanging in the House.
        </p>
      </header>

      <ol style={{ display: 'grid', gap: 'var(--hon-space-9)' }}>
        {lessons.map((lesson, position) => (
          <li
            key={lesson.question}
            style={{
              display: 'grid',
              gap: 'var(--hon-space-6)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(18rem, 100%), 1fr))',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'grid', gap: 'var(--hon-space-3)' }}>
              <span className="hon-label">{String(position + 1).padStart(2, '0')}</span>
              <h2 className="hon-title">{lesson.question}</h2>
              <p className="hon-prose">{lesson.body}</p>
              <Link href={`/artwork/${lesson.work.slug}`} className="hon-action" style={{ justifySelf: 'start' }}>
                See it in the House
              </Link>
            </div>
            <ArtworkPlate artwork={lesson.work} artist={repo.getArtist(lesson.work.artistSlug)} />
          </li>
        ))}
      </ol>

      {newVisitorPathways.length > 0 ? (
        <section style={{ borderTop: '1px solid var(--hon-edge)', paddingTop: 'var(--hon-space-6)', display: 'grid', gap: 'var(--hon-space-4)' }}>
          <h2 className="hon-title">Then take a route</h2>
          <ul style={{ display: 'grid', gap: 'var(--hon-space-3)' }}>
            {newVisitorPathways.map((pathway) => (
              <li key={pathway.slug}>
                <Link href={`/pathway/${pathway.slug}`} className="hon-action">
                  {pathway.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
