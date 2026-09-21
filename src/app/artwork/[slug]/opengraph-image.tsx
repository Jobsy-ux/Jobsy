import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { getRepository } from '@/data';
import { displayAsset, displayTitle, posterAsset } from '@/domain';
import { COLLECTION_NAME, SITE_NAME } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'A work in the House of Nucci Collection';

/**
 * The social card for an artwork (§57).
 *
 * The work is placed whole on a dark ground — letterboxed, never cropped or reframed —
 * with its title, its artist, and the name of the collection. No price, no token, no
 * clutter. Composing the card ourselves is what keeps the work intact: handing a platform
 * a bare image invites it to crop the work to its own aspect ratio (§14).
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = getRepository();
  const artwork = repo.getArtwork(slug);

  if (!artwork) {
    return new ImageResponse(<Fallback line={SITE_NAME} />, size);
  }

  const artist = repo.getArtist(artwork.artistSlug);
  /* Prefer a small local derivative: the card is 1200×630, and the archival file is not. */
  const asset = artwork.media.thumbnail ?? posterAsset(artwork) ?? displayAsset(artwork);
  const source = await inlineLocalAsset(asset.url);

  if (!source) {
    return new ImageResponse(<Fallback line={displayTitle(artwork)} />, size);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0d0e10',
          padding: '48px 56px',
        }}
      >
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          { }
          <img
            src={source}
            alt=""
            style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', color: '#ece7dd', fontSize: 40, letterSpacing: '-0.01em' }}>
            {displayTitle(artwork)}
          </div>
          <div style={{ display: 'flex', color: '#b6b0a6', fontSize: 24 }}>
            {artist?.name ?? 'Unattributed'}
            {artwork.year ? ` · ${artwork.year}` : ''}
          </div>
          <div style={{ display: 'flex', color: '#85817a', fontSize: 18, letterSpacing: '0.16em', marginTop: 10 }}>
            {COLLECTION_NAME.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

function Fallback({ line }: { line: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: '#0d0e10',
        padding: 56,
      }}
    >
      <div style={{ display: 'flex', color: '#ece7dd', fontSize: 52 }}>{line}</div>
      <div style={{ display: 'flex', color: '#85817a', fontSize: 20, letterSpacing: '0.16em', marginTop: 12 }}>
        {COLLECTION_NAME.toUpperCase()}
      </div>
    </div>
  );
}

/**
 * Cards are rendered at build time, when the site cannot fetch from itself. Local media is
 * therefore read from disk and inlined; remote media is passed through as a URL.
 */
async function inlineLocalAsset(url: string): Promise<string | null> {
  if (!url.startsWith('/')) return url;
  try {
    const file = await readFile(join(process.cwd(), 'public', url));
    const mime = url.endsWith('.png')
      ? 'image/png'
      : url.endsWith('.webp')
        ? 'image/webp'
        : url.endsWith('.svg')
          ? 'image/svg+xml'
          : 'image/jpeg';
    return `data:${mime};base64,${file.toString('base64')}`;
  } catch {
    return null;
  }
}
