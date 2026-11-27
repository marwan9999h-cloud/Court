import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { CourtroomEnvironment } from './CourtroomEnvironment';
import { BackgroundCharacters } from './BackgroundCharacters';
import { Defendant } from './Defendant';
import { Witness } from './Witness';
import { JudgeDesk } from './JudgeDesk';
import { CameraController } from './CameraController';
import { CaseData, FileId, GamePhase } from '../types';

const MODAL_PHASES: GamePhase[] = [
  'SETTINGS',
  'ABOUT',
  'HOW_TO_PLAY',
  'LEVEL_COMPLETE',
  'CASE_ARCHIVE',
  'CAREER_PROFILE',
];

/** Freezes the shadow map so it renders once instead of every frame (static scene).
 *  Shadows re-render once shortly after mount to catch the settled scene. */
function ShadowTuner() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    const id = window.setTimeout(() => {
      gl.shadowMap.needsUpdate = true;
    }, 2500);
    return () => window.clearTimeout(id);
  }, [gl]);
  return null;
}

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
  const flaggedDefendants = caseData.characters.filter((c) => c.isDefendant);
  // Full device sharpness by default (up to 2x); the governor below only steps
  // down after sustained very low FPS on weak devices.
  const [dpr, setDpr] = useState(() =>
    typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
  );
  const [lowTier, setLowTier] = useState(false);
  const declines = useRef(0);

  const frameloop = MODAL_PHASES.includes(phase) ? ('never' as const) : ('always' as const);
  const accused1 =
    caseData.characters.find((ch) => ch.id === 'char_defendant') ?? flaggedDefendants[0];
  const accused2 =
    caseData.characters.find((ch) => ch.id === 'char_maintenance') ?? flaggedDefendants[1];
  const accused3 =
    caseData.characters.find((ch) => ch.id === 'char_control') ?? flaggedDefendants[2];
  const witnessGuard =
    caseData.characters.find((ch) => ch.id === 'char_guard') ??
    caseData.characters.find((ch) => ch.role === 'witness');

  return (
    <div id="courtroom-canvas-container" className="w-full h-full relative cursor-default touch-none">
      <Canvas
        frameloop={frameloop}
        shadows
        camera={{
          position: [0, 1.56, 0.82],
          fov: 72,
          near: 0.1,
          far: 100,
        }}
        dpr={typeof window !== 'undefined' ? Math.max(1, dpr) : 1}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#1a130e']} />
        <ShadowTuner />
        <PerformanceMonitor
          ms={1000}
          iterations={10}
          flipflops={5}
          onDecline={() => {
            declines.current += 1;
            if (declines.current === 1) {
              setDpr(Math.min(window.devicePixelRatio || 1, 1.5));
            } else if (declines.current === 2) {
              setDpr(1);
            } else {
              setLowTier(true);
            }
          }}
          onIncline={() => {
            declines.current = Math.max(0, declines.current - 1);
            setDpr(Math.min(window.devicePixelRatio || 1, 2));
          }}
        />
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
          <CourtroomEnvironment quality={lowTier ? 'performance' : 'high'} />

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
            name={accused2?.name || caseData.defendantNames[1] || 'المتهم الثاني'}
            position={[0, 0, -4.6]}
            rotationY={0}
            reactKey={gavelStrikes}
            striped
            info={accused2}
            onInterrogate={() => onInterrogateDefendant('munther')}
            onHover={onHoverObject}
          />
          <Defendant
            name={accused3?.name || caseData.defendantNames[2] || 'المتهم الثالث'}
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
