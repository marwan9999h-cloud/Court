import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { InterrogationQuestion } from '../types';
import { audioManager } from '../audio/AudioManager';

interface InterrogationModalProps {
  isOpen: boolean;
  onClose: () => void;
  personKey: string;
  askedQuestionIds: string[];
  onQuestionAnswered: (
    personKey: string,
    questionId: string,
    note: string,
    contradictionText?: string,
  ) => void;
  questions: InterrogationQuestion[];
  defendantName: string;
  profile?: { role?: string; age?: string; status?: string };
  kind?: 'accused' | 'witness';
}

export function InterrogationModal({
  isOpen,
  onClose,
  personKey,
  askedQuestionIds,
  onQuestionAnswered,
  questions,
  defendantName,
  profile,
  kind = 'accused',
}: InterrogationModalProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Reset highlighted answer when switching speaker or reopening
  React.useEffect(() => {
    setSelectedQuestionId(null);
  }, [personKey, isOpen]);

  if (!isOpen) return null;

  const isWitness = kind === 'witness';
  const askedSet = new Set(askedQuestionIds);
  const currentQ = questions.find((q) => q.id === selectedQuestionId);

  const handleSelectQuestion = (qId: string) => {
    audioManager.playPaperRustle();
    setSelectedQuestionId(qId);

    const target = questions.find((q) => q.id === qId);
    if (target) {
      const contradictionText =
        target.reaction === 'nervous' || target.reaction === 'hesitant'
          ? `${defendantName}: ${target.unlockedNote || target.response}`
          : undefined;
      onQuestionAnswered(personKey, qId, target.unlockedNote || '', contradictionText);
    }
  };

  const reactionLabel = (reaction: InterrogationQuestion['reaction']) => {
    if (reaction === 'nervous') return 'متوتر';
    if (reaction === 'confident') return 'واثق';
    if (reaction === 'hesitant') return 'متردد';
    return 'دفاعي';
  };

  return (
    <AnimatePresence>
      <div
        id="interrogation-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-md transition-all select-none"
        onClick={onClose}
      >
        <motion.div
          id="interrogation-dossier"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-md bg-[#130f0c] border border-[#d4af37]/35 text-[#f5eedb] shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#d4af37]/20 bg-[#1e140d]/95">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-sm bg-[#d4af37]/15 text-[#e2b442] border border-[#d4af37]/30 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[#d4af37]/80 font-body-court truncate">
                  {isWitness ? 'منصة سماع الشهود' : 'استجواب قفص الاتهام'}
                </div>
                <h2 className="text-lg sm:text-2xl font-bold font-serif-court text-[#faf7f0] leading-tight truncate">
                  {isWitness ? `سماع الشاهد: ${defendantName}` : `استجواب: ${defendantName}`}
                </h2>
              </div>
            </div>

            <button
              id="btn-close-interrogation"
              onClick={onClose}
              className="flex items-center gap-1.5 min-h-[44px] px-3 sm:px-4 py-2 rounded-sm text-xs font-semibold text-[#faf7f0]/80 hover:text-[#faf7f0] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">العودة للمنصة</span>
            </button>
          </div>

          {/* Speaker Status Summary */}
          <div className="px-4 sm:px-6 py-3 bg-[#18110b] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#d4af37]/90 font-serif-court">
              <span>
                <strong>الصفة:</strong> {(profile?.role || 'طرف في الدعوى').split('—').pop()?.trim()}
              </span>
              {profile?.age && (
                <span>
                  <strong>العمر:</strong> {profile.age}
                </span>
              )}
              {profile?.status && (
                <span>
                  <strong>الحالة:</strong> {profile.status}
                </span>
              )}
            </div>
            <div className="text-emerald-400 font-body-court text-xs font-semibold tabular-nums">
              الأسئلة المطروحة:{' '}
              <span dir="ltr" className="inline-block">
                {askedSet.size} / {questions.length}
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* Questions Selection Grid */}
            <div>
              <label className="text-xs text-[#d4af37]/80 font-semibold mb-3 block font-serif-court">
                {isWitness ? 'اختر سؤال المنصة للشاهد:' : 'اختر سؤال المنصة للمتهم:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questions.map((q, idx) => {
                  const isSelected = selectedQuestionId === q.id;
                  const isAnswered = askedSet.has(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuestion(q.id)}
                      className={`text-right min-h-[52px] p-3.5 sm:p-4 rounded-sm border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#2a1b12] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)] text-[#ffffff]'
                          : isAnswered
                            ? 'bg-[#18120d]/85 border-emerald-600/35 hover:border-emerald-500/60 text-[#d6cdb7]'
                            : 'bg-[#18120d] border-white/10 hover:border-[#d4af37]/40 text-[#c7bcab]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isAnswered ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-[#d4af37]/60" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-body-court text-[#d4af37]/85 mb-1 tabular-nums">
                          سؤال {idx + 1} {isAnswered ? '• تم الاستجواب' : ''}
                        </div>
                        <div className="text-xs sm:text-sm font-medium font-serif-court leading-snug">
                          {q.question}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer Display Card */}
            {currentQ && (
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-sm bg-[#1e130b] border border-[#d4af37]/35 shadow-lg space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <span className="text-xs font-bold text-[#d4af37] font-serif-court">
                    {isWitness
                      ? `شهادة ${defendantName} أمام المحكمة:`
                      : `إفادة المتهم ${defendantName} أمام المحكمة:`}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-300 border border-amber-500/20 font-body-court">
                    {isWitness ? 'نبرة الشاهد' : 'رد المتهم'}: {reactionLabel(currentQ.reaction)}
                  </span>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-[#faf7f0] font-body-court bg-black/35 p-3.5 sm:p-4 rounded-sm border border-white/10">
                  {currentQ.response}
                </p>

                {currentQ.unlockedNote && (
                  <div className="flex items-start gap-2.5 bg-[#120b06] p-3.5 rounded-sm border border-emerald-600/30 text-xs text-emerald-300/95 font-serif-court">
                    <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-300 block mb-0.5">
                        تم التدوين في ملاحظات القاضي:
                      </span>
                      <span>{currentQ.unlockedNote}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer Action */}
          <div className="px-4 sm:px-6 py-3.5 border-t border-[#d4af37]/20 bg-[#160e08] flex items-center justify-between gap-3">
            <span className="text-xs text-[#faf7f0]/60 font-body-court hidden sm:inline">
              {isWitness
                ? 'يمكنك إعادة سماع الشاهد في أي وقت أثناء نظر الدعوى'
                : 'يمكنك استجواب المتهم في أي وقت أثناء نظر الدعوى'}
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-sm bg-[#d4af37] hover:bg-[#e6be44] text-[#1a1008] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md font-serif-court"
            >
              العودة لمنصة الحكم
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
