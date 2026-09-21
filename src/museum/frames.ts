/**
 * Frame bodies (§67).
 *
 * A frame is metadata, and here it becomes geometry: a solid body slightly larger than
 * the work. Because it is solid, it has to sit behind the artwork surface — a frame
 * centred on the work hides the work behind its own front face. `frameBodyOffset` is the
 * only place that distance is decided.
 */
import type { FrameStyle } from '@/domain';

export interface FrameBody {
  colour: string;
  /** Thickness of the body, front to back, in metres. */
  depth: number;
  /** How far the body extends beyond the work on each side, in metres. */
  border: number;
  metalness: number;
  roughness: number;
}

/** How far the artwork surface stands proud of its frame body, in metres. */
export const FRAME_CLEARANCE = 0.004;

export const FRAME_BODIES: Record<FrameStyle, FrameBody | null> = {
  'frameless-digital': null,
  none: null,
  projection: null,
  screen: { colour: '#0a0a0b', depth: 0.09, border: 0.035, metalness: 0.2, roughness: 0.6 },
  'thin-black': { colour: '#0c0c0d', depth: 0.035, border: 0.022, metalness: 0.1, roughness: 0.8 },
  aluminum: { colour: '#8d8f92', depth: 0.03, border: 0.018, metalness: 0.85, roughness: 0.35 },
  floating: { colour: '#17181a', depth: 0.06, border: 0.01, metalness: 0.1, roughness: 0.9 },
  'museum-white': { colour: '#d8d3c8', depth: 0.04, border: 0.045, metalness: 0, roughness: 0.95 },
  'dark-wood': { colour: '#2a1f18', depth: 0.045, border: 0.04, metalness: 0, roughness: 0.85 },
  'light-wood': { colour: '#a58862', depth: 0.045, border: 0.04, metalness: 0, roughness: 0.8 },
};

/**
 * How far back along the wall normal the frame body's centre sits, relative to the
 * artwork surface. Always at least half the body's depth, so the body's front face stays
 * behind the work.
 */
export function frameBodyOffset(body: FrameBody): number {
  return body.depth / 2 + FRAME_CLEARANCE;
}

/**
 * Signed distance from the artwork surface to the front face of its frame, along the
 * normal. Negative means the frame is behind the work, which is the only acceptable
 * result: a positive value would mean the frame covers the work.
 */
export function frameFrontFaceClearance(body: FrameBody): number {
  return body.depth / 2 - frameBodyOffset(body);
}
