import { useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCourtFonts } from './courtFonts';
import { shouldYieldHitPadding, useTapHandler } from './pointerGesture';

interface WitnessProps {
  name: string;
  position?: [number, number, number];
  rotationY?: number;
  info?: { age?: string; role?: string; status?: string };
  onTestify?: () => void;
  onHover?: (label: string | null) => void;
}

export function Witness({
  name,
  position = [2.55, 0, -5.55],
  rotationY = -0.1,
  info,
  onTestify,
  onHover,
}: WitnessProps) {
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  const fontsReady = useCourtFonts();
  const tapHandlers = useTapHandler(onTestify);
  const viewportSize = useThree((s) => s.size);
  const isCompactViewport = viewportSize.width < 640 && viewportSize.height > viewportSize.width;

  const bubbleTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 640; c.height = 400;
    const x = c.getContext('2d')!;
    x.fillStyle = 'rgba(18,12,8,0.92)';
    x.strokeStyle = '#e2b442'; x.lineWidth = 8;
    const r = 36;
    x.beginPath();
    x.moveTo(r, 4); x.lineTo(640 - r, 4); x.quadraticCurveTo(636, 4, 636, r);
    x.lineTo(636, 396 - r); x.quadraticCurveTo(636, 396, 640 - r, 396);
    x.lineTo(r, 396); x.quadraticCurveTo(4, 396, 4, 396 - r);
    x.lineTo(4, r); x.quadraticCurveTo(4, 4, r, 4); x.closePath();
    x.fill(); x.stroke();
    x.direction = 'rtl'; x.textAlign = 'right';
    x.fillStyle = '#e2b442'; x.font = 'bold 30px "Cairo", "Amiri", sans-serif';
    x.fillText('الشاهد', 600, 56);
    x.fillStyle = '#fff7e0'; x.font = 'bold 56px "Amiri", "Cairo", serif';
    x.fillText(name, 600, 124);
    x.fillStyle = '#e8dcc0'; x.font = '32px "Cairo", "Amiri", sans-serif';
    const rows = [info?.role || '', info?.age ? 'العمر: ' + info.age : ''];
    let y = 182;
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
      for (const l of lines) { x.fillText(l, 600, y); y += 42; }
      y += 8;
    }
    x.fillStyle = '#e2b442'; x.font = 'bold 30px "Cairo", "Amiri", sans-serif';
    x.fillText('انقر لسماع الشهادة', 600, 372);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [name, info?.age, info?.role, fontsReady]);

  const materials = useMemo(() => ({
    uniform: new THREE.MeshStandardMaterial({ color: '#26455e', roughness: 0.7 }),
    shirt: new THREE.MeshStandardMaterial({ color: '#dfe5ea', roughness: 0.55 }),
    skin: new THREE.MeshStandardMaterial({ color: '#b07d4b', roughness: 0.62 }),
    hair: new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.85 }),
    wood: new THREE.MeshStandardMaterial({ color: '#3d2516', roughness: 0.44, metalness: 0.1 }),
    brass: new THREE.MeshStandardMaterial({ color: '#d4af37', roughness: 0.28, metalness: 0.85 }),
    highlightAura: new THREE.MeshBasicMaterial({ color: '#e2b442', transparent: true, opacity: 0.12, side: THREE.BackSide }),
  }), []);

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      userData={{ interactiveTarget: true }}
      {...tapHandlers}
      onPointerOver={(e) => {
        if (shouldYieldHitPadding(e)) return;
        e.stopPropagation();
        hoveredRef.current = true;
        setHovered(true);
        onHover?.(`⭐ الشاهد: ${name} (انقر لسماع الشهادة)`);
      }}
      onPointerOut={() => {
        if (!hoveredRef.current) return;
        hoveredRef.current = false;
        setHovered(false);
        onHover?.(null);
      }}
    >
      {/* Small witness platform with front wooden rail */}
      <mesh position={[0, 0.05, 0]} material={materials.wood} receiveShadow>
        <boxGeometry args={[1.1, 0.1, 0.9]} />
      </mesh>
      <mesh position={[0, 0.55, 0.42]} material={materials.wood} castShadow>
        <boxGeometry args={[1.05, 0.8, 0.07]} />
      </mesh>
      <mesh position={[0, 0.97, 0.42]} rotation={[0, 0, Math.PI / 2]} material={materials.brass}>
        <cylinderGeometry args={[0.025, 0.025, 1.08, 12]} />
      </mesh>

      {/* Standing night-guard witness figure */}
      <group position={[0, 0.1, 0]}>
        {/* Legs */}
        <mesh position={[-0.13, 0.5, 0]} material={materials.uniform}>
          <cylinderGeometry args={[0.075, 0.065, 0.9, 10]} />
        </mesh>
        <mesh position={[0.13, 0.5, 0]} material={materials.uniform}>
          <cylinderGeometry args={[0.075, 0.065, 0.9, 10]} />
        </mesh>
        {/* Shoes */}
        <mesh position={[-0.13, 0.05, 0.05]} material={materials.hair}>
          <boxGeometry args={[0.11, 0.09, 0.22]} />
        </mesh>
        <mesh position={[0.13, 0.05, 0.05]} material={materials.hair}>
          <boxGeometry args={[0.11, 0.09, 0.22]} />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 1.14, 0]} material={materials.uniform} castShadow>
          <boxGeometry args={[0.46, 0.56, 0.25]} />
        </mesh>
        {/* Shirt chest patch */}
        <mesh position={[0, 1.2, 0.12]} material={materials.shirt}>
          <boxGeometry args={[0.16, 0.2, 0.03]} />
        </mesh>
        {/* Guard badge */}
        <mesh position={[0.13, 1.26, 0.135]} rotation={[Math.PI / 2, 0, 0]} material={materials.brass}>
          <cylinderGeometry args={[0.025, 0.025, 0.012, 10]} />
        </mesh>
        {/* Arms held at the sides */}
        <mesh position={[-0.29, 1.05, 0]} rotation={[0, 0, 0.08]} material={materials.uniform}>
          <cylinderGeometry args={[0.055, 0.05, 0.52, 8]} />
        </mesh>
        <mesh position={[0.29, 1.05, 0]} rotation={[0, 0, -0.08]} material={materials.uniform}>
          <cylinderGeometry args={[0.055, 0.05, 0.52, 8]} />
        </mesh>
        <mesh position={[-0.31, 0.76, 0]} material={materials.skin}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
        <mesh position={[0.31, 0.76, 0]} material={materials.skin}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
        {/* Neck & head */}
        <mesh position={[0, 1.48, 0]} material={materials.skin}>
          <cylinderGeometry args={[0.055, 0.065, 0.12, 10]} />
        </mesh>
        <mesh position={[0, 1.62, 0]} material={materials.skin} castShadow>
          <sphereGeometry args={[0.13, 14, 14]} />
        </mesh>
        {/* Guard cap */}
        <mesh position={[0, 1.74, 0]} material={materials.uniform}>
          <cylinderGeometry args={[0.145, 0.15, 0.07, 14]} />
        </mesh>
        <mesh position={[0, 1.705, 0.12]} material={materials.hair}>
          <boxGeometry args={[0.2, 0.02, 0.1]} />
        </mesh>
      </group>

      {/* Info bubble (compact & tucked slightly on mobile portrait; desktop unchanged) */}
      <sprite
        position={[
          isCompactViewport ? -0.32 : 0,
          isCompactViewport ? 2.08 : 2.14,
          0.2,
        ]}
        scale={isCompactViewport ? [0.78, 0.54, 1] : [1.18, 0.78, 1]}
      >
        <spriteMaterial map={bubbleTex} transparent depthWrite={false} />
      </sprite>

      {/* Hover aura */}
      {hovered && (
        <mesh position={[0, 1.0, 0.2]} material={materials.highlightAura}>
          <cylinderGeometry args={[0.7, 0.8, 2.0, 16]} />
        </mesh>
      )}

      {/* Invisible generous hit box covering figure & info card */}
      <mesh position={[0, 1.15, 0.12]} visible={false} userData={{ isHitPadding: true }}>
        <boxGeometry args={[1.25, 2.3, 1.0]} />
      </mesh>
    </group>
  );
}
