import { orderedProvenance, type Artwork } from '@/domain';
import { ExternalLink } from '@/components/primitives/ExternalLink';

const EVENT_LABELS: Record<string, string> = {
  created: 'Created',
  minted: 'Minted',
  exhibited: 'Exhibited',
  transferred: 'Transferred',
  'acquired-by-house': 'Entered House of Nucci',
  conserved: 'Conserved',
};

/**
 * Provenance as object biography (§28) — a vertical line of events, not a block-explorer
 * table. Nothing is invented to fill a gap: an undated or reported event says so, and a
 * work with no recorded history says that plainly.
 */
export function ProvenanceTimeline({ artwork }: { artwork: Artwork }) {
  const events = orderedProvenance(artwork);

  if (events.length === 0) {
    return (
      <p className="hon-prose">
        No provenance has been documented for this work yet. The House records history
        only where it can be sourced.
      </p>
    );
  }

  return (
    <ol style={{ display: 'grid', gap: 'var(--hon-space-5)' }}>
      {events.map((event) => (
        <li
          key={event.id}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(4.5rem, 6rem) 1fr',
            gap: 'var(--hon-space-5)',
            borderTop: '1px solid var(--hon-edge-faint)',
            paddingTop: 'var(--hon-space-4)',
          }}
        >
          <span className="hon-label" style={{ color: 'var(--hon-bone-dim)' }}>
            {event.date ? event.date.slice(0, 4) : 'Undated'}
          </span>
          <div style={{ display: 'grid', gap: 'var(--hon-space-2)' }}>
            <span style={{ fontSize: 'var(--hon-size-body)' }}>
              {EVENT_LABELS[event.type] ?? event.type}
              {event.actor ? <span className="hon-quiet"> · {event.actor}</span> : null}
            </span>
            {event.note ? (
              <p className="hon-prose" style={{ fontSize: 'var(--hon-size-small)' }}>
                {event.note}
              </p>
            ) : null}
            <span
              className="hon-label"
              style={{ color: event.certainty === 'documented' ? 'var(--hon-faint)' : 'var(--hon-warning)' }}
            >
              {event.certainty === 'documented' ? 'Documented' : `${event.certainty} — not independently documented`}
            </span>
            {event.sourceUrl ? (
              <ExternalLink href={event.sourceUrl} platform="provenance-source" artworkSlug={artwork.slug}>
                {event.sourceLabel ?? 'Source'}
              </ExternalLink>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
