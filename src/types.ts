export type AppScreen =
  | 'MAIN_MENU'
  | 'SEASONS'
  | 'LEVELS'
  | 'CASE_BRIEF'
  | 'COURTROOM'
  | 'LEVEL_COMPLETE'
  | 'CASE_ARCHIVE'
  | 'HOW_TO_PLAY'
  | 'SETTINGS'
  | 'ABOUT';

export type GamePhase =
  | 'INTRO'
  | 'MAIN_MENU'
  | 'SEASONS'
  | 'LEVELS'
  | 'CASE_BRIEF'
  | 'COURTROOM'
  | 'CASE_FILE'
  | 'EVIDENCE'
  | 'CHARACTERS'
  | 'WITNESSES'
  | 'NOTES'
  | 'INTERROGATION'
  | 'VERDICT'
  | 'LEVEL_COMPLETE'
  | 'CASE_ARCHIVE'
  | 'HOW_TO_PLAY'
  | 'SETTINGS'
  | 'ABOUT'
  | 'CAREER_PROFILE';

export type FileId = 'case_file' | 'evidence' | 'characters' | 'witnesses' | 'notes' | 'verdict';

export type FileStatus = 'locked' | 'active' | 'completed';

export interface EvidenceItem {
  id: string;
  code: string;
  title: string;
  type: string;
  source: string;
  labResult: string;
  description: string;
  keyFinding: string;
  tag: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  age: string;
  status: string;
  testimony: string;
  motiveOrAlibi: string;
  suspicionScore: number;
  contradiction: string;
  isDefendant?: boolean;
}

export interface InterrogationQuestion {
  id: string;
  question: string;
  response: string;
  unlockedNote?: string;
  reaction: 'nervous' | 'confident' | 'defensive' | 'hesitant';
}

export interface DocumentPage {
  pageNumber: number;
  headerTitle: string;
  sectionTitle: string;
  contentParagraphs: string[];
  stampText?: string;
  caseDetails?: {
    label: string;
    value: string;
  }[];
  signatures?: string[];
}

export interface CourtFileItem {
  id: FileId;
  code: string;
  title: string;
  subtitle: string;
  status: FileStatus;
  color: string;
  accentColor: string;
  badgeText?: string;
  pages: DocumentPage[];
}

export interface VerdictOption {
  id: 'guilty' | 'innocent' | 'reinvestigate';
  title: string;
  subtitle: string;
  decisionText: string;
  reasoning: string;
  consequences: string[];
}

// --- New Verdict, Sentencing & Evaluation Types ---

export type VerdictType =
  | 'acquittal'
  | 'guilty'
  | 'death_penalty'
  | 'fine'
  | 'suspended'
  | 'probation'
  | 'dismissed'
  | 'retrial';

export type PreTrialDecisionType = 'bail_granted' | 'bail_denied';

export type PrisonDurationId =
  | '14_days'
  | '1_month'
  | '3_months'
  | '6_months'
  | '1_year'
  | '3_years'
  | '5_years'
  | '10_years'
  | '15_years'
  | '25_years'
  | 'life';

export type ReasonCategoryId =
  | 'forensic_proof'
  | 'card_cloning_innocence'
  | 'witness_contradiction'
  | 'co_conspiracy_sabotage'
  | 'insufficient_evidence'
  | 'negligence_without_intent'
  | 'procedural_remand'
  | 'premeditated_intent';

export interface PrisonDurationOption {
  id: PrisonDurationId;
  label: string;
  months: number;
}

export interface ReasonCategoryOption {
  id: ReasonCategoryId;
  label: string;
  description: string;
}

export interface DefendantVerdictRule {
  defendantId: string;
  defendantName: string;
  roleLabel: string;
  chargeTitle: string;
  chargeSeverity: 'minor' | 'felony' | 'capital';
  isActuallyGuilty: boolean;
  expectedOutcome: 'acquittal' | 'guilty';
  acceptableVerdictTypes: VerdictType[];
  idealSentenceMonths: number;
  minAcceptableMonths: number;
  maxAcceptableMonths: number;
  idealFineAmount?: number;
  allowBailPreTrial: boolean;
  recommendedBailDecision: PreTrialDecisionType;
  recommendedBailAmount?: number;
  keyEvidenceIds: string[];
  keyTestimonyIds: string[];
  weakOrWrongEvidenceIds: string[];
  preferredReasons: ReasonCategoryId[];
  truthExplanation: string;
  notes?: {
    acquittalFair?: string;
    innocentConvicted?: string;
    lenientPenalty?: string;
    deathPenaltyFair?: string;
    deathPenaltyHarsh?: string;
  };
}

export interface CaseVerdictConfig {
  caseId: string;
  stage: 'pretrial' | 'trial';
  allowPreTrialBail: boolean;
  allowDeathPenalty: boolean;
  availableVerdictTypes: VerdictType[];
  prisonOptions: PrisonDurationId[];
  fineOptions: number[];
  bailOptions: number[];
  availableReasons: ReasonCategoryId[];
  defendantRules: DefendantVerdictRule[];
  truthOverview: string;
  simulationNotice: string;
}

export interface PreTrialBailDecision {
  defendantId: string;
  decision: PreTrialDecisionType;
  bailAmount?: number;
  note: string;
}

