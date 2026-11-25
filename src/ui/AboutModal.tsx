import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Scale, Shield, Award, Check } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div
      id="about-modal-backdrop"
      className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto border-b border-[#d4af37]/25 pb-4 mb-6">
        <button
          id="btn-close-about"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#faf7f0]/80 hover:text-[#faf7f0] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>العودة للقائمة</span>
        </button>

        <div className="text-[11px] font-mono text-[#d4af37] uppercase tracking-widest">
          SYSTEM DOSSIER • عن التجربة
        </div>
      </div>

      {/* Center Info Card */}
      <div className="w-full max-w-2xl mx-auto my-auto py-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 sm:p-8 rounded-sm bg-[#160f0a] border border-[#d4af37]/40 shadow-xl space-y-6 text-center"
        >
          {/* Logo Emblem */}
          <div className="inline-flex p-4 rounded-full bg-[#1b120c] border border-[#d4af37]/40 text-[#d4af37] mx-auto brass-glow">
            <Scale className="w-10 h-10 stroke-[1.75]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-widest font-title-court text-[#d4af37]">
              THE COURT
            </h2>
            <div className="text-xs font-mono text-[#d4af37]/75">
              VERSION 1.4 — LEGAL NOIR COURTROOM TRIAL
            </div>
          </div>

          <p className="text-sm text-[#faf7f0]/85 font-serif-court leading-relaxed max-w-lg mx-auto bg-black/40 p-4 rounded-sm border border-white/5">
            تجربة تحقيق وقضاء سينمائية تضعك في مقعد القاضي بمنظور أول وتفاعل حقيقي مع ملفات القضية، الأدلة الجنائية، استجواب المتهمين، وإصدار الأحكام المصيرية.
          </p>

          <div className="grid grid-cols-2 gap-3 text-left pt-2">
            <div className="p-3 rounded-sm bg-[#1a120b] border border-white/5 text-right">
              <div className="text-[10px] font-mono text-[#d4af37] uppercase">النوع والتصنيف</div>
              <div className="text-xs font-bold font-serif-court text-[#faf7f0]">تحقيق ومحاكمة جنائية تفاعلية</div>
            </div>
            <div className="p-3 rounded-sm bg-[#1a120b] border border-white/5 text-right">
              <div className="text-[10px] font-mono text-[#d4af37] uppercase">المنظور</div>
              <div className="text-xs font-bold font-serif-court text-[#faf7f0]">منظور أول — قاضي المنصة</div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-8 py-2.5 rounded-sm bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] font-bold text-xs sm:text-sm font-serif-court transition-all cursor-pointer brass-glow"
            >
              العودة للقائمة الرئيسية
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-2xl mx-auto pt-4 text-[11px] text-white/40 font-mono flex items-center justify-between border-t border-white/5">
        <div>THE COURT • ALL RIGHTS RESERVED</div>
        <div>LEGAL SIMULATION SYSTEM</div>
      </div>
    </div>
  );
}
