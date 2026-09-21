/**
 * Movement through the building: where a visitor may stand, how they cross between
 * rooms, and how a blocked step slides along a wall instead of stopping dead.
 *
 * Pure functions over room records, deliberately free of Three.js so the movement model
 * is testable and identical in every control scheme (§13).
 */
import type { Room } from '@/domain';
import { isInside, roomBox, type Box, type Vec3 } from './geometry';

/** How close a visitor may get to a wall. Keeps the camera out of the plaster. */
export const WALL_MARGIN = 0.55;

export interface NavigationMesh {
  /** One box per room, inset by the wall margin. */
  rooms: Array<{ slug: string; box: Box }>;
  /** Short connector boxes spanning each doorway, so thresholds are walkable. */
  portals: Array<{ box: Box; between: [string, string] }>;
}

export function buildNavigationMesh(rooms: readonly Room[]): NavigationMesh {
  const meshRooms = rooms.map((room) => {
    const box = roomBox(room);
    return {
      slug: room.slug,
      box: {
        minX: box.minX + WALL_MARGIN,
        maxX: box.maxX - WALL_MARGIN,
        minZ: box.minZ + WALL_MARGIN,
        maxZ: box.maxZ - WALL_MARGIN,
      },
    };
  });

  const portals: NavigationMesh['portals'] = [];
  const seen = new Set<string>();

  for (const room of rooms) {
    for (const connection of room.connections) {
      const key = [room.slug, connection.toRoomSlug].sort().join('→');
      if (seen.has(key)) continue;
      seen.add(key);

      const other = rooms.find((candidate) => candidate.slug === connection.toRoomSlug);
      if (!other) continue;

      /* A doorway is thin across the boundary and as wide as the opening along it. */
      const acrossX = Math.abs(other.origin[0] - room.origin[0]) > Math.abs(other.origin[2] - room.origin[2]);
      const half = connection.width / 2;
      const depth = WALL_MARGIN + 0.8;
      const [px, , pz] = connection.position;

      portals.push({
        box: acrossX
          ? { minX: px - depth, maxX: px + depth, minZ: pz - half, maxZ: pz + half }
          : { minX: px - half, maxX: px + half, minZ: pz - depth, maxZ: pz + depth },
        between: [room.slug, connection.toRoomSlug],
      });
    }
  }

  return { rooms: meshRooms, portals };
}

/** Is this point somewhere a visitor may stand? */
export function isNavigable(mesh: NavigationMesh, x: number, z: number): boolean {
  for (const room of mesh.rooms) if (isInside(room.box, x, z)) return true;
  for (const portal of mesh.portals) if (isInside(portal.box, x, z)) return true;
  return false;
}

/**
 * Resolves a step. A move into a wall is not cancelled — the visitor slides along it, the
 * way a person walking a gallery does. Nothing here can eject someone from the building.
 */
export function resolveStep(
  mesh: NavigationMesh,
  from: { x: number; z: number },
  to: { x: number; z: number },
): { x: number; z: number } {
  if (isNavigable(mesh, to.x, to.z)) return to;
  if (isNavigable(mesh, to.x, from.z)) return { x: to.x, z: from.z };
  if (isNavigable(mesh, from.x, to.z)) return { x: from.x, z: to.z };
  return from;
}

/** Which room a point is in, if any. Portals belong to neither until you are through. */
export function roomAt(mesh: NavigationMesh, x: number, z: number): string | null {
  for (const room of mesh.rooms) if (isInside(room.box, x, z)) return room.slug;
  return null;
}

/** Nearest navigable point, used to recover a camera that has ended up nowhere valid. */
export function nearestNavigablePoint(
  mesh: NavigationMesh,
  x: number,
  z: number,
): { x: number; z: number; roomSlug: string } {
  let best = { x, z, roomSlug: mesh.rooms[0]?.slug ?? '', distance: Number.POSITIVE_INFINITY };
  for (const room of mesh.rooms) {
    const clampedX = Math.min(Math.max(x, room.box.minX), room.box.maxX);
    const clampedZ = Math.min(Math.max(z, room.box.minZ), room.box.maxZ);
    const distance = Math.hypot(clampedX - x, clampedZ - z);
    if (distance < best.distance) best = { x: clampedX, z: clampedZ, roomSlug: room.slug, distance };
  }
  return { x: best.x, z: best.z, roomSlug: best.roomSlug };
}

/* ------------------------------------------------------------------ movement */

export interface MovementState {
  position: Vec3;
  heading: number;
  pitch: number;
  velocity: [number, number];
}

/** Walking pace, with the acceleration of a person rather than a game character (§13). */
export const WALK_SPEED = 2.6;
const ACCELERATION = 11;
const DAMPING = 9;
export const EYE_HEIGHT = 1.65;
export const MAX_PITCH = Math.PI / 2 - 0.08;

/**
 * Advances movement by one frame. `input` is a normalised intent: forward/strafe in
 * [-1, 1]. Acceleration and damping give the gentle start and settle the brief asks for,
 * with no sense of momentum sliding.
 */
export function stepMovement(
  mesh: NavigationMesh,
  state: MovementState,
  input: { forward: number; strafe: number },
  delta: number,
): MovementState {
  const clampedDelta = Math.min(delta, 0.05);
  const sin = Math.sin(state.heading);
  const cos = Math.cos(state.heading);

  /* forward = (−sin h, −cos h); strafe is its right-hand perpendicular. */
  const desiredX = (-sin * input.forward + cos * input.strafe) * WALK_SPEED;
  const desiredZ = (-cos * input.forward - sin * input.strafe) * WALK_SPEED;

  const blend = 1 - Math.exp(-(input.forward || input.strafe ? ACCELERATION : DAMPING) * clampedDelta);
  const vx = state.velocity[0] + (desiredX - state.velocity[0]) * blend;
  const vz = state.velocity[1] + (desiredZ - state.velocity[1]) * blend;

  const from = { x: state.position[0], z: state.position[2] };
  const resolved = resolveStep(mesh, from, { x: from.x + vx * clampedDelta, z: from.z + vz * clampedDelta });

  return {
    position: [resolved.x, state.position[1], resolved.z],
    heading: state.heading,
    pitch: state.pitch,
    velocity: [resolved.x === from.x ? 0 : vx, resolved.z === from.z ? 0 : vz],
  };
}

/** Shortest signed angular difference, so a turn never takes the long way round. */
export function shortestAngle(from: number, to: number): number {
  let difference = (to - from) % (Math.PI * 2);
  if (difference > Math.PI) difference -= Math.PI * 2;
  if (difference < -Math.PI) difference += Math.PI * 2;
  return difference;
}

/** Eased interpolation used by guided transitions — slow in, slow out (§97). */
export function easeArchitectural(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2;
}
