import { User, AlertTriangle, Scale, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CharacterProfile } from '../types';

interface CharacterViewProps {
  characters: CharacterProfile[];
}

export function CharacterView({ characters }: CharacterViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-[#1e140c]/20">
        <div className="text-xs font-semibold text-[#3d2616]/80 tracking-widest mb-1 uppercase font-serif-court">
          محكمة العدل العليا — قلم التحقيق والاستجواب
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-[#1a1008] font-serif-court">
          سجل الشخصيات وأطراف الدعوى والشهود
        </h3>
        <p className="text-xs text-[#1a1008]/60 mt-1 font-body-court">
          الإفادات الرسمية، حجج الغياب، وتناقضات الأقوال أمام النيابة
        </p>
      </div>

      {/* Characters List */}
      <div className="space-y-4">
        {characters.map((char) => (
          <div
            key={char.id}
            className={`rounded-sm border p-4 sm:p-5 space-y-3 transition-colors ${
              char.isDefendant
                ? 'bg-[#831843]/5 border-[#831843]/30'
                : 'bg-[#1e140c]/5 border-[#1e140c]/15'
            }`}
          >
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#1e140c]/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    char.isDefendant
                      ? 'bg-[#831843] text-[#faf5ee]'
                      : 'bg-[#1a1008] text-[#d4af37]'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-bold font-serif-court text-[#1a1008]">
                      {char.name}
                    </h4>
                    {char.isDefendant && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-xs bg-[#831843] text-white">
                        المتهم الرئيسي
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#3d2616]/80 font-body-court">
                    {char.role} • {char.age} • {char.status}
                  </span>
                </div>
              </div>

              {/* Suspicion score meter */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] uppercase font-bold text-[#1a1008]/60">مؤشر الشبهة الجنائية</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-24 h-2 bg-[#1e140c]/15 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        char.suspicionScore > 70
                          ? 'bg-rose-700'
                          : char.suspicionScore > 35
                          ? 'bg-amber-600'
                          : 'bg-emerald-700'
                      }`}
                      style={{ width: `${char.suspicionScore}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#1a1008]">
                    {char.suspicionScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Testimony Quote */}
            <div className="rounded-xs bg-[#f7f2e4] border-r-3 border-[#d4af37] p-3 text-xs sm:text-sm text-[#1c140d] italic font-serif-court leading-relaxed">
              {char.testimony}
            </div>

            {/* Alibi & Contradiction details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body-court pt-1">
              <div className="space-y-0.5">
                <span className="font-bold text-[#1a1008]/80 font-serif-court">حجة الغياب / الدافع:</span>
                <p className="text-[#2a2a2a]">{char.motiveOrAlibi}</p>
              </div>
              <div className="space-y-0.5 bg-rose-950/5 p-2 rounded-xs border border-rose-900/10">
                <div className="flex items-center gap-1 text-rose-900 font-bold font-serif-court">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span>التناقض المرصود:</span>
                </div>
                <p className="text-rose-950/90 leading-snug">{char.contradiction}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
