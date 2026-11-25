import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Scale, Home, Settings, Award } from 'lucide-react';
import { GamePhase, CaseData, LifetimeCareerStats } from '../types';

interface MinimalOverlayProps {
  phase: GamePhase;
  caseData: CaseData;
  careerStats?: LifetimeCareerStats;
  feedbackMessage: string | null;
  hoveredObject: string | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoToMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenCareerProfile?: () => void;
}

export function MinimalOverlay({
  phase,
  caseData,
  careerStats,
  feedbackMessage,
  hoveredObject,
  soundEnabled,
  onToggleSound,
  onGoToMenu,
  onOpenSettings,
  onOpenCareerProfile,
}: MinimalOverlayProps) {
  const isCourtroomPhase =
    phase === 'COURTROOM' ||
    phase === 'CASE_FILE' ||
    phase === 'EVIDENCE' ||
    phase === 'CHARACTERS' ||
    phase === 'NOTES' ||
    phase === 'INTERROGATION' ||
    phase === 'VERDICT';

  if (!isCourtroomPhase) return null;

  return (
    <div
      id="court-minimal-overlay"
      className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between px-2.5 py-2 sm:px-5 sm:py-3.5 select-none"
    >
      {/* Top Header Bar HUD: compact single row on mobile; controls-only on desktop so top-right suspect card stays unobstructed */}
      <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
        {/* Compact Court Title (Mobile top-right; on desktop moved to bottom-right away from defendant cards) */}
        <div className="pointer-events-auto flex sm:hidden items-center gap-1.5 shrink-0">
          <Scale className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="serif text-xs font-bold tracking-[0.08em] text-[#d4af37] whitespace-nowrap">
            THE COURT
          </span>
        </div>

        {/* Minimal Audio, Career Profile & Menu Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {onOpenCareerProfile && (
            <button
              id="btn-hud-career-profile"
              onClick={onOpenCareerProfile}
              className="h-8 sm:h-9 flex items-center gap-1 bg-black/65 hover:bg-black/85 border border-[#d4af37]/35 hover:border-[#d4af37]/75 px-2 sm:px-3 rounded-full text-xs text-[#f5f2ed] transition-all cursor-pointer backdrop-blur-md shadow-lg font-body-court"
              title="سجل القاضي والرتبة والنجوم"
            >
              <Award className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="text-[11px] font-bold text-[#d4af37] tabular-nums whitespace-nowrap">
                {careerStats?.totalStars ?? 0} ★
              </span>
            </button>
          )}

          {onGoToMenu && (
            <button
              id="btn-return-menu"
              onClick={onGoToMenu}
              className="h-8 w-8 sm:w-auto sm:h-9 flex items-center justify-center gap-1.5 bg-black/60 hover:bg-black/80 border border-white/15 hover:border-[#d4af37]/60 sm:px-3 rounded-full text-xs text-white/80 hover:text-[#f5f2ed] transition-all cursor-pointer backdrop-blur-md shadow-lg font-serif-court"
              title="العودة للقائمة الرئيسية"
            >
              <Home className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="text-[11px] font-medium hidden sm:inline">القائمة</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              id="btn-quick-settings"
              onClick={onOpenSettings}
              className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 border border-white/15 hover:border-[#d4af37]/60 text-white/80 hover:text-[#f5f2ed] transition-all cursor-pointer backdrop-blur-md shadow-lg"
              title="الإعدادات"
            >
              <Settings className="w-3.5 h-3.5 text-[#d4af37]" />
            </button>
          )}

          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className="h-8 w-8 sm:w-auto sm:h-9 flex items-center justify-center gap-1.5 bg-black/60 hover:bg-black/80 border border-white/15 hover:border-[#d4af37]/60 sm:px-3 rounded-full text-xs text-white/75 hover:text-[#f5f2ed] transition-all cursor-pointer backdrop-blur-md shadow-lg"
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[11px] font-medium font-body-court hidden sm:inline">الصوت</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[11px] font-medium font-body-court text-white/40 hidden sm:inline">صامت</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Center Hover Tooltip Hint */}
      <div className="flex flex-col items-center justify-center gap-3">
        <AnimatePresence>
          {hoveredObject && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#0d0c0a]/92 border border-[#d4af37]/40 text-[#f5f2ed] text-xs sm:text-sm font-serif-court backdrop-blur-md shadow-2xl brass-glow"
            >
              <span>{hoveredObject}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Row: Desktop Court Branding (bottom-right, clear of defendant cards) + Centered Toast / Prompt */}
      <div className="flex items-end justify-center sm:justify-between gap-3 pb-1 sm:pb-0 w-full">
        {/* Desktop Title Placement (away from top-right defendant card) */}
        <div className="hidden sm:flex pointer-events-auto flex-col items-start bg-black/55 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-sm shrink-0">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="serif text-sm font-bold tracking-[0.14em] text-[#d4af37]">
              THE COURT
            </span>
          </div>
          <span className="text-[10px] tracking-wide text-white/65 font-body-court">
            {caseData.coverInfo.fileNumber} • {caseData.title}
          </span>
        </div>

        <div className="flex-1 flex justify-center min-w-0">
          <AnimatePresence>
            {feedbackMessage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto px-4 sm:px-5 py-2 rounded-full bg-[#0d0c0a]/92 border border-[#d4af37]/40 text-[#f5f2ed] text-xs sm:text-sm font-medium backdrop-blur-md shadow-2xl text-center brass-glow"
              >
                <span className="font-body-court font-semibold">{feedbackMessage}</span>
              </motion.div>
            ) : (
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full">
                <span className="text-[11px] tracking-wide text-white/75 font-body-court">
                  اسحب للنظر حولك، وانقر على الملفات أو المتهمين للتفاعل
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden lg:block w-44 shrink-0" />
      </div>
    </div>
  );
}
