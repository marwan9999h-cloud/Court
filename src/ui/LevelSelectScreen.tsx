import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Lock, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { SeasonDefinition, LevelDefinition, GameProgressState } from '../types';

interface LevelSelectScreenProps {
  season: SeasonDefinition;
  progress: GameProgressState;
  onSelectLevel: (level: LevelDefinition) => void;
  onBack: () => void;
}

export function LevelSelectScreen({
  season,
  progress,
  onSelectLevel,
  onBack,
}: LevelSelectScreenProps) {
  return (
    <div
      id="level-select-screen-overlay"
      className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto border-b border-[#d4af37]/25 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-seasons"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#faf7f0]/80 hover:text-[#faf7f0] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>العودة للمواسم</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="text-[11px] font-mono text-[#d4af37] uppercase tracking-widest">
            {season.title.split(':')[0]} • ملفات القضايا
          </div>
        </div>

        <div className="text-xs text-[#faf7f0]/70 font-mono">
          SEASON 0{season.seasonNumber} FILES
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto my-auto py-2">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-court text-[#faf7f0]">
            {season.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#faf7f0]/65 font-body-court">
            اختر ملف القضية المراد فتح جلستها والاطلاع على أوراق الاتهام والأحراز الجنائية.
          </p>
        </div>

        {/* Level Files Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {season.levels.map((level, idx) => {
            const isCompleted = progress.completedCases[level.caseId] !== undefined;
            const isUnlocked = progress.unlockedLevelIds.includes(level.id);
            const completionData = progress.completedCases[level.caseId];

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                onClick={() => isUnlocked && onSelectLevel(level)}
                className={`relative rounded-sm border p-5 flex flex-col justify-between transition-all duration-300 ${
                  isUnlocked
                    ? isCompleted
                      ? 'bg-gradient-to-b from-[#1c1a12] to-[#12110c] border-[#d4af37]/60 hover:border-[#d4af37] shadow-lg cursor-pointer hover:-translate-y-1'
                      : 'bg-gradient-to-b from-[#251810] to-[#160e0a] border-[#d4af37]/40 hover:border-[#d4af37] shadow-[0_6px_25px_rgba(0,0,0,0.8)] cursor-pointer hover:-translate-y-1'
                    : 'bg-[#100c09]/70 border-white/10 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* File Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-xs bg-black/60 border border-white/10 font-mono text-[11px] font-bold text-[#d4af37]">
                      {level.fileCode}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      LEVEL 0{level.levelNumber}
                    </span>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-serif-court font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مكتملة</span>
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[11px] text-[#d4af37] font-serif-court font-semibold">
                        جاهزة للاطلاع
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/80 font-serif-court">
                        <Lock className="w-3 h-3" />
                        <span>مقفلة</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Case Title and Details */}
                <div className="space-y-1.5 mb-4">
                  <h3 className="text-base sm:text-lg font-bold font-serif-court text-[#faf7f0] leading-snug">
                    {level.title}
                  </h3>
                  <div className="text-xs text-[#d4af37]/80 font-serif-court line-clamp-1">
                    {level.caseType}
                  </div>
                  <p className="text-xs text-[#faf7f0]/65 font-body-court line-clamp-2 leading-relaxed pt-1">
                    {level.briefSummary}
                  </p>
                </div>

                {/* Footer and Completion Status */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="text-[11px] text-emerald-300/80 font-serif-court">
                      {completionData?.verdictTitle ? `الحكم: ${completionData.verdictTitle}` : 'تم إصدار الحكم'}
                    </div>
                  ) : isUnlocked ? (
                    <div className="text-[11px] text-[#faf7f0]/60 font-body-court">
                      انقر لعرض لائحة الاتهام
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-300/70 font-body-court">
                      {level.unlockRequirement || 'أكمل المستوى السابق أولاً'}
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="flex items-center gap-1 text-xs text-[#d4af37] font-bold font-serif-court">
                      <span>فتح</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto pt-4 text-[11px] text-white/40 font-mono flex items-center justify-between border-t border-white/5">
        <div>THE COURT • CASE LEVEL SELECTOR</div>
        <div>SELECT A CASE DOSSIER TO OPEN BRIEFING</div>
      </div>
    </div>
  );
}
