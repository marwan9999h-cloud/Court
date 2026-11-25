import { useMemo } from 'react';
import * as THREE from 'three';

export function CourtroomEnvironment({ quality }: { quality: 'high' | 'performance' }) {
  // Shared materials for optimal performance
  const materials = useMemo(() => {
    return {
      darkWalnut: new THREE.MeshStandardMaterial({
        color: '#362115',
        roughness: 0.45,
        metalness: 0.1,
      }),
      mediumWood: new THREE.MeshStandardMaterial({
        color: '#523420',
        roughness: 0.48,
        metalness: 0.08,
      }),
      floorWood: new THREE.MeshStandardMaterial({
        color: '#2b1b11',
        roughness: 0.38,
        metalness: 0.12,
      }),
      courtroomWall: new THREE.MeshStandardMaterial({
        color: '#635649',
        roughness: 0.85,
        metalness: 0.02,
      }),
      goldAccent: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        roughness: 0.22,
        metalness: 0.88,
      }),
      brassMetal: new THREE.MeshStandardMaterial({
        color: '#e2b442',
        roughness: 0.25,
        metalness: 0.85,
      }),
      leatherGreen: new THREE.MeshStandardMaterial({
        color: '#1a3c2a',
        roughness: 0.65,
        metalness: 0.05,
      }),
      leatherBurgundy: new THREE.MeshStandardMaterial({
        color: '#521922',
        roughness: 0.6,
        metalness: 0.05,
      }),
      carpetRunner: new THREE.MeshStandardMaterial({
        color: '#6e1d28',
        roughness: 0.85,
      }),
      ceilingBeams: new THREE.MeshStandardMaterial({
        color: '#26160d',
        roughness: 0.6,
      }),
      windowGlass: new THREE.MeshStandardMaterial({
        color: '#e0f2fe',
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.6,
      }),
    };
  }, []);

  return (
    <group>
      {/* 1. Main Courtroom Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -4]}
        receiveShadow={quality === 'high'}
        material={materials.floorWood}
      >
        <planeGeometry args={[18, 22]} />
      </mesh>

      {/* Central Courtroom Carpet Runner */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, -4]}
        material={materials.carpetRunner}
      >
        <planeGeometry args={[2.4, 18]} />
      </mesh>

      {/* 2. Elevated Judge Podium Platform */}
      <mesh position={[0, 0.2, 0]} receiveShadow material={materials.darkWalnut}>
        <boxGeometry args={[7, 0.4, 3.5]} />
      </mesh>
      {/* Podium Steps */}
      <mesh position={[0, 0.1, -1.85]} material={materials.mediumWood}>
        <boxGeometry args={[4, 0.2, 0.5]} />
      </mesh>

      {/* 3. Front Judicial Wall (Behind Counsel & Defendant) */}
      <mesh position={[0, 4.5, -13]} receiveShadow material={materials.courtroomWall}>
        <boxGeometry args={[18, 9, 0.4]} />
      </mesh>
      {/* Wall Wood Wainscoting Panelling */}
      <mesh position={[0, 1.75, -12.78]} material={materials.darkWalnut}>
        <boxGeometry args={[17.8, 3.5, 0.1]} />
      </mesh>
      {/* Decorative Wall Pillars */}
      {[-7, -3.5, 0, 3.5, 7].map((x, idx) => (
        <group key={`front-pillar-${idx}`} position={[x, 4.5, -12.65]}>
          <mesh material={materials.mediumWood}>
            <boxGeometry args={[0.7, 9, 0.2]} />
          </mesh>
          <mesh position={[0, 4.2, 0.1]} material={materials.goldAccent}>
            <boxGeometry args={[0.85, 0.4, 0.25]} />
          </mesh>
        </group>
      ))}

      {/* Central Coat of Arms / Emblem of Justice on the Back Wall */}
      <group position={[0, 5.8, -12.6]}>
        {/* Emblem Shield Plaque */}
        <mesh material={materials.darkWalnut}>
          <cylinderGeometry args={[1.3, 1.3, 0.1, 32]} />
        </mesh>
        {/* Outer Gold Rim */}
        <mesh position={[0, 0, 0.06]} material={materials.goldAccent}>
          <ringGeometry args={[1.15, 1.32, 32]} />
        </mesh>
        {/* Scales of Justice Emblem Silhouette */}
        <group position={[0, 0, 0.12]}>
          {/* Vertical Pillar / Sword */}
          <mesh material={materials.goldAccent}>
            <boxGeometry args={[0.08, 1.4, 0.04]} />
          </mesh>
          {/* Top Crossbar */}
          <mesh position={[0, 0.45, 0]} material={materials.goldAccent}>
            <boxGeometry args={[1.5, 0.06, 0.04]} />
          </mesh>
          {/* Left Scale Pan */}
          <mesh position={[-0.65, 0.1, 0]} material={materials.goldAccent}>
            <cylinderGeometry args={[0.25, 0.02, 0.1, 16]} />
          </mesh>
          {/* Right Scale Pan */}
          <mesh position={[0.65, 0.1, 0]} material={materials.goldAccent}>
            <cylinderGeometry args={[0.25, 0.02, 0.1, 16]} />
          </mesh>
        </group>
      </group>

      {/* 4. Side Walls & Windows */}
      {/* Left Wall */}
      <mesh position={[-9, 4.5, -4]} rotation={[0, Math.PI / 2, 0]} material={materials.courtroomWall}>
        <boxGeometry args={[22, 9, 0.4]} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[9, 4.5, -4]} rotation={[0, -Math.PI / 2, 0]} material={materials.courtroomWall}>
        <boxGeometry args={[22, 9, 0.4]} />
      </mesh>

      {/* Arched High Windows on Left and Right Walls */}
      {[-1, -5, -9].map((zPos, idx) => (
        <group key={`window-left-${idx}`} position={[-8.78, 5.2, zPos]}>
          <mesh rotation={[0, Math.PI / 2, 0]} material={materials.mediumWood}>
            <boxGeometry args={[1.8, 4.2, 0.12]} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} position={[0.02, 0, 0]} material={materials.windowGlass}>
            <planeGeometry args={[1.5, 3.8]} />
          </mesh>
        </group>
      ))}

      {/* 5. Back Entrance Wall (Behind the Judge / Gallery View) */}
      <mesh position={[0, 4.5, 6]} material={materials.courtroomWall}>
        <boxGeometry args={[18, 9, 0.4]} />
      </mesh>
      {/* Double Wooden Courtroom Doors in the Back */}
      <group position={[0, 1.8, -12.75]}>
        <mesh position={[-0.9, 0, 0]} material={materials.darkWalnut}>
          <boxGeometry args={[1.6, 3.4, 0.15]} />
        </mesh>
        <mesh position={[0.9, 0, 0]} material={materials.darkWalnut}>
          <boxGeometry args={[1.6, 3.4, 0.15]} />
        </mesh>
        {/* Brass Door Handles */}
        <mesh position={[-0.2, 0, 0.12]} material={materials.brassMetal}>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 12]} />
        </mesh>
        <mesh position={[0.2, 0, 0.12]} material={materials.brassMetal}>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 12]} />
        </mesh>
      </group>

      {/* 6. Coffered Ceiling */}
      <mesh position={[0, 9, -4]} rotation={[Math.PI / 2, 0, 0]} material={materials.courtroomWall}>
        <planeGeometry args={[18, 22]} />
      </mesh>
      {/* Ceiling Structural Wood Beams */}
      {[-6, -2, 2, 6].map((x, i) => (
        <mesh key={`beam-x-${i}`} position={[x, 8.8, -4]} material={materials.ceilingBeams}>
          <boxGeometry args={[0.5, 0.4, 22]} />
        </mesh>
      ))}
      {[-11, -7, -3, 1, 5].map((z, i) => (
        <mesh key={`beam-z-${i}`} position={[0, 8.8, z]} material={materials.ceilingBeams}>
          <boxGeometry args={[18, 0.4, 0.5]} />
        </mesh>
      ))}

      {/* 7. Courtroom Furniture */}
      {/* Left Table: Defense Counsel Desk */}
      <group position={[-2.8, 0, -3.8]}>
        {/* Desk top */}
        <mesh position={[0, 0.74, 0]} material={materials.darkWalnut} castShadow={quality === 'high'}>
          <boxGeometry args={[2.4, 0.08, 1.1]} />
        </mesh>
        {/* Desk front modesty panel */}
        <mesh position={[0, 0.37, 0.48]} material={materials.mediumWood}>
          <boxGeometry args={[2.36, 0.68, 0.04]} />
        </mesh>
        {/* Legs */}
        <mesh position={[-1.1, 0.37, -0.45]} material={materials.darkWalnut}>
          <boxGeometry args={[0.1, 0.72, 0.1]} />
        </mesh>
        <mesh position={[1.1, 0.37, -0.45]} material={materials.darkWalnut}>
          <boxGeometry args={[0.1, 0.72, 0.1]} />
        </mesh>
        {/* Leather Defense Chair */}
        <group position={[0, 0, -0.8]}>
          <mesh position={[0, 0.48, 0]} material={materials.leatherBurgundy}>
            <boxGeometry args={[0.6, 0.08, 0.55]} />
          </mesh>
          <mesh position={[0, 0.85, -0.24]} material={materials.leatherBurgundy}>
            <boxGeometry args={[0.58, 0.7, 0.08]} />
          </mesh>
          <mesh position={[0, 0.22, 0]} material={materials.darkWalnut}>
            <cylinderGeometry args={[0.04, 0.04, 0.45, 12]} />
          </mesh>
        </group>
        {/* Props on Defense Desk: Briefcase & Papers */}
        <mesh position={[-0.7, 0.82, -0.1]} rotation={[0, 0.2, 0]} material={materials.darkWalnut}>
          <boxGeometry args={[0.45, 0.12, 0.32]} />
        </mesh>
        <mesh position={[0.4, 0.79, 0]} rotation={[0, -0.1, 0]} material={materials.courtroomWall}>
          <boxGeometry args={[0.35, 0.02, 0.25]} />
        </mesh>
      </group>

      {/* Right Table: Prosecution Desk */}
      <group position={[2.8, 0, -3.8]}>
        {/* Desk top */}
        <mesh position={[0, 0.74, 0]} material={materials.darkWalnut} castShadow={quality === 'high'}>
          <boxGeometry args={[2.4, 0.08, 1.1]} />
        </mesh>
        {/* Desk front modesty panel */}
        <mesh position={[0, 0.37, 0.48]} material={materials.mediumWood}>
          <boxGeometry args={[2.36, 0.68, 0.04]} />
        </mesh>
        {/* Legs */}
        <mesh position={[-1.1, 0.37, -0.45]} material={materials.darkWalnut}>
          <boxGeometry args={[0.1, 0.72, 0.1]} />
        </mesh>
        <mesh position={[1.1, 0.37, -0.45]} material={materials.darkWalnut}>
          <boxGeometry args={[0.1, 0.72, 0.1]} />
        </mesh>
        {/* Leather Prosecutor Chair */}
        <group position={[0, 0, -0.8]}>
          <mesh position={[0, 0.48, 0]} material={materials.leatherBurgundy}>
            <boxGeometry args={[0.6, 0.08, 0.55]} />
          </mesh>
          <mesh position={[0, 0.85, -0.24]} material={materials.leatherBurgundy}>
            <boxGeometry args={[0.58, 0.7, 0.08]} />
          </mesh>
          <mesh position={[0, 0.22, 0]} material={materials.darkWalnut}>
            <cylinderGeometry args={[0.04, 0.04, 0.45, 12]} />
          </mesh>
        </group>
        {/* Prosecution folders and lamp */}
        <mesh position={[0.6, 0.81, 0]} rotation={[0, -0.15, 0]} material={materials.mediumWood}>
          <boxGeometry args={[0.3, 0.06, 0.35]} />
        </mesh>
        <mesh position={[-0.4, 0.79, 0.1]} rotation={[0, 0.08, 0]} material={materials.courtroomWall}>
          <boxGeometry args={[0.4, 0.02, 0.28]} />
        </mesh>
      </group>

      {/* Center dock removed: the three accused now stand in their own interactive docks (Defendant component) */}

      {/* Left-Flank: Witness Stand Box */}
      <group position={[-4.5, 0, -2.4]}>
        {/* Elevated Witness Box */}
        <mesh position={[0, 0.35, 0]} material={materials.darkWalnut}>
          <boxGeometry args={[1.3, 0.7, 1.3]} />
        </mesh>
        <mesh position={[0, 0.9, 0.6]} material={materials.mediumWood}>
          <boxGeometry args={[1.3, 0.4, 0.06]} />
        </mesh>
        {/* Witness Microphone Pole */}
        <mesh position={[0.2, 1.15, 0.5]} material={materials.brassMetal}>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
        </mesh>
        <mesh position={[0.2, 1.32, 0.45]} material={materials.darkWalnut}>
          <sphereGeometry args={[0.035, 12, 12]} />
        </mesh>
      </group>

      {/* Wooden Spectator Divider Railing */}
      <group position={[0, 0.5, -6.8]}>
        <mesh position={[-3.2, 0, 0]} material={materials.darkWalnut}>
          <boxGeometry args={[5.2, 1.0, 0.08]} />
        </mesh>
        <mesh position={[3.2, 0, 0]} material={materials.darkWalnut}>
          <boxGeometry args={[5.2, 1.0, 0.08]} />
        </mesh>
        {/* Center Gate Gap with Spindles */}
        <mesh position={[-0.8, 0, 0]} material={materials.brassMetal}>
          <cylinderGeometry args={[0.06, 0.06, 1.1, 12]} />
        </mesh>
        <mesh position={[0.8, 0, 0]} material={materials.brassMetal}>
          <cylinderGeometry args={[0.06, 0.06, 1.1, 12]} />
        </mesh>
      </group>

      {/* Audience Benches (Gallery) */}
      {[-8.0, -9.5, -11.0].map((z, rowIdx) => (
        <group key={`audience-row-${rowIdx}`} position={[0, 0, z]}>
          {/* Left Pew */}
          <group position={[-3.2, 0, 0]}>
            <mesh position={[0, 0.45, 0]} material={materials.mediumWood}>
              <boxGeometry args={[4.8, 0.08, 0.5]} />
            </mesh>
            <mesh position={[0, 0.85, -0.22]} material={materials.mediumWood}>
              <boxGeometry args={[4.8, 0.7, 0.06]} />
            </mesh>
            <mesh position={[-2.3, 0.22, 0]} material={materials.darkWalnut}>
              <boxGeometry args={[0.08, 0.44, 0.5]} />
            </mesh>
            <mesh position={[2.3, 0.22, 0]} material={materials.darkWalnut}>
              <boxGeometry args={[0.08, 0.44, 0.5]} />
            </mesh>
          </group>
          {/* Right Pew */}
          <group position={[3.2, 0, 0]}>
            <mesh position={[0, 0.45, 0]} material={materials.mediumWood}>
              <boxGeometry args={[4.8, 0.08, 0.5]} />
            </mesh>
            <mesh position={[0, 0.85, -0.22]} material={materials.mediumWood}>
              <boxGeometry args={[4.8, 0.7, 0.06]} />
            </mesh>
            <mesh position={[-2.3, 0.22, 0]} material={materials.darkWalnut}>
              <boxGeometry args={[0.08, 0.44, 0.5]} />
            </mesh>
            <mesh position={[2.3, 0.22, 0]} material={materials.darkWalnut}>
              <boxGeometry args={[0.08, 0.44, 0.5]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

