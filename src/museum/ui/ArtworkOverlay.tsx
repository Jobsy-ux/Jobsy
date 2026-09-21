'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Artwork, CuratorialRelationship } from '@/domain';
import { displayTitle, isLinkPresentable, ownedWorkLinks } from '@/domain';
import { ArtworkMedia } from '@/components/artwork/ArtworkMedia';
import { SaveToMyHouse } from '@/components/artwork/SaveToMyHouse';
import { DemoMarker } from '@/components/primitives/DemoMarker';
import { ExternalLink } from '@/components/primitives/ExternalLink';

/**
 * Selecting a work in the museum opens its record in place — it does not throw the
 * visitor out of the building (§21). Everything essential about the work is here; the
 * full passport is one deliberate step away.
 */
export function ArtworkOverlay({
  artwork,
  onClose,
  onShowInRoom,
  relatedInHouse,
  onGoToRelated,
}: {
  artwork: Artwork;
  onClose: () => void;
  onShowInRoom: () => void;
  relatedInHouse: Array<{ relation: CuratorialRelationship; artwork: Artwork }>;
  onGoToRelated: (slug: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Escape closes, focus moves in, and the wall behind stays where it was (§63). */
  useEffect(() => {
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const owned = ownedWorkLinks(artwork.links).filter(isLinkPresentable);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${displayTitle(artwork)} — record`}
      ref={panelRef}
      tabIndex={-1}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        alignItems: 'end',
        background: 'linear-gradient(to top, rgba(8,8,10,0.96) 42%, rgba(8,8,10,0.2) 100%)',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="hon-shell"
        style={{
          paddingBlock: 'var(--hon-space-6)',
          display: 'grid',
          gap: 'var(--hon-space-5)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(18rem, 100%), 1fr))',
          alignItems: 'end',
          maxHeight: '78%',
          overflowY: 'auto',
        }}
      >
        <div style={{ maxWidth: '22rem' }}>
          <ArtworkMedia artwork={artwork} mode="plate" />
        </div>

        <div style={{ display: 'grid', gap: 'var(--hon-space-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--hon-space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="hon-label">In the House</span>
            {artwork.isPlaceholder ? <DemoMarker /> : null}
          </div>
          <h2 className="hon-title">{displayTitle(artwork)}</h2>
          <p className="hon-label">
            {artwork.medium}
            {artwork.year ? ` · ${artwork.year}` : ''}
            {artwork.editionLabel ? ` · Edition ${artwork.editionLabel}` : ''}
          </p>
          {artwork.description ? (
            <p className="hon-prose" style={{ fontSize: 'var(--hon-size-small)' }}>
              {artwork.description}
            </p>
          ) : null}

          <div style={{ display: 'flex', gap: 'var(--hon-space-4)', flexWrap: 'wrap', marginTop: 'var(--hon-space-2)' }}>
            <Link href={`/artwork/${artwork.slug}`} className="hon-action">
              Open the full record
            </Link>
            <SaveToMyHouse slug={artwork.slug} title={artwork.title} />
            <button type="button" className="hon-action" onClick={onShowInRoom}>
              Stand in front of it
            </button>
            <button type="button" className="hon-action" onClick={onClose}>
              Close
            </button>
          </div>

          {owned.length > 0 ? (
            <div style={{ display: 'flex', gap: 'var(--hon-space-4)', flexWrap: 'wrap' }}>
              {owned.map((link) => (
                <ExternalLink key={link.url} href={link.url} platform={link.platform} artworkSlug={artwork.slug}>
                  {link.label}
                </ExternalLink>
              ))}
            </div>
          ) : null}

          {relatedInHouse.length > 0 ? (
            <div style={{ borderTop: '1px solid var(--hon-edge)', paddingTop: 'var(--hon-space-3)' }}>
              <p className="hon-label">Also in the House</p>
              <ul style={{ display: 'grid', gap: 'var(--hon-space-2)', marginTop: 'var(--hon-space-2)' }}>
                {relatedInHouse.map(({ relation, artwork: related }) => (
                  <li key={related.slug}>
                    <button type="button" className="hon-action" onClick={() => onGoToRelated(related.slug)}>
                      {displayTitle(related)}
                      <span className="hon-quiet"> — related by {relation.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
