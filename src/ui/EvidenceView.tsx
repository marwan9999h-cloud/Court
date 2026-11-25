import { Microscope, Tag, Search, ShieldCheck } from 'lucide-react';
import { EvidenceItem } from '../types';

interface EvidenceViewProps {
  evidence: EvidenceItem[];
}

export function EvidenceView({ evidence }: EvidenceViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-[#1e140c]/20">
        <div className="text-xs font-semibold text-[#3d2616]/80 tracking-widest mb-1 uppercase font-serif-court">
          محكمة العدل العليا — هيئة الأدلة الجنائية
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-[#1a1008] font-serif-court">
          سجل الأحراز والمضبوطات الجنائية المعتمدة
        </h3>
        <p className="text-xs text-[#1a1008]/60 mt-1 font-body-court">
          تحريات المعمل الجنائي، نتائج فحص البصمات، وتحليل الشرائط الرقمية
        </p>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidence.map((item) => (
          <div
            key={item.id}
            className="rounded-sm bg-[#1e140c]/5 border border-[#1e140c]/15 p-4 flex flex-col justify-between space-y-3"
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-2 border-b border-[#1e140c]/10 pb-2.5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3d2616]/70 block">
                  {item.code} • {item.type}
                </span>
                <h4 className="text-base font-bold font-serif-court text-[#1a1008] mt-0.5">
                  {item.title}
                </h4>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-xs bg-[#831843]/10 text-[#831843] border border-[#831843]/20 shrink-0">
                {item.tag}
              </span>
            </div>

            {/* Description */}
            <div className="text-xs sm:text-sm text-[#2a2a2a] leading-relaxed font-body-court">
              {item.description}
            </div>

            {/* Lab Result Box */}
            <div className="rounded-xs bg-[#f4ebd9] border border-[#d4af37]/30 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#78350f]">
                <Microscope className="w-3.5 h-3.5 text-[#b45309]" />
                <span>نتيجة الفحص الجنائي:</span>
              </div>
              <p className="text-xs text-[#2b180d] font-medium leading-snug">
                {item.labResult}
              </p>
            </div>

            {/* Key Finding */}
            <div className="pt-2 border-t border-[#1e140c]/10 flex items-start gap-1.5 text-xs text-[#1a1008]/80 font-body-court">
              <Search className="w-3.5 h-3.5 text-[#1e140c]/60 shrink-0 mt-0.5" />
              <span>
                <strong className="font-serif-court text-[#1a1008]">الدلالة القضائية: </strong>
                {item.keyFinding}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Verification footer */}
      <div className="pt-4 border-t border-[#1e140c]/20 flex items-center justify-between text-xs text-[#1a1008]/70 font-serif-court">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-800" />
          <span>الأحراز مطابقة للبروتوكول الجنائي المعتمد</span>
        </div>
        <div>مدير مصلحة الأدلة الجنائية</div>
      </div>
    </div>
  );
}
