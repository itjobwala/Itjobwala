'use client';

import type { JobFitResult } from '../../types/resume.types';

interface Props {
  data: JobFitResult;
}

export default function FitGapAnalysis({ data }: Props) {
  const hasStrengths = data.fit_strengths.length > 0;
  const hasGaps      = data.fit_gaps.length > 0;

  if (!hasStrengths && !hasGaps) return null;

  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-4">
      <h4 className="text-sm font-bold text-heading">Fit Analysis</h4>

      <div className="grid grid-cols-1 gap-4">
        {hasStrengths && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Why You Fit This Role
            </p>
            <ul className="space-y-1.5">
              {data.fit_strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-body">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasGaps && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
              Why a Recruiter May Hesitate
            </p>
            <ul className="space-y-1.5">
              {data.fit_gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-body">
                  <span className="text-amber-500 shrink-0 mt-0.5">▲</span>
                  <span className="leading-relaxed">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Matched skills */}
      {data.matched_skills.length > 0 && (
        <div className="pt-2 border-t border-token space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-subtle">
            Skills You Already Have ({data.matched_skills.length}/{data.job_required_skills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.matched_skills.map(s => (
              <span key={s} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
