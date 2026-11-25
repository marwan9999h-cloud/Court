import { AlertTriangle, CheckCircle2, CheckSquare, Circle, Feather, Gavel, Lightbulb } from 'lucide-react';
import { CaseData, FileId, InvestigationState } from '../types';
import { formatMoneyEGP } from '../game/VerdictRules';

interface NotesViewProps {
  caseData: CaseData;
  investigation: InvestigationState;
}

export function NotesView({ caseData, investigation }: NotesViewProps) {
  const bailList = Object.values(investigation.bailDecisions || {});
  const speakerKeys = [
    { key: 'karim', label: 'استجواب المتهم الأول: كريم المنصور' },
    { key: 'munther', label: 'استجواب المتهم الثاني: منذر وهبة' },
    { key: 'moamen', label: 'استجواب المتهم الثالث: مؤمن رزق' },
    { key: 'tarek', label: 'سماع شهادة الحارس: طارق الحمد' },
  ];

  const fileChecklist: { id: FileId; label: string }[] = [
    { id: 'case_file', label: 'ملف القضية ولائحة الاتهام' },
    { id: 'evidence', label: 'ملف الأدلة والأحراز الجنائية' },
    { id: 'characters', label: 'ملف الشخصيات وأطراف الدعوى' },
  ];

  const filesCheckedCount = fileChecklist.filter((f) =>
    investigation.examinedFiles.includes(f.id),
  ).length;
  const speakersAskedCount = speakerKeys.filter(
    (s) => (investigation.askedQuestions[s.key]?.length || 0) > 0,
  ).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center pb-4 border-b border-[#1e140c]/20">
        <div className="text-xs font-semibold text-[#3d2616]/80 tracking-wide mb-1 font-serif-court">
          محكمة العدل العليا — مفكرة قاضي الجلسة
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-[#1a1008] font-serif-court">
          ملاحظات القضية: «{caseData.title}»
        </h3>
        <p className="text-xs text-[#1a1008]/65 mt-1 font-body-court">
          تتحدث هذه الصفحة تلقائياً بما فحصته من مستندات وسمعته في الاستجوابات فقط
        </p>
      </div>

      {/* Investigation Progress Summary */}
      <div className="grid grid-cols-2 gap-3 text-xs font-body-court">
        <div className="p-3 rounded-sm bg-[#ebe4d7] border border-[#1e140c]/15 flex items-center justify-between gap-2">
          <span className="text-[#3d2616] font-semibold">الملفات المفحوصة</span>
          <span dir="ltr" className="inline-block font-bold text-[#1a1008] tabular-nums">
            {filesCheckedCount} / 3
          </span>
        </div>
        <div className="p-3 rounded-sm bg-[#ebe4d7] border border-[#1e140c]/15 flex items-center justify-between gap-2">
          <span className="text-[#3d2616] font-semibold">الأطراف المستجوبة</span>
          <span dir="ltr" className="inline-block font-bold text-[#1a1008] tabular-nums">
            {speakersAskedCount} / 4
          </span>
        </div>
      </div>

      {/* Dynamic Discoveries (Only things actually examined or heard) */}
      <div className="rounded-sm bg-[#faf6ed] border border-[#1e140c]/25 p-4 sm:p-6 space-y-4 shadow-inner relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1e140c]/10 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#78350f]">
            <Feather className="w-4 h-4 text-[#b45309]" />
            <span>الاستنتاجات المدوّنة من التحقيق:</span>
          </div>
          <span className="text-[11px] text-[#78350f]/80 font-body-court tabular-nums">
            {investigation.discoveredNotes.length} تدوينات
          </span>
        </div>

        {investigation.discoveredNotes.length === 0 ? (
          <div className="text-xs sm:text-sm text-[#4b3828]/80 font-body-court py-2 leading-relaxed">
            لم تُدوَّن أي استنتاجات بعد. افتح ملفات القضية والأدلة على المكتب واستجوب المتهمين والشاهد لتسجيل ما تكتشفه هنا.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {investigation.discoveredNotes.map((note, idx) => (
              <div
                key={`disc-${idx}`}
                className="flex items-start gap-2.5 text-xs sm:text-sm font-body-court text-[#1f2937] leading-relaxed"
              >
                <span className="mt-1.5 w-2 h-2 rounded-full bg-[#b45309] shrink-0" />
                <p>{note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contradictions Found */}
      {investigation.discoveredContradictions.length > 0 && (
        <div className="rounded-sm bg-[#fff5f5] border border-rose-900/25 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            <span>التناقضات المرصودة في الأقوال:</span>
          </div>
          <div className="space-y-2.5">
            {investigation.discoveredContradictions.map((c, idx) => (
              <p
                key={`contra-${idx}`}
                className="text-xs sm:text-sm font-body-court text-rose-950/90 leading-relaxed"
              >
                • {c}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Pre-trial Bail Decisions */}
      {bailList.length > 0 && (
        <div className="rounded-sm bg-[#f3efe6] border border-[#1e140c]/20 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1a1008]">
            <Gavel className="w-4 h-4 text-[#78350f]" />
            <span>قرارات التوقيف والكفالة المسجلة:</span>
          </div>
          {bailList.map((b) => (
            <div key={b.defendantId} className="text-xs font-body-court text-[#2a2a2a]">
              • {b.note}
              {b.decision === 'bail_granted' && b.bailAmount
                ? ` (${formatMoneyEGP(b.bailAmount)})`
                : ''}
            </div>
          ))}
        </div>
      )}

      {/* Neutral Procedural To-Do Hints (No spoilers) */}
      <div className="rounded-sm bg-[#f0eadf] border border-[#1e140c]/15 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#3d2616]">
          <CheckSquare className="w-4 h-4 text-[#3d2616]" />
          <span>مهام الجلسة والتحقيق:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-body-court">
          {fileChecklist.map((file) => {
            const done = investigation.examinedFiles.includes(file.id);
            return (
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-sm bg-[#faf6ed]/70 border border-[#1e140c]/10"
              >
                <span className="flex items-center gap-1.5 text-[#2a2a2a]">
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#78350f]/50 shrink-0" />
                  )}
                  <span>{file.label}</span>
                </span>
                <span
                  className={`text-[11px] font-semibold shrink-0 ${
                    done ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                >
                  {done ? 'تمت المطالعة' : 'لم يُفحص بعد'}
                </span>
              </div>
            );
          })}

          {speakerKeys.map((sp) => {
            const count = investigation.askedQuestions[sp.key]?.length || 0;
            const done = count > 0;
            return (
              <div
                key={sp.key}
                className="flex items-center justify-between gap-2 p-2.5 rounded-sm bg-[#faf6ed]/70 border border-[#1e140c]/10"
              >
                <span className="flex items-center gap-1.5 text-[#2a2a2a]">
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#78350f]/50 shrink-0" />
                  )}
                  <span>{sp.label}</span>
                </span>
                <span
                  className={`text-[11px] font-semibold shrink-0 ${
                    done ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                >
                  {done ? 'تم الاستجواب' : 'لم يُستجوب بعد'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Note */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#1a1008]/75 font-serif-court border-t border-[#1e140c]/15">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-700" />
          <span>تحقق من كافة الملفات والأقوال قبل طرق المطرقة وإصدار الحكم</span>
        </div>
        <div>قاضي الدائرة الجنائية</div>
      </div>
    </div>
  );
}
