import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, FileText, Search, Users, Hammer, Check } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const steps = [
    {
      num: '01',
      title: 'افحص ملف القضية ولائحة الاتهام',
      icon: FileText,
      description: 'ابدأ بمطالعة ملف القضية الرئيسي، تقرير الضبط الجنائي الأولي، وسجلات البوابات الإلكترونية لمعرفة وقائع الجريمة وخيوط البداية.',
    },
    {
      num: '02',
      title: 'دقق في الأحراز وتقارير المعمل الجنائي',
      icon: Search,
      description: 'راجع الأحراز المادية والرقمية؛ فحص البصمات، مطابقة المقذوفات الباليستية، وتفريغ كاميرات المراقبة للوصول إلى الحقيقة المادية.',
    },
    {
      num: '03',
      title: 'استجوب المتهم وتابع سجلات الشخصيات',
      icon: Users,
      description: 'وجه أسئلة التحقيق المباشرة للمتهم في قفص الاتهام، وقارن إفادته مع أقوال الشهود والمشتبه بهم لكشف التناقضات وحجج الغياب.',
    },
    {
      num: '04',
      title: 'اطرق المطرقة وأصدر الحكم العادل',
      icon: Hammer,
      description: 'بعد اكتمال قناعتك القضائية، افتح ملف الحكم واطرق المطرقة لتطبيق منطوق العدالة (إدانة، براءة، أو إعادة فتح التحقيق).',
    },
  ];

  return (
    <div
      id="how-to-play-modal-backdrop"
      className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto border-b border-[#d4af37]/25 pb-4 mb-6">
        <button
          id="btn-close-how-to-play"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#faf7f0]/80 hover:text-[#faf7f0] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>العودة للقائمة</span>
        </button>

        <div className="text-[11px] font-mono text-[#d4af37] uppercase tracking-widest">
          JUDICIAL PROTOCOL • طريقة اللعب
        </div>
      </div>

      {/* Guide Steps Grid */}
      <div className="w-full max-w-4xl mx-auto my-auto py-2">
        <div className="mb-6 space-y-1 text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-court text-[#faf7f0]">
            أركان التحقيق والمحاكمة
          </h2>
          <p className="text-xs sm:text-sm text-[#faf7f0]/65 font-body-court">
            أنت جالس على منصة القضاء في تجربة منظور أول سينمائية حقيقية. اتبع الخطوات الأربع لإدارة الجلسة:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-sm bg-[#18110b] border border-[#d4af37]/35 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-sm bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xl font-bold text-[#d4af37]/50">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold font-serif-court text-[#faf7f0]">
                  {step.title}
                </h3>
                <p className="text-xs text-[#faf7f0]/75 font-body-court leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-sm bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] font-bold text-sm font-serif-court shadow-lg transition-all cursor-pointer brass-glow"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>فهمت — العودة للقائمة</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-4xl mx-auto pt-4 text-[11px] text-white/40 font-mono flex items-center justify-between border-t border-white/5">
        <div>THE COURT • MANUAL</div>
        <div>LEGAL ADMISSIBILITY RULES</div>
      </div>
    </div>
  );
}
