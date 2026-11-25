import {
  CaseData,
  CaseVerdictConfig,
  PrisonDurationId,
  PrisonDurationOption,
  ReasonCategoryId,
  ReasonCategoryOption,
  VerdictType,
} from '../types';

export const SIMULATION_RULES_NOTICE =
  'محاكاة قضائية تفاعلية: جميع الأحكام والعقوبات ونطاقات الكفالة تخضع لقواعد توازن مصممة داخل اللعبة لتقييم التحقيق والعدالة، ولا تمثل نصوصاً قانونية واقعية ملزمة.';

export const PRISON_DURATION_OPTIONS: PrisonDurationOption[] = [
  { id: '14_days', label: '14 يومًا', months: 0.5 },
  { id: '1_month', label: 'شهر واحد', months: 1 },
  { id: '3_months', label: '3 أشهر', months: 3 },
  { id: '6_months', label: '6 أشهر', months: 6 },
  { id: '1_year', label: 'سنة واحدة', months: 12 },
  { id: '3_years', label: '3 سنوات', months: 36 },
  { id: '5_years', label: '5 سنوات', months: 60 },
  { id: '10_years', label: '10 سنوات', months: 120 },
  { id: '15_years', label: '15 سنة', months: 180 },
  { id: '25_years', label: '25 سنة (مؤبد مشدد)', months: 300 },
  { id: 'life', label: 'السجن المؤبد', months: 360 },
];

export const VERDICT_TYPE_META: Record<
  VerdictType,
  {
    label: string;
    shortDesc: string;
    requiresDuration: boolean;
    requiresFine: boolean;
    isConviction: boolean;
    isCapital?: boolean;
  }
> = {
  acquittal: {
    label: 'براءة وإخلاء سبيل',
    shortDesc: 'إعلان براءة المتهم لانتفاء التهمة أو ثبوت براءته بالأدلة.',
    requiresDuration: false,
    requiresFine: false,
    isConviction: false,
  },
  guilty: {
    label: 'إدانة مع عقوبة السجن',
    shortDesc: 'إدانة المتهم بالجرم المنسوب إليه وتحديد مدة السجن المناسبة.',
    requiresDuration: true,
    requiresFine: false,
    isConviction: true,
  },
  death_penalty: {
    label: 'الإعدام',
    shortDesc: 'أقصى عقوبة — تُطرح حصراً في الجرائم الجسيمة كالقتل العمد المشدد.',
    requiresDuration: false,
    requiresFine: false,
    isConviction: true,
    isCapital: true,
  },
  fine: {
    label: 'غرامة مالية فقط',
    shortDesc: 'إلزام المتهم بغرامة مالية دون عقوبة سالبة للحرية.',
    requiresDuration: false,
    requiresFine: true,
    isConviction: true,
  },
  suspended: {
    label: 'حبس مع إيقاف التنفيذ',
    shortDesc: 'إدانة بعقوبة حبس موقوفة التنفيذ لحسن السير أو الظروف المخففة.',
    requiresDuration: true,
    requiresFine: false,
    isConviction: true,
  },
  probation: {
    label: 'وضع تحت المراقبة / خدمة مجتمعية',
    shortDesc: 'إلزام المتهم بالخدمة المجتمعية أو المراقبة القضائية لفترة محددة.',
    requiresDuration: true,
    requiresFine: false,
    isConviction: true,
  },
  dismissed: {
    label: 'إسقاط الدعوى لعدم كفاية الأدلة',
    shortDesc: 'صرف النظر عن الاتهام لعدم بلوغ الأدلة درجة اليقين القضائي.',
    requiresDuration: false,
    requiresFine: false,
    isConviction: false,
  },
  retrial: {
    label: 'إعادة المحاكمة / استكمال التحقيق',
    shortDesc: 'إرجاء الفصل وإعادة الأوراق للنيابة لاستيفاء أدلة ناقصة.',
    requiresDuration: false,
    requiresFine: false,
    isConviction: false,
  },
};

