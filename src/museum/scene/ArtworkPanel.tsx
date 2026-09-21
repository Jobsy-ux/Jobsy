'use client';

import { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { LightingProfile } from '@/domain';
import { FRAME_BODIES, frameBodyOffset } from '../frames';
import type { HungWork } from '../geometry';
import { useMediaState } from '../media/useMediaDirector';
import { useArtworkSurface } from './useArtworkSurface';

/** Lighting treatments describe the wall, never the artwork's own colour (§66). */
/*
 * Intensities are in physical units: a spot roughly three metres from the wall needs a
 * value in the low hundreds to read as a gallery light. A screen work is lit by itself
 * and gets none at all.
 */
const LIGHTING: Record<LightingProfile, { intensity: number; angle: number; penumbra: number; distance: number }> = {
  'wall-wash': { intensity: 260, angle: 0.66, penumbra: 0.92, distance: 13 },
  'gallery-spot': { intensity: 320, angle: 0.4, penumbra: 0.7, distance: 11 },
  'screen-emissive': { intensity: 0, angle: 0.4, penumbra: 1, distance: 0 },
  'ambient-only': { intensity: 0, angle: 0.4, penumbra: 1, distance: 0 },
  'black-box': { intensity: 70, angle: 0.34, penumbra: 0.96, distance: 8 },
  'daylight-void': { intensity: 200, angle: 0.8, penumbra: 1, distance: 16 },
};

export function ArtworkPanel({
  work,
  shadows,
  onSelect,
  onHover,
}: {
  work: HungWork;
  shadows: boolean;
  onSelect: (slug: string) => void;
  onHover: (slug: string | null) => void;
}) {
  const state = useMediaState(work.artwork.slug);
  const { texture, ready } = useArtworkSurface(work.artwork, state);
  /* The spotlight needs something to aim at. Created once per panel and positioned in
     the scene graph, rather than read from a ref while rendering. */
  const lightTarget = useMemo(() => new THREE.Object3D(), []);

  const frame = FRAME_BODIES[work.placement.frame];
  const light = LIGHTING[work.placement.lighting];

  /*
   * The artwork is rendered unlit and outside tone mapping. A gallery light falls on the
   * wall and the frame; it never touches the work's pixels, so what is on the wall is
   * exactly the file the artist made (§14, §66).
   */
  const material = useMemo(() => {
    const created = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      color: texture ? 0xffffff : 0x111114,
    });
    return created;
  }, [texture]);

  const [x, y, z] = work.position;
  const normal: [number, number] = [Math.sin(work.rotationY), Math.cos(work.rotationY)];

  return (
    <group>
      {frame ? (
        /*
         * A frame is modelled as a solid body larger than the work, so it has to sit
         * BEHIND the artwork surface: pushed back by half its own depth, it reads as a
         * border around a work that stands a few millimetres proud. Centre it on the
         * artwork instead and the frame's own front face hides the work completely.
         */
        <mesh
          position={[x - normal[0] * frameBodyOffset(frame), y, z - normal[1] * frameBodyOffset(frame)]}
          rotation={[0, work.rotationY, 0]}
          castShadow={shadows}
          receiveShadow={shadows}
        >
          <boxGeometry args={[work.width + frame.border * 2, work.height + frame.border * 2, frame.depth]} />
          <meshStandardMaterial color={frame.colour} metalness={frame.metalness} roughness={frame.roughness} />
        </mesh>
      ) : null}

      <mesh
        position={[x, y, z]}
        rotation={[0, work.rotationY, 0]}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onSelect(work.artwork.slug);
        }}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          onHover(work.artwork.slug);
        }}
        onPointerOut={() => onHover(null)}
      >
        {/* Geometry comes from the artwork's own aspect ratio; there is no other path. */}
        <planeGeometry args={[work.width, work.height]} />
        <primitive object={material} attach="material" />
      </mesh>

      {light.intensity > 0 && ready ? (
        <>
          <primitive object={lightTarget} position={[x, y, z]} />
          <spotLight
            position={[x + normal[0] * 2.6, y + work.height / 2 + 1.9, z + normal[1] * 2.6]}
            target={lightTarget}
            angle={light.angle}
            penumbra={light.penumbra}
            intensity={light.intensity}
            distance={light.distance}
            /* Neutral white. A coloured gallery light would recolour the wall around the
               work and change how the work reads (§66). */
            color="#fff6e9"
            castShadow={shadows}
          />
        </>
      ) : null}
    </group>
  );
}
