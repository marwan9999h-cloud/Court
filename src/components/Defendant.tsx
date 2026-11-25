import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCourtFonts } from './courtFonts';
import { shouldYieldHitPadding, useTapHandler } from './pointerGesture';

interface DefendantProps {
  name?: string;
  position?: [number, number, number];
  rotationY?: number;
  onInterrogate?: () => void;
  onHover?: (label: string | null) => void;
  reactKey?: number;
  striped?: boolean;
  info?: { age?: string; role?: string; status?: string; contradiction?: string };
}

export function Defendant({
  name = 'كريم المنصور',
  position = [0, 0, -4.5],
  rotationY = 0,
  onInterrogate,
  onHover,
  info,
  reactKey = 0,
  striped = true,
}: DefendantProps) {
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  const fontsReady = useCourtFonts();
  const tapHandlers = useTapHandler(onInterrogate);
  const viewportSize = useThree((s) => s.size);
  const isCompactViewport = viewportSize.width < 640 && viewportSize.height > viewportSize.width;
  const groupRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const timeRef = useRef<number>(0);
  const flinchRef = useRef<number>(1);

  useEffect(() => {
    if (reactKey > 0) flinchRef.current = 0;
  }, [reactKey]);

  const bubbleTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 640; c.height = 470;
    const x = c.getContext('2d')!;
    x.fillStyle = 'rgba(18,12,8,0.92)';
    x.strokeStyle = '#e2b442'; x.lineWidth = 8;
    const r = 36;
    x.beginPath();
    x.moveTo(r, 4); x.lineTo(640 - r, 4); x.quadraticCurveTo(636, 4, 636, r);
    x.lineTo(636, 466 - r); x.quadraticCurveTo(636, 466, 640 - r, 466);
    x.lineTo(r, 466); x.quadraticCurveTo(4, 466, 4, 466 - r);
    x.lineTo(4, r); x.quadraticCurveTo(4, 4, r, 4); x.closePath();
    x.fill(); x.stroke();
    x.direction = 'rtl'; x.textAlign = 'right';
    x.fillStyle = '#e2b442'; x.font = 'bold 30px "Cairo", "Amiri", sans-serif';
    x.fillText('المتهم', 600, 56);
    x.fillStyle = '#fff7e0'; x.font = 'bold 60px "Amiri", "Cairo", serif';
    x.fillText(name, 600, 126);
    x.font = '34px "Cairo", "Amiri", sans-serif'; x.fillStyle = '#e8dcc0';
    const rows = [info?.age ? 'العمر: ' + info.age : '', info?.role || '', info?.status ? 'الحالة: ' + info.status : ''];
    let y = 186;
    x.font = '32px "Cairo", "Amiri", sans-serif';
    for (const t of rows) {
      if (!t) continue;
      const words = t.split(' ');
      let line = '';
      const lines: string[] = [];
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (x.measureText(test).width > 560 && line) { lines.push(line); line = w; } else line = test;
      }
      if (line) lines.push(line);
      for (const l of lines) { x.fillText(l, 600, y); y += 44; }
      y += 10;
    }
    x.fillStyle = '#e2b442'; x.font = 'bold 30px "Cairo", "Amiri", sans-serif';
    x.fillText('انقر لبدء الاستجواب', 600, 440);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [name, info?.age, info?.role, info?.status, fontsReady]);

  const materials = useMemo(() => {
    const sc = document.createElement('canvas');
    sc.width = 8; sc.height = 64;
    const sx = sc.getContext('2d')!;
    for (let i = 0; i < 8; i++) { sx.fillStyle = i % 2 ? '#f5f5f0' : '#101010'; sx.fillRect(0, i * 8, 8, 8); }
    const stripeTex = new THREE.CanvasTexture(sc);
    stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping;
    stripeTex.repeat.set(1, 2);
    stripeTex.colorSpace = THREE.SRGBColorSpace;
    stripeTex.magFilter = THREE.NearestFilter;
    return {
      uniform: new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.8 }),
      suit: new THREE.MeshStandardMaterial({
        color: '#1c2430',
        roughness: 0.72,
        metalness: 0.08,
      }),
      shirt: new THREE.MeshStandardMaterial({
        color: '#e5e7eb',
        roughness: 0.55,
      }),
      skin: new THREE.MeshStandardMaterial({
        color: '#c9966b',
        roughness: 0.62,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: '#1f1610',
        roughness: 0.88,
      }),
      dockWood: new THREE.MeshStandardMaterial({
        color: '#3d2516',
        roughness: 0.44,
        metalness: 0.1,
      }),
      brassRailing: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        roughness: 0.28,
        metalness: 0.85,
      }),
      dockFloor: new THREE.MeshStandardMaterial({
        color: '#26160d',
        roughness: 0.6,
      }),
      highlightAura: new THREE.MeshBasicMaterial({
        color: '#e2b442',
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      }),
    };
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Subtle natural breathing (chest slight expansion & vertical oscillation)
    if (chestRef.current) {
      const breath = Math.sin(timeRef.current * 1.8) * 0.012;
      chestRef.current.scale.set(1 + breath * 0.5, 1 + breath * 0.8, 1 + breath);
      chestRef.current.position.y = 1.15 + breath * 0.2;
    }

    // Occasional subtle head shift / anxious looking towards the judge
    if (headRef.current) {
      const headSwayY = Math.sin(timeRef.current * 0.45) * 0.035 + Math.sin(timeRef.current * 1.1) * 0.015;
      const headSwayX = Math.cos(timeRef.current * 0.6) * 0.02;
      let flinchHead = 0;
      if (flinchRef.current < 1) {
        flinchRef.current = Math.min(1, flinchRef.current + delta / 0.9);
        flinchHead = Math.sin(Math.min(1, flinchRef.current * 1.6) * Math.PI) * 0.28;
      }
      headRef.current.rotation.y = headSwayY;
      headRef.current.rotation.x = headSwayX + flinchHead;
    }
    if (chestRef.current && flinchRef.current < 1) {
      chestRef.current.position.y += Math.sin(flinchRef.current * Math.PI) * 0.03;
    }
  });

  const bodyMat = striped ? materials.uniform : materials.suit;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      userData={{ interactiveTarget: true }}
      {...tapHandlers}
      onPointerOver={(e) => {
        if (shouldYieldHitPadding(e)) return;
        e.stopPropagation();
        hoveredRef.current = true;
        setHovered(true);
        onHover?.(`👤 المتهم: ${name} (انقر لبدء الاستجواب)`);
      }}
      onPointerOut={() => {
        if (!hoveredRef.current) return;
        hoveredRef.current = false;
        setHovered(false);
        onHover?.(null);
      }}
    >
      {/* 1. The Judicial Defendant Dock (Enclosed Wood & Brass Bar) */}
      <group position={[0, 0, 0]}>
        {/* Dock Platform Base */}
        <mesh position={[0, 0.08, 0]} material={materials.dockFloor}>
          <boxGeometry args={[1.6, 0.16, 1.2]} />
        </mesh>

        {/* Front Dock Balustrade / Barrier */}
        <mesh position={[0, 0.6, 0.52]} material={materials.dockWood} castShadow>
          <boxGeometry args={[1.5, 0.9, 0.08]} />
        </mesh>
        {/* Front Top Brass Handrail */}
        <mesh position={[0, 1.06, 0.52]} rotation={[0, 0, Math.PI / 2]} material={materials.brassRailing}>
          <cylinderGeometry args={[0.03, 0.03, 1.54, 12]} />
        </mesh>

        {/* Left Side Barrier */}
        <mesh position={[-0.72, 0.6, 0]} material={materials.dockWood} castShadow>
          <boxGeometry args={[0.08, 0.9, 1.0]} />
        </mesh>
        {/* Right Side Barrier */}
        <mesh position={[0.72, 0.6, 0]} material={materials.dockWood} castShadow>
          <boxGeometry args={[0.08, 0.9, 1.0]} />
        </mesh>

        {/* Dock Witness Microphone attached to rail */}
        <group position={[0.32, 1.06, 0.48]} rotation={[0.2, 0, 0]}>
          <mesh material={materials.brassRailing}>
            <cylinderGeometry args={[0.006, 0.006, 0.28, 8]} />
          </mesh>
          <mesh position={[0, 0.15, 0]} material={materials.dockWood}>
            <sphereGeometry args={[0.02, 8, 8]} />
          </mesh>
        </group>
      </group>

      {/* 2. Standing Defendant Character (Standing tall, attentive, slightly tense) */}
      <group position={[0, 0.16, 0]}>
        {/* Legs (Standing in trousers) */}
        <mesh position={[-0.14, 0.5, 0]} material={bodyMat}>
          <cylinderGeometry args={[0.075, 0.065, 0.9, 10]} />
        </mesh>
        <mesh position={[0.14, 0.5, 0]} material={bodyMat}>
          <cylinderGeometry args={[0.075, 0.065, 0.9, 10]} />
        </mesh>
        {/* Leather Shoes */}
        <mesh position={[-0.14, 0.05, 0.06]} material={materials.hair}>
          <boxGeometry args={[0.11, 0.09, 0.24]} />
        </mesh>
        <mesh position={[0.14, 0.05, 0.06]} material={materials.hair}>
          <boxGeometry args={[0.11, 0.09, 0.24]} />
        </mesh>

        {/* Torso & Chest Group (Animated breathing) */}
        <group ref={chestRef} position={[0, 1.15, 0]}>
          {/* Main Suit Jacket */}
          <mesh material={bodyMat} castShadow>
            <boxGeometry args={[0.48, 0.58, 0.26]} />
          </mesh>
          {/* Shirt Front Collar */}

          {/* Unbuttoned Top Collar & Neck base */}
          <mesh position={[0, 0.24, 0.1]} material={materials.skin}>
            <boxGeometry args={[0.08, 0.1, 0.04]} />
          </mesh>

          {/* Left Arm Resting on the Dock Rail */}
          <group position={[-0.28, 0.15, 0]} rotation={[0.45, 0.1, -0.1]}>
            <mesh position={[0, -0.2, 0]} material={bodyMat}>
              <cylinderGeometry args={[0.06, 0.055, 0.42, 8]} />
            </mesh>
            <mesh position={[0.04, -0.42, 0.18]} rotation={[0.8, 0, 0]} material={bodyMat}>
              <cylinderGeometry args={[0.052, 0.048, 0.38, 8]} />
            </mesh>
            <mesh position={[0.04, -0.56, 0.34]} material={materials.skin}>
              <sphereGeometry args={[0.045, 8, 8]} />
            </mesh>
          </group>

          {/* Right Arm Resting on the Dock Rail */}
          <group position={[0.28, 0.15, 0]} rotation={[0.45, -0.1, 0.1]}>
            <mesh position={[0, -0.2, 0]} material={bodyMat}>
              <cylinderGeometry args={[0.06, 0.055, 0.42, 8]} />
            </mesh>
            <mesh position={[-0.04, -0.42, 0.18]} rotation={[0.8, 0, 0]} material={bodyMat}>
              <cylinderGeometry args={[0.052, 0.048, 0.38, 8]} />
            </mesh>
            <mesh position={[-0.04, -0.56, 0.34]} material={materials.skin}>
              <sphereGeometry args={[0.045, 8, 8]} />
            </mesh>
          </group>
        </group>

        {/* Head & Neck (Animated subtle head gaze) */}
        <group ref={headRef} position={[0, 1.55, 0]}>
          {/* Neck */}
          <mesh position={[0, -0.06, 0]} material={materials.skin}>
            <cylinderGeometry args={[0.06, 0.07, 0.12, 10]} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.08, 0]} material={materials.skin} castShadow>
            <sphereGeometry args={[0.135, 16, 16]} />
          </mesh>
          {/* Hair */}
          <mesh position={[0, 0.14, -0.02]} material={materials.hair}>
            <sphereGeometry args={[0.142, 14, 14]} />
          </mesh>
          {/* Beard / Shadow on Jawline */}
          <mesh position={[0, 0.04, 0.06]} material={materials.hair}>
            <boxGeometry args={[0.16, 0.1, 0.12]} />
          </mesh>
        </group>
      </group>

      {/* Info bubble (scaled down & tucked cleanly inside 390x844 mobile portrait; desktop unchanged) */}
      <sprite
        position={[
          isCompactViewport
            ? position[0] < -0.5
              ? 0.92
              : position[0] > 0.5
                ? -0.92
                : 0
            : 0,
          isCompactViewport ? (Math.abs(position[0]) < 0.5 ? 2.22 : 2.08) : 2.14,
          0.2,
        ]}
        scale={isCompactViewport ? [0.8, 0.58, 1] : [1.18, 0.86, 1]}
      >
        <spriteMaterial map={bubbleTex} transparent depthWrite={false} />
      </sprite>

      {/* Subtle Hover Aura indicator when hovered */}
      {hovered && (
        <mesh position={[0, 1.0, 0.2]} material={materials.highlightAura}>
          <cylinderGeometry args={[0.7, 0.8, 2.0, 16]} />
        </mesh>
      )}

      {/* Invisible Hit Box tightened to dock/figure so it never blocks neighbouring witness */}
      <mesh position={[0, 0.95, 0.08]} visible={false} userData={{ isHitPadding: true }}>
        <boxGeometry args={[1.05, 1.88, 0.92]} />
      </mesh>
    </group>
  );
}

