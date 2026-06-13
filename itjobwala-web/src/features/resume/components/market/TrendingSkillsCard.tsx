'use client';

import type { SkillDemandEntry, HighDemandSkillToAdd } from '../../types/resume.types';

interface Props {
  topSkills:   SkillDemandEntry[];
  skillsToAdd: HighDemandSkillToAdd[];
}

// Intentional semantic trend colors
const TREND_CONFIG: Record<string, { icon: string; color: string }> = {
  rising:   { icon: '↑', color: 'text-emerald-600' },
  stable:   { icon: '→', color: 'text-blue-500'    },
  declining:{ icon: '↓', color: 'text-amber-500'   },
};

// Intentional semantic demand level bar colors; Niche kept muted
const DEMAND_BAR: Record<string, string> = {
  'Very High': 'bg-emerald-500',
  High:        'bg-blue-500',
  Moderate:    'bg-amber-400',
  Niche:       'bg-slate-300',
};

export default function TrendingSkillsCard({ topSkills, skillsToAdd }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-5">
      <h4 className="text-sm font-bold text-heading">Top Demanded QA Skills (2025)</h4>

      {/* Demand bars */}
      <div className="space-y-2.5">
        {topSkills.slice(0, 8).map(s => {
          const tc = TREND_CONFIG[s.trend] ?? TREND_CONFIG.stable;
          return (
            <div key={s.skill} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-body">{s.skill}</span>
                  {s.db_signal && (
                    <span className="text-[9px] bg-indigo-50 text-indigo-500 border border-indigo-100 px-1.5 py-0.5 rounded-full font-medium">
                      Live
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[10px] ${tc.color}`}>{tc.icon} {s.trend}</span>
                  <span className="text-subtle">{s.demand_pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${DEMAND_BAR[s.demand_level] ?? 'bg-slate-300'}`}
                  style={{ width: `${s.demand_pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills to add */}
      {skillsToAdd.length > 0 && (
        <div className="pt-1 border-t border-token space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">
            Add These to Boost Market Visibility
          </p>
          <div className="space-y-1.5">
            {skillsToAdd.map(s => (
              <div key={s.skill} className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span className="font-semibold text-body">{s.skill}</span>
                <span className="text-xs text-subtle ml-auto">{s.demand_pct}% demand · {s.trend}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
