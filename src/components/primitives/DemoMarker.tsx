/**
 * Marks a demo record wherever it appears (§91, §104).
 *
 * Placeholder records exist only so the institution could be built before the collection
 * was supplied. Nothing carrying this marker is a work the House of Nucci Collection
 * holds, and the marker is never suppressed for aesthetic reasons.
 */
export function DemoMarker({ detail }: { detail?: string }) {
  return (
    <span className="hon-demo-marker" role="note">
      <span aria-hidden="true">◇</span>
      Demo record{detail ? ` — ${detail}` : ''}
      <span className="hon-visually-hidden">
        . This is a placeholder used to build the site. It is not a work in the House of
        Nucci Collection.
      </span>
    </span>
  );
}

/** Page-level notice, used where a whole view is populated by demo records. */
export function DemoNotice() {
  return (
    <aside
      style={{
        border: '1px solid var(--hon-demo)',
        padding: 'var(--hon-space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--hon-space-2)',
      }}
    >
      <span className="hon-label" style={{ color: 'var(--hon-demo)' }}>
        Demo build
      </span>
      <p className="hon-prose" style={{ fontSize: 'var(--hon-size-small)' }}>
        The works shown here are placeholder records with generated abstract media. They
        are not part of the House of Nucci Collection, and no artist, provenance or
        ownership represented here is real. They exist so the institution could be
        designed and reviewed before the collection was supplied.
      </p>
    </aside>
  );
}
