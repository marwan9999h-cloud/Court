import React, { useState, useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { getCharactersPaperTexture } from './paperTextures';

interface CharactersPaperProps {
  characterCount: number;
  position: [number, number, number];
  rotationY?: number;
  onSelect: () => void;
  onHover: (label: string | null) => void;
}

export function CharactersPaper({
  characterCount,
  position,
  rotationY = 0.05,
  onSelect,
  onHover,
}: CharactersPaperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(() => getCharactersPaperTexture(characterCount), [characterCount]);

  const materials = useMemo(() => {
    return {
      folderCover: new THREE.MeshStandardMaterial({
        color: '#16221a',
        roughness: 0.55,
        metalness: 0.05,
      }),
      topPrintedCover: new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.65,
        metalness: 0.04,
      }),
      insidePages: new THREE.MeshStandardMaterial({
        color: '#f6f7f2',
        roughness: 0.85,
      }),
      brassCorner: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        roughness: 0.25,
        metalness: 0.85,
      }),
      claspStrip: new THREE.MeshStandardMaterial({
        color: '#166534',
        roughness: 0.4,
        metalness: 0.3,
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
    onHover(`👥 الشخصيات والشهود (${characterCount} أطراف — انقر للاطلاع)`);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  const fileWidth = 0.29;
  const fileHeight = 0.39;

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
        <boxGeometry args={[fileWidth * 1.35, 0.16, fileHeight * 1.35]} />
      </mesh>

      {/* 2. Bottom Backing */}
      <mesh position={[0, 0.004, 0]} material={materials.folderCover} castShadow receiveShadow>
        <boxGeometry args={[fileWidth, 0.008, fileHeight]} />
      </mesh>

      {/* 3. Paper Stack Inside */}
      <mesh position={[0.003, 0.011, 0]} material={materials.insidePages}>
        <boxGeometry args={[fileWidth * 0.94, 0.009, fileHeight * 0.94]} />
      </mesh>

      {/* 4. Top Printed Dossier Cover */}
      <mesh position={[0, 0.018, 0]} material={materials.topPrintedCover} castShadow>
        <boxGeometry args={[fileWidth, 0.005, fileHeight]} />
      </mesh>

      {/* 5. Left Spine Clasp */}
      <mesh position={[-fileWidth / 2 + 0.006, 0.011, 0]} material={materials.claspStrip}>
        <boxGeometry args={[0.012, 0.018, fileHeight]} />
      </mesh>

      {/* 6. Gold Corners */}
      {[fileWidth / 2 - 0.012, -fileWidth / 2 + 0.012].map((cx) =>
        [fileHeight / 2 - 0.012, -fileHeight / 2 + 0.012].map((cz) => (
          <mesh key={`corner-${cx}-${cz}`} position={[cx, 0.020, cz]} material={materials.brassCorner}>
            <boxGeometry args={[0.022, 0.003, 0.022]} />
          </mesh>
        )),
      )}
    </group>
  );
}

