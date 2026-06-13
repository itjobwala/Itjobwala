'use client';

import type { MarketIntelligenceResult } from '../../types/resume.types';

interface Props {
  data: MarketIntelligenceResult;
}

// Intentional semantic demand level colors
const DEMAND_COLOR: Record<string, { text: string; bar: string; bg: string; border: string }> = {
  'High Demand':     { text: 'text-emerald-700', bar: 'bg-emerald-500', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  'In Demand':       { text: 'text-blue-700',    bar: 'bg-blue-500',    bg: 'bg-blue-50',     border: 'border-blue-200'    },
  'Moderate Demand': { text: 'text-amber-700',   bar: 'bg-amber-500',   bg: 'bg-amber-50',    border: 'border-amber-200'   },
  'Low Demand':      { text: 'text-red-600',     bar: 'bg-red-400',     bg: 'bg-red-50',      border: 'border-red-200'     },
};

const TREND_ICON: Record<string, string> = {
  rising:   '↑',
  stable:   '→',
  declining:'↓',
};

export default function PersonalMarketScore({ data }: Props) {
  if (data.market_demand_score === null) return null;

  const score  = data.market_demand_score;
  const level  = data.recruiter_demand_level ?? 'Moderate Demand';
  const cfg    = DEMAND_COLOR[level] ?? DEMAND_COLOR['Moderate Demand'];
  const trend  = data.specialization_trend ?? 'stable';

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-0.5">Your Market Position</p>
          <h3 className="text-sm font-bold text-heading">Market Demand Score</h3>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.text} ${cfg.bg} ${cfg.border}`}>
          {level}
        </span>
      </div>

      {/* Score bar */}
      <div className="space-y-1.5">
        <div className="flex items-end justify-between">
          <span className="text-xs text-muted">Market alignment</span>
          <span className={`text-3xl font-black ${cfg.text}`}>{score}</span>
        </div>
        <div className="h-2.5 bg-white/70 rounded-full overflow-hidden border border-white">
          <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${score}%` }} />
        </div>
      </div>

      {/* Keyword vs Demonstrated alignment split */}
      {data.skill_alignment_score !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-micro">
            <span className="text-muted font-medium">Keyword Alignment</span>
            <span className={`font-bold ${cfg.text}`}>{data.skill_alignment_score}%</span>
          </div>
          {data.demonstrated_alignment_score !== null && (
            <div className="flex items-center justify-between text-micro">
              <span className="text-muted font-medium">Demonstrated Alignment</span>
              <span className={`font-bold ${
                data.demonstrated_alignment_score >= 50 ? 'text-emerald-600' :
                data.demonstrated_alignment_score >= 30 ? 'text-amber-600' : 'text-red-600'
              }`}>{data.demonstrated_alignment_score}%</span>
            </div>
          )}
          {data.demonstrated_alignment_score !== null &&
           data.skill_alignment_score - data.demonstrated_alignment_score >= 15 && (
            <p className="text-[10px] text-amber-600 italic leading-snug">
              Gap between keyword and demonstrated alignment — add implementation evidence to strengthen market position.
            </p>
          )}
        </div>
      )}

      {/* Specialization trend */}
      {data.specialization_demand_pct !== null && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Your specialization demand</span>
          <span className={`font-semibold ${cfg.text}`}>
            {TREND_ICON[trend]} {data.specialization_demand_pct}% of roles
          </span>
        </div>
      )}

      {/* Skills you have that are in demand */}
      {data.high_demand_skills_you_have.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-subtle">In-Demand Skills You Have</p>
          <div className="flex flex-wrap gap-1.5">
            {data.high_demand_skills_you_have.map(s => (
              <span key={s} className="text-xs bg-white/80 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Market tip */}
      {data.market_tip && (
        <div className="bg-white/60 rounded-xl p-3 border border-white">
          <p className="text-xs text-body-secondary leading-relaxed">{data.market_tip}</p>
        </div>
      )}
    </div>
  );
}
