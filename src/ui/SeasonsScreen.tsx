import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Lock, FolderOpen, Scale, Sparkles } from 'lucide-react';
import { SeasonDefinition, GameProgressState } from '../types';

interface SeasonsScreenProps {
  seasons: SeasonDefinition[];
  progress: GameProgressState;
  onSelectSeason: (season: SeasonDefinition) => void;
  onBack: () => void;
}

export function SeasonsScreen({
  seasons,
  progress,
  onSelectSeason,
  onBack,
}: SeasonsScreenProps) {
  return (
    <div
      id="seasons-screen-overlay"
      className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      {/* Top Bar with Navigation */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto border-b border-[#d4af37]/25 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-main-from-seasons"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#faf7f0]/80 hover:text-[#faf7f0] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>العودة للقائمة</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="text-[11px] font-mono text-[#d4af37] uppercase tracking-widest">
            SEASONS DIRECTORY • مواسم القضايا
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#faf7f0]/70 font-serif-court">
          <Scale className="w-4 h-4 text-[#d4af37]" />
          <span>اختر موسم القضايا للبدء</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto my-auto py-4">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-court text-[#faf7f0]">
            مواسم التحقيق القضائي
          </h2>
          <p className="text-xs sm:text-sm text-[#faf7f0]/65 font-body-court">
            كل موسم يحتوي على سلسلة قضايا جنائية متسلسلة تتطلب فحص الأدلة وكشف التناقضات.
          </p>
        </div>

        {/* Seasons Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seasons.map((season) => {
            const isUnlocked = progress.unlockedSeasonIds.includes(season.id);
            const seasonCompletedCount = season.levels.filter(
              (lvl) => progress.completedCases[lvl.caseId] !== undefined
            ).length;

            return (
              <motion.div
                key={season.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => isUnlocked && onSelectSeason(season)}
                className={`relative rounded-sm border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-[#22160e] to-[#140d08] border-[#d4af37]/45 hover:border-[#d4af37] shadow-[0_8px_30px_rgba(0,0,0,0.85)] cursor-pointer hover:-translate-y-1'
                    : 'bg-[#100b08]/80 border-white/10 opacity-70 cursor-not-allowed'
                }`}
              >
                {/* Dossier Header Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-xs bg-[#d4af37]/20 border border-[#d4af37]/40 text-[10px] font-mono font-bold text-[#d4af37] tracking-widest uppercase">
                      SEASON 0{season.seasonNumber}
                    </span>
                    {isUnlocked ? (
                      <span className="text-xs font-serif-court text-emerald-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> متاح
                      </span>
                    ) : (
                      <span className="text-xs font-serif-court text-amber-400/80 font-semibold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> مغلق
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono text-[#d4af37]/75">
                    <span dir="ltr" className="inline-block">
                      {seasonCompletedCount} / {season.totalLevels}
                    </span>{' '}
                    مكتملة
                  </div>
                </div>

                {/* Season Title and Subtitle */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold font-serif-court text-[#faf7f0]">
                    {season.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#faf7f0]/70 font-body-court leading-relaxed">
                    {season.subtitle}
                  </p>
                </div>

                {/* Footer and Call to Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  {isUnlocked ? (
                    <>
                      <div className="flex items-center gap-2 text-xs text-[#faf7f0]/60 font-body-court">
                        <FolderOpen className="w-4 h-4 text-[#d4af37]" />
                        <span>{season.levels.length} ملفات قضائية</span>
                      </div>
                      <button className="px-4 py-1.5 rounded-sm bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] font-bold text-xs uppercase tracking-wider font-serif-court transition-colors">
                        استعراض القضايا
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-amber-300/80 font-body-court flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{season.lockReason || 'يتطلب إكمال الموسم السابق'}</span>
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
        <div>THE COURT • SEASONS ENGINE</div>
        <div>SELECT A SEASON TO PROCEED</div>
      </div>
    </div>
  );
}
