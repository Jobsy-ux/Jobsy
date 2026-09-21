'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { displayAsset, posterAsset, requiresNearestNeighbour, type Artwork } from '@/domain';
import { needsFullMedia, type MediaState } from '../media/media-director';
import {
  getVideoUploadSupport,
  probeVideoUpload,
  subscribeVideoUploadSupport,
} from './video-upload-support';

/**
 * Turns an artwork into a texture, honouring its media type and the current media state.
 *
 * Fidelity rules enforced here (§14):
 *   · colour space is sRGB, always — the wall must not shift the artwork's colour
 *   · pixel work gets nearest-neighbour filtering and no mipmaps, at any distance
 *   · nothing is resized, cropped or re-encoded; the texture is the file
 *
 * Lifecycle rules (§58): every texture, video element and canvas created here is disposed
 * when the state falls back to dormant or the panel unmounts. Walking out of a room
 * releases its GPU memory.
 */
/**
 * Every video currently on a wall. The elements are created by the panels rather than
 * written into the page markup, so the audio gate needs a register to reach them — a DOM
 * query would find nothing (§17).
 */
const liveVideos = new Set<HTMLVideoElement>();

/*
 * Source elements for video and animated rasters have to be in the document AND inside
 * the viewport: browsers stop producing frames for media they believe nobody can see, and
 * a texture sampled from a stalled element is a still — which would misrepresent a
 * time-based work as a static one (§16). So they sit in a corner at two pixels and one
 * per cent opacity, out of the accessibility tree and out of the way of pointers.
 */
const HIDDEN_MEDIA_STYLE =
  'position:fixed;right:0;bottom:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1';
let artworkAudioEnabled = false;

export interface ArtworkSurface {
  texture: THREE.Texture | null;
  /** True once something is on the wall — poster or the work itself. */
  ready: boolean;
}