export const REASON_CATEGORIES: Record<ReasonCategoryId, ReasonCategoryOption> = {
  forensic_proof: {
    id: 'forensic_proof',
    label: 'ثبوت الدليل الجنائي المادي',
    description: 'الأحراز المعملية والمضبوطات المادية تثبت الواقعة بنسبة يقينية.',
  },
  card_cloning_innocence: {
    id: 'card_cloning_innocence',
    label: 'انتحال الهوية واستنساخ البطاقة',
    description: 'الدليل الرقمي يثبت استنساخ تصريح الدخول من طرف آخر دون علم صاحبه.',
  },
  witness_contradiction: {
    id: 'witness_contradiction',
    label: 'تكذيب الأقوال بشهادة عيان وسجل رسمي',
    description: 'أقوال المتهم وحجة غيابه انهارت أمام شهادة الحارس والسجلات الرقمية.',
  },
  co_conspiracy_sabotage: {
    id: 'co_conspiracy_sabotage',
    label: 'الاشتراك الجنائي وتعطيل المراقبة',
    description: 'دور مباشر في تعطيل الأنظمة الأمنية لتسهيل تنفيذ السرقة.',
  },
  insufficient_evidence: {
    id: 'insufficient_evidence',
    label: 'عدم كفاية الأدلة وقيام الشك',
    description: 'الشك يُفسر لصالح المتهم لغياب الدليل القاطع على الخزنة الداخلية.',
  },
  negligence_without_intent: {
    id: 'negligence_without_intent',
    label: 'إهمال إداري دون قصد جنائي',
    description: 'مخالفة تنظيمية في حفظ العهدة دون وجود نية أو اشتراك في الجريمة.',
  },
  procedural_remand: {
    id: 'procedural_remand',
    label: 'قصور التحقيق والحاجة لتحريات إضافية',
    description: 'الأوراق الحالية تحتاج استكمال تتبع الحوالات والكاميرات قبل الفصل.',
  },
  premeditated_intent: {
    id: 'premeditated_intent',
    label: 'توافر القصد الجنائي وسبق التخطيط',
    description: 'توافر الدافع المالي والتخطيط المسبق للوصول للممرات والوثائق.',
  },
};

export function getPrisonDurationOption(id?: PrisonDurationId): PrisonDurationOption | undefined {
  if (!id) return undefined;
  return PRISON_DURATION_OPTIONS.find((opt) => opt.id === id);
}

export function formatMoneyEGP(amount: number): string {
  return `${amount.toLocaleString('en-US')} ج.م`;
}

/**
 * Case 01 (صمت الأرشيف الوطني) verdict rules:
 * Non-capital sovereign document theft & insider sabotage (3 defendants in the dock).
 */
export const CASE_01_VERDICT_CONFIG: CaseVerdictConfig = {
  caseId: 'CASE_001',
  stage: 'trial',
  allowPreTrialBail: true,
  allowDeathPenalty: false,
  availableVerdictTypes: [
    'acquittal',
    'guilty',
    'fine',
    'suspended',
    'probation',
    'dismissed',
    'retrial',
  ],
  prisonOptions: [
    '14_days',
    '1_month',
    '3_months',
    '6_months',
    '1_year',
    '3_years',
    '5_years',
    '10_years',
    '15_years',
    '25_years',
    'life',
  ],
  fineOptions: [5000, 15000, 30000, 75000, 150000, 300000],
  bailOptions: [5000, 15000, 30000, 50000, 100000],
  availableReasons: [
    'card_cloning_innocence',
    'forensic_proof',
    'witness_contradiction',
    'co_conspiracy_sabotage',
    'premeditated_intent',
    'insufficient_evidence',
    'negligence_without_intent',
    'procedural_remand',
  ],
  truthOverview:
    'استغل فني الصيانة منذر وهبة ديون القمار والحوالة المشبوهة، واستنسخ لاسلكياً بطاقة كبير المهندسين كريم المنصور، وتسلل بالزي المهني وقفازات اللاتكس لسرقة المخطط التأسيسي عبر ممرات التهوية بمساعدة مسؤول المراقبة مؤمن رزق الذي عطل بث الكاميرات لمدة 4 دقائق.',
  simulationNotice: SIMULATION_RULES_NOTICE,
  defendantRules: [
    {
      defendantId: 'char_defendant',
      defendantName: 'كريم المنصور',
      roleLabel: 'المتهم الأول — كبير مهندسي الأرشيف',
      chargeTitle: 'الاستيلاء على وثائق سيادية باستخدام بطاقة الدخول',
      chargeSeverity: 'felony',
      isActuallyGuilty: false,
      expectedOutcome: 'acquittal',
      acceptableVerdictTypes: ['acquittal', 'dismissed'],
      idealSentenceMonths: 0,
      minAcceptableMonths: 0,
      maxAcceptableMonths: 0,
      allowBailPreTrial: true,
      recommendedBailDecision: 'bail_granted',
      recommendedBailAmount: 15000,
      keyEvidenceIds: ['evd_card', 'evd_prints', 'evd_cctv'],
      keyTestimonyIds: ['char_defendant'],
      weakOrWrongEvidenceIds: ['evd_key', 'evd_control'],
      preferredReasons: ['card_cloning_innocence', 'insufficient_evidence'],
      truthExplanation:
        'كريم المنصور بريء من السرقة؛ بطاقته استُنسخت قبل يومين، وشريط المراقبة يظهر شخصاً بزي صيانة، ولم تُرصد بصماته على الخزنة الداخلية التي فُتحت بقفازات مهنية.',
    },
    {
      defendantId: 'char_maintenance',
      defendantName: 'منذر وهبة',
      roleLabel: 'المتهم الثاني — فني صيانة أنظمة التبريد',
      chargeTitle: 'سرقة مخطوطات سيادية عمداً والفرار من التحقيق',
      chargeSeverity: 'felony',
      isActuallyGuilty: true,
      expectedOutcome: 'guilty',
      acceptableVerdictTypes: ['guilty'],
      idealSentenceMonths: 120, // 10 years
      minAcceptableMonths: 60, // 5 years
      maxAcceptableMonths: 180, // 15 years
      allowBailPreTrial: true,
      recommendedBailDecision: 'bail_denied',
      keyEvidenceIds: ['evd_key', 'evd_cctv', 'evd_prints'],
      keyTestimonyIds: ['char_maintenance', 'char_defendant'],
      weakOrWrongEvidenceIds: [],
      preferredReasons: ['forensic_proof', 'premeditated_intent'],
      truthExplanation:
        'منذر وهبة هو المنفذ المباشر للسرقة؛ عُثر على مفتاح الصيانة الخاص به بمسرح الجريمة ملوثاً بزيت التهوية، وظهرت هيئة بزي الصيانة في الشريط، وطلب سابقاً خرائط ممرات الهواء من كريم وتلقى حوالة مالية غامضة.',
    },
    {
      defendantId: 'char_control',
      defendantName: 'مؤمن رزق',
      roleLabel: 'المتهم الثالث — مسؤول غرفة المراقبة',
      chargeTitle: 'الاشتراك الجنائي وتعطيل كاميرات المراقبة عمداً',
      chargeSeverity: 'felony',
      isActuallyGuilty: true,
      expectedOutcome: 'guilty',
      acceptableVerdictTypes: ['guilty'],
      idealSentenceMonths: 60, // 5 years
      minAcceptableMonths: 36, // 3 years
      maxAcceptableMonths: 120, // 10 years
      allowBailPreTrial: true,
      recommendedBailDecision: 'bail_denied',
      keyEvidenceIds: ['evd_control', 'evd_cctv'],
      keyTestimonyIds: ['char_guard', 'char_control'],
      weakOrWrongEvidenceIds: ['evd_card'],
      preferredReasons: ['co_conspiracy_sabotage', 'witness_contradiction'],
      truthExplanation:
        'مؤمن رزق شريك أساسي في التغطية على السرقة؛ سجل غرفة المراقبة أثبت فتح الغرفة ببطاقته في 23:44 وصدور أمر قطع البث من محطته رقم 3، كما شاهده الحارس طارق الحمد داخل الغرفة ليلتها مكذباً ادعاءه بالغياب المرضي.',
    },
  ],
};

