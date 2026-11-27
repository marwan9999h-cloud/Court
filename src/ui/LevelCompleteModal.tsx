import React from 'react';
import { motion } from 'motion/react';
import {
  Award,
  ArrowRight,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  UserCheck,
  Sparkles,
  Share2,
} from 'lucide-react';
import { shareCourtVerdict } from '../utils/shareCard';
import {
  CaseEvaluationResult,
  LevelDefinition,
  LifetimeCareerStats,
  SeasonDefinition,
} from '../types';
import { getCareerRank } from '../game/CareerProgress';

interface LevelCompleteModalProps {
  level: LevelDefinition;
  season: SeasonDefinition;
  evaluation: CaseEvaluationResult | null;
  careerStats: LifetimeCareerStats;
  onPlayNextLevel: () => void;
  onRetry: () => void;
  onOpenProfile: () => void;
  onBackToLevels: () => void;
  onBackToMainMenu: () => void;
}

function TenStarsRow({ stars }: { stars: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap" dir="ltr">
      {Array.from({ length: 10 }).map((_, index) => {
        const fill = Math.max(0, Math.min(1, stars - index));
        return (
          <div key={index} className="relative w-5 h-5 sm:w-6 sm:h-6">
            <Star className="w-full h-full text-white/15 stroke-[1.75]" />
            {fill > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${Math.round(fill * 100)}%` }}
              >
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#d4af37] fill-[#d4af37] stroke-[1.5]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ShareVerdictButton({
  level,
  evaluation,
  rankTitle,
}: {
  level: LevelDefinition;
  evaluation: CaseEvaluationResult;
  rankTitle: string;
}) {
  const [isSharing, setIsSharing] = React.useState(false);
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      await shareCourtVerdict({
        fileCode: level.fileCode,
        caseTitle: level.title,
        stars: evaluation.stars,
        verdictCorrect: evaluation.verdictCorrect,
        fairnessLabel: evaluation.fairnessLabel,
        rankTitle,
      });
    } catch {
      // Share sheet dismissed or encode failed; nothing to recover.
    } finally {
      setIsSharing(false);
    }
  };
  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/60 text-xs sm:text-sm font-bold text-[#f3d166] cursor-pointer font-serif-court disabled:opacity-60"
    >
      <Share2 className="w-4 h-4" />
      <span>{isSharing ? 'جاري التجهيز...' : 'شارك الحكم'}</span>
    </button>
  );
}

export function LevelCompleteModal({
  level,
  season,
  evaluation,
  careerStats,
  onPlayNextLevel,
  onRetry,
  onOpenProfile,
  onBackToLevels,
  onBackToMainMenu,
}: LevelCompleteModalProps) {
  if (!evaluation) return null;

  const currentIdx = season.levels.findIndex((l) => l.id === level.id);
  const nextLevel =
    currentIdx !== -1 && currentIdx + 1 < season.levels.length
      ? season.levels[currentIdx + 1]
      : null;

  const rank = getCareerRank(careerStats.totalStars);

  return (
    <div
      id="level-complete-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/90 backdrop-blur-md select-none"
    >
      <motion.div
        id="level-complete-card"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-3xl max-h-[94vh] rounded-md border border-[#d4af37]/50 bg-[#140e0a] text-[#faf7f0] shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
      >
        {/* Header with 10-Star Rating & Verdicts Labels */}
        <div className="p-4 sm:p-6 bg-[#20150e] border-b border-[#d4af37]/30 text-center space-y-3">
          <div className="text-[11px] font-body-court text-[#d4af37]/85">
            {level.fileCode} • {level.title}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold font-serif-court border ${
                evaluation.verdictCorrect
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              }`}
            >
              {evaluation.verdictCorrect ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>{evaluation.verdictCorrect ? 'حكم صحيح' : 'حكم خاطئ'}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold font-serif-court border ${
                evaluation.isFair
                  ? 'bg-[#d4af37]/15 border-[#d4af37]/60 text-[#f3d166]'
                  : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
              }`}
            >
              {evaluation.isFair ? (
                <Award className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>{evaluation.fairnessLabel}</span>
            </span>
          </div>

          <div className="space-y-1.5">
            <TenStarsRow stars={evaluation.stars} />
            <div className="text-2xl sm:text-3xl font-bold font-serif-court text-[#faf7f0] tabular-nums">
              <span dir="ltr" className="inline-block">
                {evaluation.stars} / 10
              </span>{' '}
              نجوم
            </div>
            {evaluation.careerCredit && (
              <div className="text-xs font-body-court text-[#faf7f0]/80 pt-0.5 tabular-nums">
                {!evaluation.careerCredit.isReplay ? (
                  <span>
                    رصيد هذه القضية: أُضيفت{' '}
                    <strong className="text-[#d4af37]">{evaluation.careerCredit.starsAdded}</strong>{' '}
                    نجوم إلى رصيدك التراكمي
                  </span>
                ) : evaluation.careerCredit.starsAdded > 0 ? (
                  <span>
                    رصيد هذه القضية: أفضل نتيجة{' '}
                    <strong className="text-[#d4af37]">{evaluation.careerCredit.bestStars}</strong>{' '}
                    (<span dir="ltr" className="inline-block text-emerald-300 font-bold">+{evaluation.careerCredit.starsAdded}</span>{' '}
                    تحسن عن أفضل نتيجة)
                  </span>
                ) : (
                  <span>
                    رصيد هذه القضية: أفضل نتيجة{' '}
                    <strong className="text-[#d4af37]">{evaluation.careerCredit.bestStars}</strong>{' '}
                    (لم تضف هذه المحاولة نجوماً)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Evaluation Details */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* 4-Part Score Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 rounded-sm bg-[#1c130d] border border-white/10">
              <div className="text-[11px] text-[#faf7f0]/65 font-body-court">صحة الحكم</div>
              <div
                dir="ltr"
                className="text-sm sm:text-base font-bold text-[#d4af37] mt-0.5 tabular-nums inline-block"
              >
                {evaluation.breakdown.verdictScore} / 4
              </div>
            </div>
            <div className="p-3 rounded-sm bg-[#1c130d] border border-white/10">
              <div className="text-[11px] text-[#faf7f0]/65 font-body-court">تناسب العقوبة</div>
              <div
                dir="ltr"
                className="text-sm sm:text-base font-bold text-[#d4af37] mt-0.5 tabular-nums inline-block"
              >
                {evaluation.breakdown.proportionalityScore} / 2.5
              </div>
            </div>
            <div className="p-3 rounded-sm bg-[#1c130d] border border-white/10">
              <div className="text-[11px] text-[#faf7f0]/65 font-body-court">التسبيب والأدلة</div>
              <div
                dir="ltr"
                className="text-sm sm:text-base font-bold text-[#d4af37] mt-0.5 tabular-nums inline-block"
              >
                {evaluation.breakdown.justificationScore} / 2
              </div>
            </div>
            <div className="p-3 rounded-sm bg-[#1c130d] border border-white/10">
              <div className="text-[11px] text-[#faf7f0]/65 font-body-court">شمولية التحقيق</div>
              <div
                dir="ltr"
                className="text-sm sm:text-base font-bold text-[#d4af37] mt-0.5 tabular-nums inline-block"
              >
                {evaluation.breakdown.thoroughnessScore} / 1.5
              </div>
            </div>
          </div>

          {evaluation.breakdown.thoroughnessCapApplied && (
            <div className="p-3.5 rounded-sm bg-amber-950/40 border border-amber-500/40 text-xs sm:text-sm text-amber-200 font-body-court leading-relaxed">
              تنبيه التحقيق: تم تخفيض السقف الأعلى للنجوم لأن الحكم صدر قبل استيفاء فحص الملفات واستجواب أطراف القضية في القاعة.
            </div>
          )}

          {/* Per-defendant Results */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#d4af37] font-serif-court">
              تقييم حكمك لكل متهم:
            </h3>
            <div className="space-y-2">
              {evaluation.defendantResults.map((d) => (
                <div
                  key={d.defendantId}
                  className="p-3.5 rounded-sm bg-[#1a120c] border border-white/10 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold font-serif-court text-[#faf7f0]">
                      {d.verdictSummary}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-sm font-body-court ${
                        d.isFair
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {d.fairnessLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#faf7f0]/75 font-body-court leading-relaxed">
                    {d.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Written Arabic Explanation */}
          <div className="p-4 sm:p-5 rounded-sm bg-[#19110b] border border-[#d4af37]/30 space-y-3.5 text-xs sm:text-sm font-body-court leading-relaxed">
            <div>
              <div className="font-bold text-[#d4af37] font-serif-court mb-1">
                ما هي الحقيقة الكاملة في القضية؟
              </div>
              <p className="text-[#faf7f0]/90">{evaluation.explanation.truthSummary}</p>
            </div>

            <div>
              <div className="font-bold text-[#d4af37] font-serif-court mb-1">
                الأدلة التي أثبتت ذلك:
              </div>
              <ul className="space-y-1 text-[#faf7f0]/80">
                {evaluation.explanation.provingEvidence.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>

            {evaluation.explanation.missedItems.length > 0 && (
              <div>
                <div className="font-bold text-amber-300 font-serif-court mb-1">
                  نقاط فاتك فحصها أو استجوابها:
                </div>
                <ul className="space-y-1 text-amber-100/85">
                  {evaluation.explanation.missedItems.map((m, idx) => (
                    <li key={idx}>• {m}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.bailFeedback && (
              <div>
                <div className="font-bold text-[#d4af37] font-serif-court mb-1">
                  تقييم قرار الكفالة ما قبل الحكم:
                </div>
                <p className="text-[#faf7f0]/85">{evaluation.bailFeedback}</p>
              </div>
            )}

            <div className="pt-2 border-t border-white/10 text-[11px] text-[#faf7f0]/55">
              {evaluation.explanation.simulationNote}
            </div>
          </div>

          {/* Career Summary Strip */}
          <div className="p-3.5 rounded-sm bg-black/40 border border-[#d4af37]/25 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#d4af37] font-serif-court">
              <UserCheck className="w-4 h-4" />
              <span>الرتبة الحالية: <strong>{rank.title}</strong></span>
            </div>
            <div className="text-[#faf7f0]/80 font-body-court tabular-nums">
              رصيدك التراكمي: <strong>{careerStats.totalStars}</strong> نجمة ({careerStats.casesPlayed}{' '}
              {careerStats.casesPlayed === 1 ? 'قضية' : 'قضايا'})
            </div>
          </div>

          {nextLevel && evaluation.verdictCorrect && evaluation.stars >= 6 && (
            <div className="p-3.5 rounded-sm bg-[#241910] border border-[#d4af37]/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#d4af37] shrink-0" />
                <div className="text-xs sm:text-sm font-serif-court text-[#faf7f0]">
                  تم فتح القضية التالية: <strong>{nextLevel.title}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-5 bg-[#18100a] border-t border-[#d4af37]/25 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onBackToMainMenu}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#faf7f0]/85 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>القائمة</span>
            </button>

            <button
              onClick={onBackToLevels}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#faf7f0]/85 cursor-pointer"
            >
              <span>المستويات</span>
            </button>

            <button
              onClick={onOpenProfile}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-sm bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/35 text-xs text-[#d4af37] cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>سجل القاضي</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-retry-trial"
              onClick={onRetry}
              className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-sm bg-white/10 hover:bg-white/15 border border-white/15 text-xs sm:text-sm font-semibold text-[#faf7f0] cursor-pointer font-serif-court"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاكمة</span>
            </button>

            <ShareVerdictButton
              level={level}
              evaluation={evaluation}
              rankTitle={rank.title}
            />

            {nextLevel && (
              <button
                id="btn-next-level"
                onClick={onPlayNextLevel}
                className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] font-bold text-xs sm:text-sm font-serif-court cursor-pointer"
              >
                <span>القضية التالية</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
