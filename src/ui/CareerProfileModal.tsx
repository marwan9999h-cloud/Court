import React from 'react';
import { motion } from 'motion/react';
import { Award, CheckCircle2, AlertTriangle, Star, Scale, X, History } from 'lucide-react';
import { LifetimeCareerStats } from '../types';
import { CAREER_RANKS, getCareerRank } from '../game/CareerProgress';

interface CareerProfileModalProps {
  careerStats: LifetimeCareerStats;
  onClose: () => void;
}

export function CareerProfileModal({ careerStats, onClose }: CareerProfileModalProps) {
  const rank = getCareerRank(careerStats.totalStars);
  const progressRatio = rank.nextRankStars
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((careerStats.totalStars - rank.minStars) /
              Math.max(1, rank.nextRankStars - rank.minStars)) *
              100,
          ),
        ),
      )
    : 100;

  return (
    <div
      id="career-profile-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/88 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-3xl max-h-[92vh] rounded-md border border-[#d4af37]/45 bg-[#140e0a] text-[#faf7f0] shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-[#d4af37]/25 bg-[#1e140d]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-sm bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-body-court text-[#d4af37]/80">
                السجل المهني التراكمي للقاضي
              </div>
              <h2 className="text-lg sm:text-2xl font-bold font-serif-court text-[#faf7f0] truncate">
                المسيرة القضائية والرتبة
              </h2>
            </div>
          </div>

          <button
            id="btn-close-career-profile"
            onClick={onClose}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#faf7f0]/80 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
            <span>إغلاق</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Rank Card */}
          <div className="p-4 sm:p-5 rounded-sm bg-[#1f150d] border border-[#d4af37]/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-[#d4af37]/85 font-body-court">الرتبة القضائية الحالية</div>
                <div className="text-xl sm:text-2xl font-bold font-serif-court text-[#faf7f0] mt-0.5">
                  {rank.title}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-black/40 border border-[#d4af37]/30 text-[#d4af37] font-bold text-sm tabular-nums">
                <Star className="w-4 h-4 fill-[#d4af37]" />
                <span>{careerStats.totalStars} نجمة</span>
              </div>
            </div>

            {rank.nextRankTitle && rank.nextRankStars !== null ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#faf7f0]/75 font-body-court tabular-nums">
                  <span>الترقية القادمة: {rank.nextRankTitle}</span>
                  <span>
                    <span dir="ltr" className="inline-block">
                      {careerStats.totalStars} / {rank.nextRankStars}
                    </span>{' '}
                    نجمة
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-[#d4af37] transition-all duration-300"
                    style={{ width: `${progressRatio}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-emerald-300 font-body-court">
                بلغت أعلى درجة في السلم القضائي الأعلى.
              </div>
            )}
          </div>

          {/* 5 Lifetime Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
            <div className="p-3 rounded-sm bg-[#19120c] border border-white/10">
              <div className="text-[11px] text-[#faf7f0]/65 font-body-court">إجمالي النجوم</div>
              <div className="text-lg font-bold text-[#d4af37] mt-1 tabular-nums">
                {careerStats.totalStars}
              </div>
            </div>
            <div className="p-3 rounded-sm bg-[#19120c] border border-white/10">
              <div className="text-[11px] text-[#faf7f0]/65 font-body-court">القضايا الملعوبة</div>
              <div className="text-lg font-bold text-[#faf7f0] mt-1 tabular-nums">
                {careerStats.casesPlayed}
              </div>
            </div>
            <div className="p-3 rounded-sm bg-[#19120c] border border-white/10">
              <div className="text-[11px] text-[#faf7f0]/65 font-body-court">متوسط النجوم</div>
              <div dir="ltr" className="text-lg font-bold text-[#faf7f0] mt-1 tabular-nums inline-block">
                {careerStats.averageStars} / 10
              </div>
            </div>
            <div className="p-3 rounded-sm bg-[#19120c] border border-white/10">
              <div className="text-[11px] text-[#faf7f0]/65 font-body-court">أحكام صحيحة</div>
              <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
                {careerStats.correctVerdicts}
              </div>
            </div>
            <div className="p-3 rounded-sm bg-[#19120c] border border-white/10 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-[#faf7f0]/65 font-body-court">أحكام جائرة</div>
              <div className="text-lg font-bold text-rose-400 mt-1 tabular-nums">
                {careerStats.unjustVerdicts}
              </div>
            </div>
          </div>

          {/* Rank Ladder */}
          <div className="p-4 rounded-sm bg-[#18110b] border border-white/10 space-y-2">
            <div className="text-xs font-bold text-[#d4af37] font-serif-court flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              <span>سلم الرتب القضائية</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {CAREER_RANKS.map((r) => {
                const reached = careerStats.totalStars >= r.minStars;
                return (
                  <div
                    key={r.title}
                    className={`p-2 rounded-sm border flex items-center justify-between gap-1 ${
                      reached
                        ? 'bg-[#25190f] border-[#d4af37]/45 text-[#faf7f0]'
                        : 'bg-black/25 border-white/5 text-white/45'
                    }`}
                  >
                    <span className="font-serif-court truncate">{r.title}</span>
                    <span className="font-body-court text-[11px] text-[#d4af37] shrink-0 tabular-nums">
                      {r.minStars}+
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent History */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-[#d4af37] font-serif-court flex items-center gap-1.5">
              <History className="w-4 h-4" />
              <span>سجل الجلسات الأخيرة</span>
            </div>

            {careerStats.history.length === 0 ? (
              <div className="p-4 rounded-sm bg-[#18110b] border border-white/10 text-xs sm:text-sm text-[#faf7f0]/65 font-body-court text-center">
                لم تُحسم أي قضية بعد. أكمل جلستك الأولى لتسجيل نجومك ورتبتك هنا.
              </div>
            ) : (
              <div className="space-y-2">
                {careerStats.history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-sm bg-[#19120c] border border-white/10 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold font-serif-court text-[#faf7f0]">
                        {item.caseTitle}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.isReplay && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-sm font-body-court border ${
                              (item.starsAdded ?? 0) > 0
                                ? 'bg-[#d4af37]/15 text-[#f3d166] border-[#d4af37]/40'
                                : 'bg-white/5 text-[#faf7f0]/65 border-white/15'
                            }`}
                          >
                            {(item.starsAdded ?? 0) > 0 ? (
                              <>
                                إعادة (
                                <span dir="ltr" className="inline-block tabular-nums">
                                  +{item.starsAdded}
                                </span>
                                )
                              </>
                            ) : (
                              'إعادة — دون رصيد إضافي'
                            )}
                          </span>
                        )}
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-sm inline-flex items-center gap-1 ${
                            item.isFair
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.isFair ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          <span>{item.fairnessLabel}</span>
                        </span>
                        <span dir="ltr" className="inline-block text-xs font-bold text-[#d4af37] tabular-nums">
                          {item.stars} / 10 ★
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#faf7f0]/75 font-body-court">
                      {item.verdictSummary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#18100a] border-t border-[#d4af37]/20 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-sm bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] font-bold text-xs sm:text-sm font-serif-court cursor-pointer"
          >
            العودة
          </button>
        </div>
      </motion.div>
    </div>
  );
}
