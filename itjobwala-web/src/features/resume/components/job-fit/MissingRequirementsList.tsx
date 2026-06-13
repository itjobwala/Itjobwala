'use client';

import type { JobFitResult } from '../../types/resume.types';

interface Props {
  data: JobFitResult;
}

export default function MissingRequirementsList({ data }: Props) {
  const highImpact   = data.high_impact_missing_skills ?? [];
  const allMissing   = data.missing_requirements       ?? [];
  const otherMissing = allMissing.filter(s => !highImpact.includes(s));

  if (allMissing.length === 0 && highImpact.length === 0) return null;

  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-4">
      <h4 className="text-sm font-bold text-heading">Missing Requirements</h4>

      {highImpact.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">
            High Impact — Add These First
          </p>
          <div className="space-y-1.5">
            {highImpact.map(s => (
              <div key={s} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-sm font-semibold text-red-700">{s}</span>
                <span className="ml-auto text-[10px] text-red-400 font-medium">ATS filter risk</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherMissing.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-subtle">
            Other Gaps
          </p>
          <div className="flex flex-wrap gap-1.5">
            {otherMissing.map(s => (
              <span key={s} className="text-xs bg-surface-alt border border-token text-body-secondary px-2 py-1 rounded-lg">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
