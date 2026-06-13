'use client';

import { useWeightEngineQuery } from '../../hooks';
import DynamicScoreBadge        from './DynamicScoreBadge';
import WeightBreakdownChart     from './WeightBreakdownChart';

export default function WeightEnginePanel() {
  const { data, isLoading, isError } = useWeightEngineQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-sm text-red-300">Could not load weight analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Insight text */}
      <div
        className="rounded-2xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-[12px] text-slate-300 leading-relaxed">{data.weight_insight}</p>
      </div>

      {/* Dynamic score badge */}
      {data.static_score != null && (
        <DynamicScoreBadge
          staticScore={data.static_score}
          dynamicScore={data.dynamic_score}
          scoreDelta={data.score_delta}
          specialization={data.specialization}
          seniorityApplied={data.seniority_applied}
        />
      )}

      {/* Market adjustments */}
      {data.market_adjustments.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3 space-y-2"
          style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2">Market Adjustments Applied</p>
          {data.market_adjustments.map(adj => (
            <div key={adj.dimension} className="flex items-start gap-2">
              <span
                className="text-[9.5px] font-black px-1.5 py-0.5 rounded-md shrink-0 mt-0.5"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}
              >
                +{adj.delta}
              </span>
              <div>
                <span className="text-[11px] font-semibold text-slate-300">{adj.label}</span>
                <p className="text-[10px] text-slate-500">{adj.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Per-dimension breakdown */}
      <WeightBreakdownChart
        dimensions={data.dimensions}
        highestLeverageDimension={data.highest_leverage_dimension}
      />

      {/* Enterprise profile scores */}
      {data.enterprise_profiles?.profiles && (
        <EnterpriseProfilesCard
          profiles={data.enterprise_profiles.profiles}
          bestFit={data.enterprise_profiles.best_fit}
        />
      )}
    </div>
  );
}

// ── Enterprise profiles ───────────────────────────────────────────────────────

interface EntProfile { label: string; score: number; description: string }

function EnterpriseProfilesCard({
  profiles,
  bestFit,
}: {
  profiles: Record<string, EntProfile>;
  bestFit: string | null;
}) {
  return (
    <div
      className="rounded-2xl px-4 py-3 space-y-3"
      style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Company-Type Fit</p>
      <div className="space-y-2">
        {Object.entries(profiles).map(([key, p]) => {
          const isBest = key === bestFit;
          const color  = isBest ? '#a78bfa' : '#64748b';
          const barPct = `${p.score}%`;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: isBest ? '#c4b5fd' : '#94a3b8' }}
                >
                  {p.label}
                  {isBest && (
                    <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa' }}>
                      BEST FIT
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-bold" style={{ color }}>{p.score}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: barPct, background: isBest ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : 'rgba(100,116,139,0.4)' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
