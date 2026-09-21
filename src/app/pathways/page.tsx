import type { Metadata } from 'next';
import Link from 'next/link';
import { getRepository } from '@/data';

export const metadata: Metadata = {
  title: 'Pathways',
  description: 'Curated routes through the House of Nucci Collection.',
};

export default function PathwaysPage() {
  const pathways = getRepository().listPathways();

  return (
    <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-8)', display: 'grid', gap: 'var(--hon-space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--hon-space-4)' }}>
        <p className="hon-eyebrow">Nucci Pathways</p>
        <h1 className="hon-display">Pathways</h1>
        <p className="hon-prose hon-measure">
          Routes through the collection, each built around an idea rather than a category.
        </p>
      </header>
      <ul style={{ display: 'grid' }}>
        {pathways.map((pathway) => (
          <li key={pathway.slug} style={{ borderTop: '1px solid var(--hon-edge)' }}>
            <Link href={`/pathway/${pathway.slug}`} style={{ display: 'grid', gap: 'var(--hon-space-2)', paddingBlock: 'var(--hon-space-5)' }}>
              <span className="hon-title">{pathway.title}</span>
              <span className="hon-label">
                {pathway.stops.length} stops
                {pathway.estimatedMinutes ? ` · about ${pathway.estimatedMinutes} minutes` : ''}
                {pathway.forNewVisitors ? ' · For a first visit' : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
