'use client';

import { useMemo } from 'react';
import type { Room, RoomMaterial } from '@/domain';
import { buildRoomShell } from '../geometry';

/**
 * The architecture (§11). Dark concrete, warm limestone, graphite and black box, built
 * from the room's own dimensions so what you can see and where you can walk are derived
 * from one source.
 */
const SURFACES: Record<RoomMaterial, { wall: string; floor: string; ceiling: string; roughness: number; metalness: number }> = {
  'dark-concrete': { wall: '#1b1c1e', floor: '#121314', ceiling: '#141516', roughness: 0.92, metalness: 0.02 },
  'warm-limestone': { wall: '#2a2723', floor: '#171614', ceiling: '#1d1c19', roughness: 0.86, metalness: 0.03 },
  graphite: { wall: '#17181a', floor: '#0f1011', ceiling: '#121314', roughness: 0.8, metalness: 0.08 },
  'black-box': { wall: '#0a0a0b', floor: '#08080a', ceiling: '#08080a', roughness: 0.98, metalness: 0 },
  'polished-stone': { wall: '#232426', floor: '#0e0f10', ceiling: '#191a1c', roughness: 0.35, metalness: 0.15 },
};

export function RoomShell({ room, shadows }: { room: Room; shadows: boolean }) {
  const shell = useMemo(() => buildRoomShell(room), [room]);
  const surface = SURFACES[room.material];

  /* One lamp roughly every eight metres along the room's longest axis. */
  const lamps = useMemo<Array<[number, number, number]>>(() => {
    const [width, height, depth] = room.size;
    const [ox, oy, oz] = room.origin;
    const alongZ = depth >= width;
    const span = alongZ ? depth : width;
    const count = Math.max(1, Math.round(span / 8));
    const y = oy + height * 0.78;

    return Array.from({ length: count }, (_, index) => {
      const t = count === 1 ? 0.5 : (index + 0.5) / count;
      const offset = (t - 0.5) * span * 0.82;
      return alongZ ? [ox, y, oz + offset] : [ox + offset, y, oz];
    });
  }, [room]);

  const lampIntensity = room.material === 'black-box' ? 26 : 340;
  const lampReach = Math.max(room.size[0], room.size[2]) * 1.15;

  return (
    <group>
      <mesh
        position={shell.floor.position}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={shadows}
      >
        <planeGeometry args={[shell.floor.width, shell.floor.depth]} />
        {/* A floor with a little sheen carries the light down the long sightline. */}
        <meshStandardMaterial color={surface.floor} roughness={surface.roughness * 0.55} metalness={0.12} />
      </mesh>

      <mesh position={shell.ceiling.position} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[shell.ceiling.width, shell.ceiling.depth]} />
        <meshStandardMaterial color={surface.ceiling} roughness={0.98} metalness={0} />
      </mesh>

      {shell.walls.map((panel, index) => (
        <mesh
          key={`${room.slug}-wall-${index}`}
          position={panel.position}
          rotation={[0, panel.rotationY, 0]}
          receiveShadow={shadows}
        >
          <planeGeometry args={[panel.width, panel.height]} />
          <meshStandardMaterial
            color={surface.wall}
            roughness={surface.roughness}
            metalness={surface.metalness}
            side={2 /* THREE.DoubleSide — a visitor may see a wall from the doorway side */}
          />
        </mesh>
      ))}

      {/*
        Architectural light (§66).

        Three's lights are physical: a point light's contribution falls off with the
        square of distance, so a room this size needs light measured in the hundreds, not
        in single digits. Lamps are spaced along the room's long axis rather than hung as
        one bulb in the middle, which is what gives the Great Room its rhythm of pools and
        shadow instead of a single hot spot.
      */}
      <ambientLight intensity={room.ambientIntensity} color="#c8ccd2" />
      {lamps.map((lamp, index) => (
        <pointLight
          key={`${room.slug}-lamp-${index}`}
          position={lamp}
          intensity={lampIntensity}
          distance={lampReach}
          decay={2}
          color="#ffeeda"
          castShadow={shadows && index === 0}
        />
      ))}
      {/* A cool grazing fill from above keeps the concrete from going flat black. */}
      <hemisphereLight args={['#2a2e36', '#0b0b0c', room.material === 'black-box' ? 0.12 : 0.5]} />
    </group>
  );
}
