import { describe, expect, it } from 'vitest';
import { FileCollectionRepository } from '@/data';
import { buildRoomShell, hangWork, hungWorksInRoom, roomBox } from '@/museum/geometry';
import {
  buildNavigationMesh,
  isNavigable,
  nearestNavigablePoint,
  resolveStep,
  roomAt,
  stepMovement,
} from '@/museum/navigation';
import { computeMediaStates } from '@/museum/media/media-director';
import { FRAME_BODIES, frameBodyOffset, frameFrontFaceClearance } from '@/museum/frames';
import { FRAME_STYLES } from '@/domain';
import type { MediaCandidate } from '@/museum/media/media-director';

const repo = new FileCollectionRepository();

/** Is a camera at `position` with this heading actually looking at `target`? */
function facesTarget(
  position: readonly [number, number, number],
  heading: number,
  target: readonly [number, number, number],
): boolean {
  const forward: [number, number] = [-Math.sin(heading), -Math.cos(heading)];
  const dx = target[0] - position[0];
  const dz = target[2] - position[2];
  const length = Math.hypot(dx, dz) || 1;
  return (forward[0] * dx + forward[1] * dz) / length > 0.9;
}
const rooms = repo.listRooms();
const mesh = buildNavigationMesh(rooms);

describe('architecture', () => {
  it('builds a shell for every room, with a doorway left open in the wall', () => {
    for (const room of rooms) {
      const shell = buildRoomShell(room);
      expect(shell.walls.length).toBeGreaterThanOrEqual(4);
      /* Each doorway splits one side into two panels (plus a lintel), so a room with
         connections always has more panels than a plain box. */
      if (room.connections.length > 0) {
        expect(shell.walls.length).toBeGreaterThan(4);
      }
    }
  });

  it('hangs work at the artwork’s own proportions', () => {
    for (const room of rooms) {
      for (const work of hungWorksInRoom(room, (slug) => repo.getArtwork(slug))) {
        const asset = work.artwork.media.canonical;
        expect(work.width / work.height).toBeCloseTo((asset.width ?? 1) / (asset.height ?? 1), 6);
      }
    }
  });

  it('keeps every hung work inside its room and clear of floor and ceiling', () => {
    for (const room of rooms) {
      const box = roomBox(room);
      for (const work of hungWorksInRoom(room, (slug) => repo.getArtwork(slug))) {
        expect(work.position[0]).toBeGreaterThanOrEqual(box.minX - 0.1);
        expect(work.position[0]).toBeLessThanOrEqual(box.maxX + 0.1);
        expect(work.position[2]).toBeGreaterThanOrEqual(box.minZ - 0.1);
        expect(work.position[2]).toBeLessThanOrEqual(box.maxZ + 0.1);
        expect(work.position[1] - work.height / 2).toBeGreaterThan(0);
        expect(work.position[1] + work.height / 2).toBeLessThan(room.size[1]);
      }
    }
  });

  it('faces every authored guided stop toward the work it is for', () => {
    /* A stop that looks the wrong way is worse than no stop at all: the visitor is
       carried somewhere and shown a blank wall (§33). */
    for (const room of rooms) {
      for (const stop of room.guidedStops) {
        const placement = repo.findPlacement(stop.artworkSlug);
        expect(placement).not.toBeNull();
        const work = hungWorksInRoom(placement!.room, (slug) => repo.getArtwork(slug)).find(
          (candidate) => candidate.artwork.slug === stop.artworkSlug,
        );
        expect(work).toBeDefined();
        expect(facesTarget(stop.position, stop.heading, work!.position)).toBe(true);
      }
    }
  });

  it('derives a viewing position that looks at the work, not away from it', () => {
    for (const room of rooms) {
      for (const work of hungWorksInRoom(room, (slug) => repo.getArtwork(slug))) {
        expect(
          facesTarget(work.viewingPosition, work.viewingHeading, work.position),
          `${work.artwork.slug} is viewed facing the wrong way`,
        ).toBe(true);
      }
    }
  });

  it('puts the viewing position in front of the work, facing it', () => {
    const room = rooms.find((candidate) => candidate.slug === 'the-great-room');
    expect(room).toBeDefined();
    const wall = room!.walls[0]!;
    const placement = wall.placements[0]!;
    const artwork = repo.getArtwork(placement.artworkSlug)!;
    const work = hangWork(room!, wall, placement, artwork);

    /* Standing back from the wall, not inside it. */
    const distance = Math.hypot(
      work.viewingPosition[0] - work.position[0],
      work.viewingPosition[2] - work.position[2],
    );
    expect(distance).toBeGreaterThan(1.5);
    expect(isNavigable(mesh, work.viewingPosition[0], work.viewingPosition[2])).toBe(true);
  });
});

