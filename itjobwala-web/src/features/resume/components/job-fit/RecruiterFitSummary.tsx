'use client';

import type { JobFitResult } from '../../types/resume.types';

interface Props {
  data: JobFitResult;
}

export default function RecruiterFitSummary({ data }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-4">
      <h4 className="text-sm font-bold text-heading">Recruiter Perspective</h4>

      {/* Summary */}
      <div className="bg-surface-alt rounded-xl p-4 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-subtle">
          What a Recruiter Would Think
        </p>
        <p className="text-sm text-body leading-relaxed">
          {data.recruiter_fit_summary}
        </p>
      </div>

      {/* Intentional blue shortlist prediction */}
      {data.shortlist_prediction && (
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">
              Shortlist Prediction
            </p>
            <p className="text-sm text-body">{data.shortlist_prediction}</p>
          </div>
        </div>
      )}

      {/* Rejection risks */}
      {data.rejection_risks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">
            Screening Risks
          </p>
          <ul className="space-y-1.5">
            {data.rejection_risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body-secondary">
                <span className="text-red-400 shrink-0 mt-0.5 font-bold">!</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
