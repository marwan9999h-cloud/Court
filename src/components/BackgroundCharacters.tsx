import { useMemo } from 'react';
import * as THREE from 'three';

interface HumanFigureProps {
  position: [number, number, number];
  rotationY?: number;
  isSeated?: boolean;
  suitColor?: string;
  hairColor?: string;
  skinTone?: string;
  hasTie?: boolean;
  tieColor?: string;
  scale?: number;
}

function HumanFigure({
  position,
  rotationY = 0,
  isSeated = true,
  suitColor = '#1f2937',
  hairColor = '#1e1b18',
  skinTone = '#d4a373',
  hasTie = true,
  tieColor = '#991b1b',
  scale = 1.0,
}: HumanFigureProps) {
  const materials = useMemo(() => {
    return {
      suit: new THREE.MeshStandardMaterial({ color: suitColor, roughness: 0.7 }),
      skin: new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.6 }),
      hair: new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.85 }),
      shirt: new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.5 }),
      tie: new THREE.MeshStandardMaterial({ color: tieColor, roughness: 0.4 }),
      shoes: new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.3 }),
    };
  }, [suitColor, skinTone, hairColor, tieColor]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      {/* Head */}
      <mesh position={[0, isSeated ? 1.2 : 1.62, 0]} material={materials.skin}>
        <sphereGeometry args={[0.13, 12, 12]} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, (isSeated ? 1.2 : 1.62) + 0.05, -0.02]} material={materials.hair}>
        <sphereGeometry args={[0.135, 10, 10]} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, isSeated ? 1.05 : 1.47, 0]} material={materials.skin}>
        <cylinderGeometry args={[0.055, 0.065, 0.1, 8]} />
      </mesh>

      {/* Torso & Suit Jacket */}
      <mesh position={[0, isSeated ? 0.78 : 1.15, 0]} material={materials.suit}>
        <boxGeometry args={[0.42, 0.52, 0.24]} />
      </mesh>

      {/* Shirt Collar / Chest Area */}
      <mesh position={[0, isSeated ? 0.88 : 1.25, 0.11]} material={materials.shirt}>
        <boxGeometry args={[0.14, 0.22, 0.04]} />
      </mesh>

      {/* Tie */}
      {hasTie && (
        <mesh position={[0, isSeated ? 0.84 : 1.21, 0.13]} material={materials.tie}>
          <boxGeometry args={[0.04, 0.22, 0.02]} />
        </mesh>
      )}

      {/* Arms & Hands */}
      <mesh position={[-0.24, isSeated ? 0.75 : 1.15, isSeated ? 0.08 : 0]} rotation={[isSeated ? 0.4 : 0, 0, 0]} material={materials.suit}>
        <cylinderGeometry args={[0.055, 0.05, 0.38, 6]} />
      </mesh>
      <mesh position={[0.24, isSeated ? 0.75 : 1.15, isSeated ? 0.08 : 0]} rotation={[isSeated ? 0.4 : 0, 0, 0]} material={materials.suit}>
        <cylinderGeometry args={[0.055, 0.05, 0.38, 6]} />
      </mesh>
      <mesh position={[-0.18, isSeated ? 0.54 : 0.88, isSeated ? 0.22 : 0]} material={materials.skin}>
        <sphereGeometry args={[0.045, 6, 6]} />
      </mesh>
      <mesh position={[0.18, isSeated ? 0.54 : 0.88, isSeated ? 0.22 : 0]} material={materials.skin}>
        <sphereGeometry args={[0.045, 6, 6]} />
      </mesh>

      {/* Legs */}
      {isSeated ? (
        <>
          <mesh position={[-0.11, 0.46, 0.18]} rotation={[Math.PI / 2, 0, 0]} material={materials.suit}>
            <cylinderGeometry args={[0.065, 0.06, 0.4, 6]} />
          </mesh>
          <mesh position={[0.11, 0.46, 0.18]} rotation={[Math.PI / 2, 0, 0]} material={materials.suit}>
            <cylinderGeometry args={[0.065, 0.06, 0.4, 6]} />
          </mesh>
          <mesh position={[-0.11, 0.22, 0.36]} material={materials.suit}>
            <cylinderGeometry args={[0.06, 0.055, 0.42, 6]} />
          </mesh>
          <mesh position={[0.11, 0.22, 0.36]} material={materials.suit}>
            <cylinderGeometry args={[0.06, 0.055, 0.42, 6]} />
          </mesh>
          <mesh position={[-0.11, 0.04, 0.42]} material={materials.shoes}>
            <boxGeometry args={[0.09, 0.07, 0.18]} />
          </mesh>
          <mesh position={[0.11, 0.04, 0.42]} material={materials.shoes}>
            <boxGeometry args={[0.09, 0.07, 0.18]} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-0.11, 0.44, 0]} material={materials.suit}>
            <cylinderGeometry args={[0.07, 0.06, 0.84, 6]} />
          </mesh>
          <mesh position={[0.11, 0.44, 0]} material={materials.suit}>
            <cylinderGeometry args={[0.07, 0.06, 0.84, 6]} />
          </mesh>
          <mesh position={[-0.11, 0.04, 0.04]} material={materials.shoes}>
            <boxGeometry args={[0.09, 0.07, 0.2]} />
          </mesh>
          <mesh position={[0.11, 0.04, 0.04]} material={materials.shoes}>
            <boxGeometry args={[0.09, 0.07, 0.2]} />
          </mesh>
        </>
      )}
    </group>
  );
}

