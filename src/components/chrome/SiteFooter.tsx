import Link from 'next/link';

export function SiteFooter({ isDemo }: { isDemo: boolean }) {
  return (
    <footer style={{ borderTop: '1px solid var(--hon-edge-faint)', marginTop: 'var(--hon-space-10)' }}>
      <div
        className="hon-shell"
        style={{
          paddingBlock: 'var(--hon-space-7)',
          display: 'grid',
          gap: 'var(--hon-space-6)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
        }}
      >
        <div>
          <p className="hon-display" style={{ fontSize: '1.05rem' }}>
            House of Nucci
          </p>
          <p className="hon-label" style={{ marginTop: 'var(--hon-space-2)' }}>
            The Collection
          </p>
        </div>
        <div>
          <p className="hon-label">Visit</p>
          <ul style={{ marginTop: 'var(--hon-space-3)', display: 'grid', gap: 'var(--hon-space-2)' }}>
            <li><Link href="/museum" className="hon-prose">The Museum</Link></li>
            <li><Link href="/collection" className="hon-prose">The Collection</Link></li>
            <li><Link href="/start-here" className="hon-prose">New to digital art</Link></li>
          </ul>
        </div>
        <div>
          <p className="hon-label">Read</p>
          <ul style={{ marginTop: 'var(--hon-space-3)', display: 'grid', gap: 'var(--hon-space-2)' }}>
            <li><Link href="/exhibitions" className="hon-prose">Exhibitions</Link></li>
            <li><Link href="/pathways" className="hon-prose">Pathways</Link></li>
            <li><Link href="/artists" className="hon-prose">Artists</Link></li>
          </ul>
        </div>
        <div>
          <p className="hon-label">Note</p>
          <p className="hon-prose" style={{ marginTop: 'var(--hon-space-3)', fontSize: 'var(--hon-size-small)' }}>
            {isDemo
              ? 'This build is populated with clearly marked demo records. No work shown is part of the collection.'
              : 'Works shown are held in the House of Nucci Collection. External links lead to artists and marketplaces; the House does not sell work.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
