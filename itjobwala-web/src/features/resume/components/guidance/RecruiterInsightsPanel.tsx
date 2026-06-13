'use client';

import { RecruiterInsights } from '../../types/resume.types';

interface Props {
  data: RecruiterInsights;
}

// Intentional semantic hiring risk colors
const RISK_COLOR: Record<string, string> = {
  Low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High:   'bg-red-50 text-red-700 border-red-200',
};

export default function RecruiterInsightsPanel({ data }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-heading">Recruiter Perspective</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${RISK_COLOR[data.hiring_risk] ?? 'bg-surface-alt text-body-secondary border-token'}`}>
          {data.hiring_risk} Risk
        </span>
      </div>

      <div className="bg-surface-alt rounded-xl p-4">
        <p className="text-xs font-medium text-subtle mb-1 uppercase tracking-wide">What a Recruiter Sees</p>
        <p className="text-sm text-body leading-relaxed">{data.recruiter_summary}</p>
      </div>

      {data.best_fit_roles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Best Fit Roles</p>
          <ul className="space-y-1.5">
            {data.best_fit_roles.map((role, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-body">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {role}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.concerns.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-red-500">Screening Risks</p>
          <ul className="space-y-1.5">
            {data.concerns.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body-secondary">
                <span className="text-red-400 shrink-0 mt-0.5">!</span>
                <span className="leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Intentional blue recruiter tip panel */}
      <div className="bg-blue-50 rounded-xl p-3">
        <p className="text-xs font-medium text-blue-600 mb-0.5">Recruiter Tip</p>
        <p className="text-sm text-blue-800 leading-relaxed">{data.recruiter_tip}</p>
      </div>
    </div>
  );
}
