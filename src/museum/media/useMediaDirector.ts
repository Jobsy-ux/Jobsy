'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useSyncExternalStore } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { computeMediaStates, type MediaBudget, type MediaCandidate, type MediaState } from './media-director';

/**
 * Runs the media state machine against the live camera and publishes results to the
 * panels.
 *
 * Recomputed a few times a second rather than every frame — media states change as a
 * person walks, not as a frame renders. Panels subscribe individually, so approaching one
 * video re-renders one panel rather than the room.
 */
const RECOMPUTE_INTERVAL = 0.2;

export interface MediaDirector {
  get(slug: string): MediaState;
  subscribe(listener: () => void): () => void;
}

const DirectorContext = createContext<MediaDirector | null>(null);

export const MediaDirectorProvider = DirectorContext.Provider;

export function useMediaDirectorValue(
  candidates: readonly MediaCandidate[],
  budget: MediaBudget,
): MediaDirector {
  const camera = useThree((state) => state.camera);
  const statesRef = useRef<Map<string, MediaState>>(new Map());
  const listeners = useRef(new Set<() => void>());
  const elapsed = useRef(0);

  const subscribe = useCallback((listener: () => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (elapsed.current < RECOMPUTE_INTERVAL) return;
    elapsed.current = 0;

    const forward: [number, number] = [-Math.sin(camera.rotation.y), -Math.cos(camera.rotation.y)];
    const next = computeMediaStates(
      { position: [camera.position.x, camera.position.y, camera.position.z], forward },
      candidates,
      budget,
    );

    let changed = next.size !== statesRef.current.size;
    if (!changed) {
      for (const [slug, state] of next) {
        if (statesRef.current.get(slug) !== state) {
          changed = true;
          break;
        }
      }
    }
    if (!changed) return;

    statesRef.current = next;
    for (const listener of listeners.current) listener();
  });

  return useMemo<MediaDirector>(
    () => ({
      get: (slug) => statesRef.current.get(slug) ?? 'dormant',
      subscribe,
    }),
    [subscribe],
  );
}

/** One panel's view of the director. Re-renders only when that panel's state changes. */
export function useMediaState(slug: string): MediaState {
  const director = useContext(DirectorContext);
  const subscribe = useCallback(
    (listener: () => void) => director?.subscribe(listener) ?? (() => undefined),
    [director],
  );
  return useSyncExternalStore(
    subscribe,
    () => director?.get(slug) ?? 'dormant',
    () => 'dormant' as MediaState,
  );
}
