'use client';

import type { SpecDemandEntry } from '../../types/resume.types';

interface Props {
  data:           SpecDemandEntry[];
  candidateSpec?: string | null;
}

// Intentional semantic trend badge colors
const TREND_CONFIG: Record<string, { badge: string; icon: string }> = {
  rising:   { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '↑' },
  stable:   { badge: 'bg-blue-100 text-blue-700 border-blue-200',          icon: '→' },
  declining:{ badge: 'bg-amber-100 text-amber-700 border-amber-200',        icon: '↓' },
};

// Intentional semantic competition level colors
const COMPETITION_COLOR: Record<string, string> = {
  Low:         'text-emerald-600',
  Moderate:    'text-blue-600',
  High:        'text-amber-600',
  'Very High': 'text-red-500',
};

export default function SpecializationDemandCard({ data, candidateSpec }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-4">
      <h4 className="text-sm font-bold text-heading">QA Specialization Demand</h4>

      <div className="space-y-3">
        {data.map(s => {
          const tc      = TREND_CONFIG[s.trend] ?? TREND_CONFIG.stable;
          const isYours = s.spec === candidateSpec;

          return (
            <div
              key={s.spec}
              className={`rounded-xl p-3 space-y-2 ${
                isYours
                  ? 'bg-indigo-50 border border-indigo-100'
                  : 'bg-surface-alt border border-token'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isYours ? 'text-indigo-700' : 'text-body'}`}>
                    {s.label}
                  </span>
                  {isYours && (
                    <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tc.badge}`}>
                    {tc.icon} {s.trend}
                  </span>
                  <span className="text-xs font-bold text-body-secondary">{s.demand_pct}%</span>
                </div>
              </div>

              {/* Mini bar */}
              <div className="h-1 bg-white rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isYours ? 'bg-indigo-500' : 'bg-slate-300'}`}
                  style={{ width: `${Math.min(100, (s.demand_pct / 40) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-subtle">
                <span>{s.salary_band}</span>
                <span className={COMPETITION_COLOR[s.competition] ?? 'text-muted'}>
                  {s.competition} competition
                </span>
              </div>

              <p className="text-micro text-muted leading-relaxed">{s.insight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
