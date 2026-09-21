'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import type { Artwork, ExperienceTier, Pathway, Room } from '@/domain';
import { displayTitle } from '@/domain';
import { track } from '@/lib/analytics';
import { probeCapability, TIER_BUDGETS, type Capability } from '@/lib/device-tier';
import { loadSession, saveSession } from '@/lib/museum-session';
import { MuseumScene, configureRenderer } from './scene/MuseumScene';
import { setArtworkAudioEnabled } from './scene/useArtworkSurface';
import { hangWork, type Vec3 } from './geometry';
import { EYE_HEIGHT } from './navigation';
import { ArtworkOverlay } from './ui/ArtworkOverlay';
import { MuseumHud } from './ui/MuseumHud';
import { ArchiveFallback } from './ui/ArchiveFallback';

/**
 * The museum, from the browser's point of view (§10, §53, §59).
 *
 * Responsibilities kept here rather than in the scene: which tier this device gets, where
 * the visitor was last standing, what a deep link asked for, and what happens when they
 * select a work — which opens a record in place rather than throwing them out of the
 * building (§21).
 */
export function MuseumExperience({
  rooms,
  artworks,
  pathways,
}: {
  rooms: Room[];
  artworks: Artwork[];
  pathways: Pathway[];
}) {
  const searchParams = useSearchParams();

  /*
   * Arrival is resolved once, before the first frame: which tier this device gets, and
   * where the visitor should be standing. A deep link wins, then a preserved session,
   * then the front door (§53, §54). Doing this in state initialisers rather than an
   * effect means nobody sees the Entry for a frame before being moved.
   */
  const [capability] = useState<Capability>(() => probeCapability());
  const [arrival] = useState(() =>
    resolveArrival(rooms, {
      room: searchParams.get('room'),
      work: searchParams.get('work'),
      tour: searchParams.get('tour'),
    }),
  );

  const [tier, setTier] = useState<ExperienceTier>(capability.tier);
  const [currentRoomSlug, setCurrentRoomSlug] = useState(arrival.roomSlug);
  const [selected, setSelected] = useState<string | null>(arrival.selected);
  const [hovered, setHovered] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(arrival.audioEnabled);
  const [tourSlug, setTourSlug] = useState<string | null>(arrival.tourSlug);
  const [stopIndex, setStopIndex] = useState(arrival.stopIndex);
  const [target, setTarget] = useState<{ position: Vec3; heading: number; token: number } | null>(null);

  const poseRef = useRef(arrival.pose);
  const targetToken = useRef(0);

  const artworkBySlug = useMemo(
    () => new Map(artworks.map((artwork) => [artwork.slug, artwork])),
    [artworks],
  );
  const roomBySlug = useMemo(() => new Map(rooms.map((room) => [room.slug, room])), [rooms]);

  useEffect(() => {
    track({ name: 'enter_museum', tier: capability.tier });
  }, [capability.tier]);

  /* ------------------------------------------------------------ session saving */
  const persist = useCallback(
    (roomSlug: string, pose: { position: Vec3; heading: number; pitch: number }) => {
      saveSession({
        roomSlug,
        position: pose.position,
        heading: pose.heading,
        pitch: pose.pitch,
        tourPathwaySlug: tourSlug,
        tourStopIndex: stopIndex,
        audioEnabled,
      });
    },
    [tourSlug, stopIndex, audioEnabled],
  );

  const handlePose = useCallback(
    (pose: { position: Vec3; heading: number; pitch: number }) => {
      poseRef.current = pose;
      persist(currentRoomSlug, pose);
    },
    [currentRoomSlug, persist],
  );

  const handleRoomChange = useCallback(
    (slug: string) => {
      setCurrentRoomSlug(slug);
      track({ name: 'room_entered', room: slug });
      persist(slug, poseRef.current);
    },
    [persist],
  );

  useEffect(() => {
    setArtworkAudioEnabled(audioEnabled);
  }, [audioEnabled]);

  /* --------------------------------------------------------------- guided tour */
  const tour = useMemo(
    () => pathways.find((pathway) => pathway.slug === tourSlug) ?? null,
    [pathways, tourSlug],
  );

  const stops = useMemo(() => {
    if (tour) {
      return tour.stops
        .map((stop) => locateWork(rooms, stop.artworkSlug))
        .filter((stop): stop is NonNullable<typeof stop> => stop !== null);
    }
    const room = roomBySlug.get(currentRoomSlug);
    if (!room) return [];
    return room.guidedStops.map((stop) => ({
      artworkSlug: stop.artworkSlug,
      roomSlug: room.slug,
      position: stop.position,
      heading: stop.heading,
    }));
  }, [tour, rooms, roomBySlug, currentRoomSlug]);

  const goToStop = useCallback(
    (index: number) => {
      const stop = stops[index];
      if (!stop) return;
      setStopIndex(index);
      setCurrentRoomSlug(stop.roomSlug);
      targetToken.current += 1;
      setTarget({ position: stop.position, heading: stop.heading, token: targetToken.current });
    },
    [stops],
  );

  const goToWork = useCallback(
    (slug: string) => {
      const located = locateWork(rooms, slug, (key) => artworkBySlug.get(key) ?? null);
      if (!located) return;
      setCurrentRoomSlug(located.roomSlug);
      targetToken.current += 1;
      setTarget({ position: located.position, heading: located.heading, token: targetToken.current });
    },
    [rooms, artworkBySlug],
  );

  const handleSelect = useCallback((slug: string) => {
    setSelected(slug);
    track({ name: 'artwork_selected', artwork: slug, surface: 'museum' });
  }, []);

  /* ------------------------------------------------------------------- render */
  if (!capability.webglAvailable) {
    /* A complete, unapologetic alternative rather than a broken 3D page (§59, §63). */
    return <ArchiveFallback reason={capability.reason} artworks={artworks} rooms={rooms} />;
  }

  const room = roomBySlug.get(currentRoomSlug) ?? rooms[0];
  const selectedArtwork = selected ? (artworkBySlug.get(selected) ?? null) : null;
  const hoveredArtwork = hovered ? (artworkBySlug.get(hovered) ?? null) : null;
  const mode = tier === 'guided-3d' ? 'guided' : 'free';

  return (
    <div style={{ position: 'relative', height: 'calc(100dvh - 4.2rem)', background: 'var(--hon-void)' }}>
      <Canvas
        camera={{ fov: 62, near: 0.1, far: 120, position: arrival.pose.position }}
        dpr={[1, TIER_BUDGETS[tier].maxPixelRatio]}
        shadows={TIER_BUDGETS[tier].shadows}
        gl={{ antialias: tier === 'full-3d', powerPreference: 'high-performance' }}
        onCreated={({ gl }) => configureRenderer(gl)}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          {room ? (
            <MuseumScene
              rooms={rooms}
              artworkBySlug={artworkBySlug}
              currentRoomSlug={room.slug}
              tier={tier}
              mode={mode}
              initialPose={arrival.pose}
              target={target}
              onRoomChange={handleRoomChange}
              onPose={handlePose}
              onSelect={handleSelect}
              onHover={setHovered}
            />
          ) : null}
        </Suspense>
      </Canvas>

      <MuseumHud
        room={room ?? null}
        tier={tier}
        capability={capability}
        hovered={hoveredArtwork}
        audioEnabled={audioEnabled}
        tour={tour}
        stopIndex={stopIndex}
        stopCount={stops.length}
        onAudioToggle={() => setAudioEnabled((value) => !value)}
        onTierChange={setTier}
        onStop={goToStop}
        onEndTour={() => {
          setTourSlug(null);
          setStopIndex(0);
        }}
      />

      {selectedArtwork ? (
        <ArtworkOverlay
          artwork={selectedArtwork}
          onClose={() => setSelected(null)}
          onShowInRoom={() => {
            goToWork(selectedArtwork.slug);
            setSelected(null);
          }}
          relatedInHouse={selectedArtwork.relationships
            .map((relation) => ({ relation, artwork: artworkBySlug.get(relation.artworkSlug) ?? null }))
            .filter((entry): entry is { relation: (typeof entry)['relation']; artwork: Artwork } =>
              entry.artwork !== null,
            )}
          onGoToRelated={(slug) => {
            setSelected(slug);
            goToWork(slug);
          }}
        />
      ) : null}

      <noscript>
        <div className="hon-shell" style={{ paddingBlock: 'var(--hon-space-6)' }}>
          <p className="hon-prose">
            The museum needs JavaScript. The collection, the artists and every record are
            available without it — <Link href="/collection">explore the collection</Link>.
          </p>
        </div>
      </noscript>
    </div>
  );
}

