import Link from 'next/link';

/** No blank screens (§85): a wrong turn still lands somewhere in the building. */
export default function NotFound() {
  return (
    <div
      className="hon-shell"
      style={{ minHeight: '60vh', display: 'grid', alignContent: 'center', gap: 'var(--hon-space-5)' }}
    >
      <p className="hon-eyebrow">Not in the House</p>
      <h1 className="hon-display">There is nothing at this address.</h1>
      <p className="hon-prose hon-measure">
        The work may have moved, or the link may be from an earlier arrangement of the
        collection.
      </p>
      <div style={{ display: 'flex', gap: 'var(--hon-space-5)', flexWrap: 'wrap' }}>
        <Link href="/collection" className="hon-door">
          Explore the Collection
          <span className="hon-door__mark" aria-hidden="true">→</span>
        </Link>
        <Link href="/" className="hon-action">
          Return to the entrance
        </Link>
      </div>
    </div>
  );
}
