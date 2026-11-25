import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Archive, CheckCircle2, Lock, Play, FolderOpen } from 'lucide-react';
import { SeasonDefinition, LevelDefinition, GameProgressState } from '../types';

interface CaseArchiveModalProps {
  seasons: SeasonDefinition[];
  progress: GameProgressState;
  onSelectLevel: (level: LevelDefinition) => void;
  onClose: () => void;
}

export function CaseArchiveModal({
  seasons,
  progress,
  onSelectLevel,
  onClose,
}: CaseArchiveModalProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'unlocked'>('all');

  const allLevels = seasons.flatMap((s) => s.levels);

  const filteredLevels = allLevels.filter((lvl) => {
    const isCompleted = progress.completedCases[lvl.caseId] !== undefined;
    const isUnlocked = progress.unlockedLevelIds.includes(lvl.id);
    if (filter === 'completed') return isCompleted;
    if (filter === 'unlocked') return isUnlocked && !isCompleted;
    return true;
  });

  return (
    <div
      id="case-archive-modal-backdrop"
      className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto border-b border-[#d4af37]/25 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            id="btn-close-archive"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#faf7f0]/80 hover:text-[#faf7f0] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>العودة للقائمة</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="text-[11px] font-mono text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
            <Archive className="w-3.5 h-3.5" />
            <span>JUDICIAL CASE ARCHIVES • أرشيف القضايا</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xs text-xs font-serif-court cursor-pointer transition-colors ${
              filter === 'all'
                ? 'bg-[#d4af37] text-[#1a1008] font-bold'
                : 'bg-white/5 hover:bg-white/10 text-[#faf7f0]/70'
            }`}
          >
            كافة القضايا
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-xs text-xs font-serif-court cursor-pointer transition-colors ${
              filter === 'completed'
                ? 'bg-[#d4af37] text-[#1a1008] font-bold'
                : 'bg-white/5 hover:bg-white/10 text-[#faf7f0]/70'
            }`}
          >
            المكتملة
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1 rounded-xs text-xs font-serif-court cursor-pointer transition-colors ${
              filter === 'unlocked'
                ? 'bg-[#d4af37] text-[#1a1008] font-bold'
                : 'bg-white/5 hover:bg-white/10 text-[#faf7f0]/70'
            }`}
          >
            قيد المحاكمة
          </button>
        </div>
      </div>

      {/* Archive Grid */}
      <div className="w-full max-w-5xl mx-auto my-auto py-2">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-court text-[#faf7f0]">
            أرشيف السجلات القضائية
          </h2>
          <p className="text-xs sm:text-sm text-[#faf7f0]/65 font-body-court">
            استعرض كافة ملفات القضايا والأحكام الصادرة، مع إمكانية إعادة فتح أي جلسة للمراجعة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLevels.map((level) => {
            const isCompleted = progress.completedCases[level.caseId] !== undefined;
            const isUnlocked = progress.unlockedLevelIds.includes(level.id);
            const completion = progress.completedCases[level.caseId];

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-sm border transition-all ${
                  isUnlocked
                    ? 'bg-[#18110b] border-[#d4af37]/40 shadow-md'
                    : 'bg-[#110d0a]/60 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[#d4af37] px-2 py-0.5 rounded-xs bg-black/40 border border-white/5">
                    {level.fileCode}
                  </span>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-serif-court font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>حكم صادر</span>
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-xs text-[#d4af37] font-serif-court font-semibold">
                      متاح للمحاكمة
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-400/80 font-serif-court">
                      <Lock className="w-3 h-3" />
                      <span>مغلق</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold font-serif-court text-[#faf7f0] mb-1">
                  {level.title}
                </h3>
                <div className="text-xs text-[#d4af37]/80 font-serif-court mb-2">
                  {level.caseType}
                </div>

                {isCompleted && completion && (
                  <div className="p-3 rounded-sm bg-black/50 border border-white/5 text-xs text-[#faf7f0]/90 font-serif-court mb-3 space-y-1">
                    <div>
                      <strong>المنطوق المقضي به:</strong> {completion.verdictTitle}
                    </div>
                    {typeof completion.stars === 'number' && (
                      <div className="flex items-center justify-between text-[11px] text-[#d4af37] font-body-court tabular-nums">
                        <span>{completion.fairnessLabel || ''}</span>
                        <span dir="ltr" className="inline-block">
                          {completion.stars} / 10 ★
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-white/40 font-mono">
                    {level.caseData.caseNumber}
                  </span>
                  {isUnlocked && (
                    <button
                      onClick={() => onSelectLevel(level)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] font-bold text-xs font-serif-court cursor-pointer transition-colors"
                    >
                      <Play className="w-3 h-3 fill-[#1a1008]" />
                      <span>{isCompleted ? 'إعادة الجلسة' : 'بدء التحقيق'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto pt-4 text-[11px] text-white/40 font-mono flex items-center justify-between border-t border-white/5">
        <div>THE COURT • ARCHIVE DATABASE</div>
        <div>ALL JUDICIAL RECORDS RETAINED</div>
      </div>
    </div>
  );
}
