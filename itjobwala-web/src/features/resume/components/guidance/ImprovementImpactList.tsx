'use client';

import { ImprovementImpact } from '../../types/resume.types';

interface Props {
  data: ImprovementImpact[];
}

// Intentional semantic impact level colors
const IMPACT_COLOR: Record<string, string> = {
  'Very High': 'bg-emerald-100 text-emerald-700',
  High:        'bg-blue-100 text-blue-700',
  Medium:      'bg-amber-100 text-amber-700',
  Low:         'bg-surface-hover text-body-secondary',
};

export default function ImprovementImpactList({ data }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-4">
      <h3 className="font-semibold text-heading">Score Impact Per Skill</h3>
      <p className="text-xs text-subtle">Estimated score gain if you add each skill to your profile</p>
      <div className="space-y-3">
        {data.map(item => (
          <div key={item.skill} className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-heading">{item.skill}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${IMPACT_COLOR[item.recruiter_impact] ?? 'bg-surface-hover text-body-secondary'}`}>
                  {item.recruiter_impact}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">{item.reasoning}</p>
            </div>
            <span className="text-sm font-bold text-emerald-600 whitespace-nowrap shrink-0">
              {item.estimated_score_gain}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
