import React, { useState, useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { getNotesPaperTexture } from './paperTextures';

interface NotesPaperProps {
  position: [number, number, number];
  rotationY?: number;
  onSelect: () => void;
  onHover: (label: string | null) => void;
}

export function NotesPaper({
  position,
  rotationY = 0.15,
  onSelect,
  onHover,
}: NotesPaperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(() => getNotesPaperTexture(), []);

  const materials = useMemo(() => {
    return {
      printedPaper: new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.85,
        metalness: 0.0,
      }),
      paperStack: new THREE.MeshStandardMaterial({
        color: '#f4efe4',
        roughness: 0.9,
      }),
      clipBrass: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        roughness: 0.25,
        metalness: 0.85,
      }),
      fountainPen: new THREE.MeshStandardMaterial({
        color: '#1a1917',
        roughness: 0.25,
        metalness: 0.7,
      }),
      inkwellCrystal: new THREE.MeshStandardMaterial({
        color: '#182026',
        roughness: 0.2,
        metalness: 0.4,
      }),
    };
  }, [texture]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = position[1] + (hovered ? 0.024 : 0);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, Math.min(1, delta * 12));

    const targetRotX = hovered ? -0.06 : 0;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, Math.min(1, delta * 12));
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover('📝 ملاحظات القضية (مفكرة القاضي — انقر للقراءة)');
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  const padWidth = 0.24;
  const padHeight = 0.32;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* 1. Large Invisible Hit-Box */}
      <mesh position={[0, 0.04, 0]} visible={false}>
        <boxGeometry args={[padWidth * 1.4, 0.16, padHeight * 1.4]} />
      </mesh>

      {/* 2. Paper Stack */}
      <mesh position={[0, 0.006, 0]} material={materials.paperStack} castShadow receiveShadow>
        <boxGeometry args={[padWidth, 0.012, padHeight]} />
      </mesh>

      {/* 3. Top Printed Judicial Notes Page */}
      <mesh position={[0, 0.013, 0]} material={materials.printedPaper} castShadow>
        <boxGeometry args={[padWidth, 0.002, padHeight]} />
      </mesh>

      {/* 4. Top Brass Binder Clip */}
      <mesh position={[0, 0.016, -padHeight / 2 + 0.015]} material={materials.clipBrass}>
        <boxGeometry args={[0.06, 0.006, 0.018]} />
      </mesh>

      {/* 5. Crystal Inkwell beside pad */}
      <mesh position={[0.15, 0.02, -0.08]} material={materials.inkwellCrystal} castShadow>
        <cylinderGeometry args={[0.025, 0.028, 0.04, 12]} />
      </mesh>
      <mesh position={[0.15, 0.042, -0.08]} material={materials.clipBrass}>
        <cylinderGeometry args={[0.016, 0.016, 0.008, 12]} />
      </mesh>

      {/* 6. Fountain Pen resting beside notepad */}
      <group position={[0.15, 0.014, 0.06]} rotation={[0, -0.15, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.fountainPen}>
          <cylinderGeometry args={[0.004, 0.005, 0.15, 12]} />
        </mesh>
        <mesh position={[0, 0, 0.075]} rotation={[-Math.PI / 2, 0, 0]} material={materials.clipBrass}>
          <coneGeometry args={[0.0045, 0.022, 8]} />
        </mesh>
        <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]} material={materials.clipBrass}>
          <cylinderGeometry args={[0.0055, 0.0055, 0.014, 12]} />
        </mesh>
      </group>
    </group>
  );
}

