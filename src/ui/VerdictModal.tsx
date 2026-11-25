import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale,
  Hammer,
  X,
  Check,
  ShieldCheck,
  AlertTriangle,
  Gavel,
  FileSearch,
  UserCheck,
  Info,
  ChevronLeft,
} from 'lucide-react';
import {
  CaseData,
  InvestigationState,
  PreTrialBailDecision,
  PreTrialDecisionType,
  PrisonDurationId,
  ReasonCategoryId,
  SubmittedCaseJudgment,
  SubmittedDefendantJudgment,
  VerdictType,
} from '../types';
import {
  formatMoneyEGP,
  getCaseVerdictConfig,
  PRISON_DURATION_OPTIONS,
  REASON_CATEGORIES,
  SIMULATION_RULES_NOTICE,
  VERDICT_TYPE_META,
} from '../game/VerdictRules';
import { audioManager } from '../audio/AudioManager';

interface VerdictModalProps {
  isOpen: boolean;
  caseData: CaseData;
  investigation: InvestigationState;
  onClose: () => void;
  onRecordBailDecision: (decision: PreTrialBailDecision) => void;
  onSubmitJudgment: (judgment: SubmittedCaseJudgment) => void;
}

type ModalTab = 'verdict' | 'pretrial';

function createInitialDrafts(
  caseData: CaseData,
): Record<string, SubmittedDefendantJudgment> {
  const config = getCaseVerdictConfig(caseData);
  const drafts: Record<string, SubmittedDefendantJudgment> = {};
  for (const rule of config.defendantRules) {
    drafts[rule.defendantId] = {
      defendantId: rule.defendantId,
      verdictType: 'acquittal',
      prisonDuration: config.prisonOptions.includes('5_years')
        ? '5_years'
        : config.prisonOptions[0],
      fineAmount: config.fineOptions[0] ?? 15000,
      reasonCategory: config.availableReasons[0] ?? 'forensic_proof',
      selectedEvidenceIds: [],
      selectedTestimonyIds: [],
    };
  }
  return drafts;
}

function getSpeakerKeyForCharacterId(charId: string): string | null {
  if (charId === 'char_defendant') return 'karim';
  if (charId === 'char_maintenance') return 'munther';
  if (charId === 'char_control') return 'moamen';
  if (charId === 'char_guard') return 'tarek';
  return null;
}