function _unused(){}
export function BackgroundCharacters() {
  return (
    <group>
      {/* 1. Defense Lawyer: standing behind the accused, in the gap between the left and middle docks */}
      <HumanFigure position={[-0.92, 0.16, -5.5]} rotationY={0} isSeated={false} suitColor="#1e293b" hairColor="#3b2518" skinTone="#e0ac69" hasTie={true} tieColor="#7f1d1d" scale={1.0} />
      {/* Court clerks seated behind on the left (right side kept clear for the standing story witness) */}
      <HumanFigure position={[-2.75, 0.1, -5.7]} rotationY={0.15} isSeated={true} suitColor="#46576b" hairColor="#4a4238" skinTone="#f1c27d" hasTie={false} scale={1.0} />

      {/* 2. Prosecutor: Right table, sitting focused with formal suit (shifted outboard to clear the third dock) */}
      <HumanFigure
        position={[3.1, 0, -4.35]}
        rotationY={-0.22}
        isSeated={true}
        suitColor="#0f172a"
        hairColor="#1c1917"
        skinTone="#d4a373"
        hasTie={true}
        tieColor="#831843"
        scale={1.0}
      />

      {/* 3. Witness: Seated in the elevated witness stand on the left flank */}
      <HumanFigure
        position={[-4.5, 0.35, -2.4]}
        rotationY={Math.PI / 4}
        isSeated={true}
        suitColor="#374151"
        hairColor="#4a4238"
        skinTone="#f1c27d"
        hasTie={false}
        scale={0.98}
      />

      {/* 4. Security Guard: Standing tall and vigilant near the back entrance doors */}
      <group position={[1.8, 0, -12.0]}>
        <HumanFigure
          position={[0, 0, 0]}
          rotationY={-0.2}
          isSeated={false}
          suitColor="#1e3a5f"
          hairColor="#18181b"
          skinTone="#b07d4b"
          hasTie={true}
          tieColor="#0f172a"
          scale={1.05}
        />
        {/* Security Badge */}
        <mesh position={[0.08, 1.28, 0.14]} rotation={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 5. Audience Gallery (Spectators in the rear pews) */}
      <HumanFigure position={[-4.2, 0, -8.3]} rotationY={0.05} isSeated={true} suitColor="#334155" hairColor="#2d1e18" skinTone="#e0ac69" hasTie={false} scale={0.95} />
      <HumanFigure position={[-2.4, 0, -8.3]} rotationY={-0.08} isSeated={true} suitColor="#475569" hairColor="#18181b" skinTone="#c68642" hasTie={true} tieColor="#047857" scale={0.96} />
      <HumanFigure position={[2.4, 0, -8.3]} rotationY={0.06} isSeated={true} suitColor="#1f2937" hairColor="#44403c" skinTone="#d4a373" hasTie={false} scale={0.95} />
      <HumanFigure position={[4.0, 0, -8.3]} rotationY={-0.04} isSeated={true} suitColor="#3f3f46" hairColor="#262626" skinTone="#f1c27d" hasTie={true} tieColor="#b45309" scale={0.95} />

      <HumanFigure position={[-3.5, 0, -9.8]} rotationY={0.02} isSeated={true} suitColor="#1e293b" hairColor="#1c1917" skinTone="#d4a373" hasTie={false} scale={0.94} />
      <HumanFigure position={[3.2, 0, -9.8]} rotationY={-0.03} isSeated={true} suitColor="#27272a" hairColor="#3b2518" skinTone="#c68642" hasTie={false} scale={0.94} />
    </group>
  );
}

