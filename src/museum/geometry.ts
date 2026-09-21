/**
 * Museum geometry. Pure functions over the authored room records — no Three.js, no
 * React — so the building can be reasoned about and tested without a renderer.
 *
 * Conventions (mirrored in `content/rooms.ts`):
 *   · metres, floor plane XZ, +Y up
 *   · a room's origin is the centre of its floor
 *   · a wall's hanging face is the left-hand normal of start → end
 *   · heading is radians about +Y, 0 faces −Z: forward = (−sin h, 0, −cos h)
 */
import { aspectRatio, type Artwork, type Placement, type Room, type Wall } from '@/domain';

export type Vec3 = [number, number, number];

export interface Box {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface WallPanel {
  /** Centre of the panel in world space. */
  position: Vec3;
  /** Rotation about Y so the panel faces into the room. */
  rotationY: number;
  width: number;
  height: number;
}

export interface HungWork {
  placement: Placement;
  artwork: Artwork;
  roomSlug: string;
  /** Centre of the artwork surface, already offset clear of the wall. */
  position: Vec3;
  rotationY: number;
  width: number;
  height: number;
  /** Where a visitor should stand to see it properly. */
  viewingPosition: Vec3;
  viewingHeading: number;
}

/** Distance a hung work stands off its wall, and the depth a frame occupies. */
const SURFACE_OFFSET = 0.035;

export function roomBox(room: Room): Box {
  const [width, , depth] = room.size;
  const [ox, , oz] = room.origin;
  return {
    minX: ox - width / 2,
    maxX: ox + width / 2,
    minZ: oz - depth / 2,
    maxZ: oz + depth / 2,
  };
}

export function isInside(box: Box, x: number, z: number, margin = 0): boolean {
  return (
    x >= box.minX + margin && x <= box.maxX - margin && z >= box.minZ + margin && z <= box.maxZ - margin
  );
}

/** Direction and normal of a wall, in the XZ plane. */
export function wallAxes(wall: Wall): {
  length: number;
  direction: [number, number];
  normal: [number, number];
  rotationY: number;
} {
  const dx = wall.end[0] - wall.start[0];
  const dz = wall.end[1] - wall.start[1];
  const length = Math.hypot(dx, dz);
  const direction: [number, number] = length === 0 ? [1, 0] : [dx / length, dz / length];
  /* Left-hand normal: the face the artwork hangs on. */
  const normal: [number, number] = [direction[1], -direction[0]];
  /* A plane whose +Z points along the normal. */
  const rotationY = Math.atan2(normal[0], normal[1]);
  return { length, direction, normal, rotationY };
}

/** A point at `offset` metres along the wall, pushed `out` metres off its face. */
export function pointOnWall(wall: Wall, offset: number, out = 0): [number, number] {
  const { direction, normal } = wallAxes(wall);
  return [
    wall.start[0] + direction[0] * offset + normal[0] * out,
    wall.start[1] + direction[1] * offset + normal[1] * out,
  ];
}

/**
 * Resolves a placement into world geometry. The width is the curator's decision and the
 * height comes from the artwork itself — the one and only way display size is computed,
 * so a distorted work is unrepresentable (§14, DECISIONS D-11).
 */
export function hangWork(
  room: Room,
  wall: Wall,
  placement: Placement,
  artwork: Artwork,
): HungWork {
  const { rotationY } = wallAxes(wall);
  const height = placement.displayWidth / aspectRatio(artwork.media.canonical);
  const [x, z] = pointOnWall(wall, placement.offset, SURFACE_OFFSET);
  const [vx, vz] = pointOnWall(wall, placement.offset, viewingDistance(placement.displayWidth, height));

  return {
    placement,
    artwork,
    roomSlug: room.slug,
    position: [x, placement.centreHeight, z],
    rotationY,
    width: placement.displayWidth,
    height,
    viewingPosition: [vx, 1.65, vz],
    /*
     * Look back at the wall. The viewing point stands out along the wall's normal, so the
     * camera must face along −normal: forward = (−sin h, −cos h) equals −n exactly when
     * h = atan2(n.x, n.z), which is the same angle the panel is rotated by.
     */
    viewingHeading: rotationY,
  };
}

/**
 * How far back to stand. Roughly the diagonal of the work, clamped — the distance a
 * person naturally chooses, not a fixed number that puts a large work out of frame.
 */
export function viewingDistance(width: number, height: number): number {
  return Math.min(7.5, Math.max(1.6, Math.hypot(width, height) * 0.95));
}

/** Every work hung in a room, resolved. */
export function hungWorksInRoom(
  room: Room,
  lookup: (slug: string) => Artwork | null,
): HungWork[] {
  const works: HungWork[] = [];
  for (const wall of room.walls) {
    for (const placement of wall.placements) {
      const artwork = lookup(placement.artworkSlug);
      /* A placement pointing at a work the House does not hold is simply not hung (§06). */
      if (!artwork) continue;
      works.push(hangWork(room, wall, placement, artwork));
    }
  }
  return works;
}

/**
 * The room shell: floor, ceiling and four perimeter walls, with each doorway cut out as
 * a gap plus a lintel above it. Built from the room's own dimensions so architecture and
 * navigation can never disagree about where a wall is.
 */
export interface RoomShell {
  floor: { position: Vec3; width: number; depth: number };
  ceiling: { position: Vec3; width: number; depth: number };
  walls: WallPanel[];
}

type Side = 'north' | 'south' | 'east' | 'west';

export function buildRoomShell(room: Room): RoomShell {
  const [width, height, depth] = room.size;
  const [ox, oy, oz] = room.origin;
  const box = roomBox(room);
  const panels: WallPanel[] = [];

  const sides: Array<{
    side: Side;
    /** Fixed coordinate of the wall plane. */
    fixed: number;
    /** Extent of the wall along its own axis. */
    from: number;
    to: number;
    rotationY: number;
    axis: 'x' | 'z';
  }> = [
    { side: 'north', fixed: box.minZ, from: box.minX, to: box.maxX, rotationY: 0, axis: 'x' },
    { side: 'south', fixed: box.maxZ, from: box.minX, to: box.maxX, rotationY: Math.PI, axis: 'x' },
    { side: 'west', fixed: box.minX, from: box.minZ, to: box.maxZ, rotationY: Math.PI / 2, axis: 'z' },
    { side: 'east', fixed: box.maxX, from: box.minZ, to: box.maxZ, rotationY: -Math.PI / 2, axis: 'z' },
  ];

  for (const side of sides) {
    /* Doorways on this wall, as spans along the wall's own axis. */
    const gaps = room.connections
      .filter((connection) => onSide(connection.position, side.fixed, side.axis))
      .map((connection) => {
        const centre = side.axis === 'x' ? connection.position[0] : connection.position[2];
        return {
          from: centre - connection.width / 2,
          to: centre + connection.width / 2,
          height: connection.height,
        };
      })
      .sort((a, b) => a.from - b.from);

    let cursor = side.from;
    for (const gap of gaps) {
      if (gap.from > cursor) {
        panels.push(panel(side, cursor, gap.from, oy, height, 0));
      }
      /* Lintel: the wall above the doorway. */
      if (gap.height < height) {
        panels.push(panel(side, gap.from, gap.to, oy + gap.height, height - gap.height, 0));
      }
      cursor = Math.max(cursor, gap.to);
    }
    if (cursor < side.to) {
      panels.push(panel(side, cursor, side.to, oy, height, 0));
    }
  }

  return {
    floor: { position: [ox, oy, oz], width, depth },
    ceiling: { position: [ox, oy + height, oz], width, depth },
    walls: panels,
  };
}

function onSide(position: Vec3, fixed: number, axis: 'x' | 'z'): boolean {
  const value = axis === 'x' ? position[2] : position[0];
  return Math.abs(value - fixed) < 0.35;
}

function panel(
  side: { fixed: number; rotationY: number; axis: 'x' | 'z' },
  from: number,
  to: number,
  baseY: number,
  height: number,
  _padding: number,
): WallPanel {
  const width = to - from;
  const centre = (from + to) / 2;
  const position: Vec3 =
    side.axis === 'x' ? [centre, baseY + height / 2, side.fixed] : [side.fixed, baseY + height / 2, centre];
  return { position, rotationY: side.rotationY, width, height };
}
