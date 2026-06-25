'use client';

interface Props {
  domainLabel:      string;
  domainConfidence: number;
  message:          string;
  reason?:          'non_qa_resume' | 'invalid_document';
}

export default function NonQaResumeState({ domainLabel, domainConfidence, message, reason = 'non_qa_resume' }: Props) {
  const isInvalidDoc = reason === 'invalid_document';

  return (
    <div className="flex flex-col items-center justify-center text-center py-10 gap-5">

      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: isInvalidDoc ? 'linear-gradient(135deg, #64748b, #475569)' : 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
      >
        {isInvalidDoc ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
            <line x1="12" y1="12" x2="12" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16" r="1" fill="white" stroke="none"/>
          </svg>
        )}
      </div>

      {/* Title & message */}
      <div>
        <h3 className="text-lg font-bold text-heading">
          {isInvalidDoc ? 'Invalid Document' : 'Resume Not Eligible For QA ATS Analysis'}
        </h3>
        <p className="text-caption text-muted mt-1.5 max-w-xs leading-relaxed">{message}</p>
      </div>

      {/* Domain detection — shown only for non-QA resumes (not invalid docs) */}
      {!isInvalidDoc && (
        <div
          className="w-full max-w-xs rounded-2xl px-4 py-3 text-left space-y-1"
          style={{ background: '#fef3c7', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-600">Detected Domain</p>
          <p className="text-sm font-black text-heading">{domainLabel}</p>
          <p className="text-micro text-amber-600 font-medium">{domainConfidence}% confidence</p>
        </div>
      )}

      {/* Scope explanation */}
      <p className="text-caption text-muted max-w-xs leading-relaxed">
        {isInvalidDoc
          ? 'Please upload a valid PDF or DOCX resume. Scanned documents, images, train tickets, or other non-resume files cannot be processed.'
          : 'This ATS analyzer currently supports QA, Automation QA, SDET, API Testing, Mobile Testing and Performance Testing resumes.'}
      </p>

      {/* CTA */}
      <a
        href="/candidate/profile"
        className="px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
      >
        {isInvalidDoc ? 'Upload Your Resume' : 'Upload QA Resume'}
      </a>
    </div>
  );
}
