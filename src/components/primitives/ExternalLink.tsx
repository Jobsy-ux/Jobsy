'use client';

import { track } from '@/lib/analytics';
import { displayHost, safeExternalUrl } from '@/lib/url';

interface ExternalLinkProps {
  href: string;
  platform: string;
  artworkSlug?: string | null;
  children: React.ReactNode;
  className?: string;
  /** Shows the destination host beside the label, so nobody is sent somewhere blind. */
  showHost?: boolean;
}

/**
 * The only way an outbound link is emitted (§23, DECISIONS D-14).
 *
 * It sanitises the URL, opens in a new tab so the House session survives, severs the
 * opener, and records an outbound event with no visitor identifier attached. A link that
 * fails sanitisation renders as nothing rather than as a broken destination.
 */
export function ExternalLink({
  href,
  platform,
  artworkSlug = null,
  children,
  className = 'hon-action',
  showHost = false,
}: ExternalLinkProps) {
  const safe = safeExternalUrl(href);
  if (!safe) return null;
  const host = showHost ? displayHost(safe) : null;

  return (
    <a
      href={safe}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track({ name: 'outbound', platform, artwork: artworkSlug })}
    >
      <span>{children}</span>
      {host ? <span className="hon-quiet">{host}</span> : null}
      <span aria-hidden="true">↗</span>
      <span className="hon-visually-hidden">(opens in a new tab)</span>
    </a>
  );
}
