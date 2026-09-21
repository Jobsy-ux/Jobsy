'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../geometry';
import {
  EYE_HEIGHT,
  MAX_PITCH,
  buildNavigationMesh,
  easeArchitectural,
  isNavigable,
  nearestNavigablePoint,
  roomAt,
  shortestAngle,
  stepMovement,
  type MovementState,
  type NavigationMesh,
} from '../navigation';
import type { Room } from '@/domain';

export interface NavigatorHandle {
  goTo(position: Vec3, heading: number): void;
}

/**
 * Movement (§13).
 *
 * One movement model, three ways to drive it:
 *   · desktop — WASD / arrows, pointer-lock mouse-look, and click-to-move for anyone who
 *     would rather not hold a key down. No gaming familiarity is assumed.
 *   · touch — drag to look, tap the floor to walk. Not a WASD pad drawn on glass.
 *   · guided — free movement is off; the visitor is carried between authored stops.
 *
 * Every step goes through the same navigation mesh, so no control scheme can walk
 * through a wall or leave the building.
 */
export function Navigator({
  rooms,
  mode,
  initialPosition,
  initialHeading,
  initialPitch = 0,
  target,
  onRoomChange,
  onPose,
  onFloorTap,
}: {
  rooms: readonly Room[];
  mode: 'free' | 'guided';
  initialPosition: Vec3;
  initialHeading: number;
  initialPitch?: number;
  /** Guided destination, or a transport request from a deep link (§54). */
  target: { position: Vec3; heading: number; token: number } | null;
  onRoomChange: (roomSlug: string) => void;
  onPose: (pose: { position: Vec3; heading: number; pitch: number }) => void;
  onFloorTap?: () => void;
}) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const mesh: NavigationMesh = useMemo(() => buildNavigationMesh(rooms), [rooms]);

  const movement = useRef<MovementState>({
    position: initialPosition,
    heading: initialHeading,
    pitch: initialPitch,
    velocity: [0, 0],
  });
  const keys = useRef(new Set<string>());
  const glide = useRef<{ x: number; z: number } | null>(null);
  const transition = useRef<{
    from: MovementState;
    to: { position: Vec3; heading: number };
    elapsed: number;
    duration: number;
  } | null>(null);
  const lastRoom = useRef<string | null>(null);
  const reportTimer = useRef(0);
  const lastTargetToken = useRef<number | null>(null);

  /* ---------------------------------------------------------------- keyboard */
  useEffect(() => {
    if (mode !== 'free') return;
    const down = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (MOVEMENT_KEYS.has(key)) {
        keys.current.add(key);
        glide.current = null;
        if (key.startsWith('arrow')) event.preventDefault();
      }
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const blur = () => keys.current.clear();

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [mode]);

  /* ------------------------------------------------------- look: mouse and touch */
  useEffect(() => {
    const canvas = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let movedDistance = 0;

    const look = (dx: number, dy: number, sensitivity: number) => {
      movement.current.heading -= dx * sensitivity;
      movement.current.pitch = Math.min(
        MAX_PITCH,
        Math.max(-MAX_PITCH, movement.current.pitch - dy * sensitivity),
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      if (mode !== 'free') return;
      dragging = true;
      movedDistance = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (document.pointerLockElement === canvas) {
        look(event.movementX, event.movementY, 0.0022);
        return;
      }
      if (!dragging || mode !== 'free') return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      movedDistance += Math.hypot(dx, dy);
      look(dx, dy, 0.004);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      if (mode !== 'free' || movedDistance > 6) return;

      /* A tap that did not drag is a request to walk somewhere (§13). */
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(ndc, camera);
      const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(floor, hit)) return;
      if (!isNavigable(mesh, hit.x, hit.z)) return;
      glide.current = { x: hit.x, z: hit.z };
      onFloorTap?.();
    };

    /* Pointer lock is offered, never required: it is the smoothest way to look around
       on a desktop, and Escape always gives it back. */
    const onDoubleClick = () => {
      if (mode === 'free' && !window.matchMedia('(pointer: coarse)').matches) {
        void canvas.requestPointerLock?.();
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('dblclick', onDoubleClick);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('dblclick', onDoubleClick);
    };
  }, [camera, gl, mesh, mode, onFloorTap]);

  /* ------------------------------------------------------------- transitions */
  useEffect(() => {
    if (!target || target.token === lastTargetToken.current) return;
    lastTargetToken.current = target.token;
    transition.current = {
      from: { ...movement.current, position: [...movement.current.position] as Vec3 },
      to: { position: target.position, heading: target.heading },
      elapsed: 0,
      /* Reduced motion gets an instant cut rather than a camera move it did not ask for (§64). */
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.001 : 1.5,
    };
    glide.current = null;
  }, [target]);

  /* ------------------------------------------------------------------- frame */
  useFrame((_, delta) => {
    const state = movement.current;

    if (transition.current) {
      const tween = transition.current;
      tween.elapsed += delta;
      const t = easeArchitectural(tween.elapsed / tween.duration);
      state.position = [
        lerp(tween.from.position[0], tween.to.position[0], t),
        EYE_HEIGHT,
        lerp(tween.from.position[2], tween.to.position[2], t),
      ];
      state.heading = tween.from.heading + shortestAngle(tween.from.heading, tween.to.heading) * t;
      state.pitch = lerp(tween.from.pitch, 0, t);
      state.velocity = [0, 0];
      if (tween.elapsed >= tween.duration) transition.current = null;
    } else if (mode === 'free') {
      let forward = 0;
      let strafe = 0;
      if (keys.current.has('w') || keys.current.has('arrowup')) forward += 1;
      if (keys.current.has('s') || keys.current.has('arrowdown')) forward -= 1;
      if (keys.current.has('d') || keys.current.has('arrowright')) strafe += 1;
      if (keys.current.has('a') || keys.current.has('arrowleft')) strafe -= 1;

      if (forward === 0 && strafe === 0 && glide.current) {
        /* Walk to the tapped point, turning toward it as a person would. */
        const dx = glide.current.x - state.position[0];
        const dz = glide.current.z - state.position[2];
        const distance = Math.hypot(dx, dz);
        if (distance < 0.25) {
          glide.current = null;
        } else {
          const desiredHeading = Math.atan2(-dx, -dz);
          state.heading += shortestAngle(state.heading, desiredHeading) * Math.min(1, delta * 3.2);
          forward = Math.min(1, distance / 2);
        }
      }

      const next = stepMovement(mesh, state, { forward, strafe }, delta);
      movement.current = { ...next, heading: state.heading, pitch: state.pitch };
    }

    const current = movement.current;

    /* A camera that has ended up outside the building is walked back in rather than
       left stranded (§85). */
    if (!isNavigable(mesh, current.position[0], current.position[2])) {
      const recovered = nearestNavigablePoint(mesh, current.position[0], current.position[2]);
      current.position = [recovered.x, EYE_HEIGHT, recovered.z];
    }

    camera.position.set(current.position[0], EYE_HEIGHT, current.position[2]);
    camera.rotation.set(current.pitch, current.heading, 0, 'YXZ');

    const room = roomAt(mesh, current.position[0], current.position[2]);
    if (room && room !== lastRoom.current) {
      lastRoom.current = room;
      onRoomChange(room);
    }

    reportTimer.current += delta;
    if (reportTimer.current > 0.6) {
      reportTimer.current = 0;
      onPose({ position: current.position, heading: current.heading, pitch: current.pitch });
    }
  });

  return null;
}

const MOVEMENT_KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}
