import {
  CareerRankInfo,
  CaseCareerCredit,
  CaseEvaluationResult,
  CaseHistoryRecord,
  LifetimeCareerStats,
} from '../types';

export const LOCAL_STORAGE_CAREER_KEY = 'the_court_career_stats_v1';

export const CAREER_RANKS: { minStars: number; title: string }[] = [
  { minStars: 0, title: 'قاضٍ متدرب' },
  { minStars: 8, title: 'قاضي تحقيق ابتدائي' },
  { minStars: 18, title: 'قاضي محكمة جزئية' },
  { minStars: 32, title: 'مستشار دائرة الجنايات' },
  { minStars: 50, title: 'رئيس محكمة الجنايات' },
  { minStars: 75, title: 'كبير قضاة المحكمة العليا' },
];

export const DEFAULT_CAREER_STATS: LifetimeCareerStats = {
  totalStars: 0,
  casesPlayed: 0,
  averageStars: 0,
  correctVerdicts: 0,
  fairVerdicts: 0,
  unjustVerdicts: 0,
  bestStarsByCase: {},
  history: [],
};

function sanitizeBestStarsMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {};
  const cleaned: Record<string, number> = {};
  for (const [caseId, val] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof val === 'number' && Number.isFinite(val)) {
      const clamped = Math.max(0, Math.min(10, Math.round(val * 2) / 2));
      cleaned[caseId] = clamped;
    }
  }
  return cleaned;
}

function recomputeSummaryFromBestStars(bestStarsByCase: Record<string, number>): {
  totalStars: number;
  casesPlayed: number;
  averageStars: number;
} {
  const values = Object.values(bestStarsByCase);
  const casesPlayed = values.length;
  const rawTotal = values.reduce((sum, s) => sum + s, 0);
  const totalStars = Math.round(rawTotal * 10) / 10;
  const averageStars =
    casesPlayed > 0 ? Math.round((totalStars / casesPlayed) * 10) / 10 : 0;
  return { totalStars, casesPlayed, averageStars };
}

function migrateHistoryEntries(history: CaseHistoryRecord[]): {
  migrated: CaseHistoryRecord[];
  changed: boolean;
} {
  if (history.length === 0) return { migrated: history, changed: false };
  const needsMigration = history.some(
    (item) => typeof item.isReplay !== 'boolean' || typeof item.starsAdded !== 'number',
  );
  if (!needsMigration) return { migrated: history, changed: false };

  // History is stored newest-first; walk oldest-to-newest to compute replay & delta
  const runningBest: Record<string, number> = {};
  const chronological = [...history].reverse().map((item) => {
    const hasPrior = Object.prototype.hasOwnProperty.call(runningBest, item.caseId);
    const prevBest = hasPrior ? runningBest[item.caseId] : 0;
    const itemStars = typeof item.stars === 'number' && Number.isFinite(item.stars) ? item.stars : 0;
    const nextBest = hasPrior ? Math.max(prevBest, itemStars) : itemStars;
    const computedAdded = hasPrior
      ? Math.max(0, Math.round((nextBest - prevBest) * 10) / 10)
      : itemStars;
    runningBest[item.caseId] = nextBest;

    return {
      ...item,
      isReplay: typeof item.isReplay === 'boolean' ? item.isReplay : hasPrior,
      starsAdded: typeof item.starsAdded === 'number' ? item.starsAdded : computedAdded,
    };
  });

  return { migrated: chronological.reverse(), changed: true };
}

export function getCareerRank(totalStars: number): CareerRankInfo {
  let currentIdx = 0;
  for (let i = 0; i < CAREER_RANKS.length; i++) {
    if (totalStars >= CAREER_RANKS[i].minStars) {
      currentIdx = i;
    }
  }
  const current = CAREER_RANKS[currentIdx];
  const next = currentIdx + 1 < CAREER_RANKS.length ? CAREER_RANKS[currentIdx + 1] : null;
  return {
    title: current.title,
    minStars: current.minStars,
    nextRankTitle: next ? next.title : null,
    nextRankStars: next ? next.minStars : null,
  };
}

