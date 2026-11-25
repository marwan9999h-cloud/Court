import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CourtroomEnvironment } from './CourtroomEnvironment';
import { BackgroundCharacters } from './BackgroundCharacters';
import { Defendant } from './Defendant';
import { Witness } from './Witness';
import { JudgeDesk } from './JudgeDesk';
import { CameraController } from './CameraController';
import { CaseData, FileId, GamePhase } from '../types';

interface CourtroomSceneProps {
  phase: GamePhase;
  caseData: CaseData;
  activeFileId: FileId | null;
  isInterrogating: boolean;
  isModalOpen: boolean;
  lampOn: boolean;
  micActive: boolean;
  gavelStrikes: number;
  deskNoteLines: string[];
  deskNoteSubtitle?: string;
  onSelectFile: (fileId: FileId) => void;
  onInterrogateDefendant: (who?: 'karim' | 'munther' | 'moamen') => void;
  onTestifyWitness: () => void;
  onGavelStrike: () => void;
  onToggleLamp: () => void;
  onToggleMicrophone: () => void;
  onHoverObject: (label: string | null) => void;
}

export function CourtroomScene({
  phase,
  caseData,
  activeFileId,
  isInterrogating,
  isModalOpen,
  lampOn,
  micActive,
  gavelStrikes,
  deskNoteLines,
  deskNoteSubtitle,
  onSelectFile,
  onInterrogateDefendant,
  onTestifyWitness,
  onGavelStrike,
  onToggleLamp,
  onToggleMicrophone,
  onHoverObject,
}: CourtroomSceneProps) {
  const accused1 = caseData.characters.find((ch) => ch.id === 'char_defendant');
  const accused2 = caseData.characters.find((ch) => ch.id === 'char_maintenance');
  const accused3 = caseData.characters.find((ch) => ch.id === 'char_control');
  const witnessGuard = caseData.characters.find((ch) => ch.id === 'char_guard');

  return (
    <div id="courtroom-canvas-container" className="w-full h-full relative cursor-default touch-none">
      <Canvas
        frameloop={phase === 'SETTINGS' || phase === 'ABOUT' || phase === 'HOW_TO_PLAY' || phase === 'LEVEL_COMPLETE' || phase === 'CASE_ARCHIVE' || phase === 'CAREER_PROFILE' ? 'never' : 'always'}
        shadows
        camera={{
          position: [0, 1.56, 0.82],
          fov: 72,
          near: 0.1,
          far: 100,
        }}
        dpr={typeof window !== 'undefined' ? [1, Math.min(window.devicePixelRatio, 2)] : 1}
        gl={{
          antialias: true,
          powerPreference: 'default',
        }}
      >
        <color attach="background" args={['#1a130e']} />
        <Suspense fallback={null}>
          {/* First-person fixed Judge perspective controller with smooth touch/mouse look */}
          <CameraController
            phase={phase}
            activeFileId={activeFileId}
            isInterrogating={isInterrogating}
            isModalOpen={isModalOpen}
          />

          {/* 1. Global Courtroom Ambient Light */}
          <ambientLight color="#fef4e5" intensity={0.9} />

          {/* 2. Main Key Directional Sunlight through high courtroom clerestory windows */}
          <directionalLight
            position={[6, 12, 6]}
            color="#ffffff"
            intensity={1.25}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />

          {/* 3. Soft Window Fill Light */}
          <directionalLight
            position={[-7, 8, -4]}
            color="#d8e8f8"
            intensity={0.7}
          />

          {/* 4. Judge Desk Focused Warm Spotlight */}
          <pointLight
            position={[0, 2.6, 0.3]}
            color="#ffeec7"
            intensity={0.75}
            distance={7}
            decay={1}
          />

          {/* 5. Central Chandelier Ambient Courtroom Glow */}
          <pointLight
            position={[0, 6.0, -4.5]}
            color="#ffd99e"
            intensity={1.0}
            distance={18}
            decay={1.5}
          />

          {/* 6. Procedural Courtroom Architecture & Paneling */}
          <CourtroomEnvironment quality="high" />

          {/* 7. The Three Accused Standing Side by Side in Prison Uniforms */}
          <Defendant
            name={accused1?.name || caseData.defendantNames[0] || 'المتهم الأول'}
            position={[-1.85, 0, -4.6]}
            rotationY={0.08}
            reactKey={gavelStrikes}
            striped
            info={accused1}
            onInterrogate={() => onInterrogateDefendant('karim')}
            onHover={onHoverObject}
          />
          <Defendant
            name={accused2?.name || 'المتهم الثاني'}
            position={[0, 0, -4.6]}
            rotationY={0}
            reactKey={gavelStrikes}
            striped
            info={accused2}
            onInterrogate={() => onInterrogateDefendant('munther')}
            onHover={onHoverObject}
          />
          <Defendant
            name={accused3?.name || 'المتهم الثالث'}
            position={[1.85, 0, -4.6]}
            rotationY={-0.08}
            reactKey={gavelStrikes}
            striped
            info={accused3}
            onInterrogate={() => onInterrogateDefendant('moamen')}
            onHover={onHoverObject}
          />

          {/* 7b. Key Witness Standing Behind the Accused (Night Guard) */}
          <Witness
            name={witnessGuard?.name || 'الشاهد'}
            position={[3.45, 0, -5.85]}
            rotationY={-0.16}
            info={witnessGuard}
            onTestify={onTestifyWitness}
            onHover={onHoverObject}
          />

          {/* 8. Courtroom Legal Personnel & Audience (Defense, Prosecution, Guard, Spectators) */}
          <BackgroundCharacters />

          {/* 9. Foreground Interactive Judge Desk (Case File, Core Papers, Gavel, Lamp, Mic) */}
          <JudgeDesk
            caseData={caseData}
            lampOn={lampOn}
            micActive={micActive}
            gavelStrikes={gavelStrikes}
            deskNoteLines={deskNoteLines}
            deskNoteSubtitle={deskNoteSubtitle}
            onSelectFile={onSelectFile}
            onGavelStrike={onGavelStrike}
            onToggleLamp={onToggleLamp}
            onToggleMicrophone={onToggleMicrophone}
            onHoverObject={onHoverObject}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
