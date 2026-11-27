/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useCourtGame } from './game/GameState';
import {
  MUNTHER_INTERROGATION_QUESTIONS,
  MOAMEN_INTERROGATION_QUESTIONS,
  TAREK_WITNESS_QUESTIONS,
} from './game/FileSystem';
import { CourtroomScene } from './components/CourtroomScene';
import { MainMenu } from './ui/MainMenu';
import { SeasonsScreen } from './ui/SeasonsScreen';
import { LevelSelectScreen } from './ui/LevelSelectScreen';
import { CaseBriefScreen } from './ui/CaseBriefScreen';
import { LevelCompleteModal } from './ui/LevelCompleteModal';
import { CaseArchiveModal } from './ui/CaseArchiveModal';
import { HowToPlayModal } from './ui/HowToPlayModal';
import { SettingsModal } from './ui/SettingsModal';
import { AboutModal } from './ui/AboutModal';
import { CareerProfileModal } from './ui/CareerProfileModal';
import { DocumentViewer } from './ui/DocumentViewer';
import { InterrogationModal } from './ui/InterrogationModal';
import { VerdictModal } from './ui/VerdictModal';
import { MinimalOverlay } from './ui/MinimalOverlay';

export default function App() {
  const [interrogee, setInterrogee] = useState<'karim' | 'munther' | 'moamen' | 'tarek'>('karim');
  const {
    phase,
    seasons,
    selectedSeason,
    selectedLevel,
    progress,
    careerStats,
    settings,
    updateSettings,
    resetProgress,
    goToMainMenu,
    goToSeasons,
    selectSeason,
    goToLevels,
    selectLevel,
    goToArchive,
    goToHowToPlay,
    goToSettings,
    goToAbout,
    openCareerProfile,
    closeCareerProfile,
    startCourtroomCase,
    playNextLevel,
    lastEvaluation,

    caseData,
    activeFileId,
    activeDocument,
    currentPage,
    isInterrogating,
    isVerdictOpen,
    investigation,
    deskNoteLines,
    deskNoteSubtitle,
    soundEnabled,
    lampOn,
    micActive,
    gavelStrikes,
    feedbackMessage,
    hoveredObject,
    setHoveredObject,
    handleGavelStrike,
    toggleLamp,
    toggleMicrophone,
    startInterrogation,
    stopInterrogation,
    handleQuestionAnswered,
    handleRecordBailDecision,
    openFile,
    closeActiveFile,
    nextPage,
    prevPage,
    closeVerdict,
    handleSubmitJudgment,
    toggleSound,
  } = useCourtGame();

  const isModalOpen =
    isVerdictOpen || phase === 'LEVEL_COMPLETE' || phase === 'CAREER_PROFILE';

  // Resolve accused/witness profiles: original archive case uses fixed ids;
  // new cases flag defendants (isDefendant) and give the witness role 'witness'.
  const flaggedDefendants = caseData.characters.filter((c) => c.isDefendant);
  const accusedProfiles = [
    caseData.characters.find((c) => c.id === 'char_defendant') ?? flaggedDefendants[0],
    caseData.characters.find((c) => c.id === 'char_maintenance') ?? flaggedDefendants[1],
    caseData.characters.find((c) => c.id === 'char_control') ?? flaggedDefendants[2],
  ];
  const witnessProfile =
    caseData.characters.find((c) => c.id === 'char_guard') ??
    caseData.characters.find((c) => c.role === 'witness');

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-neutral-950 text-neutral-100 select-none font-sans">
      {/* 3D First-Person Courtroom & Judge Desk Canvas View */}
      <CourtroomScene
        phase={phase}
        caseData={caseData}
        activeFileId={activeFileId}
        isInterrogating={isInterrogating}
        isModalOpen={isModalOpen}
        lampOn={lampOn}
        micActive={micActive}
        gavelStrikes={gavelStrikes}
        deskNoteLines={deskNoteLines}
        deskNoteSubtitle={deskNoteSubtitle}
        onSelectFile={openFile}
        onInterrogateDefendant={(who) => {
          setInterrogee(who === 'munther' || who === 'moamen' ? who : 'karim');
          startInterrogation();
        }}
        onTestifyWitness={() => {
          setInterrogee('tarek');
          startInterrogation();
        }}
        onGavelStrike={handleGavelStrike}
        onToggleLamp={toggleLamp}
        onToggleMicrophone={toggleMicrophone}
        onHoverObject={setHoveredObject}
      />

      {/* Main Menu Screen */}
      {phase === 'MAIN_MENU' && (
        <MainMenu
          progress={progress}
          careerStats={careerStats}
          onStartGame={goToSeasons}
          onOpenArchive={goToArchive}
          onOpenHowToPlay={goToHowToPlay}
          onOpenSettings={goToSettings}
          onOpenAbout={goToAbout}
          onOpenCareerProfile={openCareerProfile}
        />
      )}

      {/* Seasons Select Screen */}
      {phase === 'SEASONS' && (
        <SeasonsScreen
          seasons={seasons}
          progress={progress}
          onSelectSeason={selectSeason}
          onBack={goToMainMenu}
        />
      )}

      {/* Case Levels Select Screen */}
      {phase === 'LEVELS' && (
        <LevelSelectScreen
          season={selectedSeason}
          progress={progress}
          onSelectLevel={selectLevel}
          onBack={goToSeasons}
        />
      )}

      {/* Case Brief Dossier Overview */}
      {phase === 'CASE_BRIEF' && (
        <CaseBriefScreen
          level={selectedLevel}
          onStartCase={() => startCourtroomCase()}
          onBack={() => goToLevels(selectedSeason)}
        />
      )}

      {/* Physical Court Document Reader Overlay with Case-Data Subviews */}
      {activeDocument && (
        <DocumentViewer
          document={activeDocument}
          caseData={caseData}
          investigation={investigation}
          currentPage={currentPage}
          onClose={closeActiveFile}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      )}

      {/* Interactive Defendant Examination & Witness Testimony Modal */}
      <InterrogationModal
        isOpen={isInterrogating}
        onClose={stopInterrogation}
        personKey={interrogee}
        askedQuestionIds={investigation.askedQuestions[interrogee] || []}
        onQuestionAnswered={handleQuestionAnswered}
        kind={interrogee === 'tarek' ? 'witness' : 'accused'}
        profile={
          interrogee === 'munther'
            ? accusedProfiles[1]
            : interrogee === 'moamen'
              ? accusedProfiles[2]
              : interrogee === 'tarek'
                ? witnessProfile
                : (accusedProfiles[0] ?? caseData.characters.find((c) => c.isDefendant))
        }
        questions={
          interrogee === 'munther'
            ? (caseData.interrogations2 ?? MUNTHER_INTERROGATION_QUESTIONS)
            : interrogee === 'moamen'
              ? (caseData.interrogations3 ?? MOAMEN_INTERROGATION_QUESTIONS)
              : interrogee === 'tarek'
                ? (caseData.witnessQuestions ?? TAREK_WITNESS_QUESTIONS)
                : caseData.interrogations
        }
        defendantName={
          interrogee === 'munther'
            ? accusedProfiles[1]?.name || caseData.defendantNames[1] || 'المتهم الثاني'
            : interrogee === 'moamen'
              ? accusedProfiles[2]?.name || caseData.defendantNames[2] || 'المتهم الثالث'
              : interrogee === 'tarek'
                ? witnessProfile?.name || 'الشاهد'
                : caseData.defendantNames[0] || 'المتهم'
        }
      />

      {/* Climax Judicial Verdict Pronouncement & Bail Modal */}
      <VerdictModal
        isOpen={isVerdictOpen}
        caseData={caseData}
        investigation={investigation}
        onClose={closeVerdict}
        onRecordBailDecision={handleRecordBailDecision}
        onSubmitJudgment={handleSubmitJudgment}
      />

      {/* Level / Trial Complete Scoring Modal */}
      {phase === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          level={selectedLevel}
          season={selectedSeason}
          evaluation={lastEvaluation}
          careerStats={careerStats}
          onPlayNextLevel={playNextLevel}
          onRetry={() => startCourtroomCase(selectedLevel)}
          onOpenProfile={openCareerProfile}
          onBackToLevels={() => goToLevels(selectedSeason)}
          onBackToMainMenu={goToMainMenu}
        />
      )}

      {/* Career Profile & Lifetime Stars Modal */}
      {phase === 'CAREER_PROFILE' && (
        <CareerProfileModal
          careerStats={careerStats}
          onClose={closeCareerProfile}
        />
      )}

      {/* Case Archive Modal */}
      {phase === 'CASE_ARCHIVE' && (
        <CaseArchiveModal
          seasons={seasons}
          progress={progress}
          onSelectLevel={(level) => {
            selectLevel(level);
            startCourtroomCase(level);
          }}
          onClose={goToMainMenu}
        />
      )}

      {/* How to Play Manual Modal */}
      {phase === 'HOW_TO_PLAY' && <HowToPlayModal onClose={goToMainMenu} />}

      {/* Settings Modal */}
      {phase === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onResetProgress={resetProgress}
          onClose={goToMainMenu}
        />
      )}

      {/* About Info Modal */}
      {phase === 'ABOUT' && <AboutModal onClose={goToMainMenu} />}

      {/* Non-intrusive Minimal Overlay: Case Header, Audio Toggle, Career Badge, Menu return */}
      <MinimalOverlay
        phase={phase}
        caseData={caseData}
        careerStats={careerStats}
        feedbackMessage={feedbackMessage}
        hoveredObject={hoveredObject}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onGoToMenu={goToMainMenu}
        onOpenSettings={goToSettings}
        onOpenCareerProfile={openCareerProfile}
      />
    </main>
  );
}
