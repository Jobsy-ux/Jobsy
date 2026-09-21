'use client';

import * as THREE from 'three';

/**
 * Some browsers, drivers and renderer versions decode video perfectly but put nothing on
 * the wall: the frames never reach the texture the scene draws with. A black rectangle
 * where a moving work should be is a silent failure of §16 — the work is playing, and the
 * visitor sees a void.
 *
 * This has been observed with an otherwise healthy WebGL context, so testing the raw
 * upload proves nothing. The probe therefore renders the real texture through the real
 * renderer into a one-pixel target and reads it back, comparing it with the same frame
 * sampled through a 2D canvas, which every browser can do.
 *
 * Runs at most once per session. If it fails, moving work falls back to canvas sampling:
 * more CPU per frame, but it draws the artist's frames, unaltered, everywhere the browser
 * can decode at all (§85).
 */
export type VideoUploadSupport = 'unknown' | 'supported' | 'unsupported';

let support: VideoUploadSupport = 'unknown';
const listeners = new Set<() => void>();

export function getVideoUploadSupport(): VideoUploadSupport {
  return support;
}

export function subscribeVideoUploadSupport(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function probeVideoUpload(
  renderer: THREE.WebGLRenderer,
  video: HTMLVideoElement,
  texture: THREE.Texture,
): void {
  if (support !== 'unknown') return;
  if (video.readyState < 2 || video.videoWidth === 0) return;

  const reference = sampleThroughCanvas(video);
  /* A frame that is genuinely black tells us nothing; try again on a later frame. */
  if (reference === null || (reference[0] < 6 && reference[1] < 6 && reference[2] < 6)) return;

  const rendered = sampleThroughRenderer(renderer, texture);
  if (rendered === null) return;

  const renderedIsBlank = rendered[0] < 6 && rendered[1] < 6 && rendered[2] < 6;
  support = renderedIsBlank ? 'unsupported' : 'supported';
  for (const listener of listeners) listener();
}

/** Draws the texture through the scene's own renderer and reads one pixel back. */
function sampleThroughRenderer(
  renderer: THREE.WebGLRenderer,
  texture: THREE.Texture,
): [number, number, number] | null {
  const target = new THREE.WebGLRenderTarget(1, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  const previousTarget = renderer.getRenderTarget();
  try {
    texture.needsUpdate = true;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    const pixels = new Uint8Array(4);
    renderer.readRenderTargetPixels(target, 0, 0, 1, 1, pixels);
    return [pixels[0] ?? 0, pixels[1] ?? 0, pixels[2] ?? 0];
  } catch {
    return null;
  } finally {
    renderer.setRenderTarget(previousTarget);
    quad.geometry.dispose();
    material.dispose();
    target.dispose();
  }
}

function sampleThroughCanvas(video: HTMLVideoElement): [number, number, number] | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(video, 0, 0);
    const data = context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
    return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0];
  } catch {
    /* A cross-origin frame taints the canvas, so nothing can be concluded. Assume the
       ordinary path works rather than paying for the fallback everywhere. */
    return null;
  }
}

/** Test seam: forget what was learned, so the probe can be exercised more than once. */
export function resetVideoUploadSupport(): void {
  support = 'unknown';
  listeners.clear();
}
