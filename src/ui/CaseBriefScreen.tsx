import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Play, Scale, ShieldAlert, Calendar, User, FileText } from 'lucide-react';
import { LevelDefinition } from '../types';

interface CaseBriefScreenProps {
  level: LevelDefinition;
  onStartCase: () => void;
  onBack: () => void;
}

export function CaseBriefScreen({
  level,
  onStartCase,
  onBack,
}: CaseBriefScreenProps) {
  const caseData = level.caseData;

  return (
    <div
      id="case-brief-screen-overlay"
      className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto border-b border-[#d4af37]/25 pb-4 mb-4">
        <button
          id="btn-back-to-levels-from-brief"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#faf7f0]/80 hover:text-[#faf7f0] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>العودة للملفات</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37]">
          <span>{level.fileCode}</span>
          <span className="text-white/30">•</span>
          <span>{caseData.caseNumber}</span>
        </div>
      </div>

      {/* Center Dossier Briefing Card */}
      <div className="w-full max-w-4xl mx-auto my-auto py-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-sm border border-[#d4af37]/50 bg-[#160f0a] shadow-[0_10px_40px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
        >
          {/* Dossier Header Banner */}
          <div className="px-6 py-5 bg-[#22160e] border-b border-[#d4af37]/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-sm bg-[#d4af37] text-[#1a1008] shadow-md">
                <Scale className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#d4af37]/80 uppercase">
                  JUDICIAL DOSSIER BRIEFING • ملف الإحالة القضائية
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif-court text-[#faf7f0]">
                  {caseData.title}
                </h2>
              </div>
            </div>

            <div className="court-stamp px-3.5 py-1 text-xs font-bold font-serif-court rounded-xs uppercase">
              {caseData.confidentiality || 'سري للغاية'}
            </div>
          </div>

          {/* Dossier Meta Summary */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-sm bg-black/40 border border-white/5 text-xs text-[#faf7f0]/85">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#d4af37] shrink-0" />
                <div>
                  <span className="text-white/40 block text-[10px]">نوع الجناية:</span>
                  <span className="font-serif-court font-semibold">{caseData.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d4af37] shrink-0" />
                <div>
                  <span className="text-white/40 block text-[10px]">تاريخ الجلسة:</span>
                  <span className="font-mono">{caseData.sessionDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#d4af37] shrink-0" />
                <div>
                  <span className="text-white/40 block text-[10px]">المتهم الرئيسي:</span>
                  <span className="font-serif-court font-semibold">
                    {caseData.defendantNames.join('، ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Case Background Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest font-serif-court flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>ملخص وقائع الدعوى:</span>
              </h3>
              <p className="text-sm sm:text-base text-[#faf7f0]/90 font-serif-court leading-relaxed bg-[#1b120c] p-4 rounded-sm border border-white/5">
                {caseData.briefSummary || caseData.description}
              </p>
            </div>

            {/* Judge Directives */}
            <div className="p-4 rounded-sm bg-[#120c08] border border-[#d4af37]/20 space-y-2">
              <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider font-serif-court">
                توجيهات المنصة القضائية:
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#faf7f0]/80 font-body-court list-disc list-inside">
                <li>اطّلع على مستندات لائحة الاتهام وتواريخ البوابات الإلكترونية.</li>
                <li>فحص أحراز المعمل الجنائي لتحديد تطابق البصمات والمفاتيح.</li>
                <li>استجواب المتهم في قفص الاتهام للتحقق من مصداقية حجة الغياب.</li>
                <li>إصدار الحكم النهائي المناسب بعد تكوين القناعة القضائية الكاملة.</li>
              </ul>
            </div>
          </div>

          {/* Dossier Footer Call to Action */}
          <div className="px-6 py-4 bg-[#1b120c] border-t border-[#d4af37]/30 flex items-center justify-between">
            <span className="text-xs text-white/50 font-body-court hidden sm:inline">
              جلسة المحاكمة جاهزة للانعقاد
            </span>

            <button
              id="btn-start-case-from-brief"
              onClick={onStartCase}
              className="flex items-center gap-3 px-8 py-3 rounded-sm bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] font-bold text-sm sm:text-base uppercase tracking-wider transition-all cursor-pointer shadow-lg font-serif-court brass-glow"
            >
              <Play className="w-4 h-4 fill-[#1a1008] text-[#1a1008]" />
              <span>بدء الجلسة القضائية</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-4xl mx-auto pt-2 text-[11px] text-white/40 font-mono flex items-center justify-between">
        <div>THE COURT • BRIEFING PHASE</div>
        <div>FIRST-PERSON COURTROOM TRIAL</div>
      </div>
    </div>
  );
}