export function useArtworkSurface(artwork: Artwork, state: MediaState): ArtworkSurface {
  const renderer = useThree((three) => three.gl);
  const pixelated = requiresNearestNeighbour(artwork.mediaType);
  const full = needsFullMedia(state);
  const dormant = state === 'dormant';

  /*
   * Video is built synchronously: an element and a texture, created together so playback
   * stays the browser's job. Memoised rather than set from an effect, because the result
   * is a pure function of the artwork, whether it is close enough to load, and whether
   * this browser can put a video frame into a texture at all.
   */
  const uploadSupport = useSyncExternalStore(
    subscribeVideoUploadSupport,
    getVideoUploadSupport,
    () => 'unknown' as const,
  );
  const sampleVideoThroughCanvas = uploadSupport === 'unsupported';

  const video = useMemo(() => {
    if (artwork.mediaType !== 'video' || !full) return null;
    const asset = artwork.media.web ?? artwork.media.canonical;
    const element = document.createElement('video');
    element.src = asset.url;
    element.loop = true;
    element.playsInline = true;
    element.crossOrigin = 'anonymous';
    element.preload = 'auto';
    /* Sound never starts on its own; the audio gate turns it on (§17). A work with no
       audio track stays muted regardless, so enabling audio is never a surprise. */
    element.muted = !(artworkAudioEnabled && asset.hasAudio);
    element.setAttribute('aria-hidden', 'true');
    element.tabIndex = -1;
    /* Held in the document and technically on screen: see HIDDEN_MEDIA_STYLE. */
    element.style.cssText = HIDDEN_MEDIA_STYLE;
    document.body.append(element);
    liveVideos.add(element);

    const poster = posterAsset(artwork);
    if (poster) element.poster = poster.url;

    if (sampleVideoThroughCanvas) {
      /* Fallback path: the frames are copied through a 2D canvas, pixel for pixel. */
      const canvas = document.createElement('canvas');
      canvas.width = asset.width ?? 1280;
      canvas.height = asset.height ?? 720;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      return { element, texture, canvas };
    }

    const texture = new THREE.VideoTexture(element);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return { element, texture, canvas: null as HTMLCanvasElement | null };
  }, [artwork, full, sampleVideoThroughCanvas]);

  /* The frame loop mutates the video bundle (play state, texture staleness), so it is
     reached through a ref: the memo holds what to render, the ref holds what to drive. */
  const videoRef = useRef<typeof video>(null);
  useEffect(() => {
    videoRef.current = video;
    return () => {
      videoRef.current = null;
    };
  }, [video]);

  useEffect(
    () => () => {
      if (!video) return;
      video.texture.dispose();
      video.element.pause();
      liveVideos.delete(video.element);
      video.element.removeAttribute('src');
      video.element.load();
      video.element.remove();
    },
    [video],
  );

  /* Stills, vectors and animated rasters load asynchronously. */
  const [loaded, setLoaded] = useState<THREE.Texture | null>(null);
  const animated = useRef<{ image: HTMLImageElement; canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } | null>(
    null,
  );

  useEffect(() => {
    if (artwork.mediaType === 'video' || dormant) return;
    let cancelled = false;

    /* Animated raster: the browser advances the frames, we sample the current one.
       Sampling costs a draw per frame but keeps the artist's timing and loop intact —
       re-encoding the work to a video would not (§14). */
    if (artwork.mediaType === 'animated' && full) {
      const asset = displayAsset(artwork);
      const image = new Image();
      image.crossOrigin = 'anonymous';
      /* Kept in the document for the same reason as video: an image the browser thinks
         is off-screen may stop advancing its frames. */
      image.style.cssText = HIDDEN_MEDIA_STYLE;
      image.setAttribute('aria-hidden', 'true');
      image.src = asset.url;
      document.body.append(image);

      void image
        .decode()
        .then(() => {
          if (cancelled) return;
          const canvas = document.createElement('canvas');
          canvas.width = asset.width ?? image.naturalWidth;
          canvas.height = asset.height ?? image.naturalHeight;
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          applyFiltering(texture, pixelated);
          animated.current = { image, canvas, texture };
          setLoaded(texture);
        })
        .catch(() => undefined);

      return () => {
        cancelled = true;
        image.src = '';
        image.remove();
        animated.current?.texture.dispose();
        animated.current = null;
      };
    }

    /* Everything else is a still: the work itself when near, its poster when not. */
    const poster = posterAsset(artwork);
    const asset = full ? displayAsset(artwork) : (poster ?? artwork.media.thumbnail ?? displayAsset(artwork));
    let created: THREE.Texture | null = null;

    new THREE.TextureLoader().load(
      asset.url,
      (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        applyFiltering(texture, pixelated);
        created = texture;
        setLoaded(texture);
      },
      undefined,
      () => {
        /* A missing file leaves the wall dark rather than showing a broken icon (§85). */
      },
    );

    return () => {
      cancelled = true;
      created?.dispose();
    };
  }, [artwork, full, dormant, pixelated]);

  /* Drive playback and animated sampling from the render loop. */
  useFrame(() => {
    const live = videoRef.current;
    if (live) {
      if (state === 'active' && live.element.paused) void live.element.play().catch(() => undefined);
      if (state !== 'active' && !live.element.paused) live.element.pause();

      if (live.element.readyState >= 2) {
        /* Once, per session: can this browser actually get a video frame onto a wall? */
        probeVideoUpload(renderer, live.element, live.texture);

        if (live.canvas) {
          const context = live.canvas.getContext('2d');
          if (context) {
            context.drawImage(live.element, 0, 0, live.canvas.width, live.canvas.height);
            live.texture.needsUpdate = true;
          }
        } else {
          /* VideoTexture normally refreshes itself from `requestVideoFrameCallback`,
             which some browsers withhold from an element the compositor thinks is
             invisible. Marking it stale here keeps the work moving either way. */
          live.texture.needsUpdate = true;
        }
      }
    }

    const gif = animated.current;
    if (gif && !dormant) {
      const context = gif.canvas.getContext('2d');
      if (context) {
        context.drawImage(gif.image, 0, 0, gif.canvas.width, gif.canvas.height);
        gif.texture.needsUpdate = true;
      }
    }
  });

  /* A dormant panel shows nothing, even while its texture is still being torn down. */
  const texture = dormant ? null : (video?.texture ?? loaded);
  return { texture, ready: texture !== null };
}

function applyFiltering(texture: THREE.Texture, pixelated: boolean): void {
  if (pixelated) {
    /* A pixel is a decision, not a sample to interpolate (§14). */
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return;
  }
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
}

/**
 * Audio gate (§17): nothing is audible until the visitor asks for it, and turning it on
 * affects only the works that actually carry sound.
 */
export function setArtworkAudioEnabled(enabled: boolean): void {
  artworkAudioEnabled = enabled;
  for (const element of liveVideos) {
    /* A silent work has nothing to unmute; leaving it muted avoids browsers blocking
       playback on a page that has not been interacted with. */
    element.muted = !enabled || element.duration === 0;
  }
}

/** Test and diagnostic seam: how many works are currently loaded as video. */
export function liveVideoCount(): number {
  return liveVideos.size;
}
