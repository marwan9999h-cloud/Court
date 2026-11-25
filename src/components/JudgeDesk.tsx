import { useMemo } from 'react';
import * as THREE from 'three';
import { CaseData, FileId } from '../types';
import { DeskPaper } from './DeskPaper';
import { CaseFile } from './CaseFile';
import { EvidencePaper } from './EvidencePaper';
import { CharactersPaper } from './CharactersPaper';
import { NotesPaper } from './NotesPaper';
import { Gavel } from './Gavel';
import { DeskLamp } from './DeskLamp';
import { Microphone } from './Microphone';
import { useTapHandler } from './pointerGesture';

interface JudgeDeskProps {
  caseData: CaseData;
  lampOn: boolean;
  micActive: boolean;
  gavelStrikes: number;
  deskNoteLines: string[];
  deskNoteSubtitle?: string;
  onSelectFile: (fileId: FileId) => void;
  onGavelStrike: () => void;
  onToggleLamp: () => void;
  onToggleMicrophone: () => void;
  onHoverObject: (label: string | null) => void;
}

export function JudgeDesk({
  caseData,
  lampOn,
  micActive,
  gavelStrikes,
  deskNoteLines,
  deskNoteSubtitle,
  onSelectFile,
  onGavelStrike,
  onToggleLamp,
  onToggleMicrophone,
  onHoverObject,
}: JudgeDeskProps) {
  const sealTapHandlers = useTapHandler(() => onHoverObject('🏛️ ختم المحكمة الرسمي المعتمد'));
  const materials = useMemo(() => {
    return {
      richWalnut: new THREE.MeshStandardMaterial({
        color: '#382214',
        roughness: 0.42,
        metalness: 0.08,
      }),
      deskTrim: new THREE.MeshStandardMaterial({
        color: '#4e301d',
        roughness: 0.45,
        metalness: 0.06,
      }),
      leatherBlotter: new THREE.MeshStandardMaterial({
        color: '#132219',
        roughness: 0.65,
        metalness: 0.04,
      }),
      goldCorners: new THREE.MeshStandardMaterial({
        color: '#e2b442',
        roughness: 0.22,
        metalness: 0.88,
      }),
      courtSealBrass: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        roughness: 0.25,
        metalness: 0.85,
      }),
      fountainPen: new THREE.MeshStandardMaterial({
        color: '#1a1917',
        roughness: 0.25,
        metalness: 0.7,
      }),
      stampWood: new THREE.MeshStandardMaterial({
        color: '#422415',
        roughness: 0.35,
        metalness: 0.1,
      }),
    };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Judge Bench Architectural Structure */}
      {/* Main Elevated Bench Top Surface */}
      <mesh position={[0, 0.8, 0]} material={materials.richWalnut} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.05, 1.0]} />
      </mesh>

      {/* Front Dignified Modesty Bench Wall Facing the Courtroom */}
      <mesh position={[0, 0.4, -0.48]} material={materials.richWalnut} castShadow receiveShadow>
        <boxGeometry args={[2.34, 0.8, 0.06]} />
      </mesh>

      {/* Modesty Panel Gold Inset Moldings */}
      <mesh position={[0, 0.4, -0.515]} material={materials.goldCorners}>
        <boxGeometry args={[2.0, 0.62, 0.01]} />
      </mesh>
      <mesh position={[0, 0.4, -0.52]} material={materials.deskTrim}>
        <boxGeometry args={[1.94, 0.56, 0.012]} />
      </mesh>

      {/* Bench Left and Right Pedestal Supports */}
      <mesh position={[-1.06, 0.4, 0]} material={materials.deskTrim}>
        <boxGeometry args={[0.16, 0.8, 0.94]} />
      </mesh>
      <mesh position={[1.06, 0.4, 0]} material={materials.deskTrim}>
        <boxGeometry args={[0.16, 0.8, 0.94]} />
      </mesh>

      {/* 2. Large Leather Writing Blotter (Desk Pad) */}
      <mesh position={[0, 0.826, 0]} material={materials.leatherBlotter} receiveShadow>
        <boxGeometry args={[1.5, 0.005, 0.68]} />
      </mesh>
      {/* Blotter 4 Filigree Gold Corners */}
      {[-0.74, 0.74].map((cx) =>
        [-0.33, 0.33].map((cz) => (
          <mesh key={`blotter-corner-${cx}-${cz}`} position={[cx, 0.829, cz]} material={materials.goldCorners}>
            <boxGeometry args={[0.04, 0.002, 0.04]} />
          </mesh>
        )),
      )}

      <group scale={[0.8, 1, 0.8]}>
      <CaseFile
        coverInfo={caseData.coverInfo}
        position={[-0.32, 0.826, -0.27]}
        rotationY={0.04}
        onSelect={() => onSelectFile('case_file')}
        onHover={onHoverObject}
      />
      <DeskPaper
        position={[0.0, 0.826, -0.27]}
        rotationY={-0.03}
        theme="evidence"
        title="الأدلة"
        subtitle={`${caseData.evidence.length} أحراز`}
        lines={caseData.evidence.slice(0, 3).map((e) => '• ' + e.title.split(' ').slice(0,3).join(' '))}
        hoverLabel="📂 ملف الأدلة (انقر للقراءة)"
        onSelect={() => onSelectFile('evidence')}
        onHover={onHoverObject}
      />
      <DeskPaper
        position={[0.32, 0.826, -0.27]}
        rotationY={0.04}
        theme="characters"
        title="الأطراف"
        subtitle={`${caseData.characters.length} شخصيات`}
        lines={caseData.characters.slice(0, 5).map((c) => '• ' + c.name)}
        hoverLabel="👥 ملف الشخصيات (انقر للقراءة)"
        onSelect={() => onSelectFile('characters')}
        onHover={onHoverObject}
      />
      <DeskPaper
        position={[-0.17, 0.862, 0.16]}
        rotationY={0.05}
        theme="notes"
        title="ملاحظات القاضي"
        subtitle={deskNoteSubtitle}
        lines={deskNoteLines}
        hoverLabel="📝 ملاحظات القضية (انقر للقراءة)"
        onSelect={() => onSelectFile('notes')}
        onHover={onHoverObject}
      />
      <DeskPaper
        position={[0.11, 0.856, 0.12]}
        rotationY={0}
        theme="verdict"
        title="⚖ إصدار الحكم"
        subtitle="اضغط لإصدار الحكم"
        lines={['براءة', 'إدانة', 'كفالة / إعادة']}
        hoverLabel="⚖ ملف الحكم (انقر لإصدار الحكم)"
        onSelect={() => onSelectFile('verdict')}
        onHover={onHoverObject}
      />

      </group>

      {/* 7. Court Official Seal Stamp & Ink Pad */}
      <group
        position={[-0.54, 0.826, 0.28]}
        rotation={[0, 0.2, 0]}
        {...sealTapHandlers}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverObject('🏛️ ختم المحكمة الرسمي');
        }}
        onPointerOut={() => onHoverObject(null)}
      >
        <mesh position={[0, 0.015, 0]} material={materials.courtSealBrass} castShadow>
          <cylinderGeometry args={[0.024, 0.026, 0.015, 16]} />
        </mesh>
        <mesh position={[0, 0.045, 0]} material={materials.stampWood} castShadow>
          <cylinderGeometry args={[0.014, 0.018, 0.05, 12]} />
        </mesh>
        <mesh position={[0, 0.075, 0]} material={materials.courtSealBrass}>
          <sphereGeometry args={[0.018, 12, 12]} />
        </mesh>
        {/* Ink Pad Case */}
        <mesh position={[0.07, 0.005, 0]} material={materials.richWalnut}>
          <boxGeometry args={[0.07, 0.01, 0.06]} />
        </mesh>
        <mesh position={[0.07, 0.011, 0]} material={materials.fountainPen}>
          <boxGeometry args={[0.06, 0.004, 0.05]} />
        </mesh>
      </group>

      {/* 8. Gavel & Sounding Block on the right */}
      <Gavel
        position={[0.4, 0.826, 0.2]}
        rotationY={-0.3}
        onStrike={onGavelStrike}
        onHover={onHoverObject}
        strikesCount={gavelStrikes}
      />

      {/* 9. Traditional Banker's Desk Lamp on the left corner */}
      <DeskLamp
        position={[-0.6, 0.826, -0.4]}
        rotationY={0.5}
        lampOn={lampOn}
        onToggle={onToggleLamp}
        onHover={onHoverObject}
        quality="high"
      />

      {/* 10. Courtroom Gooseneck Microphone in front center */}
      <Microphone
        position={[-0.66, 0.826, 0.42]}
        rotationY={0}
        micActive={micActive}
        onToggle={onToggleMicrophone}
        onHover={onHoverObject}
      />
    </group>
  );
}

