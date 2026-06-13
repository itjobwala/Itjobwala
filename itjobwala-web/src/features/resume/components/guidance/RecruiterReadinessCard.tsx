'use client';

import { RecruiterReadiness } from '../../types/resume.types';

interface Props {
  data: RecruiterReadiness;
}

// Intentional semantic status colors for hiring risk level
const RISK_COLOR: Record<string, string> = {
  Low:    'text-emerald-600 bg-emerald-50',
  Medium: 'text-amber-600 bg-amber-50',
  High:   'text-red-600 bg-red-50',
};

// Intentional semantic status colors for automation maturity level
const MATURITY_COLOR: Record<string, string> = {
  Expert:       'text-violet-700',
  Advanced:     'text-blue-600',
  Intermediate: 'text-sky-600',
  Developing:   'text-amber-600',
  Beginner:     'text-muted',
};

export default function RecruiterReadinessCard({ data }: Props) {
  const prob = data.shortlist_probability;

  const probColor =
    prob >= 72 ? 'text-emerald-600' :
    prob >= 52 ? 'text-blue-600'    :
    prob >= 38 ? 'text-amber-600'   : 'text-red-500';

  const barColor =
    prob >= 72 ? 'bg-emerald-500' :
    prob >= 52 ? 'bg-blue-500'    :
    prob >= 38 ? 'bg-amber-500'   : 'bg-red-500';

  const metrics = [
    { label: 'Market Readiness',        value: data.market_readiness },
    { label: 'Recruiter Visibility',    value: data.recruiter_visibility },
    { label: 'Enterprise Readiness',    value: data.enterprise_readiness },
    { label: 'Career Growth Potential', value: data.career_growth_potential },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-heading">Recruiter Readiness</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${RISK_COLOR[data.hiring_risk] ?? 'text-muted bg-surface-hover'}`}>
          {data.hiring_risk} Hiring Risk
        </span>
      </div>

      {/* Shortlist probability */}
      <div className="space-y-1.5">
        <div className="flex items-end justify-between">
          <span className="text-sm text-muted">Shortlist Probability</span>
          <span className={`text-2xl font-bold ${probColor}`}>{prob}%</span>
        </div>
        <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${prob}%` }} />
        </div>
      </div>

      {/* Automation maturity */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Automation Maturity</span>
        <span className={`font-medium ${MATURITY_COLOR[data.automation_maturity] ?? 'text-body-secondary'}`}>
          {data.automation_maturity}
        </span>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {metrics.map(m => (
          <div key={m.label} className="bg-surface-alt rounded-xl p-3">
            <p className="text-xs text-subtle mb-0.5">{m.label}</p>
            <p className="text-sm font-semibold text-body">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
