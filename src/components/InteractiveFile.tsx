import React, { useState, useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CourtFileItem, FileId } from '../types';

interface InteractiveFileProps {
  file: CourtFileItem;
  position: [number, number, number];
  rotationY?: number;
  onSelect: (fileId: FileId) => void;
  onHover: (label: string | null) => void;
  isActiveSelection: boolean;
}

export function InteractiveFile({
  file,
  position,
  rotationY = 0,
  onSelect,
  onHover,
  isActiveSelection,
}: InteractiveFileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const isLocked = file.status === 'locked';
  const isCompleted = file.status === 'completed';
  const isMainCaseFile = file.id === 'case_file';

  const materials = useMemo(() => {
    return {
      folderCover: new THREE.MeshStandardMaterial({
        color: isLocked ? '#3a2a1d' : file.color,
        roughness: 0.42,
        metalness: 0.12,
      }),
      folderInside: new THREE.MeshStandardMaterial({
        color: '#faf7f0',
        roughness: 0.82,
      }),
      spineClasp: new THREE.MeshStandardMaterial({
        color: isLocked ? '#6b5c4d' : file.accentColor,
        roughness: 0.28,
        metalness: 0.85,
      }),
      labelBadge: new THREE.MeshStandardMaterial({
        color: isLocked ? '#2e261f' : '#f5eedb',
        roughness: 0.6,
      }),
      labelHeader: new THREE.MeshStandardMaterial({
        color: isLocked ? '#221c17' : '#7f1d1d',
        roughness: 0.5,
      }),
      labelLine: new THREE.MeshStandardMaterial({
        color: isLocked ? '#42372d' : '#2b1c13',
        roughness: 0.4,
      }),
      goldCorners: new THREE.MeshStandardMaterial({
        color: '#e2b442',
        roughness: 0.22,
        metalness: 0.88,
      }),
      redWaxSeal: new THREE.MeshStandardMaterial({
        color: '#991b1b',
        roughness: 0.35,
        metalness: 0.2,
      }),
      ribbonCompleted: new THREE.MeshStandardMaterial({
        color: '#166534',
        roughness: 0.4,
      }),
      hoverGlow: new THREE.MeshBasicMaterial({
        color: '#facc15',
        transparent: true,
        opacity: 0.18,
      }),
    };
  }, [file, isLocked]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth hover lifting effect (elevates up towards judge)
    const targetY = position[1] + (hovered && !isLocked ? 0.028 : 0);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, Math.min(1, delta * 14));

    // Slight tilt on hover for tactile depth
    const targetRotX = hovered && !isLocked ? -0.08 : 0;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, Math.min(1, delta * 12));
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    if (isLocked) {
      onHover(`🔒 ${file.title} — مغلق حالياً`);
    } else if (isCompleted) {
      onHover(`📁 ${file.title} (تمت المراجعة — انقر لإعادة الفتح)`);
    } else {
      onHover(`📂 فتح ${file.title}`);
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(file.id);
  };

  const fileWidth = isMainCaseFile ? 0.34 : 0.27;
  const fileHeight = isMainCaseFile ? 0.44 : 0.36;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* 1. Large Invisible Hit-Box for Guaranteed Effortless Touch and Click */}
      <mesh position={[0, 0.03, 0]} visible={false}>
        <boxGeometry args={[fileWidth * 1.35, 0.14, fileHeight * 1.35]} />
      </mesh>

      {/* 2. Main Dossier Folder Body */}
      {/* Bottom Cover */}
      <mesh position={[0, 0.004, 0]} material={materials.folderCover} castShadow receiveShadow>
        <boxGeometry args={[fileWidth, 0.008, fileHeight]} />
      </mesh>

      {/* Interior Legal Paper Pages */}
      <mesh position={[0.004, 0.013, 0]} material={materials.folderInside}>
        <boxGeometry args={[fileWidth * 0.95, 0.012, fileHeight * 0.95]} />
      </mesh>

      {/* Top Cover */}
      <mesh position={[0, 0.022, 0]} material={materials.folderCover} castShadow>
        <boxGeometry args={[fileWidth, 0.006, fileHeight]} />
      </mesh>

      {/* Spine Binding */}
      <mesh position={[-fileWidth / 2 + 0.006, 0.014, 0]} material={materials.spineClasp}>
        <boxGeometry args={[0.012, 0.024, fileHeight]} />
      </mesh>

      {/* 4 Brass Filigree Corner Protectors */}
      {[fileWidth / 2 - 0.012, -fileWidth / 2 + 0.012].map((cx) =>
        [fileHeight / 2 - 0.012, -fileHeight / 2 + 0.012].map((cz) => (
          <mesh key={`corner-${cx}-${cz}`} position={[cx, 0.024, cz]} material={materials.goldCorners}>
            <boxGeometry args={[0.022, 0.006, 0.022]} />
          </mesh>
        )),
      )}

      {/* Official Label Badge on Dossier Cover */}
      <mesh position={[0.008, 0.026, 0.02]} material={materials.labelBadge}>
        <boxGeometry args={[fileWidth * 0.74, 0.002, fileHeight * 0.52]} />
      </mesh>

      {/* Label Gold Border */}
      <mesh position={[0.008, 0.0265, 0.02]} material={materials.goldCorners}>
        <boxGeometry args={[fileWidth * 0.76, 0.001, fileHeight * 0.54]} />
      </mesh>

      {/* Header Accent Bar */}
      <mesh position={[0.008, 0.0275, -fileHeight * 0.16]} material={materials.labelHeader}>
        <boxGeometry args={[fileWidth * 0.62, 0.001, 0.028]} />
      </mesh>

      {/* Simulated Arabic Calligraphy & File Data Bars */}
      <mesh position={[0.008, 0.0275, -fileHeight * 0.04]} material={materials.labelLine}>
        <boxGeometry args={[fileWidth * 0.55, 0.001, 0.014]} />
      </mesh>
      <mesh position={[0.008, 0.0275, fileHeight * 0.05]} material={materials.labelLine}>
        <boxGeometry args={[fileWidth * 0.48, 0.001, 0.01]} />
      </mesh>
      <mesh position={[0.008, 0.0275, fileHeight * 0.13]} material={materials.labelLine}>
        <boxGeometry args={[fileWidth * 0.42, 0.001, 0.01]} />
      </mesh>

      {/* Official Red Wax Stamp on Main Case File */}
      {isMainCaseFile && (
        <group position={[fileWidth * 0.22, 0.029, fileHeight * 0.18]}>
          <mesh material={materials.redWaxSeal}>
            <cylinderGeometry args={[0.022, 0.024, 0.006, 16]} />
          </mesh>
          <mesh position={[0, 0.004, 0]} material={materials.goldCorners}>
            <cylinderGeometry args={[0.012, 0.012, 0.003, 12]} />
          </mesh>
        </group>
      )}

      {/* Completed Green Silk Ribbon */}
      {isCompleted && (
        <mesh position={[fileWidth * 0.28, 0.028, fileHeight * 0.38]} rotation={[0, 0.25, 0]} material={materials.ribbonCompleted}>
          <boxGeometry args={[0.032, 0.003, 0.09]} />
        </mesh>
      )}

      {/* Subtle Hover Aura */}
      {hovered && !isLocked && (
        <mesh position={[0, 0.002, 0]} material={materials.hoverGlow}>
          <boxGeometry args={[fileWidth + 0.04, 0.004, fileHeight + 0.04]} />
        </mesh>
      )}
    </group>
  );
}

