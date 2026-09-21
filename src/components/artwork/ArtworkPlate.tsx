import Link from 'next/link';
import { aspectRatio, displayAsset, posterAsset, type Artist, type Artwork } from '@/domain';
import { DemoMarker } from '@/components/primitives/DemoMarker';

/**
 * The archive plate (§18): artwork first, label beneath, nothing else. Not a card —
 * no border, no rounded corner, no hover lift, no price (§96).
 */
export function ArtworkPlate({
  artwork,
  artist,
  priority = false,
}: {
  artwork: Artwork;
  artist: Artist | null;
  priority?: boolean;
}) {
  const asset = artwork.media.thumbnail ?? posterAsset(artwork) ?? displayAsset(artwork);
  const ratio = aspectRatio(asset);

  return (
    <article>
      <Link href={`/artwork/${artwork.slug}`} style={{ display: 'block' }}>
        <div
          className="hon-artwork-surface"
          style={{
            display: 'grid',
            placeItems: 'center',
            /* Plates share a height band so the grid reads as a publication, while each
               work keeps its own proportion inside it (§14, §18). */
            aspectRatio: '1 / 1',
            padding: 'var(--hon-space-4)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.url}
            alt={`${artwork.title} — ${artwork.medium}`}
            width={asset.width ?? undefined}
            height={asset.height ?? undefined}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={artwork.mediaType === 'pixel' ? 'hon-pixel-media' : undefined}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: ratio >= 1 ? '100%' : 'auto',
              height: ratio >= 1 ? 'auto' : '100%',
              aspectRatio: String(ratio),
            }}
          />
        </div>
        <div style={{ marginTop: 'var(--hon-space-3)', display: 'grid', gap: '0.15rem' }}>
          <span className="hon-title" style={{ fontSize: '1.05rem' }}>
            {artwork.displayTitle ?? artwork.title}
          </span>
          <span className="hon-label">
            {artist?.name ?? 'Unattributed'}
            {artwork.year ? ` · ${artwork.year}` : ''}
          </span>
          {artwork.editionLabel ? (
            <span className="hon-label" style={{ color: 'var(--hon-faint)' }}>
              Edition {artwork.editionLabel}
            </span>
          ) : null}
        </div>
      </Link>
      {artwork.isPlaceholder ? (
        <div style={{ marginTop: 'var(--hon-space-2)' }}>
          <DemoMarker />
        </div>
      ) : null}
    </article>
  );
}
