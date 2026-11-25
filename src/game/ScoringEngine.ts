import {
  CaseData,
  CaseEvaluationResult,
  DefendantEvaluation,
  DefendantVerdictRule,
  FairnessLabel,
  InvestigationState,
  SubmittedCaseJudgment,
  SubmittedDefendantJudgment,
} from '../types';
import {
  formatMoneyEGP,
  getCaseVerdictConfig,
  getPrisonDurationOption,
  SIMULATION_RULES_NOTICE,
  VERDICT_TYPE_META,
} from './VerdictRules';

function roundHalf(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value * 2) / 2));
}

function formatDefendantVerdictSummary(
  rule: DefendantVerdictRule,
  j: SubmittedDefendantJudgment,
): string {
  const meta = VERDICT_TYPE_META[j.verdictType];
  if (meta.requiresDuration) {
    const dur = getPrisonDurationOption(j.prisonDuration);
    return `${rule.defendantName}: ${meta.label} (${dur?.label || 'غير محدد'})`;
  }
  if (meta.requiresFine) {
    return `${rule.defendantName}: ${meta.label} (${formatMoneyEGP(j.fineAmount || 0)})`;
  }
  return `${rule.defendantName}: ${meta.label}`;
}

function evaluateSingleDefendant(
  rule: DefendantVerdictRule,
  j: SubmittedDefendantJudgment,
): {
  evalResult: DefendantEvaluation;
  verdictPts: number; // 0..1 normalized
  propPts: number;    // 0..1 normalized
  justPts: number;    // 0..1 normalized
  sentencingNote: string;
} {
  const meta = VERDICT_TYPE_META[j.verdictType];
  const dur = getPrisonDurationOption(j.prisonDuration);
  const months = dur?.months ?? 0;

  let verdictCorrect = false;
  let isFair = false;
  let fairnessLabel: FairnessLabel = 'حكم عادل';
  let verdictPts = 0;
  let propPts = 0;
  let sentencingNote = '';

  if (j.verdictType === 'retrial') {
    verdictCorrect = false;
    isFair = false;
    fairnessLabel = 'حكم غير حاسم — تأجيل الفصل';
    verdictPts = 0.25;
    propPts = 0.2;
    sentencingNote = `${rule.defendantName}: أُجِّل الفصل رغم توافر الأدلة الكافية في الملفات للحكم النهائي.`;
  } else if (!rule.isActuallyGuilty) {
    // Defendant is innocent (Karim)
    if (j.verdictType === 'acquittal' || j.verdictType === 'dismissed') {
      verdictCorrect = true;
      isFair = true;
      fairnessLabel = 'حكم عادل';
      verdictPts = j.verdictType === 'acquittal' ? 1.0 : 0.9;
      propPts = 1.0;
      sentencingNote = `${rule.defendantName}: حكم عادل بالبراءة يتسق مع دليل استنساخ البطاقة وغياب البصمات عن الخزنة.`;
    } else {
      verdictCorrect = false;
      isFair = false;
      fairnessLabel = 'حكم جائر — إدانة بريء';
      verdictPts = 0;
      propPts = 0;
      sentencingNote = `${rule.defendantName}: إدانة غير عادلة لشخص بريء؛ الأدلة الجنائية أثبتت استنساخ بطاقته من طرف ثالث.`;
    }
  } else {
    // Defendant is actually guilty (Munther / Moamen)
    if (j.verdictType === 'acquittal' || j.verdictType === 'dismissed') {
      verdictCorrect = false;
      isFair = false;
      fairnessLabel = 'حكم جائر — إفلات مذنب';
      verdictPts = 0;
      propPts = 0;
      sentencingNote = `${rule.defendantName}: إفلات غير عادل لمذنب ثابت تورطه بالأدلة المادية أو السجلات والشهادات.`;
    } else if (j.verdictType === 'fine' || j.verdictType === 'suspended' || j.verdictType === 'probation') {
      verdictCorrect = true;
      isFair = false;
      fairnessLabel = 'حكم جائر — تساهل مخل';
      verdictPts = 0.65;
      propPts = 0.25;
      sentencingNote = `${rule.defendantName}: التوجه للإدانة صحيح، لكن العقوبة (${meta.label}) متساهلة جداً لا تتناسب مع خطورة الاستيلاء على وثائق سيادية.`;
    } else if (j.verdictType === 'death_penalty') {
      verdictCorrect = true;
      isFair = false;
      fairnessLabel = 'حكم جائر — عقوبة مبالغ فيها';
      verdictPts = 0.7;
      propPts = 0;
      sentencingNote = `${rule.defendantName}: عقوبة الإعدام مبالغ فيها ولا تتناسب مع جريمة سرقة غير مصحوبة بقتل.`;
    } else {
      // Guilty with prison term
      verdictCorrect = true;
      verdictPts = 1.0;
      if (months < rule.minAcceptableMonths) {
        isFair = false;
        fairnessLabel = 'حكم جائر — تساهل مخل';
        propPts = Math.max(0.25, months / Math.max(1, rule.minAcceptableMonths));
        sentencingNote = `${rule.defendantName}: الإدانة صحيحة، لكن مدة السجن (${dur?.label}) قصيرة جداً مقارنة بدوره في الجريمة (النطاق المتوازن ${Math.round(rule.minAcceptableMonths / 12)} إلى ${Math.round(rule.maxAcceptableMonths / 12)} سنوات).`;
      } else if (months > rule.maxAcceptableMonths) {
        isFair = false;
        fairnessLabel = 'حكم جائر — عقوبة مبالغ فيها';
        propPts = months >= 300 ? 0.3 : 0.5;
        sentencingNote = `${rule.defendantName}: الإدانة صحيحة، لكن مدة السجن (${dur?.label}) قاسية ومبالغ فيها مقارنة بحجم الجرم.`;
      } else {
        isFair = true;
        fairnessLabel = 'حكم عادل';
        const distFromIdeal = Math.abs(months - rule.idealSentenceMonths);
        const span = Math.max(12, rule.maxAcceptableMonths - rule.minAcceptableMonths);
        propPts = Math.max(0.8, 1.0 - (distFromIdeal / span) * 0.2);
        sentencingNote = `${rule.defendantName}: حكم صحيح وعقوبة متوازنة (${dur?.label}) تتناسب مع جسامة الفعل والأدلة.`;
      }
    }
  }

  // Justification scoring (0..1)
  const keyEvMatches = j.selectedEvidenceIds.filter((id) => rule.keyEvidenceIds.includes(id)).length;
  const keyTestMatches = j.selectedTestimonyIds.filter((id) => rule.keyTestimonyIds.includes(id)).length;
  const wrongEvCount = j.selectedEvidenceIds.filter((id) => rule.weakOrWrongEvidenceIds.includes(id)).length;
  const irrelevantEvCount = j.selectedEvidenceIds.filter(
    (id) => !rule.keyEvidenceIds.includes(id) && !rule.weakOrWrongEvidenceIds.includes(id),
  ).length;
  const reasonBonus = rule.preferredReasons.includes(j.reasonCategory) ? 0.25 : 0.05;

  const evRatio = rule.keyEvidenceIds.length > 0 ? Math.min(1, keyEvMatches / Math.min(2, rule.keyEvidenceIds.length)) : 1;
  const testRatio = rule.keyTestimonyIds.length > 0 ? Math.min(1, keyTestMatches / 1) : 1;
  const penalty = wrongEvCount * 0.22 + irrelevantEvCount * 0.1;
  const justPts = Math.max(0, Math.min(1, evRatio * 0.5 + testRatio * 0.25 + reasonBonus - penalty));

  return {
    evalResult: {
      defendantId: rule.defendantId,
      defendantName: rule.defendantName,
      verdictCorrect,
      isFair,
      fairnessLabel,
      verdictSummary: formatDefendantVerdictSummary(rule, j),
      feedback: sentencingNote,
    },
    verdictPts,
    propPts,
    justPts,
    sentencingNote,
  };
}

