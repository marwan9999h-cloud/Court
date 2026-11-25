import { useState, useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useTapHandler } from './pointerGesture';

interface MicrophoneProps {
  position: [number, number, number];
  rotationY?: number;
  micActive: boolean;
  onToggle: () => void;
  onHover: (label: string | null) => void;
}

export function Microphone({
  position,
  rotationY = 0,
  micActive,
  onToggle,
  onHover,
}: MicrophoneProps) {
  const [hovered, setHovered] = useState(false);
  const tapHandlers = useTapHandler(onToggle);

  const materials = useMemo(() => {
    return {
      darkBase: new THREE.MeshStandardMaterial({
        color: '#0d0c0a',
        roughness: 0.35,
        metalness: 0.8,
      }),
      chromeNeck: new THREE.MeshStandardMaterial({
        color: '#1f1f23',
        roughness: 0.25,
        metalness: 0.85,
      }),
      micGrille: new THREE.MeshStandardMaterial({
        color: '#27272a',
        roughness: 0.7,
        metalness: 0.3,
      }),
      brassRing: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        roughness: 0.2,
        metalness: 0.88,
      }),
      indicatorLed: new THREE.MeshBasicMaterial({
        color: micActive ? '#d4af37' : '#3f3f46',
      }),
    };
  }, [micActive]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover('🎙️ ميكروفون المنصة (انقر للتفعيل/الفحص)');
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
      {/* Enlarged hit target */}
      <mesh position={[0, 0.14, 0]} visible={false}>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 1. Heavy Metal Cast Base */}
      <mesh position={[0, 0.01, 0]} material={materials.darkBase} castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.02, 20]} />
      </mesh>
      {/* Base Toggle Button */}
      <mesh position={[0, 0.022, 0.025]} material={materials.indicatorLed}>
        <boxGeometry args={[0.015, 0.005, 0.015]} />
      </mesh>

      {/* 2. Articulated Gooseneck Flexible Arm */}
      <group position={[0, 0.02, -0.01]}>
        {/* Lower vertical stem */}
        <mesh position={[0, 0.05, 0]} material={materials.chromeNeck}>
          <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
        </mesh>
        {/* Curved upper neck bending toward judge */}
        <mesh position={[0, 0.12, 0.02]} rotation={[-0.4, 0, 0]} material={materials.chromeNeck}>
          <cylinderGeometry args={[0.0045, 0.0045, 0.08, 8]} />
        </mesh>
      </group>

      {/* 3. Microphone Capsule Head */}
      <group position={[0, 0.17, 0.045]} rotation={[-0.4, 0, 0]}>
        {/* Cylindrical capsule body */}
        <mesh material={materials.micGrille}>
          <cylinderGeometry args={[0.014, 0.014, 0.04, 16]} />
        </mesh>
        {/* Rounded top dome */}
        <mesh position={[0, 0.02, 0]} material={materials.micGrille}>
          <sphereGeometry args={[0.014, 12, 12]} />
        </mesh>
        {/* Active Ring Light Indicator */}
        <mesh position={[0, -0.015, 0]} material={materials.indicatorLed}>
          <cylinderGeometry args={[0.0145, 0.0145, 0.004, 16]} />
        </mesh>
      </group>
    </group>
  );
}