interface Arrival {
  roomSlug: string;
  pose: { position: Vec3; heading: number; pitch: number };
  selected: string | null;
  tourSlug: string | null;
  stopIndex: number;
  audioEnabled: boolean;
}

/** Resolves where this visit begins, in priority order: deep link, session, front door. */
function resolveArrival(
  rooms: readonly Room[],
  request: { room: string | null; work: string | null; tour: string | null },
): Arrival {
  const entry = rooms[0];
  const fallback: Arrival = {
    roomSlug: entry?.slug ?? '',
    pose: {
      position: entry?.entryPosition ?? [0, EYE_HEIGHT, 0],
      heading: entry?.entryHeading ?? 0,
      pitch: 0,
    },
    selected: null,
    tourSlug: request.tour,
    stopIndex: 0,
    audioEnabled: false,
  };

  if (request.work) {
    const located = locateWork(rooms, request.work);
    if (located) {
      return {
        ...fallback,
        roomSlug: located.roomSlug,
        pose: { position: located.position, heading: located.heading, pitch: 0 },
        selected: request.work,
      };
    }
  }

  if (request.room) {
    const room = rooms.find((candidate) => candidate.slug === request.room);
    if (room) {
      return {
        ...fallback,
        roomSlug: room.slug,
        pose: { position: room.entryPosition, heading: room.entryHeading, pitch: 0 },
      };
    }
  }

  const session = loadSession();
  if (session && rooms.some((room) => room.slug === session.roomSlug)) {
    return {
      roomSlug: session.roomSlug,
      pose: { position: session.position, heading: session.heading, pitch: session.pitch },
      selected: null,
      tourSlug: request.tour ?? session.tourPathwaySlug,
      stopIndex: session.tourStopIndex,
      audioEnabled: session.audioEnabled,
    };
  }

  return fallback;
}

/** Where a work hangs, and where to stand to see it (§54: VIEW IN MUSEUM). */
function locateWork(
  rooms: readonly Room[],
  slug: string,
  artworkLookup?: (slug: string) => Artwork | null,
): { artworkSlug: string; roomSlug: string; position: Vec3; heading: number } | null {
  for (const room of rooms) {
    const stop = room.guidedStops.find((candidate) => candidate.artworkSlug === slug);
    if (stop) {
      return { artworkSlug: slug, roomSlug: room.slug, position: stop.position, heading: stop.heading };
    }
  }
  /* No authored stop: derive a viewing position from the placement itself, using the
     same geometry the museum hangs the work with. */
  for (const room of rooms) {
    for (const wall of room.walls) {
      const placement = wall.placements.find((candidate) => candidate.artworkSlug === slug);
      if (!placement) continue;
      const artwork = artworkLookup?.(slug) ?? null;
      if (!artwork) continue;
      const hung = hangWork(room, wall, placement, artwork);
      return {
        artworkSlug: slug,
        roomSlug: room.slug,
        position: hung.viewingPosition,
        heading: hung.viewingHeading,
      };
    }
  }
  return null;
}

export { displayTitle };