export function VerdictModal({
  isOpen,
  caseData,
  investigation,
  onClose,
  onRecordBailDecision,
  onSubmitJudgment,
}: VerdictModalProps) {
  const config = useMemo(() => getCaseVerdictConfig(caseData), [caseData]);
  const [activeTab, setActiveTab] = useState<ModalTab>('verdict');
  const [activeDefendantId, setActiveDefendantId] = useState<string>(
    config.defendantRules[0]?.defendantId || '',
  );
  const [drafts, setDrafts] = useState<Record<string, SubmittedDefendantJudgment>>(() =>
    createInitialDrafts(caseData),
  );
  const [touchedDefendants, setTouchedDefendants] = useState<Record<string, boolean>>({});

  // Pre-trial bail state
  const [bailDefendantId, setBailDefendantId] = useState<string>(
    config.defendantRules[0]?.defendantId || '',
  );
  const [bailChoice, setBailChoice] = useState<PreTrialDecisionType>('bail_granted');
  const [bailAmount, setBailAmount] = useState<number>(config.bailOptions[1] ?? 15000);

  React.useEffect(() => {
    if (isOpen) {
      setDrafts(createInitialDrafts(caseData));
      setTouchedDefendants({});
      const firstId = config.defendantRules[0]?.defendantId || '';
      setActiveDefendantId(firstId);
      setBailDefendantId(firstId);
      setActiveTab('verdict');
      setBailChoice('bail_granted');
      setBailAmount(config.bailOptions[1] ?? config.bailOptions[0] ?? 15000);
    }
  }, [isOpen, caseData, config]);

  if (!isOpen) return null;

  const allowedVerdictTypes: VerdictType[] = config.allowDeathPenalty
    ? Array.from(new Set([...config.availableVerdictTypes, 'death_penalty' as VerdictType]))
    : config.availableVerdictTypes.filter((v) => v !== 'death_penalty');

  const currentRule =
    config.defendantRules.find((r) => r.defendantId === activeDefendantId) ||
    config.defendantRules[0];
  const currentDraft = drafts[currentRule?.defendantId || ''];

  const isDefendantComplete = (defId: string): boolean => {
    const d = drafts[defId];
    if (!d) return false;
    if (d.verdictType === 'retrial') return Boolean(d.reasonCategory);
    const meta = VERDICT_TYPE_META[d.verdictType];
    if (meta.requiresDuration && !d.prisonDuration) return false;
    if (meta.requiresFine && !d.fineAmount) return false;
    const hasJustification =
      d.selectedEvidenceIds.length > 0 || d.selectedTestimonyIds.length > 0;
    return Boolean(d.reasonCategory) && hasJustification;
  };

  const completedCount = config.defendantRules.filter((r) =>
    isDefendantComplete(r.defendantId),
  ).length;
  const allComplete =
    config.defendantRules.length > 0 &&
    completedCount === config.defendantRules.length;

  const updateCurrentDraft = (patch: Partial<SubmittedDefendantJudgment>) => {
    if (!currentRule) return;
    setTouchedDefendants((prev) => ({ ...prev, [currentRule.defendantId]: true }));
    setDrafts((prev) => ({
      ...prev,
      [currentRule.defendantId]: {
        ...prev[currentRule.defendantId],
        ...patch,
      },
    }));
  };

  const toggleEvidence = (evId: string) => {
    if (!currentDraft) return;
    audioManager.playPaperRustle();
    const exists = currentDraft.selectedEvidenceIds.includes(evId);
    const next = exists
      ? currentDraft.selectedEvidenceIds.filter((id) => id !== evId)
      : [...currentDraft.selectedEvidenceIds, evId];
    updateCurrentDraft({ selectedEvidenceIds: next });
  };

  const toggleTestimony = (charId: string) => {
    if (!currentDraft) return;
    audioManager.playPaperRustle();
    const exists = currentDraft.selectedTestimonyIds.includes(charId);
    const next = exists
      ? currentDraft.selectedTestimonyIds.filter((id) => id !== charId)
      : [...currentDraft.selectedTestimonyIds, charId];
    updateCurrentDraft({ selectedTestimonyIds: next });
  };

  const handleSaveBail = () => {
    const rule = config.defendantRules.find((r) => r.defendantId === bailDefendantId);
    if (!rule) return;
    const note =
      bailChoice === 'bail_granted'
        ? `إفراج بكفالة للمتهم ${rule.defendantName}`
        : `رفض الكفالة واستمرار حبس ${rule.defendantName}`;
    onRecordBailDecision({
      defendantId: rule.defendantId,
      decision: bailChoice,
      bailAmount: bailChoice === 'bail_granted' ? bailAmount : undefined,
      note,
    });
  };

  const handleFinalSubmit = () => {
    if (!allComplete) return;
    const orderedJudgments = config.defendantRules.map((r) => drafts[r.defendantId]);
    onSubmitJudgment({
      defendantJudgments: orderedJudgments,
      bailDecisions: investigation.bailDecisions,
    });
  };

  const nextIncompleteRule = config.defendantRules.find(
    (r) => r.defendantId !== currentRule?.defendantId && !isDefendantComplete(r.defendantId),
  );

  const testimonyCharacters = caseData.characters.filter(
    (c) =>
      c.isDefendant ||
      c.id === 'char_maintenance' ||
      c.id === 'char_control' ||
      c.id === 'char_guard',
  );

  const currentMeta = currentDraft ? VERDICT_TYPE_META[currentDraft.verdictType] : null;

  return (
    <AnimatePresence>
      <div
        id="verdict-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/90 backdrop-blur-md select-none"
        onClick={onClose}
      >
        <motion.div
          id="judicial-verdict-dossier"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl max-h-[94vh] overflow-hidden rounded-md bg-[#110d0a] border border-[#d4af37]/45 text-[#f5eedb] shadow-[0_0_100px_rgba(0,0,0,0.95)] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 border-b border-[#d4af37]/25 bg-[#1b120c]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded bg-[#d4af37] text-[#1a1008] shadow-md shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[#d4af37]/85 font-body-court truncate">
                  منصة القضاء • {caseData.coverInfo.fileNumber}
                </div>
                <h2 className="text-lg sm:text-2xl font-bold font-serif-court text-[#faf7f0] leading-tight truncate">
                  محضر المداولة وإصدار الحكم
                </h2>
              </div>
            </div>

            <button
              id="btn-close-verdict"
              onClick={onClose}
              className="flex items-center gap-1.5 min-h-[44px] px-3 sm:px-4 py-2 rounded text-xs font-semibold text-[#faf7f0]/80 hover:text-[#faf7f0] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">الرجوع للمنصة</span>
            </button>
          </div>

          {/* Simulation Notice + Tabs */}
          <div className="px-4 sm:px-6 pt-3 pb-2.5 bg-[#160f0a] border-b border-white/10 space-y-2.5">
            <div className="flex items-start gap-2 px-3 py-2 rounded-sm bg-amber-950/35 border border-[#d4af37]/25 text-[11px] sm:text-xs text-[#f5eedb]/80 font-body-court leading-relaxed">
              <Info className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <span>{config.simulationNotice || SIMULATION_RULES_NOTICE}</span>
            </div>

            {config.allowPreTrialBail && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab('verdict')}
                  className={`min-h-[44px] px-3 py-2 rounded-sm border text-xs sm:text-sm font-serif-court font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'verdict'
                      ? 'bg-[#2a1b10] border-[#d4af37] text-[#d4af37]'
                      : 'bg-black/30 border-white/10 text-[#faf7f0]/70 hover:text-[#faf7f0]'
                  }`}
                >
                  <Hammer className="w-4 h-4" />
                  <span>الحكم النهائي والتسبيب</span>
                </button>
                <button
                  onClick={() => setActiveTab('pretrial')}
                  className={`min-h-[44px] px-3 py-2 rounded-sm border text-xs sm:text-sm font-serif-court font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'pretrial'
                      ? 'bg-[#2a1b10] border-[#d4af37] text-[#d4af37]'
                      : 'bg-black/30 border-white/10 text-[#faf7f0]/70 hover:text-[#faf7f0]'
                  }`}
                >
                  <Gavel className="w-4 h-4" />
                  <span>التوقيف والكفالة (ما قبل الحكم)</span>
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {activeTab === 'pretrial' ? (
              <div className="space-y-5">
                <div className="p-3.5 rounded-sm bg-[#19120c] border border-white/10 text-xs sm:text-sm text-[#faf7f0]/80 font-body-court leading-relaxed">
                  قرار التوقيف الاحتياطي أو الإفراج بكفالة يُسجَّل في محضر الجلسة أثناء نظر القضية ولا يُنهي المحاكمة، ويُقيَّم ضمن عدالة إجراءاتك في النتيجة النهائية.
                </div>

                {/* Defendant Selection for Bail */}
                <div>
                  <label className="text-xs font-bold text-[#d4af37] font-serif-court block mb-2">
                    اختر المتهم للنظر في أمر توقيفه أو كفالته:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {config.defendantRules.map((rule) => {
                      const recorded = investigation.bailDecisions[rule.defendantId];
                      const selected = bailDefendantId === rule.defendantId;
                      return (
                        <button
                          key={rule.defendantId}
                          onClick={() => setBailDefendantId(rule.defendantId)}
                          className={`min-h-[52px] p-3 rounded-sm border text-right transition-all cursor-pointer ${
                            selected
                              ? 'bg-[#27190f] border-[#d4af37] text-[#faf7f0]'
                              : 'bg-[#17110c] border-white/10 text-[#faf7f0]/75 hover:border-white/25'
                          }`}
                        >
                          <div className="font-bold font-serif-court text-sm">
                            {rule.defendantName}
                          </div>
                          <div className="text-[11px] text-[#d4af37]/80 font-body-court mt-0.5">
                            {recorded
                              ? recorded.decision === 'bail_granted'
                                ? `كفالة: ${formatMoneyEGP(recorded.bailAmount || 0)}`
                                : 'رفض الكفالة (استمرار الحبس)'
                              : 'لم يصدر قرار ما قبل الحكم'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bail Action Choice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setBailChoice('bail_granted')}
                    className={`min-h-[56px] p-4 rounded-sm border text-right cursor-pointer transition-all ${
                      bailChoice === 'bail_granted'
                        ? 'bg-emerald-950/35 border-emerald-500 text-[#faf7f0]'
                        : 'bg-[#17110c] border-white/10 text-[#faf7f0]/75'
                    }`}
                  >
                    <div className="font-bold font-serif-court text-sm text-emerald-300">
                      إفراج مؤقت بكفالة مالية
                    </div>
                    <div className="text-xs text-[#faf7f0]/70 font-body-court mt-1">
                      إخلاء سبيل المتهم مؤقتاً بضمان مالي لحين النطق بالحكم النهائي.
                    </div>
                  </button>

                  <button
                    onClick={() => setBailChoice('bail_denied')}
                    className={`min-h-[56px] p-4 rounded-sm border text-right cursor-pointer transition-all ${
                      bailChoice === 'bail_denied'
                        ? 'bg-rose-950/35 border-rose-500 text-[#faf7f0]'
                        : 'bg-[#17110c] border-white/10 text-[#faf7f0]/75'
                    }`}
                  >
                    <div className="font-bold font-serif-court text-sm text-rose-300">
                      رفض الكفالة واستمرار الحبس
                    </div>
                    <div className="text-xs text-[#faf7f0]/70 font-body-court mt-1">
                      استمرار حبس المتهم احتياطياً لخطورة التهمة أو خشية الهرب والعبث بالأدلة.
                    </div>
                  </button>
                </div>

                {bailChoice === 'bail_granted' && (
                  <div>
                    <label className="text-xs font-bold text-[#d4af37] font-serif-court block mb-2">
                      حدد مبلغ الكفالة المالية:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {config.bailOptions.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setBailAmount(amount)}
                          className={`min-h-[44px] px-4 py-2 rounded-sm border text-xs sm:text-sm font-body-court tabular-nums cursor-pointer transition-all ${
                            bailAmount === amount
                              ? 'bg-[#d4af37] text-[#1a1008] border-[#d4af37] font-bold'
                              : 'bg-[#17110c] text-[#faf7f0]/80 border-white/15 hover:border-[#d4af37]/50'
                          }`}
                        >
                          {formatMoneyEGP(amount)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('verdict')}
                    className="min-h-[44px] px-4 py-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#faf7f0]/80 cursor-pointer font-serif-court"
                  >
                    الانتقال لإصدار الحكم النهائي
                  </button>
                  <button
                    id="btn-save-bail-decision"
                    onClick={handleSaveBail}
                    className="min-h-[44px] px-5 py-2.5 rounded-sm bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] font-bold text-xs sm:text-sm cursor-pointer font-serif-court"
                  >
                    تسجيل قرار التوقيف / الكفالة
                  </button>
                </div>
              </div>
            ) : (
              currentRule &&
              currentDraft && (
                <div className="space-y-5">
                  {/* Defendant Selector Strip */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#d4af37] font-serif-court">
                        1) اختر المتهم لتحديد حكمه وتسبيبه:
                      </span>
                      <span className="text-xs text-[#faf7f0]/75 font-body-court tabular-nums">
                        المكتمل:{' '}
                        <span dir="ltr" className="inline-block">
                          {completedCount} / {config.defendantRules.length}
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {config.defendantRules.map((rule) => {
                        const isSelected = rule.defendantId === currentRule.defendantId;
                        const isDone = isDefendantComplete(rule.defendantId);
                        const wasTouched = touchedDefendants[rule.defendantId];
                        return (
                          <button
                            key={rule.defendantId}
                            onClick={() => {
                              audioManager.playPaperRustle();
                              setActiveDefendantId(rule.defendantId);
                            }}
                            className={`min-h-[54px] p-3 rounded-sm border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-[#2a1b10] border-[#d4af37] text-[#ffffff] shadow-[0_0_16px_rgba(212,175,55,0.18)]'
                                : isDone
                                  ? 'bg-[#161c15] border-emerald-600/45 text-[#e8f5e9]'
                                  : 'bg-[#17110c] border-white/10 text-[#c9bfae] hover:border-white/25'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="font-bold font-serif-court text-sm truncate">
                                {rule.defendantName}
                              </div>
                              <div className="text-[11px] opacity-75 font-body-court truncate">
                                {isDone
                                  ? VERDICT_TYPE_META[drafts[rule.defendantId].verdictType].label
                                  : wasTouched
                                    ? 'أكمل الأدلة والتسبيب'
                                    : 'بانتظار تحديد الحكم'}
                              </div>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-400 text-[#0c140c]'
                                  : 'border-white/20 text-white/30'
                              }`}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Charge Box */}
                  <div className="p-3.5 rounded-sm bg-[#19120c] border border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs text-[#d4af37]/85 font-body-court">
                        {currentRule.roleLabel}
                      </div>
                      <div className="text-sm font-bold font-serif-court text-[#faf7f0] mt-0.5">
                        التهمة المسندة: {currentRule.chargeTitle}
                      </div>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-sm bg-black/40 border border-white/10 text-[#d4af37] font-body-court">
                      {currentRule.chargeSeverity === 'capital'
                        ? 'جناية كبرى (عقوبتها تصل للإعدام)'
                        : currentRule.chargeSeverity === 'felony'
                          ? 'جناية (لا تشمل عقوبة الإعدام)'
                          : 'جنحة'}
                    </span>
                  </div>

                  {/* 2) Verdict Type Picker */}
                  <div>
                    <label className="text-xs font-bold text-[#d4af37] font-serif-court block mb-2">
                      2) منطوق الحكم بحق {currentRule.defendantName}:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {allowedVerdictTypes.map((vType) => {
                        const meta = VERDICT_TYPE_META[vType];
                        const selected = currentDraft.verdictType === vType;
                        return (
                          <button
                            key={vType}
                            onClick={() => {
                              audioManager.playPaperRustle();
                              updateCurrentDraft({ verdictType: vType });
                            }}
                            className={`min-h-[52px] p-3 rounded-sm border text-right transition-all cursor-pointer flex items-start justify-between gap-2 ${
                              selected
                                ? 'bg-[#26180e] border-[#d4af37] text-[#ffffff]'
                                : 'bg-[#16100b] border-white/10 text-[#c9bfae] hover:border-white/25'
                            }`}
                          >
                            <div>
                              <div className="font-bold font-serif-court text-sm flex items-center gap-1.5">
                                {vType === 'acquittal' || vType === 'dismissed' ? (
                                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : vType === 'retrial' ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                ) : (
                                  <Scale className="w-4 h-4 text-rose-400 shrink-0" />
                                )}
                                <span>{meta.label}</span>
                              </div>
                              <div className="text-[11px] opacity-75 font-body-court mt-1 leading-snug">
                                {meta.shortDesc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conditional Duration Picker */}
                  {currentMeta?.requiresDuration && (
                    <div className="p-4 rounded-sm bg-[#18110b] border border-[#d4af37]/30 space-y-2.5">
                      <label className="text-xs font-bold text-[#d4af37] font-serif-court block">
                        اختر مدة العقوبة ({currentMeta.label}):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {config.prisonOptions.map((durId: PrisonDurationId) => {
                          const opt = PRISON_DURATION_OPTIONS.find((o) => o.id === durId);
                          if (!opt) return null;
                          const selected = currentDraft.prisonDuration === durId;
                          return (
                            <button
                              key={durId}
                              onClick={() => updateCurrentDraft({ prisonDuration: durId })}
                              className={`min-h-[44px] px-3.5 py-2 rounded-sm border text-xs font-body-court cursor-pointer transition-all ${
                                selected
                                  ? 'bg-[#d4af37] text-[#1a1008] border-[#d4af37] font-bold'
                                  : 'bg-black/35 text-[#faf7f0]/80 border-white/15 hover:border-[#d4af37]/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Conditional Fine Picker */}
                  {currentMeta?.requiresFine && (
                    <div className="p-4 rounded-sm bg-[#18110b] border border-[#d4af37]/30 space-y-2.5">
                      <label className="text-xs font-bold text-[#d4af37] font-serif-court block">
                        اختر قيمة الغرامة المالية:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {config.fineOptions.map((amount) => {
                          const selected = currentDraft.fineAmount === amount;
                          return (
                            <button
                              key={amount}
                              onClick={() => updateCurrentDraft({ fineAmount: amount })}
                              className={`min-h-[44px] px-3.5 py-2 rounded-sm border text-xs font-body-court tabular-nums cursor-pointer transition-all ${
                                selected
                                  ? 'bg-[#d4af37] text-[#1a1008] border-[#d4af37] font-bold'
                                  : 'bg-black/35 text-[#faf7f0]/80 border-white/15 hover:border-[#d4af37]/50'
                              }`}
                            >
                              {formatMoneyEGP(amount)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3) Legal Reason Category */}
                  <div>
                    <label className="text-xs font-bold text-[#d4af37] font-serif-court block mb-2">
                      3) سبب الحكم والتكييف القضائي:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {config.availableReasons.map((rId: ReasonCategoryId) => {
                        const r = REASON_CATEGORIES[rId];
                        if (!r) return null;
                        const selected = currentDraft.reasonCategory === rId;
                        return (
                          <button
                            key={rId}
                            onClick={() => updateCurrentDraft({ reasonCategory: rId })}
                            className={`min-h-[48px] p-3 rounded-sm border text-right cursor-pointer transition-all ${
                              selected
                                ? 'bg-[#26180e] border-[#d4af37] text-[#ffffff]'
                                : 'bg-[#16100b] border-white/10 text-[#c9bfae] hover:border-white/25'
                            }`}
                          >
                            <div className="text-xs sm:text-sm font-bold font-serif-court">
                              {r.label}
                            </div>
                            <div className="text-[11px] opacity-75 font-body-court mt-0.5 leading-snug">
                              {r.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4) Justification: Evidence + Testimonies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Supporting Evidence */}
                    <div className="p-4 rounded-sm bg-[#16100b] border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#d4af37] font-serif-court flex items-center gap-1.5">
                          <FileSearch className="w-4 h-4" />
                          <span>الأدلة المستند إليها (مطلوب):</span>
                        </span>
                        <span className="text-[11px] text-[#faf7f0]/60 tabular-nums">
                          {currentDraft.selectedEvidenceIds.length} مختار
                        </span>
                      </div>
                      <div className="space-y-2">
                        {caseData.evidence.map((ev) => {
                          const checked = currentDraft.selectedEvidenceIds.includes(ev.id);
                          const examined = investigation.examinedEvidenceIds.includes(ev.id);
                          return (
                            <button
                              key={ev.id}
                              onClick={() => toggleEvidence(ev.id)}
                              className={`w-full min-h-[44px] p-2.5 rounded-sm border text-right flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                checked
                                  ? 'bg-[#2a1b10] border-[#d4af37] text-[#ffffff]'
                                  : 'bg-black/30 border-white/10 text-[#c9bfae] hover:border-white/25'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-bold font-serif-court truncate">
                                  {ev.title}
                                </div>
                                <div className="text-[11px] opacity-70 font-body-court">
                                  {examined ? 'تم فحصه في ملف الأحراز' : 'لم يُفحص بعد'}
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-xs border flex items-center justify-center shrink-0 ${
                                  checked
                                    ? 'bg-[#d4af37] border-[#d4af37] text-[#1a1008]'
                                    : 'border-white/25'
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Supporting Testimonies */}
                    <div className="p-4 rounded-sm bg-[#16100b] border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#d4af37] font-serif-court flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4" />
                          <span>الشهادات والإفادات المؤيدة:</span>
                        </span>
                        <span className="text-[11px] text-[#faf7f0]/60 tabular-nums">
                          {currentDraft.selectedTestimonyIds.length} مختار
                        </span>
                      </div>
                      <div className="space-y-2">
                        {testimonyCharacters.map((ch) => {
                          const checked = currentDraft.selectedTestimonyIds.includes(ch.id);
                          const speakerKey = getSpeakerKeyForCharacterId(ch.id);
                          const askedCount = speakerKey
                            ? investigation.askedQuestions[speakerKey]?.length || 0
                            : 0;
                          return (
                            <button
                              key={ch.id}
                              onClick={() => toggleTestimony(ch.id)}
                              className={`w-full min-h-[44px] p-2.5 rounded-sm border text-right flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                checked
                                  ? 'bg-[#2a1b10] border-[#d4af37] text-[#ffffff]'
                                  : 'bg-black/30 border-white/10 text-[#c9bfae] hover:border-white/25'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-bold font-serif-court truncate">
                                  {ch.name}
                                </div>
                                <div className="text-[11px] opacity-70 font-body-court">
                                  {askedCount > 0
                                    ? `تم استجوابه (${askedCount} أسئلة)`
                                    : 'لم يُستجوب في القاعة بعد'}
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-xs border flex items-center justify-center shrink-0 ${
                                  checked
                                    ? 'bg-[#d4af37] border-[#d4af37] text-[#1a1008]'
                                    : 'border-white/25'
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-4 sm:px-6 py-3.5 border-t border-[#d4af37]/25 bg-[#160e08] flex flex-wrap items-center justify-between gap-2.5">
            {activeTab === 'verdict' ? (
              <>
                <div className="text-xs text-[#faf7f0]/70 font-body-court">
                  {!allComplete
                    ? 'اختر الحكم والسبب ودليلاً واحداً على الأقل لكل متهم لتفعيل طرق المطرقة.'
                    : 'جميع الأحكام مسبّبة وجاهزة للنطق الرسمي.'}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {nextIncompleteRule && (
                    <button
                      onClick={() => setActiveDefendantId(nextIncompleteRule.defendantId)}
                      className="min-h-[44px] px-3.5 py-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#faf7f0] flex items-center gap-1 cursor-pointer font-serif-court"
                    >
                      <span>التالي: {nextIncompleteRule.defendantName}</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    id="btn-pronounce-verdict"
                    onClick={handleFinalSubmit}
                    disabled={!allComplete}
                    className={`min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-bold text-xs sm:text-sm transition-all font-serif-court ${
                      allComplete
                        ? 'bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] cursor-pointer shadow-lg brass-glow'
                        : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                    }`}
                  >
                    <Hammer className="w-4 h-4" />
                    <span>طرق المطرقة وإعلان الحكم</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-between">
                <span className="text-xs text-[#faf7f0]/65 font-body-court">
                  تُحفظ قرارات التوقيف والكفالة في مفكرة القاضي.
                </span>
                <button
                  onClick={onClose}
                  className="min-h-[44px] px-5 py-2 rounded-sm bg-white/10 hover:bg-white/15 text-xs font-serif-court text-[#faf7f0] cursor-pointer"
                >
                  العودة لقاعة المحكمة
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
