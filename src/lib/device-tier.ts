'use client';

import type { ExperienceTier } from '@/domain';

/**
 * EXPERIENCE TIERS (§59). The point is never to punish a weak device: each tier is a
 * coherent experience, and the visitor can always override the probe's choice.
 *
 * FULL 3D       — free roaming, full lighting, all media states
 * OPTIMIZED 3D  — free roaming, reduced pixel ratio and lighting, stricter media caps
 * GUIDED 3D     — no free roaming; the visitor moves between authored stops
 * ARCHIVE 2D    — no WebGL at all; the archive, which is a complete product on its own
 */
export interface Capability {
  tier: ExperienceTier;
  webglAvailable: boolean;
  prefersReducedMotion: boolean;
  coarsePointer: boolean;
  deviceMemoryGb: number | null;
  reason: string;
}

export function probeCapability(): Capability {
  if (typeof window === 'undefined') {
    return {
      tier: 'archive-2d',
      webglAvailable: false,
      prefersReducedMotion: false,
      coarsePointer: false,
      deviceMemoryGb: null,
      reason: 'server',
    };
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const deviceMemoryGb =
    'deviceMemory' in navigator && typeof navigator.deviceMemory === 'number'
      ? navigator.deviceMemory
      : null;
  const webglAvailable = detectWebgl();

  if (!webglAvailable) {
    return {
      tier: 'archive-2d',
      webglAvailable,
      prefersReducedMotion,
      coarsePointer,
      deviceMemoryGb,
      reason: 'WebGL is unavailable in this browser',
    };
  }

  // Reduced motion means no camera the visitor did not ask for — guided stops, not
  // free-roam drift (§64).
  if (prefersReducedMotion) {
    return {
      tier: 'guided-3d',
      webglAvailable,
      prefersReducedMotion,
      coarsePointer,
      deviceMemoryGb,
      reason: 'This device asks for reduced motion',
    };
  }

  if (deviceMemoryGb !== null && deviceMemoryGb <= 2) {
    return {
      tier: 'guided-3d',
      webglAvailable,
      prefersReducedMotion,
      coarsePointer,
      deviceMemoryGb,
      reason: 'Limited device memory',
    };
  }

  if (coarsePointer) {
    return {
      tier: 'optimized-3d',
      webglAvailable,
      prefersReducedMotion,
      coarsePointer,
      deviceMemoryGb,
      reason: 'Touch device',
    };
  }

  return {
    tier: 'full-3d',
    webglAvailable,
    prefersReducedMotion,
    coarsePointer,
    deviceMemoryGb,
    reason: 'Desktop-class device',
  };
}

function detectWebgl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    return context !== null;
  } catch {
    return false;
  }
}

/** Per-tier limits, applied by the museum's media state machine (§16, §58). */
export const TIER_BUDGETS: Record<
  ExperienceTier,
  { maxConcurrentVideo: number; maxPixelRatio: number; shadows: boolean; streamDistance: number }
> = {
  'full-3d': { maxConcurrentVideo: 2, maxPixelRatio: 2, shadows: true, streamDistance: 16 },
  'optimized-3d': { maxConcurrentVideo: 1, maxPixelRatio: 1.5, shadows: false, streamDistance: 11 },
  'guided-3d': { maxConcurrentVideo: 1, maxPixelRatio: 1.25, shadows: false, streamDistance: 9 },
  'archive-2d': { maxConcurrentVideo: 0, maxPixelRatio: 1, shadows: false, streamDistance: 0 },
};
