import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  GamePhase,
  FileId,
  CourtFileItem,
  CaseData,
  SeasonDefinition,
  LevelDefinition,
  GameProgressState,
  GameSettings,
  InvestigationState,
  PreTrialBailDecision,
  SubmittedCaseJudgment,
  CaseEvaluationResult,
  LifetimeCareerStats,
} from '../types';
import { DEFAULT_CASE_DATA } from './FileSystem';
import {
  SEASONS_DATA,
  loadGameProgress,
  saveGameProgress,
  loadGameSettings,
  saveGameSettings,
  DEFAULT_PROGRESS,
} from './CaseDatabase';
import {
  loadCareerStats,
  applyCaseOutcome,
  resetCareerStats,
} from './CareerProgress';
import { evaluateCaseJudgment } from './ScoringEngine';
import { formatMoneyEGP } from './VerdictRules';
import { audioManager } from '../audio/AudioManager';

const INITIAL_INVESTIGATION: InvestigationState = {
  examinedFiles: [],
  examinedEvidenceIds: [],
  examinedCharacterIds: [],
  askedQuestions: {},
  discoveredNotes: [],
  discoveredContradictions: [],
  bailDecisions: {},
};

function shortenForDeskPaper(text: string): string {
  const clean = text.replace(/^•\s*/, '').trim();
  const words = clean.split(' ');
  if (words.length <= 6) return `• ${clean}`;
  return `• ${words.slice(0, 6).join(' ')}…`;
}

