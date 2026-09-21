/**
 * Media state machine (§16, §58).
 *
 * Nothing in the museum loads everything. Each hung work is in exactly one state, chosen
 * from distance, facing and a hard concurrency budget, so a room of moving image never
 * asks the device for more decoding than it can give.
 *
 *   dormant   — nothing loaded, nothing in GPU memory
 *   poster    — a still stands in for the work; loaded lazily as you approach
 *   streaming — full media loaded, video paused on its poster frame
 *   active    — video playing; only ever the nearest few, never more than the budget
 */
import type { Vec3 } from '../geometry';

export type MediaState = 'dormant' | 'poster' | 'streaming' | 'active';

export interface MediaCandidate {
  slug: string;
  position: Vec3;
  /** Direction the work faces, as its wall normal in XZ. */
  facing: [number, number];
  /** Time-based work competes for the video budget; stills never do. */
  isTimeBased: boolean;
}

export interface MediaBudget {
  maxConcurrentVideo: number;
  streamDistance: number;
}

export interface Viewer {
  position: Vec3;
  /** Camera forward in XZ. */
  forward: [number, number];
}

/** Fractions of the stream distance at which each state begins. */
const POSTER_FACTOR = 1.9;
const ACTIVE_FACTOR = 0.7;

export function computeMediaStates(
  viewer: Viewer,
  candidates: readonly MediaCandidate[],
  budget: MediaBudget,
): Map<string, MediaState> {
  const states = new Map<string, MediaState>();
  const playable: Array<{ slug: string; distance: number }> = [];

  for (const candidate of candidates) {
    const dx = candidate.position[0] - viewer.position[0];
    const dz = candidate.position[2] - viewer.position[2];
    const distance = Math.hypot(dx, dz);

    if (distance > budget.streamDistance * POSTER_FACTOR) {
      states.set(candidate.slug, 'dormant');
      continue;
    }
    if (distance > budget.streamDistance) {
      states.set(candidate.slug, 'poster');
      continue;
    }

    /* Is the visitor in front of the work, and looking anywhere near it? */
    const towards = distance === 0 ? 1 : (dx * viewer.forward[0] + dz * viewer.forward[1]) / distance;
    const faced = distance === 0 ? 1 : -(dx * candidate.facing[0] + dz * candidate.facing[1]) / distance;
    const visible = towards > -0.2 && faced > 0;

    if (!candidate.isTimeBased) {
      states.set(candidate.slug, 'streaming');
      continue;
    }

    if (visible && distance <= budget.streamDistance * ACTIVE_FACTOR) {
      playable.push({ slug: candidate.slug, distance });
      states.set(candidate.slug, 'streaming');
    } else {
      states.set(candidate.slug, visible ? 'streaming' : 'poster');
    }
  }

  /* Only the nearest few actually run. Everything else holds on its poster frame. */
  playable
    .sort((a, b) => a.distance - b.distance)
    .slice(0, Math.max(0, budget.maxConcurrentVideo))
    .forEach((entry) => states.set(entry.slug, 'active'));

  return states;
}

/** True when a state needs the full-resolution asset in memory. */
export function needsFullMedia(state: MediaState): boolean {
  return state === 'streaming' || state === 'active';
}
