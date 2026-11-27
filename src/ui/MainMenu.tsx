import React from 'react';
import { motion } from 'motion/react';
import { Scale, Play, BookOpen, Archive, Settings, Info, Award, Star } from 'lucide-react';
import { GameProgressState, LifetimeCareerStats } from '../types';
import { getCareerRank } from '../game/CareerProgress';

interface MainMenuProps {
  progress: GameProgressState;
  careerStats: LifetimeCareerStats;
  onStartGame: () => void;
  onOpenArchive: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenCareerProfile: () => void;
}

export function MainMenu({
  progress,
  careerStats,
  onStartGame,
  onOpenArchive,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenAbout,
  onOpenCareerProfile,
}: MainMenuProps) {
  const rank = getCareerRank(careerStats.totalStars);

  return (
    <div
      id="main-menu-overlay"
      className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-10 pointer-events-none select-none bg-gradient-to-r from-black/85 via-black/55 to-transparent backdrop-blur-[2px]"
    >
      {/* Top Header branding */}
      <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full max-w-7xl mx-auto pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-sm border border-[#d4af37]/40 bg-[#160f0a]/90 text-[#d4af37] shadow-lg shrink-0">
            <Scale className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.14em] sm:tracking-[0.25em] text-[#d4af37]/85 uppercase leading-snug">
              SUPREME JUDICIAL TRIBUNAL
            </div>
            <div className="text-xs sm:text-sm text-[#f5eedb]/75 font-serif-court">
              المحكمة الجنائية العليا — منصة القضاء
            </div>
          </div>
        </div>

        {/* Clickable Career Rank & Stars Button */}
        <button
          id="btn-main-career-profile"
          onClick={onOpenCareerProfile}
          className="self-start sm:self-auto min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-sm bg-[#160f0a]/90 hover:bg-[#23170e] border border-[#d4af37]/40 hover:border-[#d4af37] text-xs text-[#f5eedb] transition-colors cursor-pointer shrink-0"
          title="فتح سجل القاضي والرتبة والنجوم"
        >
          <Award className="w-4 h-4 text-[#d4af37] shrink-0" />
          <div className="text-right">
            <div className="font-serif-court font-bold leading-tight">{rank.title}</div>
            <div className="text-[11px] text-[#d4af37] flex items-center gap-1 tabular-nums">
              <Star className="w-3 h-3 fill-[#d4af37]" />
              <span>{careerStats.totalStars} نجمة</span>
            </div>
          </div>
        </button>
      </div>

      {/* Center Left: Main Title and Menu Navigation */}
      <div className="w-full max-w-7xl mx-auto flex flex-col justify-center my-auto pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl space-y-6"
        >
          {/* Main Title Branding */}
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-xs bg-[#d4af37]/15 border border-[#d4af37]/40 text-[11px] font-mono tracking-[0.2em] text-[#d4af37] uppercase">
              FIRST-PERSON COURTROOM TRIAL EXPERIENCE
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-[0.2em] font-title-court text-[#d4af37] leading-none drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
              THE COURT
            </h1>
            <p className="text-base sm:text-lg text-[#faf7f0]/80 font-serif-court leading-relaxed max-w-md pt-1">
              أنت القاضي. تفحص الأدلة، استنطق المتهمين، واطرق المطرقة لتقرير مصير العدالة.
            </p>
          </div>

          {/* Menu Action List */}
          <div className="space-y-3 pt-4 w-full sm:w-80">
            {/* Primary: Start Game */}
            <button
              id="btn-main-start-game"
              onClick={onStartGame}
              className="group w-full relative flex items-center justify-between px-6 py-4 rounded-sm bg-gradient-to-r from-[#3d2616] to-[#1f140c] border border-[#d4af37] text-[#faf7f0] font-bold text-lg font-serif-court shadow-[0_4px_25px_rgba(0,0,0,0.8)] hover:brightness-125 transition-all duration-300 cursor-pointer active:scale-98 brass-glow"
            >
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 fill-[#d4af37] text-[#d4af37]" />
                <span className="tracking-wide">ابدأ اللعب</span>
              </div>
              <span className="text-xs font-mono text-[#d4af37]/75 tracking-wider uppercase">
                ENTER
              </span>
            </button>

            {/* Secondary Option: Case Archive */}
            <button
              id="btn-main-archive"
              onClick={onOpenArchive}
              className="w-full flex items-center justify-between px-5 py-3 rounded-sm bg-[#140e0a]/80 hover:bg-[#20150f] border border-white/10 hover:border-[#d4af37]/40 text-[#faf7f0]/85 hover:text-[#faf7f0] font-serif-court text-sm transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Archive className="w-4 h-4 text-[#d4af37]" />
                <span>أرشيف القضايا</span>
              </div>
              <span className="text-[11px] font-mono text-white/40">ARCHIVE</span>
            </button>

            {/* Secondary Option: How to Play */}
            <button
              id="btn-main-how-to-play"
              onClick={onOpenHowToPlay}
              className="w-full flex items-center justify-between px-5 py-3 rounded-sm bg-[#140e0a]/80 hover:bg-[#20150f] border border-white/10 hover:border-[#d4af37]/40 text-[#faf7f0]/85 hover:text-[#faf7f0] font-serif-court text-sm transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#d4af37]" />
                <span>طريقة اللعب</span>
              </div>
              <span className="text-[11px] font-mono text-white/40">GUIDE</span>
            </button>

            {/* Secondary Option: Settings */}
            <button
              id="btn-main-settings"
              onClick={onOpenSettings}
              className="w-full flex items-center justify-between px-5 py-3 rounded-sm bg-[#140e0a]/80 hover:bg-[#20150f] border border-white/10 hover:border-[#d4af37]/40 text-[#faf7f0]/85 hover:text-[#faf7f0] font-serif-court text-sm transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-[#d4af37]" />
                <span>الإعدادات</span>
              </div>
              <span className="text-[11px] font-mono text-white/40">OPTIONS</span>
            </button>

            {/* Secondary Option: About */}
            <button
              id="btn-main-about"
              onClick={onOpenAbout}
              className="w-full flex items-center justify-between px-5 py-3 rounded-sm bg-[#140e0a]/80 hover:bg-[#20150f] border border-white/10 hover:border-[#d4af37]/40 text-[#faf7f0]/85 hover:text-[#faf7f0] font-serif-court text-sm transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-[#d4af37]" />
                <span>عن اللعبة</span>
              </div>
              <span className="text-[11px] font-mono text-white/40">INFO</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer information */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto text-[11px] text-white/40 font-mono pointer-events-auto">
        <div>THE COURT • VERSION 1.4</div>
        <div>LEGAL NOIR SIMULATOR</div>
      </div>
      <div dir="ltr" className="w-full text-center text-[11px] text-[#d4af37]/70 font-mono tracking-[0.18em] pointer-events-none select-none">
        By : Marwan M. Hammad
      </div>
    </div>
  );
}
