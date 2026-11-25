import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Play } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const [step, setStep] = useState<'title' | 'case_title' | 'ready'>('title');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStep('case_title');
    }, 1400);

    const t2 = setTimeout(() => {
      setStep('ready');
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      id="intro-screen-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0c0a]/95 text-[#f5f2ed] backdrop-blur-md transition-all duration-1000"
    >
      <div className="max-w-xl px-6 py-12 text-center flex flex-col items-center">
        {/* Court Emblem Icon with Sophisticated Brass Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 p-5 rounded-full border-2 border-[#d4af37]/40 bg-[#1a1008]/80 text-[#d4af37] brass-glow"
        >
          <Scale className="w-10 h-10 stroke-[1.75]" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-4xl md:text-5xl tracking-[0.25em] font-title-court font-bold text-[#d4af37] mb-3"
        >
          THE COURT
        </motion.h1>

        {/* Subtitle */}
        <AnimatePresence>
          {(step === 'case_title' || step === 'ready') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-2 mt-4"
            >
              <div className="text-xl md:text-2xl font-serif-court text-[#f5f2ed] font-semibold tracking-wide">
                القضية الأولى: صمت القاعة
              </div>
              <p className="text-sm md:text-base text-white/50 font-body-court max-w-md mx-auto leading-relaxed">
                جلسة التحقيق القضائية في اختفاء وثائق الأرشيف الوطني
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button */}
        <AnimatePresence>
          {step === 'ready' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mt-12 flex flex-col items-center"
            >
              <button
                id="btn-start-court-session"
                onClick={onStart}
                className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-md bg-gradient-to-b from-[#3d2616] to-[#1f140c] text-[#f5f2ed] font-semibold tracking-wider shadow-2xl hover:brightness-125 transition-all duration-300 cursor-pointer active:scale-98 border border-[#d4af37]/50 text-base md:text-lg brass-glow"
              >
                <Play className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
                <span className="font-serif-court">ابدأ الجلسة</span>
              </button>
              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/40">
                منصة القضاء • انقر وتفاعل مع ملفات القضية
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
