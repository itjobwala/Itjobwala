'use client';

import type { SemanticHiddenMatch } from '../../types/resume.types';

interface Props {
  matches: SemanticHiddenMatch[];
}

export default function HiddenMatchesList({ matches }: Props) {
  if (matches.length === 0) return null;

  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          Hidden Matches ({matches.length})
        </p>
      </div>
      <p className="text-[10px] text-slate-500 mb-2.5 leading-relaxed">
        Your resume implies these requirements using different terminology — semantic bridge found.
      </p>
      <div className="space-y-1.5">
        {matches.map((m, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span
              className="px-2 py-0.5 rounded-lg font-semibold shrink-0"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}
            >
              {m.resume_term}
            </span>
            <svg width="12" height="10" viewBox="0 0 16 12" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5">
              <path d="M1 6h14M9 1l5 5-5 5"/>
            </svg>
            <span
              className="px-2 py-0.5 rounded-lg font-semibold shrink-0"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}
            >
              {m.job_term}
            </span>
            <span className="text-[9.5px] text-slate-600 italic">semantically equivalent</span>
          </div>
        ))}
      </div>
    </div>
  );
}
