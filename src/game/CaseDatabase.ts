import { SeasonDefinition, GameProgressState, GameSettings } from '../types';
import { DEFAULT_CASE_DATA } from './FileSystem';
import { CASE_02_DATA } from './cases/case02';
import { CASE_03_DATA } from './cases/case03';
import { CASE_04_DATA } from './cases/case04';
import { CASE_05_DATA } from './cases/case05';
import { CASE_06_DATA } from './cases/case06';
import { CASE_07_DATA } from './cases/case07';

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
  unlockedLevelIds: ['lvl_s01_02'],
  unlockedSeasonIds: ['season_01'],
};

export const SEASONS_DATA: SeasonDefinition[] = [
  {
    id: 'season_01',
    seasonNumber: 1,
    title: 'الموسم الأول: جرائم القتل والأسرار السيادية',
    subtitle: 'سلسلة قضايا جنائية معقدة تختبر بصيرتك وقدرتك على استنطاق الأدلة الخفية',
    totalLevels: 7,
    isUnlocked: true,
    levels: [
      {
        id: 'lvl_s01_02',
        levelNumber: 1,
        fileCode: 'FILE 001',
        caseId: 'crime_s01_file001',
        title: 'الوريث الأخير',
        caseType: 'جناية قتل عمد داخل قصر بجاردن سيتي',
        briefSummary: 'عُثر على رجل الأعمال عثمان الألفي متوفى داخل مكتبه قبل دقائق من توقيع وصية جديدة، وثلاثة من أفراد عائلته في قفص الاتهام.',
        caseData: CASE_02_DATA,
      },
      {
        id: 'lvl_s01_03',
        levelNumber: 2,
        fileCode: 'FILE 002',
        caseId: 'crime_s01_file002',
        title: 'ليلة فيلا الزمالك',
        caseType: 'جناية قتل عمد أثناء انقطاع الكهرباء',
        briefSummary: 'عُثر على المنتج ياسين مراد مقتولًا داخل غرفة الموسيقى بعد انقطاع الكهرباء 58 ثانية، وسط شهادات متضاربة واختفاء هاتف المجني عليه.',
        caseData: CASE_03_DATA,
      },
      {
        id: 'lvl_s01_04',
        levelNumber: 3,
        fileCode: 'FILE 003',
        caseId: 'crime_s01_file003',
        title: 'آخر رحلة',
        caseType: 'جناية قتل عمد على متن يخت',
        briefSummary: 'عُثر على القبطان كمال الديب مقتولًا داخل غرفة قيادة اليخت «نورس» قبالة ساحل الإسكندرية، بإصابة قاتلة وجرعة منومة حادة.',
        caseData: CASE_04_DATA,
      },
      {
        id: 'lvl_s01_05',
        levelNumber: 4,
        fileCode: 'FILE 004',
        caseId: 'crime_s01_file004',
        title: 'الطابق السابع',
        caseType: 'جناية قتل عمد داخل مكتب مغلق',
        briefSummary: 'عُثر على المدير التنفيذي لشركة أفق للاستثمار ميتًا داخل مكتبه المغلق بالطابق السابع، وسط سجلات متضاربة حول الدقائق الحاسمة.',
        caseData: CASE_05_DATA,
      },
      {
        id: 'lvl_s01_06',
        levelNumber: 5,
        fileCode: 'FILE 005',
        caseId: 'crime_s01_file005',
        title: 'المكالمة الأخيرة',
        caseType: 'جناية قتل عمد أثناء بث مباشر',
        briefSummary: 'عُثر على مخرج تلفزيوني شهير مقتولًا داخل غرفة التسجيل أثناء بث مباشر عقب مكالمة غامضة، وتتضارب سجلات البث والتايم كود.',
        caseData: CASE_06_DATA,
      },
      {
        id: 'lvl_s01_07',
        levelNumber: 6,
        fileCode: 'FILE 006',
        caseId: 'crime_s02_file001',
        title: 'مليون في 15 دقيقة',
        caseType: 'جناية سطو مسلح على بنك بخيانة داخلية',
        briefSummary: 'عصابة مسلحة اقتحمت فرع البنك واستولت على مليون جنيه خلال دقائق، وكاميرا خفية وسجلات رقمية كشفت خيانة من الداخل.',
        caseData: CASE_07_DATA,
      },
      {
        id: 'lvl_s01_01',
        levelNumber: 7,
        fileCode: 'FILE 007',
        caseId: 'court_archive_001',
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
      const completedCases = parsed.completedCases || {};
      // Migration: the archive case wrapper id changed from crime_s01_file001 to court_archive_001
      if (completedCases['crime_s01_file001'] && !completedCases['court_archive_001']) {
        completedCases['court_archive_001'] = completedCases['crime_s01_file001'];
      }
      const unlockedLevelIds: string[] = parsed.unlockedLevelIds || ['lvl_s01_02'];
      // Migration: make sure the new first level is playable for existing saves
      if (!unlockedLevelIds.includes('lvl_s01_02')) {
        unlockedLevelIds.push('lvl_s01_02');
      }
      return {
        completedCases,
        unlockedLevelIds,
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
