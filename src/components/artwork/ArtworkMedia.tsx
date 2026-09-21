'use client';

import { useEffect, useRef, useState } from 'react';
import { aspectRatio, displayAsset, posterAsset, type Artwork } from '@/domain';

/**
 * The web-side artwork renderer registry (§15).
 *
 * One renderer per media type, chosen by data rather than by branching inside a page.
 * Adding `generative`, `html`, `shader`, `interactive` or `model3d` means adding a
 * renderer here and nothing else.
 *
 * Artwork is deliberately NOT passed through `next/image`: the optimizer re-encodes and
 * may resample, and a recompressed artwork is an altered artwork (§14, DECISIONS D-16).
 * Intrinsic dimensions are always declared so nothing reflows and nothing is stretched.
 */
interface RendererProps {
  artwork: Artwork;
  /** `wall` is the dominant presentation; `plate` is the archive thumbnail. */
  mode: 'wall' | 'plate';
  priority?: boolean;
}

type Renderer = (props: RendererProps) => React.ReactElement | null;

function StillRenderer({ artwork, mode, priority }: RendererProps) {
  const asset = mode === 'plate' ? (artwork.media.thumbnail ?? displayAsset(artwork)) : displayAsset(artwork);
  const isPixel = artwork.mediaType === 'pixel';
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={asset.url}
      alt={altText(artwork)}
      width={asset.width ?? undefined}
      height={asset.height ?? undefined}
      className={isPixel ? 'hon-pixel-media' : undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      style={{ width: '100%', height: 'auto', aspectRatio: String(aspectRatio(asset)) }}
    />
  );
}

function VideoRenderer({ artwork, mode }: RendererProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const canonical = artwork.media.canonical;
  const alternate = artwork.media.web;
  const poster = posterAsset(artwork);
  const hasAudio = canonical.hasAudio || alternate?.hasAudio === true;

  /* Only play what is on screen (§16). Off-screen video is paused, not merely hidden. */
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nowVisible = entry?.isIntersecting ?? false;
        setVisible(nowVisible);
        if (nowVisible) void element.play().catch(() => undefined);
        else element.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      poster={poster?.url}
      width={canonical.width ?? undefined}
      height={canonical.height ?? undefined}
      /* Audio never starts on its own; a work with sound gets controls (§17). */
      muted={!hasAudio}
      controls={hasAudio && mode === 'wall'}
      loop
      playsInline
      preload={mode === 'wall' ? 'metadata' : 'none'}
      aria-label={altText(artwork)}
      data-playing={visible}
      style={{ width: '100%', height: 'auto', aspectRatio: String(aspectRatio(canonical)) }}
    >
      {alternate ? <source src={alternate.url} type={alternate.mimeType} /> : null}
      <source src={canonical.url} type={canonical.mimeType} />
    </video>
  );
}

function VectorRenderer({ artwork }: RendererProps) {
  const asset = displayAsset(artwork);
  return (
    /* Vector work is delivered as vector: it has no native pixel size to preserve. */
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={asset.url}
      alt={altText(artwork)}
      width={asset.width ?? undefined}
      height={asset.height ?? undefined}
      loading="lazy"
      decoding="async"
      style={{ width: '100%', height: 'auto', aspectRatio: String(aspectRatio(asset)) }}
    />
  );
}

function UnsupportedRenderer({ artwork }: RendererProps) {
  /* No blank screens (§85): say what the work is and where it can be seen. */
  return (
    <div
      className="hon-artwork-surface"
      style={{
        aspectRatio: '4 / 3',
        display: 'grid',
        placeItems: 'center',
        border: '1px solid var(--hon-edge)',
        padding: 'var(--hon-space-6)',
        textAlign: 'center',
      }}
    >
      <div>
        <p className="hon-label">{artwork.mediaType} work</p>
        <p className="hon-prose" style={{ marginTop: 'var(--hon-space-3)' }}>
          This work needs a renderer that is not yet built into the House. Its record is
          complete, and it can be viewed at its original source.
        </p>
      </div>
    </div>
  );
}

const RENDERERS: Partial<Record<Artwork['mediaType'], Renderer>> = {
  still: StillRenderer,
  pixel: StillRenderer,
  animated: StillRenderer, // GIF/APNG animate natively in an <img>; nothing is re-encoded.
  video: VideoRenderer,
  svg: VectorRenderer,
  placeholder: StillRenderer,
};

export function ArtworkMedia(props: RendererProps) {
  const Renderer = RENDERERS[props.artwork.mediaType] ?? UnsupportedRenderer;
  return (
    <div className="hon-artwork-surface" style={{ width: '100%' }}>
      <Renderer {...props} />
    </div>
  );
}

/**
 * Alt text is factual and short: title, artist, medium. It never describes the image,
 * because describing an artwork is an interpretation the House would be inventing (§63,
 * §104).
 */
function altText(artwork: Artwork): string {
  return `${artwork.displayTitle ?? artwork.title} — ${artwork.medium}`;
}
