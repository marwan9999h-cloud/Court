import React, { useState, useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CaseCoverInfo } from '../types';
import { getCaseFileCoverTexture } from './paperTextures';
import { useCourtFonts } from './courtFonts';
import { shouldYieldHitPadding, useTapHandler } from './pointerGesture';

interface CaseFileProps {
  coverInfo: CaseCoverInfo;
  position: [number, number, number];
  rotationY?: number;
  onSelect: () => void;
  onHover: (label: string | null) => void;
}

export function CaseFile({
  coverInfo,
  position,
  rotationY = 0.08,
  onSelect,
  onHover,
}: CaseFileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const fontsReady = useCourtFonts();
  const tapHandlers = useTapHandler(onSelect);

  const texture = useMemo(() => getCaseFileCoverTexture(coverInfo, fontsReady), [coverInfo, fontsReady]);

  const materials = useMemo(() => {
    return {
      folderCover: new THREE.MeshStandardMaterial({
        color: '#221a14',
        roughness: 0.55,
        metalness: 0.06,
      }),
      topPrintedCover: new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.65,
        metalness: 0.04,
      }),
      folderInsidePages: new THREE.MeshStandardMaterial({
        color: '#f6f3ea',
        roughness: 0.85,
        metalness: 0.0,
      }),
      spineClasp: new THREE.MeshStandardMaterial({
        color: '#c5a059',
        roughness: 0.28,
        metalness: 0.82,
      }),
      brassCorner: new THREE.MeshStandardMaterial({
        color: '#e2b442',
        roughness: 0.24,
        metalness: 0.85,
      }),
      redWaxSeal: new THREE.MeshStandardMaterial({
        color: '#991b1b',
        roughness: 0.35,
        metalness: 0.15,
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
    if (shouldYieldHitPadding(e)) return;
    e.stopPropagation();
    setHovered(true);
    onHover(`📂 ملف القضية: «${coverInfo.caseTitle}» (انقر للمطالعة)`);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover(null);
  };

  const fileWidth = 0.35;
  const fileHeight = 0.46;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      userData={{ interactiveTarget: true }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      {...tapHandlers}
    >
      {/* 1. Large Invisible Hit-Box for Touch & Click Accessibility */}
      <mesh position={[0, 0.04, 0]} visible={false} userData={{ isHitPadding: true }}>
        <boxGeometry args={[fileWidth * 1.35, 0.16, fileHeight * 1.35]} />
      </mesh>

      {/* 2. Folder Bottom Backing Cover */}
      <mesh position={[0, 0.004, 0]} material={materials.folderCover} castShadow receiveShadow>
        <boxGeometry args={[fileWidth, 0.008, fileHeight]} />
      </mesh>

      {/* 3. Real Paper Block Inside */}
      <mesh position={[0.005, 0.012, 0]} material={materials.folderInsidePages}>
        <boxGeometry args={[fileWidth * 0.94, 0.010, fileHeight * 0.94]} />
      </mesh>

      {/* 4. Top Cover with Crisp Case Data Typography */}
      <mesh position={[0, 0.020, 0]} material={materials.topPrintedCover} castShadow>
        <boxGeometry args={[fileWidth, 0.006, fileHeight]} />
      </mesh>

      {/* 5. Left Spine Binding Strip */}
      <mesh position={[-fileWidth / 2 + 0.007, 0.012, 0]} material={materials.spineClasp}>
        <boxGeometry args={[0.014, 0.022, fileHeight]} />
      </mesh>

      {/* 6. Four Brass Protective Corner Filigrees */}
      {[fileWidth / 2 - 0.014, -fileWidth / 2 + 0.014].map((cx) =>
        [fileHeight / 2 - 0.014, -fileHeight / 2 + 0.014].map((cz) => (
          <mesh key={`corner-${cx}-${cz}`} position={[cx, 0.022, cz]} material={materials.brassCorner}>
            <boxGeometry args={[0.026, 0.004, 0.026]} />
          </mesh>
        )),
      )}

      {/* 7. Official 3D Raised Red Wax Stamp */}
      <group position={[fileWidth * 0.24, 0.024, fileHeight * 0.28]}>
        <mesh material={materials.redWaxSeal}>
          <cylinderGeometry args={[0.022, 0.024, 0.006, 16]} />
        </mesh>
        <mesh position={[0, 0.004, 0]} material={materials.brassCorner}>
          <cylinderGeometry args={[0.011, 0.011, 0.002, 12]} />
        </mesh>
      </group>
    </group>
  );
}