export interface SubmittedDefendantJudgment {
  defendantId: string;
  verdictType: VerdictType;
  prisonDuration?: PrisonDurationId;
  fineAmount?: number;
  reasonCategory: ReasonCategoryId;
  selectedEvidenceIds: string[];
  selectedTestimonyIds: string[];
}

export interface SubmittedCaseJudgment {
  defendantJudgments: SubmittedDefendantJudgment[];
  bailDecisions: Record<string, PreTrialBailDecision>;
}

export type FairnessLabel =
  | 'حكم عادل'
  | 'حكم جائر — إدانة بريء'
  | 'حكم جائر — إفلات مذنب'
  | 'حكم جائر — عقوبة مبالغ فيها'
  | 'حكم جائر — تساهل مخل'
  | 'حكم غير حاسم — تأجيل الفصل';

export interface DefendantEvaluation {
  defendantId: string;
  defendantName: string;
  verdictCorrect: boolean;
  isFair: boolean;
  fairnessLabel: FairnessLabel;
  verdictSummary: string;
  feedback: string;
}

export interface CaseCareerCredit {
  isReplay: boolean;
  previousBestStars: number | null;
  bestStars: number;
  starsAdded: number;
}

export interface CaseEvaluationResult {
  stars: number; // 0..10 in 0.5 steps
  verdictCorrect: boolean;
  isFair: boolean;
  fairnessLabel: FairnessLabel;
  headlineVerdictTitle: string;
  breakdown: {
    verdictScore: number;          // / 4.0
    proportionalityScore: number;  // / 2.5
    justificationScore: number;    // / 2.0
    thoroughnessScore: number;     // / 1.5
    thoroughnessCapApplied: boolean;
  };
  defendantResults: DefendantEvaluation[];
  explanation: {
    truthSummary: string;
    provingEvidence: string[];
    missedItems: string[];
    sentencingFeedback: string;
    simulationNote: string;
  };
  bailFeedback?: string;
  careerCredit?: CaseCareerCredit;
}

export interface InvestigationState {
  examinedFiles: FileId[];
  examinedEvidenceIds: string[];
  examinedCharacterIds: string[];
  askedQuestions: Record<string, string[]>; // personKey -> questionIds
  discoveredNotes: string[];
  discoveredContradictions: string[];
  bailDecisions: Record<string, PreTrialBailDecision>;
}

export interface CaseHistoryRecord {
  id: string;
  caseId: string;
  caseTitle: string;
  stars: number;
  verdictCorrect: boolean;
  isFair: boolean;
  fairnessLabel: FairnessLabel;
  verdictSummary: string;
  playedAt: string;
  isReplay?: boolean;
  starsAdded?: number;
}

export interface CareerRankInfo {
  title: string;
  minStars: number;
  nextRankTitle: string | null;
  nextRankStars: number | null;
}

export interface LifetimeCareerStats {
  totalStars: number;
  casesPlayed: number;
  averageStars: number;
  correctVerdicts: number;
  fairVerdicts: number;
  unjustVerdicts: number;
  bestStarsByCase: Record<string, number>;
  history: CaseHistoryRecord[];
}

export interface CaseCoverInfo {
  courtHeader: string;
  fileNumber: string;
  caseTitle: string;
  caseType: string;
  classification: string;
  date: string;
}

export interface CaseData {
  seasonId: string;
  levelId: string;
  caseId: string;
  caseNumber: string;
  title: string;
  type: string;
  description: string;
  briefSummary: string;
  confidentiality: string;
  sessionDate: string;
  courtName: string;
  defendantNames: string[];
  coverInfo: CaseCoverInfo;
  characters: CharacterProfile[];
  evidence: EvidenceItem[];
  documents: CourtFileItem[];
  notes: string[];
  timeline?: { time: string; event: string }[];
  contradictions?: string[];
  interrogations: InterrogationQuestion[];
  interrogations2?: InterrogationQuestion[];
  interrogations3?: InterrogationQuestion[];
  witnessQuestions?: InterrogationQuestion[];
  verdicts: VerdictOption[];
  verdictConfig?: CaseVerdictConfig;
  unlockRequirement?: string;
}

export interface LevelDefinition {
  id: string;
  levelNumber: number;
  fileCode: string; // e.g. "FILE 001"
  caseId: string;   // e.g. "crime_s01_file001"
  title: string;
  caseType: string;
  briefSummary: string;
  unlockRequirement?: string;
  caseData: CaseData;
}

export interface SeasonDefinition {
  id: string;
  seasonNumber: number;
  title: string;
  subtitle: string;
  totalLevels: number;
  isUnlocked: boolean;
  lockReason?: string;
  levels: LevelDefinition[];
}

export interface GameProgressState {
  completedCases: {
    [caseId: string]: {
      completedAt: string;
      verdictId: string;
      verdictTitle: string;
      stars?: number;
      fairnessLabel?: string;
    };
  };
  unlockedLevelIds: string[];
  unlockedSeasonIds: string[];
}

export interface GameSettings {
  sound: boolean;
  music: boolean;
  sfx: boolean;
  vibration: boolean;
  language: string;
}

export interface InteractiveDeskState {
  lampOn: boolean;
  gavelStrikes: number;
  micActive: boolean;
  notesInspected: boolean;
  activeFileId: FileId | null;
  soundEnabled: boolean;
  feedbackMessage: string | null;
  hoveredObject: string | null;
}