export function useCourtGame(initialCase: CaseData = DEFAULT_CASE_DATA) {
  // Navigation & Screen Phase
  const [phase, setPhase] = useState<GamePhase>('MAIN_MENU');
  const [profileReturnPhase, setProfileReturnPhase] = useState<GamePhase>('MAIN_MENU');

  // Seasons and Levels state
  const [seasons] = useState<SeasonDefinition[]>(SEASONS_DATA);
  const [selectedSeason, setSelectedSeason] = useState<SeasonDefinition>(SEASONS_DATA[0]);
  const [selectedLevel, setSelectedLevel] = useState<LevelDefinition>(SEASONS_DATA[0].levels[0]);

  // Persistent Progress, Career Stats & Settings
  const [progress, setProgress] = useState<GameProgressState>(loadGameProgress);
  const [careerStats, setCareerStats] = useState<LifetimeCareerStats>(loadCareerStats);
  const [settings, setSettings] = useState<GameSettings>(loadGameSettings);

  // Active Courtroom Case Data
  const [caseData, setCaseData] = useState<CaseData>(initialCase);
  const [files, setFiles] = useState<CourtFileItem[]>(initialCase.documents);
  const [activeFileId, setActiveFileId] = useState<FileId | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isInterrogating, setIsInterrogating] = useState<boolean>(false);
  const [isVerdictOpen, setIsVerdictOpen] = useState<boolean>(false);
  const [investigation, setInvestigation] = useState<InvestigationState>(INITIAL_INVESTIGATION);
  const [lastEvaluation, setLastEvaluation] = useState<CaseEvaluationResult | null>(null);

  // Desk State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.sound);
  const [lampOn, setLampOn] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [gavelStrikes, setGavelStrikes] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  // Clear feedback toast timer
  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = setTimeout(() => {
      setFeedbackMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  const showFeedback = useCallback((msg: string) => {
    setFeedbackMessage(msg);
  }, []);

  // Update sound engine on settings change
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveGameSettings(updated);
      if (typeof updated.sound === 'boolean') {
        setSoundEnabled(updated.sound);
        audioManager.setMuted(!updated.sound);
      }
      audioManager.setMusic(updated.music !== false);
      audioManager.setSfx(updated.sfx !== false);
      return updated;
    });
  }, []);

  useEffect(() => {
    audioManager.setMusic(settings.music !== false);
    audioManager.setSfx(settings.sfx !== false);
    audioManager.setMuted(!settings.sound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSound = useCallback(() => {
    updateSettings({ sound: !soundEnabled });
  }, [soundEnabled, updateSettings]);

  // Reset Progress & Career Stats
  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    saveGameProgress(DEFAULT_PROGRESS);
    setCareerStats(resetCareerStats());
    showFeedback('تمت إعادة ضبط سجل القضايا والرتبة والنجوم');
  }, [showFeedback]);

  // Navigation handlers
  const goToMainMenu = useCallback(() => {
    audioManager.playPaperRustle();
    setActiveFileId(null);
    setIsInterrogating(false);
    setIsVerdictOpen(false);
    setPhase('MAIN_MENU');
  }, []);

  const goToSeasons = useCallback(() => {
    audioManager.playPaperRustle();
    setPhase('SEASONS');
  }, []);

  const selectSeason = useCallback((season: SeasonDefinition) => {
    audioManager.playPaperRustle();
    setSelectedSeason(season);
    setPhase('LEVELS');
  }, []);

  const goToLevels = useCallback((season?: SeasonDefinition) => {
    audioManager.playPaperRustle();
    if (season) setSelectedSeason(season);
    setPhase('LEVELS');
  }, []);

  const selectLevel = useCallback((level: LevelDefinition) => {
    audioManager.playPaperRustle();
    setSelectedLevel(level);
    setPhase('CASE_BRIEF');
  }, []);

  const goToCaseBrief = useCallback((level?: LevelDefinition) => {
    audioManager.playPaperRustle();
    if (level) setSelectedLevel(level);
    setPhase('CASE_BRIEF');
  }, []);

  const goToArchive = useCallback(() => {
    audioManager.playPaperRustle();
    setPhase('CASE_ARCHIVE');
  }, []);

  const goToHowToPlay = useCallback(() => {
    audioManager.playPaperRustle();
    setPhase('HOW_TO_PLAY');
  }, []);

  const goToSettings = useCallback(() => {
    audioManager.playPaperRustle();
    setPhase('SETTINGS');
  }, []);

  const goToAbout = useCallback(() => {
    audioManager.playPaperRustle();
    setPhase('ABOUT');
  }, []);

  const openCareerProfile = useCallback(() => {
    audioManager.playPaperRustle();
    setProfileReturnPhase((prev) =>
      phase === 'CAREER_PROFILE' ? prev : phase,
    );
    setPhase('CAREER_PROFILE');
  }, [phase]);

  const closeCareerProfile = useCallback(() => {
    audioManager.playPaperRustle();
    setPhase(profileReturnPhase || 'MAIN_MENU');
  }, [profileReturnPhase]);

  // Launch Courtroom from CaseBrief or direct start
  const startCourtroomCase = useCallback(
    (levelToStart?: LevelDefinition) => {
      const targetLevel = levelToStart || selectedLevel;
      if (!targetLevel) return;

      setSelectedLevel(targetLevel);
      setCaseData(targetLevel.caseData);
      setFiles(targetLevel.caseData.documents);
      setActiveFileId(null);
      setCurrentPage(1);
      setIsInterrogating(false);
      setIsVerdictOpen(false);
      setInvestigation(INITIAL_INVESTIGATION);
      setLastEvaluation(null);

      setPhase('COURTROOM');
      audioManager.startAmbience();
      audioManager.playGavel();
      showFeedback(`بدأت الجلسة — ${targetLevel.title}`);
    },
    [selectedLevel, showFeedback],
  );

  // Complete trial with structured evaluation + persistent career update
  const finalizeCaseEvaluation = useCallback(
    (judgment: SubmittedCaseJudgment) => {
      const evaluation = evaluateCaseJudgment(caseData, judgment, investigation);

      // Update persistent lifetime career stats after EVERY case (best result per case)
      const { stats: updatedCareerStats, credit } = applyCaseOutcome(
        careerStats,
        selectedLevel.caseId,
        selectedLevel.title,
        evaluation,
      );
      setCareerStats(updatedCareerStats);

      // Update level progression & archive completion record
      const currentLevelId = selectedLevel.id;
      const currentCaseId = selectedLevel.caseId;

      const updatedProgress: GameProgressState = {
        ...progress,
        completedCases: {
          ...progress.completedCases,
          [currentCaseId]: {
            completedAt: new Date().toISOString(),
            verdictId: evaluation.verdictCorrect ? 'fair' : 'reviewed',
            verdictTitle: evaluation.headlineVerdictTitle,
            stars: evaluation.stars,
            fairnessLabel: evaluation.fairnessLabel,
          },
        },
      };

      // Unlock next level if the player delivered a correct & fair verdict (or scored >= 6)
      if (evaluation.verdictCorrect && evaluation.stars >= 6) {
        const currentSeasonLevels = selectedSeason.levels;
        const currentIdx = currentSeasonLevels.findIndex((lvl) => lvl.id === currentLevelId);
        if (currentIdx !== -1 && currentIdx + 1 < currentSeasonLevels.length) {
          const nextLvl = currentSeasonLevels[currentIdx + 1];
          if (!updatedProgress.unlockedLevelIds.includes(nextLvl.id)) {
            updatedProgress.unlockedLevelIds.push(nextLvl.id);
          }
        }
      }

      setProgress(updatedProgress);
      saveGameProgress(updatedProgress);
      setLastEvaluation({ ...evaluation, careerCredit: credit });
      setIsVerdictOpen(false);
      setActiveFileId(null);
      setPhase('LEVEL_COMPLETE');
    },
    [caseData, investigation, selectedLevel, selectedSeason, progress, careerStats],
  );

  // Play next level if available
  const playNextLevel = useCallback(() => {
    const currentSeasonLevels = selectedSeason.levels;
    const currentIdx = currentSeasonLevels.findIndex((lvl) => lvl.id === selectedLevel.id);
    if (currentIdx !== -1 && currentIdx + 1 < currentSeasonLevels.length) {
      const nextLvl = currentSeasonLevels[currentIdx + 1];
      startCourtroomCase(nextLvl);
    } else {
      setPhase('LEVELS');
    }
  }, [selectedSeason, selectedLevel, startCourtroomCase]);

  // Courtroom interactions
  const handleGavelStrike = useCallback(() => {
    setGavelStrikes((prev) => prev + 1);
    if (settings.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    audioManager.playGavel();
    showFeedback('«هدوء في القاعة!»');
  }, [showFeedback, settings.vibration]);

  const toggleLamp = useCallback(() => {
    setLampOn((prev) => {
      const next = !prev;
      audioManager.playLampSwitch(next);
      showFeedback(next ? 'تم تشغيل مصباح المنصة' : 'تم إطفاء مصباح المنصة');
      return next;
    });
  }, [showFeedback]);

  const toggleMicrophone = useCallback(() => {
    setMicActive((prev) => {
      const next = !prev;
      audioManager.playMicClick();
      showFeedback(next ? 'الميكروفون نشط — صوت القاضي مسموع' : 'تم إيقاف الميكروفون');
      return next;
    });
  }, [showFeedback]);

  const startInterrogation = useCallback(() => {
    audioManager.playPaperRustle();
    setIsInterrogating(true);
  }, []);

  const stopInterrogation = useCallback(() => {
    setIsInterrogating(false);
  }, []);

  const handleQuestionAnswered = useCallback(
    (personKey: string, questionId: string, note: string, contradictionText?: string) => {
      setInvestigation((prev) => {
        const prevAsked = prev.askedQuestions[personKey] || [];
        const askedQuestions = prevAsked.includes(questionId)
          ? prev.askedQuestions
          : { ...prev.askedQuestions, [personKey]: [...prevAsked, questionId] };

        const discoveredNotes =
          note && !prev.discoveredNotes.includes(note)
            ? [...prev.discoveredNotes, note]
            : prev.discoveredNotes;

        const discoveredContradictions =
          contradictionText && !prev.discoveredContradictions.includes(contradictionText)
            ? [...prev.discoveredContradictions, contradictionText]
            : prev.discoveredContradictions;

        return {
          ...prev,
          askedQuestions,
          discoveredNotes,
          discoveredContradictions,
        };
      });
      showFeedback('تم تدوين استنتاج قضائي جديد في ملاحظات القاضي');
    },
    [showFeedback],
  );

  const handleRecordBailDecision = useCallback(
    (decision: PreTrialBailDecision) => {
      audioManager.playGavel();
      setGavelStrikes((prev) => prev + 1);
      setInvestigation((prev) => {
        const bailDecisions = {
          ...prev.bailDecisions,
          [decision.defendantId]: decision,
        };
        const label =
          decision.decision === 'bail_granted'
            ? `قرار ما قبل الحكم: ${decision.note} (${formatMoneyEGP(decision.bailAmount || 0)})`
            : `قرار ما قبل الحكم: ${decision.note}`;
        const discoveredNotes = prev.discoveredNotes.includes(label)
          ? prev.discoveredNotes
          : [...prev.discoveredNotes, label];

        return {
          ...prev,
          bailDecisions,
          discoveredNotes,
        };
      });
      showFeedback(`تم تسجيل قرار التوقيف/الكفالة: ${decision.note}`);
    },
    [showFeedback],
  );

  const openFile = useCallback(
    (fileId: FileId) => {
      if (fileId === 'verdict') {
        audioManager.playPaperRustle();
        setIsVerdictOpen(true);
        return;
      }

      const targetFile = files.find((f) => f.id === fileId);
      if (!targetFile) return;

      audioManager.playPaperRustle();
      setActiveFileId(fileId);
      setCurrentPage(1);

      // Track examined dossiers & unlock investigation findings
      setInvestigation((prev) => {
        const examinedFiles = prev.examinedFiles.includes(fileId)
          ? prev.examinedFiles
          : [...prev.examinedFiles, fileId];

        let examinedEvidenceIds = prev.examinedEvidenceIds;
        let examinedCharacterIds = prev.examinedCharacterIds;
        let discoveredNotes = [...prev.discoveredNotes];
        let discoveredContradictions = [...prev.discoveredContradictions];

        if (fileId === 'case_file' && !prev.examinedFiles.includes('case_file')) {
          const note = 'فحص لائحة الاتهام: 3 متهمين والقبو فُتح ببطاقة كريم المنصور في 23:43.';
          if (!discoveredNotes.includes(note)) discoveredNotes.push(note);
        }

        if (fileId === 'evidence') {
          examinedEvidenceIds = caseData.evidence.map((e) => e.id);
          if (!prev.examinedFiles.includes('evidence')) {
            const evNotes = [
              'تقرير المعمل: بطاقة كريم استُنسخت لاسلكياً والخزنة فُتحت بقفازات مهنية.',
              'أحراز القبو: مفتاح منذر وهبة بمسرح الجريمة وأمر قطع البث من محطة مؤمن رزق.',
            ];
            for (const n of evNotes) {
              if (!discoveredNotes.includes(n)) discoveredNotes.push(n);
            }
          }
        }

        if (fileId === 'characters' || fileId === 'witnesses') {
          examinedCharacterIds = caseData.characters.map((c) => c.id);
          if (!prev.examinedFiles.includes('characters')) {
            const cNote = 'ملف الأطراف: ديون قمار وحوالة مجهولة لمنذر، وشهادة الحارس تكذب مؤمن.';
            if (!discoveredNotes.includes(cNote)) discoveredNotes.push(cNote);
            const cContradiction = 'تناقض مؤمن رزق: يدعي المرض بينما سجل غرفته فتح في 23:44.';
            if (!discoveredContradictions.includes(cContradiction)) {
              discoveredContradictions.push(cContradiction);
            }
          }
        }

        return {
          ...prev,
          examinedFiles,
          examinedEvidenceIds,
          examinedCharacterIds,
          discoveredNotes,
          discoveredContradictions,
        };
      });

      if (fileId === 'case_file') setPhase('CASE_FILE');
      else if (fileId === 'evidence') setPhase('EVIDENCE');
      else if (fileId === 'characters' || fileId === 'witnesses') setPhase('CHARACTERS');
      else if (fileId === 'notes') setPhase('NOTES');
    },
    [files, caseData.evidence, caseData.characters],
  );

  const closeActiveFile = useCallback(() => {
    if (!activeFileId) return;

    audioManager.playPaperRustle();

    setFiles((prevFiles) => {
      const index = prevFiles.findIndex((f) => f.id === activeFileId);
      if (index === -1) return prevFiles;

      const nextFiles = [...prevFiles];
      nextFiles[index] = {
        ...nextFiles[index],
        status: 'completed',
        badgeText: 'تمت المراجعة',
      };
      return nextFiles;
    });

    setActiveFileId(null);
    setPhase('COURTROOM');
  }, [activeFileId]);

  const nextPage = useCallback(() => {
    const activeFile = files.find((f) => f.id === activeFileId);
    if (activeFile && currentPage < activeFile.pages.length) {
      audioManager.playPaperRustle();
      setCurrentPage((prev) => prev + 1);
    }
  }, [files, activeFileId, currentPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      audioManager.playPaperRustle();
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const resumeCourtroom = useCallback(() => {
    setLastEvaluation(null);
    setPhase('COURTROOM');
  }, []);

  const closeVerdict = useCallback(() => {
    setIsVerdictOpen(false);
  }, []);

  const handleSubmitJudgment = useCallback(
    (judgment: SubmittedCaseJudgment) => {
      setGavelStrikes((prev) => prev + 1);
      if (settings.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      showFeedback('تم طرق المطرقة وتوثيق الحكم في سجلات المحكمة');
      audioManager.playGavel();
      setIsVerdictOpen(false);
      // Let the 3D gavel strike and defendant reaction play out before showing the result screen
      setTimeout(() => finalizeCaseEvaluation(judgment), 1100);
    },
    [showFeedback, finalizeCaseEvaluation, settings.vibration],
  );

  const activeDocument = files.find((f) => f.id === activeFileId) || null;

  // Dynamic Judge's Notes rendered directly onto the 3D desk paper
  const { deskNoteLines, deskNoteSubtitle } = useMemo(() => {
    const discovered = investigation.discoveredNotes;
    if (discovered.length === 0) {
      return {
        deskNoteSubtitle: 'بانتظار فحص الأدلة',
        deskNoteLines: [
          '• افحص ملف القضية والأحراز',
          '• استجوب المتهمين الثلاثة',
          '• اسمع شهادة الحارس طارق',
        ],
      };
    }

    const latestThree = discovered.slice(-3).map(shortenForDeskPaper);
    return {
      deskNoteSubtitle: `${discovered.length} استنتاجات مدوّنة`,
      deskNoteLines: latestThree,
    };
  }, [investigation.discoveredNotes]);

  return {
    // Navigation
    phase,
    setPhase,
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
    goToCaseBrief,
    goToArchive,
    goToHowToPlay,
    goToSettings,
    goToAbout,
    openCareerProfile,
    closeCareerProfile,
    startCourtroomCase,
    playNextLevel,
    lastEvaluation,

    // Case and File state
    caseData,
    setCaseData,
    files,
    activeFileId,
    activeDocument,
    currentPage,
    isInterrogating,
    isVerdictOpen,
    investigation,
    deskNoteLines,
    deskNoteSubtitle,

    // Desk and Audio state
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
    resumeCourtroom,
    handleSubmitJudgment,
    toggleSound,
    showFeedback,
  };
}
