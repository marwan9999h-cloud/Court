import { FileText, ShieldAlert } from 'lucide-react';
import { CourtFileItem, DocumentPage } from '../types';

interface CaseDocumentViewProps {
  document: CourtFileItem;
  currentPage: number;
}

export function CaseDocumentView({ document, currentPage }: CaseDocumentViewProps) {
  const pageData: DocumentPage = document.pages[currentPage - 1] || document.pages[0];

  return (
    <div className="space-y-6">
      {/* Document Section Header */}
      <div className="text-center pb-4 border-b border-[#1e140c]/20">
        <div className="text-xs font-semibold text-[#3d2616]/80 tracking-widest mb-1 uppercase font-serif-court">
          {pageData.headerTitle}
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-[#1a1008] inline-block px-4 font-serif-court">
          {pageData.sectionTitle}
        </h3>

        {/* Official Stamp */}
        {pageData.stampText && (
          <div className="mt-3">
            <span className="court-stamp px-3.5 py-1 text-xs font-bold font-serif-court uppercase tracking-widest rotate-[-2deg] inline-block rounded-xs shadow-xs">
              {pageData.stampText}
            </span>
          </div>
        )}
      </div>

      {/* Case Details Box */}
      {pageData.caseDetails && pageData.caseDetails.length > 0 && (
        <div className="rounded-sm bg-[#1e140c]/5 border border-[#1e140c]/15 p-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
            {pageData.caseDetails.map((detail, idx) => (
              <div key={`detail-${idx}`} className="flex items-baseline gap-2">
                <span className="font-bold text-[#1a1008]/80 font-serif-court">{detail.label}:</span>
                <span className="text-[#2a2a2a] font-medium font-body-court">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paragraphs */}
      <div className="space-y-4 text-[#2a2a2a] text-sm sm:text-base leading-relaxed font-body-court">
        {pageData.contentParagraphs.map((para, idx) => (
          <p key={`para-${idx}`} className="text-justify indent-4 leading-7">
            {para}
          </p>
        ))}
      </div>

      {/* Signatures */}
      {pageData.signatures && pageData.signatures.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#1e140c]/20 flex flex-wrap items-center justify-between gap-4 text-xs text-[#1a1008]/70 font-serif-court">
          {pageData.signatures.map((sig, idx) => (
            <div key={`sig-${idx}`} className="text-center">
              <div className="text-[#1a1008]/50 mb-1">الختم والتوقيع الرسمي:</div>
              <div className="font-bold text-[#1a1008] italic underline decoration-[#1a1008]/40">
                {sig}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
