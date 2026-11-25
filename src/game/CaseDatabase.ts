import { SeasonDefinition, GameProgressState, GameSettings } from '../types';
import { DEFAULT_CASE_DATA } from './FileSystem';

export const LOCAL_STORAGE_PROGRESS_KEY = 'the_court_game_progress_v1';
export const LOCAL_STORAGE_SETTINGS_KEY = 'the_court_game_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  sound: true,
  music: true,
  sfx: true,
  vibration: true,
  language: 'العربية المصرية',
};

export const DEFAULT_PROGRESS: GameProgressState = {
  completedCases: {},
  unlockedLevelIds: ['lvl_s01_01'],
  unlockedSeasonIds: ['season_01'],
};

// Case 01 only (cases 2-5 removed in this build)
export const SEASONS_DATA: SeasonDefinition[] = [
  {
    id: 'season_01',
    seasonNumber: 1,
    title: 'الموسم الأول: جرائم القتل والأسرار السيادية',
    subtitle: 'سلسلة قضايا جنائية معقدة تختبر بصيرتك وقدرتك على استنطاق الأدلة الخفية',
    totalLevels: 1,
    isUnlocked: true,
    levels: [
      {
        id: 'lvl_s01_01',
        levelNumber: 1,
        fileCode: 'FILE 001',
        caseId: 'crime_s01_file001',
        title: 'صمت الأرشيف الوطني',
        caseType: 'جناية سرقة وثائق أمن دولة وتواطؤ داخلي',
        briefSummary: 'اختفاء وثائق المخطط التأسيسي للأرشيف الوطني ليلاً، وثلاثة متهمين في قفص الاتهام: كبير المهندسين صاحب البطاقة المستنسخة، وفني الصيانة صاحب المفتاح، ومسؤول غرفة المراقبة الذي قطع البث.',
        caseData: DEFAULT_CASE_DATA,
      },
    ],
  },
];

/**
 * Load progress from localStorage safely
 */
export function loadGameProgress(): GameProgressState {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        completedCases: parsed.completedCases || {},
        unlockedLevelIds: parsed.unlockedLevelIds || ['lvl_s01_01'],
        unlockedSeasonIds: parsed.unlockedSeasonIds || ['season_01'],
      };
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return DEFAULT_PROGRESS;
}

/**
 * Save progress to localStorage
 */
export function saveGameProgress(progress: GameProgressState) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore
  }
}

/**
 * Load settings from localStorage
 */
export function loadGameSettings(): GameSettings {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
export function saveGameSettings(settings: GameSettings) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