export function getCaseVerdictConfig(caseData: CaseData): CaseVerdictConfig {
  if (caseData.verdictConfig) {
    return caseData.verdictConfig;
  }
  if (caseData.caseId === 'CASE_001' || caseData.caseNumber === 'CR-2026/089-B') {
    return CASE_01_VERDICT_CONFIG;
  }

  // Fallback generic config derived cleanly from CaseData
  const defendants = caseData.characters.filter(
    (c) => c.isDefendant || c.role.includes('المتهم'),
  );
  return {
    caseId: caseData.caseId,
    stage: 'trial',
    allowPreTrialBail: true,
    allowDeathPenalty: false,
    availableVerdictTypes: [
      'acquittal',
      'guilty',
      'fine',
      'suspended',
      'probation',
      'dismissed',
      'retrial',
    ],
    prisonOptions: [
      '14_days',
      '1_month',
      '3_months',
      '6_months',
      '1_year',
      '3_years',
      '5_years',
      '10_years',
      '15_years',
      '25_years',
      'life',
    ],
    fineOptions: [5000, 15000, 30000, 75000, 150000],
    bailOptions: [5000, 15000, 30000, 50000],
    availableReasons: Object.keys(REASON_CATEGORIES) as ReasonCategoryId[],
    truthOverview: caseData.description,
    simulationNotice: SIMULATION_RULES_NOTICE,
    defendantRules: defendants.map((d) => ({
      defendantId: d.id,
      defendantName: d.name,
      roleLabel: d.role,
      chargeTitle: caseData.type,
      chargeSeverity: 'felony',
      isActuallyGuilty: d.suspicionScore >= 60,
      expectedOutcome: d.suspicionScore >= 60 ? 'guilty' : 'acquittal',
      acceptableVerdictTypes: d.suspicionScore >= 60 ? ['guilty'] : ['acquittal', 'dismissed'],
      idealSentenceMonths: d.suspicionScore >= 60 ? 60 : 0,
      minAcceptableMonths: d.suspicionScore >= 60 ? 36 : 0,
      maxAcceptableMonths: d.suspicionScore >= 60 ? 120 : 0,
      allowBailPreTrial: true,
      recommendedBailDecision: d.suspicionScore >= 60 ? 'bail_denied' : 'bail_granted',
      keyEvidenceIds: caseData.evidence.slice(0, 2).map((e) => e.id),
      keyTestimonyIds: [d.id],
      weakOrWrongEvidenceIds: [],
      preferredReasons: ['forensic_proof'],
      truthExplanation: d.contradiction,
    })),
  };
}
