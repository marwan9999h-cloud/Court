import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, FileText, Scale } from 'lucide-react';
import { CaseData, CourtFileItem, InvestigationState } from '../types';
import { CaseDocumentView } from './CaseDocumentView';
import { EvidenceView } from './EvidenceView';
import { CharacterView } from './CharacterView';
import { NotesView } from './NotesView';

interface DocumentViewerProps {
  document: CourtFileItem | null;
  caseData: CaseData;
  investigation: InvestigationState;
  currentPage: number;
  onClose: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function DocumentViewer({
  document,
  caseData,
  investigation,
  currentPage,
  onClose,
  onNextPage,
  onPrevPage,
}: DocumentViewerProps) {
  if (!document) return null;

  const isEvidence = document.id === 'evidence';
  const isCharacters = document.id === 'characters' || document.id === 'witnesses';
  const isNotes = document.id === 'notes';
  const isCaseFile = document.id === 'case_file';

  const totalPages = document.pages.length;

  return (
    <AnimatePresence>
      <div
        id="document-viewer-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-md transition-all"
        onClick={onClose}
      >
        <motion.div
          id="court-dossier-paper"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="paper-texture relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-sm text-[#2a2a2a] p-4 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.85)] border border-[#1e140c]/30 select-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between gap-2 border-b-2 border-[#1e140c]/15 pb-4 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded bg-[#1a1008] text-[#d4af37] shadow-sm shrink-0">
                {isEvidence ? <Scale className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono font-bold text-[#3d2616]/75 truncate">
                  {document.code} • {caseData.coverInfo.fileNumber}
                </div>
                <h2 className="text-lg sm:text-2xl font-bold font-serif-court text-[#1a1008] leading-tight mt-0.5 truncate">
                  {document.title}
                </h2>
              </div>
            </div>

            <button
              id="btn-close-court-document"
              onClick={onClose}
              className="flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded text-xs font-bold text-[#1a1008] bg-[#1a1008]/5 hover:bg-[#1a1008]/15 transition-colors cursor-pointer border border-[#1e140c]/20 shrink-0"
              title="إغلاق والعودة للمنصة"
            >
              <X className="w-4 h-4" />
              <span>إغلاق</span>
            </button>
          </div>

          {/* Dedicated Subview Content */}
          {isEvidence ? (
            <EvidenceView evidence={caseData.evidence} />
          ) : isCharacters ? (
            <CharacterView characters={caseData.characters} />
          ) : isNotes ? (
            <NotesView caseData={caseData} investigation={investigation} />
          ) : (
            <CaseDocumentView document={document} currentPage={currentPage} />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && isCaseFile && (
            <div className="mt-8 pt-4 border-t-2 border-[#1e140c]/15 flex items-center justify-between gap-2">
              <button
                id="btn-prev-court-page"
                onClick={onPrevPage}
                disabled={currentPage <= 1}
                className={`flex items-center gap-1.5 min-h-[44px] px-3 sm:px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer border ${
                  currentPage <= 1
                    ? 'opacity-20 cursor-not-allowed border-transparent text-[#2a2a2a]'
                    : 'bg-[#1a1008]/5 hover:bg-[#1a1008]/15 text-[#1a1008] border-[#1e140c]/20 hover:border-[#1e140c]/40'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span>الصفحة السابقة</span>
              </button>

              <div className="text-xs font-semibold text-[#1a1008]/70 font-body-court tabular-nums">
                صفحة {currentPage} من {totalPages}
              </div>

              <button
                id="btn-next-court-page"
                onClick={onNextPage}
                disabled={currentPage >= totalPages}
                className={`flex items-center gap-1.5 min-h-[44px] px-3 sm:px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer border ${
                  currentPage >= totalPages
                    ? 'opacity-20 cursor-not-allowed border-transparent text-[#2a2a2a]'
                    : 'bg-[#1a1008]/5 hover:bg-[#1a1008]/15 text-[#1a1008] border-[#1e140c]/20 hover:border-[#1e140c]/40'
                }`}
              >
                <span>الصفحة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
