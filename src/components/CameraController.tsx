import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FileId, GamePhase } from '../types';
import {
  recordPointerDown,
  recordPointerMove,
  recordPointerUp,
  recordPointerCancel,
  resetPointerGestureState,
} from './pointerGesture';

interface CameraControllerProps {
  phase: GamePhase;
  activeFileId: FileId | null;
  isInterrogating?: boolean;
  isModalOpen?: boolean;
}

export function CameraController({
  phase,
  activeFileId,
  isInterrogating,
  isModalOpen = false,
}: CameraControllerProps) {
  const { camera, gl } = useThree();

  const isMenuMode =
    phase === 'MAIN_MENU' ||
    phase === 'SEASONS' ||
    phase === 'LEVELS' ||
    phase === 'CASE_BRIEF' ||
    phase === 'CASE_ARCHIVE' ||
    phase === 'HOW_TO_PLAY' ||
    phase === 'SETTINGS' ||
    phase === 'ABOUT' ||
    phase === 'CAREER_PROFILE' ||
    phase === 'LEVEL_COMPLETE';

  // Angle limits (in radians)
  // Horizontal: -35 deg to +35 deg
  const MIN_YAW = (-35 * Math.PI) / 180;
  const MAX_YAW = (35 * Math.PI) / 180;

  // Vertical: -45 deg to +20 deg
  const MIN_PITCH = (-45 * Math.PI) / 180;
  const MAX_PITCH = (20 * Math.PI) / 180;

  // Rotation angles
  const targetYaw = useRef<number>(0);
  const targetPitch = useRef<number>(-0.39);
  const currentYaw = useRef<number>(0);
  const currentPitch = useRef<number>(-0.39);

  const isDragging = useRef<boolean>(false);
  const activePointerId = useRef<number | null>(null);
  const previousPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const timeRef = useRef<number>(0);

  // Positions
  // Menu cinematic view: Grand court overview
  const menuPos = useRef(new THREE.Vector3(0.5, 1.7, 1.9));
  // Default Judge Eye Position (fixed seat position, close to the desk so papers stay legible)
  const defaultPos = useRef(new THREE.Vector3(0, 1.56, 0.82));
  // Close-up reading position when inspecting a dossier
  const readingPos = useRef(new THREE.Vector3(0, 1.15, 0.42));
  // Interrogation direct focus position
  const interrogatePos = useRef(new THREE.Vector3(0, 1.4, 0.65));

  const currentPos = useRef(new THREE.Vector3().copy(isMenuMode ? menuPos.current : defaultPos.current));
  const lookTarget = useRef(new THREE.Vector3(0, 1.0, -3.5));

  // Reset view whenever a trial (re)starts
  useEffect(() => {
    if (phase === 'COURTROOM') {
      targetYaw.current = 0;
      targetPitch.current = -0.39;
      currentYaw.current = 0;
      currentPitch.current = -0.39;
      isDragging.current = false;
      activePointerId.current = null;
      resetPointerGestureState();
    }
  }, [phase]);

  // Attach touch and pointer gesture listeners only in Courtroom mode
  useEffect(() => {
    if (isMenuMode || isModalOpen || activeFileId !== null || isInterrogating) {
      isDragging.current = false;
      activePointerId.current = null;
      resetPointerGestureState();
      return;
    }

    const dom = gl.domElement;
    if (!dom) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      recordPointerDown(e);
      if (activePointerId.current === null) {
        activePointerId.current = e.pointerId;
        isDragging.current = true;
        previousPointer.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      recordPointerMove(e);
      if (!isDragging.current || activePointerId.current !== e.pointerId) return;
      if (e.pointerType === 'mouse' && (e.buttons & 1) === 0) {
        isDragging.current = false;
        activePointerId.current = null;
        return;
      }
      if (
        Math.abs(e.clientX - previousPointer.current.x) > 120 ||
        Math.abs(e.clientY - previousPointer.current.y) > 120
      ) {
        previousPointer.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const deltaX = e.clientX - previousPointer.current.x;
      const deltaY = e.clientY - previousPointer.current.y;
      previousPointer.current = { x: e.clientX, y: e.clientY };

      const sensitivity = e.pointerType === 'touch' ? 0.0028 : 0.0022;

      targetYaw.current = THREE.MathUtils.clamp(
        targetYaw.current - deltaX * sensitivity,
        MIN_YAW,
        MAX_YAW,
      );

      targetPitch.current = THREE.MathUtils.clamp(
        targetPitch.current + deltaY * sensitivity,
        MIN_PITCH,
        MAX_PITCH,
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      recordPointerUp(e);
      if (activePointerId.current === e.pointerId) {
        isDragging.current = false;
        activePointerId.current = null;
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      recordPointerCancel(e);
      if (activePointerId.current === e.pointerId) {
        isDragging.current = false;
        activePointerId.current = null;
      }
    };

    const onWindowBlur = () => {
      isDragging.current = false;
      activePointerId.current = null;
      resetPointerGestureState();
    };

    dom.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });
    window.addEventListener('blur', onWindowBlur);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('blur', onWindowBlur);
      resetPointerGestureState();
    };
  }, [
    gl.domElement,
    isMenuMode,
    isModalOpen,
    activeFileId,
    isInterrogating,
    MIN_YAW,
    MAX_YAW,
    MIN_PITCH,
    MAX_PITCH,
  ]);

  useFrame((state, delta) => {
    timeRef.current += delta;

    if (isMenuMode) {
      // Cinematic slow gentle camera pan
      const destPos = menuPos.current;
      currentPos.current.lerp(destPos, Math.min(1, delta * 2.5));
      camera.position.copy(currentPos.current);

      const subtleYaw = Math.sin(timeRef.current * 0.25) * 0.04 - 0.06;
      const subtlePitch = Math.cos(timeRef.current * 0.3) * 0.02 - 0.12;

      const targetX = currentPos.current.x + 4.0 * Math.sin(subtleYaw);
      const targetY = currentPos.current.y + 4.0 * Math.sin(subtlePitch);
      const targetZ = currentPos.current.z - 4.0 * Math.cos(subtleYaw);

      lookTarget.current.set(targetX, targetY, targetZ);
      camera.lookAt(lookTarget.current);
      return;
    }

    const isReading = activeFileId !== null;
    const destPos = isReading
      ? readingPos.current
      : isInterrogating
      ? interrogatePos.current
      : defaultPos.current;

    // Smooth position interpolation
    currentPos.current.lerp(destPos, Math.min(1, delta * 3.8));
    camera.position.copy(currentPos.current);

    // Natural subtle breathing sway when not actively inspecting close-up
    const swayYaw = isReading ? 0 : Math.sin(timeRef.current * 0.75) * 0.0012;
    const swayPitch = isReading ? 0 : Math.cos(timeRef.current * 1.05) * 0.0015;

    // Smooth angle interpolation (lerp damping)
    const smoothFactor = Math.min(1, delta * 7.5);
    currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw.current, smoothFactor);
    currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, targetPitch.current, smoothFactor);

    const effYaw = isReading ? 0 : currentYaw.current + swayYaw;
    const effPitch = isReading ? -0.42 : currentPitch.current + swayPitch;

    // Compute look-at point from camera eye position and spherical rotation
    const distance = 4.0;
    const cosPitch = Math.cos(effPitch);
    const sinPitch = Math.sin(effPitch);
    const sinYaw = Math.sin(effYaw);
    const cosYaw = Math.cos(effYaw);

    const targetX = currentPos.current.x + distance * sinYaw * cosPitch;
    const targetY = currentPos.current.y + distance * sinPitch;
    const targetZ = currentPos.current.z - distance * cosYaw * cosPitch;

    lookTarget.current.set(targetX, targetY, targetZ);
    camera.lookAt(lookTarget.current);
  });

  return null;
}


