import { useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type * as THREE from 'three';

export const TAP_MAX_DISTANCE_PX = 10;
export const TAP_MAX_DURATION_MS = 800;
const DRAG_SUPPRESS_CLICK_MS = 350;

interface ActivePointer {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  downTime: number;
  maxDist: number;
}

const activePointers = new Map<number, ActivePointer>();
let multiTouchInGesture = false;
let lastDragEndedAt = 0;

export function resetPointerGestureState(): void {
  activePointers.clear();
  multiTouchInGesture = false;
}

export function recordPointerDown(e: PointerEvent): void {
  // Idempotent if called twice for the same pointerId
  if (activePointers.has(e.pointerId)) return;

  // A mouse only has one physical cursor; clear any stale mouse entry if pointerup happened outside iframe
  if (e.pointerType === 'mouse') {
    for (const [id, ptr] of activePointers.entries()) {
      if (ptr.pointerType === 'mouse') {
        activePointers.delete(id);
      }
    }
  }

  if (activePointers.size === 0) {
    multiTouchInGesture = false;
  }

  activePointers.set(e.pointerId, {
    pointerId: e.pointerId,
    pointerType: e.pointerType || 'mouse',
    startX: e.clientX,
    startY: e.clientY,
    downTime: performance.now(),
    maxDist: 0,
  });

  if (activePointers.size > 1) {
    multiTouchInGesture = true;
  }
}

export function recordPointerMove(e: PointerEvent): void {
  const entry = activePointers.get(e.pointerId);
  if (!entry) return;
  const dist = Math.hypot(e.clientX - entry.startX, e.clientY - entry.startY);
  if (dist > entry.maxDist) {
    entry.maxDist = dist;
  }
}

export function recordPointerUp(e: PointerEvent): void {
  const entry = activePointers.get(e.pointerId);
  if (entry) {
    const dist = Math.hypot(e.clientX - entry.startX, e.clientY - entry.startY);
    if (dist > entry.maxDist) {
      entry.maxDist = dist;
    }
    if (entry.maxDist > TAP_MAX_DISTANCE_PX || multiTouchInGesture) {
      lastDragEndedAt = performance.now();
    }
    activePointers.delete(e.pointerId);
  }
  if (activePointers.size === 0) {
    multiTouchInGesture = false;
  }
}

export function recordPointerCancel(e: PointerEvent): void {
  if (activePointers.has(e.pointerId)) {
    lastDragEndedAt = performance.now();
    activePointers.delete(e.pointerId);
  }
  if (activePointers.size === 0) {
    multiTouchInGesture = false;
  }
}

export function wasRecentDrag(): boolean {
  if (multiTouchInGesture) return true;
  for (const ptr of activePointers.values()) {
    if (ptr.maxDist > TAP_MAX_DISTANCE_PX) return true;
  }
  return performance.now() - lastDragEndedAt < DRAG_SUPPRESS_CLICK_MS;
}

export function didDragExceedThreshold(pointerId: number, directDist: number): boolean {
  if (directDist > TAP_MAX_DISTANCE_PX) return true;
  if (multiTouchInGesture) return true;
  const entry = activePointers.get(pointerId);
  if (entry && entry.maxDist > TAP_MAX_DISTANCE_PX) return true;
  return false;
}

function isInsideInteractiveTarget(obj: THREE.Object3D | null): boolean {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if (cur.userData?.interactiveTarget) return true;
    cur = cur.parent;
  }
  return false;
}

/**
 * Ensures an invisible padding hit-box never intercepts a tap or hover
 * when an actual visible interactive mesh or info card is under the pointer.
 */
export function shouldYieldHitPadding(e: ThreeEvent<PointerEvent | MouseEvent>): boolean {
  if (!e.object?.userData?.isHitPadding) return false;
  return e.intersections.some((hit) => {
    if (hit.object === e.object) return false;
    if (hit.object.userData?.isHitPadding) return false;
    if (!hit.object.visible) return false;
    return isInsideInteractiveTarget(hit.object);
  });
}

/**
 * Per-object tap detector for R3F 3D meshes/groups:
 * - A tap is pointerdown -> pointerup on the SAME object with total movement <= 10px
 *   and duration <= 800ms (without requiring any pointermove events).
 * - Also supports plain click fallback (e.g. synthetic clicks) when no drag occurred.
 * - Camera drags > 10px never trigger a tap.
 */
export function useTapHandler(onTap?: () => void) {
  const downRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const lastHandledTapAtRef = useRef<number>(0);

  return {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (shouldYieldHitPadding(e)) return;
      e.stopPropagation();
      recordPointerDown(e.nativeEvent);
      downRef.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        time: performance.now(),
      };
    },

    onPointerUp: (e: ThreeEvent<PointerEvent>) => {
      if (shouldYieldHitPadding(e)) return;
      e.stopPropagation();
      const down = downRef.current;
      downRef.current = null;

      if (!down || down.pointerId !== e.pointerId) return;

      const dist = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const duration = performance.now() - down.time;
      const dragged = didDragExceedThreshold(e.pointerId, dist);

      recordPointerUp(e.nativeEvent);

      if (!dragged && duration <= TAP_MAX_DURATION_MS) {
        lastHandledTapAtRef.current = performance.now();
        onTap?.();
      } else {
        lastDragEndedAt = performance.now();
      }
    },

    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (shouldYieldHitPadding(e)) return;
      e.stopPropagation();
      // Ignore synthetic click immediately following a tap already handled in onPointerUp
      if (performance.now() - lastHandledTapAtRef.current < 300) {
        return;
      }
      if (wasRecentDrag()) {
        return;
      }
      if (typeof e.delta === 'number' && e.delta > TAP_MAX_DISTANCE_PX) {
        return;
      }
      onTap?.();
    },
  };
}
