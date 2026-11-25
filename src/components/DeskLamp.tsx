import { useState, useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useTapHandler } from './pointerGesture';

interface DeskLampProps {
  position: [number, number, number];
  rotationY?: number;
  lampOn: boolean;
  onToggle: () => void;
  onHover: (label: string | null) => void;
  quality: 'high' | 'performance';
}

export function DeskLamp({
  position,
  rotationY = -0.4,
  lampOn,
  onToggle,
  onHover,
  quality,
}: DeskLampProps) {
  const [hovered, setHovered] = useState(false);
  const tapHandlers = useTapHandler(onToggle);

  const materials = useMemo(() => {
    return {
      brassBody: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        roughness: 0.22,
        metalness: 0.88,
      }),
      glassShade: new THREE.MeshStandardMaterial({
        color: lampOn ? '#1e7844' : '#1a4a2a',
        roughness: 0.18,
        metalness: 0.1,
        emissive: lampOn ? '#14532d' : '#000000',
        emissiveIntensity: lampOn ? 0.4 : 0,
      }),
      bulbOn: new THREE.MeshBasicMaterial({
        color: '#fffbeb',
      }),
    };
  }, [lampOn]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover(lampOn ? '💡 إطفاء مصباح المنصة' : '💡 تشغيل مصباح المنصة');
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover(null);
  };

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      {...tapHandlers}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Invisible enlarged hit target */}
      <mesh position={[0, 0.16, 0]} visible={false}>
        <boxGeometry args={[0.26, 0.35, 0.26]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 1. Heavy Weighted Base */}
      <mesh position={[0, 0.012, 0]} material={materials.brassBody} castShadow receiveShadow>
        <cylinderGeometry args={[0.065, 0.075, 0.024, 24]} />
      </mesh>
      <mesh position={[0, 0.025, 0]} material={materials.brassBody}>
        <cylinderGeometry args={[0.035, 0.06, 0.015, 24]} />
      </mesh>

      {/* 2. Upright Support Rod */}
      <mesh position={[0, 0.12, 0]} material={materials.brassBody} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.18, 12]} />
      </mesh>

      {/* 3. Curved Brass Shade Bracket */}
      <group position={[0, 0.22, 0.02]}>
        <mesh rotation={[Math.PI / 4, 0, 0]} material={materials.brassBody}>
          <cylinderGeometry args={[0.006, 0.006, 0.06, 8]} />
        </mesh>
      </group>

      {/* 4. Emerald Banker's Shade / Hood */}
      <group position={[0, 0.23, 0.05]} rotation={[-0.2, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={materials.glassShade} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.16, 16, 1, false, 0, Math.PI]} />
        </mesh>
        {/* Brass Shade Caps */}
        <mesh position={[-0.08, 0, 0]} material={materials.brassBody}>
          <sphereGeometry args={[0.012, 8, 8]} />
        </mesh>
        <mesh position={[0.08, 0, 0]} material={materials.brassBody}>
          <sphereGeometry args={[0.012, 8, 8]} />
        </mesh>

        {/* 5. Light Source from Bulb */}
        {lampOn && (
          <>
            {/* Small glowing bulb geometry */}
            <mesh position={[0, -0.015, 0]} material={materials.bulbOn}>
              <sphereGeometry args={[0.015, 8, 8]} />
            </mesh>

            {/* Warm localized desk light */}
            <pointLight
              position={[0, -0.04, 0]}
              color="#fff1c2"
              intensity={quality === 'high' ? 1.3 : 0.9}
              distance={1.4}
              decay={2}
              castShadow={quality === 'high'}
              shadow-mapSize-width={512}
              shadow-mapSize-height={512}
            />
          </>
        )}
      </group>

      {/* 6. Pull Chain */}
      <group position={[0.04, 0.16, 0.04]}>
        <mesh material={materials.brassBody}>
          <cylinderGeometry args={[0.0015, 0.0015, 0.08, 6]} />
        </mesh>
        <mesh position={[0, -0.04, 0]} material={materials.brassBody}>
          <sphereGeometry args={[0.004, 6, 6]} />
        </mesh>
      </group>
    </group>
  );
}

