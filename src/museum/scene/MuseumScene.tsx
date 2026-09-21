'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { isTimeBased, type Artwork, type ExperienceTier, type Room } from '@/domain';
import { hungWorksInRoom, type HungWork, type Vec3 } from '../geometry';
import { MediaDirectorProvider, useMediaDirectorValue } from '../media/useMediaDirector';
import type { MediaCandidate } from '../media/media-director';
import { Navigator } from '../controls/Navigator';
import { TIER_BUDGETS } from '@/lib/device-tier';
import { ArtworkPanel } from './ArtworkPanel';
import { RoomShell } from './RoomShell';

/**
 * The scene.
 *
 * Only the room the visitor is in and the rooms it opens onto are built: walking into
 * the Black Box does not keep the Great Room's textures resident, and leaving disposes
 * them (§58). With three rooms this is inexpensive; with thirty it is the difference
 * between a museum and a stall.
 */
export function MuseumScene({
  rooms,
  artworkBySlug,
  currentRoomSlug,
  tier,
  mode,
  initialPose,
  target,
  onRoomChange,
  onPose,
  onSelect,
  onHover,
}: {
  rooms: Room[];
  artworkBySlug: Map<string, Artwork>;
  currentRoomSlug: string;
  tier: ExperienceTier;
  mode: 'free' | 'guided';
  initialPose: { position: Vec3; heading: number; pitch: number };
  target: { position: Vec3; heading: number; token: number } | null;
  onRoomChange: (slug: string) => void;
  onPose: (pose: { position: Vec3; heading: number; pitch: number }) => void;
  onSelect: (slug: string) => void;
  onHover: (slug: string | null) => void;
}) {
  const budget = TIER_BUDGETS[tier];

  const visibleRooms = useMemo(() => {
    const current = rooms.find((room) => room.slug === currentRoomSlug) ?? rooms[0];
    if (!current) return [];
    const neighbours = new Set(current.connections.map((connection) => connection.toRoomSlug));
    return rooms.filter((room) => room.slug === current.slug || neighbours.has(room.slug));
  }, [rooms, currentRoomSlug]);

  const works = useMemo(
    () =>
      visibleRooms.flatMap((room) =>
        hungWorksInRoom(room, (slug) => artworkBySlug.get(slug) ?? null),
      ),
    [visibleRooms, artworkBySlug],
  );

  const candidates = useMemo<MediaCandidate[]>(
    () =>
      works.map((work) => ({
        slug: work.artwork.slug,
        position: work.position,
        facing: [Math.sin(work.rotationY), Math.cos(work.rotationY)],
        isTimeBased: isTimeBased(work.artwork.mediaType),
      })),
    [works],
  );

  return (
    <MediaDirectorShell candidates={candidates} budget={budget}>
      {/* Depth is read as distance, not as haze: just enough to give the long sightline
          somewhere to go (§11). */}
      <fog attach="fog" args={['#08080a', 22, 78]} />
      <color attach="background" args={['#08080a']} />

      {visibleRooms.map((room) => (
        <RoomShell key={room.slug} room={room} shadows={budget.shadows} />
      ))}

      {works.map((work: HungWork) => (
        <ArtworkPanel
          key={work.placement.id}
          work={work}
          shadows={budget.shadows}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}

      <Navigator
        rooms={rooms}
        mode={mode}
        initialPosition={initialPose.position}
        initialHeading={initialPose.heading}
        initialPitch={initialPose.pitch}
        target={target}
        onRoomChange={onRoomChange}
        onPose={onPose}
      />
    </MediaDirectorShell>
  );
}

function MediaDirectorShell({
  candidates,
  budget,
  children,
}: {
  candidates: MediaCandidate[];
  budget: { maxConcurrentVideo: number; streamDistance: number };
  children: React.ReactNode;
}) {
  const director = useMediaDirectorValue(candidates, budget);
  return <MediaDirectorProvider value={director}>{children}</MediaDirectorProvider>;
}

/** Renderer settings applied once the canvas exists. Artwork bypasses tone mapping. */
export function configureRenderer(gl: THREE.WebGLRenderer): void {
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1;
  gl.outputColorSpace = THREE.SRGBColorSpace;
}