export function evaluateCaseJudgment(
  caseData: CaseData,
  judgment: SubmittedCaseJudgment,
  investigation: InvestigationState,
): CaseEvaluationResult {
  const config = getCaseVerdictConfig(caseData);
  const rules = config.defendantRules;

  const perDefendant = rules.map((rule) => {
    const submitted =
      judgment.defendantJudgments.find((d) => d.defendantId === rule.defendantId) || {
        defendantId: rule.defendantId,
        verdictType: 'retrial' as const,
        reasonCategory: 'procedural_remand' as const,
        selectedEvidenceIds: [],
        selectedTestimonyIds: [],
      };
    return evaluateSingleDefendant(rule, submitted);
  });

  const count = Math.max(1, perDefendant.length);
  const avgVerdict = perDefendant.reduce((acc, item) => acc + item.verdictPts, 0) / count;
  const avgProp = perDefendant.reduce((acc, item) => acc + item.propPts, 0) / count;
  const avgJust = perDefendant.reduce((acc, item) => acc + item.justPts, 0) / count;

  // Thoroughness calculation (0..1)
  const expectedFiles: string[] = ['case_file', 'evidence', 'characters'];
  const filesChecked = expectedFiles.filter((f) => investigation.examinedFiles.includes(f as any)).length;
  const fileRatio = filesChecked / expectedFiles.length;

  // Check how many of the 4 courtroom speakers (karim, munther, moamen, tarek) had >=1 question asked
  const speakerKeys = ['karim', 'munther', 'moamen', 'tarek'];
  const speakersAsked = speakerKeys.filter((k) => (investigation.askedQuestions[k]?.length || 0) > 0).length;
  const totalQuestionsAsked = speakerKeys.reduce(
    (sum, k) => sum + (investigation.askedQuestions[k]?.length || 0),
    0,
  );
  const interrogationRatio = Math.min(1, (speakersAsked / speakerKeys.length) * 0.65 + (Math.min(8, totalQuestionsAsked) / 8) * 0.35);

  const thoroughnessRatio = fileRatio * 0.45 + interrogationRatio * 0.55;

  const verdictScore = Number((avgVerdict * 4.0).toFixed(2));
  const proportionalityScore = Number((avgProp * 2.5).toFixed(2));
  const justificationScore = Number((avgJust * 2.0).toFixed(2));
  const thoroughnessScore = Number((thoroughnessRatio * 1.5).toFixed(2));

  let rawStars = verdictScore + proportionalityScore + justificationScore + thoroughnessScore;
  let thoroughnessCapApplied = false;

  // Anti-guess guard: picking a right verdict without investigating cannot score well
  if (thoroughnessRatio < 0.3) {
    rawStars = Math.min(rawStars, 4.5);
    thoroughnessCapApplied = true;
  } else if (thoroughnessRatio < 0.55) {
    rawStars = Math.min(rawStars, 7.0);
    thoroughnessCapApplied = true;
  }

  const stars = roundHalf(rawStars);

  // Overall correctness & fairness labels
  const allVerdictsCorrect = perDefendant.every((p) => p.evalResult.verdictCorrect);
  const allFair = perDefendant.every((p) => p.evalResult.isFair);

  let overallFairness: FairnessLabel = 'حكم عادل';
  const priorityOrder: FairnessLabel[] = [
    'حكم جائر — إدانة بريء',
    'حكم جائر — إفلات مذنب',
    'حكم جائر — عقوبة مبالغ فيها',
    'حكم جائر — تساهل مخل',
    'حكم غير حاسم — تأجيل الفصل',
  ];
  for (const label of priorityOrder) {
    if (perDefendant.some((p) => p.evalResult.fairnessLabel === label)) {
      overallFairness = label;
      break;
    }
  }

  // Missed items list for Arabic explanation
  const missedItems: string[] = [];
  if (!investigation.examinedFiles.includes('case_file')) {
    missedItems.push('لم تقم بمطالعة ملف القضية الأساسي ولائحة الاتهام.');
  }
  if (!investigation.examinedFiles.includes('evidence')) {
    missedItems.push('لم تفتح ملف الأحراز الجنائية لفحص نتائج المعمل.');
  }
  if (!investigation.examinedFiles.includes('characters')) {
    missedItems.push('لم تطالع سجل الشخصيات وحجج الغياب المكتوبة.');
  }
  if ((investigation.askedQuestions['karim']?.length || 0) === 0) {
    missedItems.push('لم تستجوب المتهم الأول كريم المنصور حول بطاقته المستنسخة.');
  }
  if ((investigation.askedQuestions['munther']?.length || 0) === 0) {
    missedItems.push('لم تستجوب المتهم الثاني منذر وهبة حول مفتاح الصيانة والحوالة المالية.');
  }
  if ((investigation.askedQuestions['moamen']?.length || 0) === 0) {
    missedItems.push('لم تستجوب المتهم الثالث مؤمن رزق حول قطع البث من محطته.');
  }
  if ((investigation.askedQuestions['tarek']?.length || 0) === 0) {
    missedItems.push('لم تسمع شهادة حارس الأمن طارق الحمد الذي رأى مؤمن داخل غرفة المراقبة.');
  }

  if (thoroughnessCapApplied) {
    missedItems.unshift(
      'تم تقييد التقييم لأن الحكم صدر دون استيفاء فحص الأدلة واستجواب أطراف الدعوى في القاعة.',
    );
  }

  // Pre-trial bail feedback if player used bail decisions
  const bailEntries = Object.values(judgment.bailDecisions || {});
  let bailFeedback: string | undefined;
  if (bailEntries.length > 0) {
    const bailNotes = bailEntries.map((b) => {
      const rule = rules.find((r) => r.defendantId === b.defendantId);
      if (!rule) return '';
      const matches = b.decision === rule.recommendedBailDecision;
      if (b.decision === 'bail_granted') {
        return matches
          ? `${rule.defendantName}: الإفراج المؤقت بكفالة (${formatMoneyEGP(b.bailAmount || 0)}) قرار متزن لانعدام خطر الهرب.`
          : `${rule.defendantName}: الإفراج بكفالة قبل الحكم يحمل مخاطرة هرب عالية أو عبث بالأدلة.`;
      }
      return matches
        ? `${rule.defendantName}: رفض الكفالة واستمرار الحبس الاحتياطي قرار مبرر لوجود قرائن قوية أو شبهة فرار.`
        : `${rule.defendantName}: استمرار الحبس دون مبرر قوي في ظل ضعف أدلة إدانته.`;
    });
    bailFeedback = bailNotes.filter(Boolean).join(' ');
  }

  const provingEvidence = caseData.evidence.map((ev) => `${ev.title}: ${ev.keyFinding}`);

  const headlineVerdictTitle = perDefendant.map((p) => p.evalResult.verdictSummary).join(' | ');

  return {
    stars,
    verdictCorrect: allVerdictsCorrect,
    isFair: allFair && !thoroughnessCapApplied,
    fairnessLabel: overallFairness,
    headlineVerdictTitle,
    breakdown: {
      verdictScore,
      proportionalityScore,
      justificationScore,
      thoroughnessScore,
      thoroughnessCapApplied,
    },
    defendantResults: perDefendant.map((p) => p.evalResult),
    explanation: {
      truthSummary: config.truthOverview,
      provingEvidence,
      missedItems,
      sentencingFeedback: perDefendant.map((p) => p.sentencingNote).join('\n'),
      simulationNote: SIMULATION_RULES_NOTICE,
    },
    bailFeedback,
  };
}
