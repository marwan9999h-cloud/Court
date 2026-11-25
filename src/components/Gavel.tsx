import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useTapHandler } from './pointerGesture';

interface GavelProps {
  position: [number, number, number];
  rotationY?: number;
  onStrike: () => void;
  onHover: (label: string | null) => void;
  strikesCount: number;
}

export function Gavel({
  position,
  rotationY = 0.25,
  onStrike,
  onHover,
  strikesCount,
}: GavelProps) {
  const gavelHeadRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const tapHandlers = useTapHandler(onStrike);
  const strikeProgressRef = useRef<number>(0); // 0 to 1
  const isStrikingRef = useRef<boolean>(false);

  const materials = useMemo(() => {
    return {
      darkWood: new THREE.MeshStandardMaterial({
        color: '#422818',
        roughness: 0.35,
        metalness: 0.1,
      }),
      headWood: new THREE.MeshStandardMaterial({
        color: '#563520',
        roughness: 0.38,
        metalness: 0.08,
      }),
      brassBand: new THREE.MeshStandardMaterial({
        color: '#e2b442',
        roughness: 0.2,
        metalness: 0.88,
      }),
      feltBottom: new THREE.MeshStandardMaterial({
        color: '#1a291e',
        roughness: 0.9,
      }),
    };
  }, []);

  // Trigger strike animation whenever strikesCount changes
  useEffect(() => {
    if (strikesCount > 0) {
      isStrikingRef.current = true;
      strikeProgressRef.current = 0;
    }
  }, [strikesCount]);

  useFrame((_, delta) => {
    if (!gavelHeadRef.current) return;

    if (isStrikingRef.current) {
      strikeProgressRef.current += delta / 0.75; // 0.75s: raise, slam, rebound, settle
      const t = strikeProgressRef.current;
      if (t >= 1) {
        strikeProgressRef.current = 0;
        isStrikingRef.current = false;
        gavelHeadRef.current.rotation.z = 0;
        gavelHeadRef.current.position.y = 0.045;
      } else {
        let rot = 0;
        let lift = 0;
        if (t < 0.45) {
          const k = t / 0.45;
          const e = k * k * (3 - 2 * k);
          rot = 0.95 * e; lift = 0.06 * e;
        } else if (t < 0.58) {
          const k = (t - 0.45) / 0.13;
          rot = 0.95 - 1.1 * k; lift = 0.06 * (1 - k);
        } else if (t < 0.75) {
          const k = (t - 0.58) / 0.17;
          rot = -0.15 + 0.45 * Math.sin(k * Math.PI) * 0.6; lift = 0.015 * Math.sin(k * Math.PI);
        } else {
          rot = 0.12 * (1 - (t - 0.75) / 0.25) * -0.0;
        }
        gavelHeadRef.current.position.y = 0.045 + lift;
        gavelHeadRef.current.rotation.z = rot;
      }
    } else {
      // Gentle hover elevation
      const targetY = 0.045 + (hovered ? 0.008 : 0);
      gavelHeadRef.current.position.y = THREE.MathUtils.lerp(gavelHeadRef.current.position.y, targetY, Math.min(1, delta * 10));
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover('🔨 مطرقة القاضي (انقر لضبط الجلسة)');
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover(null);
  };

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Invisible enlarged hit target for easy mouse and mobile tap */}
      <mesh
        position={[0, 0.06, 0]}
        visible={false}
        {...tapHandlers}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 1. Octagonal Wood Sounding Block */}
      <group position={[0, 0.015, 0]}>
        {/* Beveled Sounding Block base */}
        <mesh material={materials.darkWood} castShadow receiveShadow>
          <cylinderGeometry args={[0.075, 0.088, 0.028, 8]} />
        </mesh>
        {/* Central Inset Brass Ring */}
        <mesh position={[0, 0.0145, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.brassBand}>
          <ringGeometry args={[0.045, 0.058, 32]} />
        </mesh>
      </group>

      {/* 2. Gavel Mallet and Handle */}
      <group ref={gavelHeadRef} position={[-0.04, 0.045, 0]} rotation={[0, 0, 0]}>
        {/* Cylindrical Gavel Mallet Head */}
        <group position={[0.04, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={materials.darkWood} castShadow>
            <cylinderGeometry args={[0.024, 0.024, 0.095, 16]} />
          </mesh>
          {/* Decorative Brass Central Ring */}
          <mesh material={materials.brassBand}>
            <cylinderGeometry args={[0.0245, 0.0245, 0.015, 16]} />
          </mesh>
          {/* Brass Cap Left */}
          <mesh position={[0, 0.048, 0]} material={materials.brassBand}>
            <cylinderGeometry args={[0.022, 0.022, 0.005, 16]} />
          </mesh>
          {/* Brass Cap Right */}
          <mesh position={[0, -0.048, 0]} material={materials.brassBand}>
            <cylinderGeometry args={[0.022, 0.022, 0.005, 16]} />
          </mesh>
        </group>

        {/* Hand-Turned Hardwood Handle */}
        <group position={[-0.075, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={materials.darkWood} castShadow>
            <cylinderGeometry args={[0.008, 0.012, 0.19, 12]} />
          </mesh>
          {/* Handle Grip Brass Accents */}
          <mesh position={[0, -0.06, 0]} material={materials.brassBand}>
            <cylinderGeometry args={[0.0125, 0.0125, 0.008, 12]} />
          </mesh>
          {/* Pommel End */}
          <mesh position={[0, -0.095, 0]} material={materials.darkWood}>
            <sphereGeometry args={[0.014, 12, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