export function loadCareerStats(): LifetimeCareerStats {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CAREER_KEY);
    if (!raw) return DEFAULT_CAREER_STATS;
    const parsed = JSON.parse(raw);

    const bestStarsByCase = sanitizeBestStarsMap(parsed.bestStarsByCase);
    const { totalStars, casesPlayed, averageStars } =
      recomputeSummaryFromBestStars(bestStarsByCase);

    const rawHistory: CaseHistoryRecord[] = Array.isArray(parsed.history) ? parsed.history : [];
    const { migrated: history, changed: historyChanged } = migrateHistoryEntries(rawHistory);

    const migrated: LifetimeCareerStats = {
      totalStars,
      casesPlayed,
      averageStars,
      correctVerdicts: typeof parsed.correctVerdicts === 'number' ? parsed.correctVerdicts : 0,
      fairVerdicts: typeof parsed.fairVerdicts === 'number' ? parsed.fairVerdicts : 0,
      unjustVerdicts: typeof parsed.unjustVerdicts === 'number' ? parsed.unjustVerdicts : 0,
      bestStarsByCase,
      history,
    };

    const summaryChanged =
      parsed.totalStars !== totalStars ||
      parsed.casesPlayed !== casesPlayed ||
      parsed.averageStars !== averageStars;

    if (summaryChanged || historyChanged) {
      saveCareerStats(migrated);
    }

    return migrated;
  } catch {
    return DEFAULT_CAREER_STATS;
  }
}

export function saveCareerStats(stats: LifetimeCareerStats): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CAREER_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage errors
  }
}

export function applyCaseOutcome(
  prev: LifetimeCareerStats,
  caseId: string,
  caseTitle: string,
  evaluation: CaseEvaluationResult,
): { stats: LifetimeCareerStats; credit: CaseCareerCredit } {
  const hasPlayedBefore = Object.prototype.hasOwnProperty.call(prev.bestStarsByCase, caseId);
  const previousBestStars = hasPlayedBefore ? prev.bestStarsByCase[caseId] : null;
  const newBest = hasPlayedBefore
    ? Math.max(previousBestStars!, evaluation.stars)
    : evaluation.stars;
  const starsAdded = hasPlayedBefore
    ? Math.max(0, Math.round((newBest - previousBestStars!) * 10) / 10)
    : evaluation.stars;

  const bestStarsByCase = {
    ...prev.bestStarsByCase,
    [caseId]: newBest,
  };

  const { totalStars, casesPlayed, averageStars } =
    recomputeSummaryFromBestStars(bestStarsByCase);

  const isCorrect = evaluation.verdictCorrect;
  const isUnjust = !evaluation.isFair;

  const entry: CaseHistoryRecord = {
    id: `${caseId}_${Date.now()}`,
    caseId,
    caseTitle,
    stars: evaluation.stars,
    verdictCorrect: evaluation.verdictCorrect,
    isFair: evaluation.isFair,
    fairnessLabel: evaluation.fairnessLabel,
    verdictSummary: evaluation.headlineVerdictTitle,
    playedAt: new Date().toISOString(),
    isReplay: hasPlayedBefore,
    starsAdded,
  };

  const updated: LifetimeCareerStats = {
    totalStars,
    casesPlayed,
    averageStars,
    correctVerdicts: prev.correctVerdicts + (isCorrect ? 1 : 0),
    fairVerdicts: prev.fairVerdicts + (evaluation.isFair ? 1 : 0),
    unjustVerdicts: prev.unjustVerdicts + (isUnjust ? 1 : 0),
    bestStarsByCase,
    history: [entry, ...prev.history].slice(0, 25),
  };

  saveCareerStats(updated);

  return {
    stats: updated,
    credit: {
      isReplay: hasPlayedBefore,
      previousBestStars,
      bestStars: newBest,
      starsAdded,
    },
  };
}

export function recordCaseOutcome(
  prev: LifetimeCareerStats,
  caseId: string,
  caseTitle: string,
  evaluation: CaseEvaluationResult,
): LifetimeCareerStats {
  return applyCaseOutcome(prev, caseId, caseTitle, evaluation).stats;
}

export function resetCareerStats(): LifetimeCareerStats {
  saveCareerStats(DEFAULT_CAREER_STATS);
  return DEFAULT_CAREER_STATS;
}