describe('navigation', () => {
  it('lets a visitor stand where each room says they arrive', () => {
    for (const room of rooms) {
      expect(isNavigable(mesh, room.entryPosition[0], room.entryPosition[2])).toBe(true);
      expect(roomAt(mesh, room.entryPosition[0], room.entryPosition[2])).toBe(room.slug);
    }
  });

  it('opens a walkable threshold between connected rooms', () => {
    for (const room of rooms) {
      for (const connection of room.connections) {
        expect(isNavigable(mesh, connection.position[0], connection.position[2])).toBe(true);
      }
    }
  });

  it('keeps a visitor out of the walls', () => {
    expect(isNavigable(mesh, 0, 40)).toBe(false);
    expect(isNavigable(mesh, 200, 200)).toBe(false);
  });

  it('slides along a wall instead of stopping dead', () => {
    const inside = { x: 0, z: 5 };
    /* Walking hard into the south wall while also moving sideways keeps the sideways part. */
    const resolved = resolveStep(mesh, inside, { x: 2, z: 40 });
    expect(resolved.z).toBe(inside.z);
    expect(resolved.x).toBe(2);
  });

  it('walks a stranded camera back into the building', () => {
    const recovered = nearestNavigablePoint(mesh, 500, -500);
    expect(isNavigable(mesh, recovered.x, recovered.z)).toBe(true);
  });

  it('cannot be walked through a wall, however long the visitor holds the key', () => {
    let state = {
      position: [0, 1.65, 5] as [number, number, number],
      heading: Math.PI, // facing +Z, into the south wall of the Entry
      pitch: 0,
      velocity: [0, 0] as [number, number],
    };
    for (let frame = 0; frame < 600; frame += 1) {
      state = stepMovement(mesh, state, { forward: 1, strafe: 0 }, 1 / 60);
    }
    expect(isNavigable(mesh, state.position[0], state.position[2])).toBe(true);
  });

  it('crosses from the Entry into the Great Room when walked forward', () => {
    let state = {
      position: [0, 1.65, 5] as [number, number, number],
      heading: 0, // facing −Z, toward the doorway
      pitch: 0,
      velocity: [0, 0] as [number, number],
    };
    for (let frame = 0; frame < 600; frame += 1) {
      state = stepMovement(mesh, state, { forward: 1, strafe: 0 }, 1 / 60);
    }
    expect(roomAt(mesh, state.position[0], state.position[2])).toBe('the-great-room');
  });
});

describe('media budget', () => {
  const candidates: MediaCandidate[] = [
    { slug: 'near-video', position: [0, 2, -2], facing: [0, 1], isTimeBased: true },
    { slug: 'mid-video', position: [0, 2, -6], facing: [0, 1], isTimeBased: true },
    { slug: 'far-video', position: [0, 2, -40], facing: [0, 1], isTimeBased: true },
    { slug: 'near-still', position: [1, 2, -2], facing: [0, 1], isTimeBased: false },
  ];
  const viewer = { position: [0, 1.65, 0] as [number, number, number], forward: [0, -1] as [number, number] };

  it('plays only as many videos as the device was given', () => {
    const states = computeMediaStates(viewer, candidates, { maxConcurrentVideo: 1, streamDistance: 11 });
    const active = [...states.entries()].filter(([, state]) => state === 'active');
    expect(active).toHaveLength(1);
    expect(active[0]?.[0]).toBe('near-video');
  });

  it('never loads a distant work at all', () => {
    const states = computeMediaStates(viewer, candidates, { maxConcurrentVideo: 2, streamDistance: 11 });
    expect(states.get('far-video')).toBe('dormant');
  });

  it('pauses on a poster when a work is behind the visitor', () => {
    const behind = { position: [0, 1.65, 0] as [number, number, number], forward: [0, 1] as [number, number] };
    const states = computeMediaStates(behind, candidates, { maxConcurrentVideo: 2, streamDistance: 11 });
    expect(states.get('near-video')).toBe('poster');
  });

  it('plays nothing at all on a device that was given no video budget', () => {
    const states = computeMediaStates(viewer, candidates, { maxConcurrentVideo: 0, streamDistance: 11 });
    expect([...states.values()].some((state) => state === 'active')).toBe(false);
  });
});

describe('frames', () => {
  it('always seats the frame body behind the artwork surface', () => {
    /* A frame centred on the work would hide it behind its own front face — which is
       exactly the failure this guards (§14, §67). */
    for (const [style, body] of Object.entries(FRAME_BODIES)) {
      if (!body) continue;
      expect(frameFrontFaceClearance(body), `${style} frame covers the work`).toBeLessThan(0);
      expect(frameBodyOffset(body)).toBeGreaterThan(body.depth / 2);
    }
  });

  it('gives every frame style a definition, so a new style cannot render as nothing', () => {
    for (const style of FRAME_STYLES) {
      expect(Object.hasOwn(FRAME_BODIES, style), `${style} has no frame body entry`).toBe(true);
    }
  });

  it('extends every frame beyond the work it holds', () => {
    for (const body of Object.values(FRAME_BODIES)) {
      if (!body) continue;
      expect(body.border).toBeGreaterThan(0);
    }
  });
});
