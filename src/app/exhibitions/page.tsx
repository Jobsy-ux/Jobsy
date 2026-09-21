import type { Metadata } from 'next';
import Link from 'next/link';
import { getRepository } from '@/data';

export const metadata: Metadata = {
  title: 'Exhibitions',
  description: 'Exhibitions drawn from the House of Nucci Collection.',
};

export default function ExhibitionsPage() {
  const exhibitions = getRepository().listExhibitions();

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <p className="hon-eyebrow">Programme</p>
        <h1 className="hon-display">Exhibitions</h1>
        <p className="hon-prose hon-measure">
          Arrangements of the collection, each with its own argument and its own order.
        </p>
      </header>
      <ul style={{ display: 'grid' }}>
        {exhibitions.map((exhibition) => (
          <li key={exhibition.slug} style={{ borderTop: '1px solid var(--hon-edge)' }}>
            <Link href={`/exhibition/${exhibition.slug}`} style={{ display: 'grid', gap: 'var(--hon-space-2)', paddingBlock: 'var(--hon-space-5)' }}>
              <span className="hon-title">{exhibition.title}</span>
              {exhibition.subtitle ? <span className="hon-label">{exhibition.subtitle}</span> : null}
              <span className="hon-prose hon-measure" style={{ fontSize: 'var(--hon-size-small)' }}>
                {exhibition.curatorialStatement.slice(0, 180)}…
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
