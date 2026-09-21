import Link from 'next/link';

const NAV = [
  { href: '/collection', label: 'The Collection' },
  { href: '/museum', label: 'The Museum' },
  { href: '/start-here', label: 'Start Here' },
  { href: '/my-house', label: 'My House' },
];

/**
 * Chrome stays quiet: a wordmark, four destinations, one rule. The interface should
 * disappear whenever there is artwork on the screen (§05).
 */
export function SiteHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backdropFilter: 'blur(14px)',
        background: 'color-mix(in srgb, var(--hon-concrete) 88%, transparent)',
        borderBottom: '1px solid var(--hon-edge-faint)',
      }}
    >
      <div
        className="hon-shell"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--hon-space-5)',
          paddingBlock: 'var(--hon-space-4)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--hon-space-3)' }}>
          <span
            className="hon-display"
            style={{ fontSize: '1.05rem', letterSpacing: '0.01em' }}
          >
            House of Nucci
          </span>
          <span className="hon-label" style={{ display: 'none' }} data-wide-only>
            The Collection
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul style={{ display: 'flex', gap: 'var(--hon-space-5)', flexWrap: 'wrap' }}>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hon-label" style={{ color: 'var(--hon-bone-dim)' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
