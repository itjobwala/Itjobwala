'use client';

import type { DimensionWeight } from '../../types/resume.types';

interface Props {
  dimensions:               DimensionWeight[];
  highestLeverageDimension: string | null;
}

const DIR_CONFIG = {
  up:   { icon: '↑', color: '#6ee7b7', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.2)'  },
  down: { icon: '↓', color: '#fca5a5', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.18)'  },
  same: { icon: '=', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.12)' },
};

function WeightRow({ dim, isHighestLeverage }: { dim: DimensionWeight; isHighestLeverage: boolean }) {
  const dir = DIR_CONFIG[dim.direction] ?? DIR_CONFIG.same;
  const maxW = 100; // bars scale to 100

  return (
    <div
      className="rounded-2xl px-3 py-3 space-y-2"
      style={{
        background: isHighestLeverage ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
        border: isHighestLeverage ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isHighestLeverage && (
            <span className="text-[8.5px] font-black px-1.5 py-0.5 rounded-md shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
              TOP LEVERAGE
            </span>
          )}
          <span className="text-[11.5px] font-bold text-slate-200 truncate">{dim.label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-[9.5px] font-black px-1.5 py-0.5 rounded-md"
            style={{ background: dir.bg, border: `1px solid ${dir.border}`, color: dir.color }}
          >
            {dim.effective_weight}
            <span className="opacity-70 ml-0.5">{dim.direction !== 'same' && `(${dir.icon}${Math.abs(dim.weight_delta)})`}</span>
          </span>
          {dim.performance_pct != null && (
            <span className="text-[10px] text-slate-500">{dim.performance_pct}%</span>
          )}
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-1">
        {/* Base weight bar */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-600 w-10 shrink-0">Base</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(dim.base_weight / maxW) * 100}%`, background: 'rgba(148,163,184,0.3)' }}
            />
          </div>
          <span className="text-[9px] text-slate-600 w-4 text-right">{dim.base_weight}</span>
        </div>
        {/* Effective weight bar */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 w-10 shrink-0">Spec</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(dim.effective_weight / maxW) * 100}%`,
                background: dir.color,
                opacity: 0.7,
              }}
            />
          </div>
          <span className="text-[9px] shrink-0 w-4 text-right" style={{ color: dir.color }}>{dim.effective_weight}</span>
        </div>
        {/* Performance bar */}
        {dim.performance_pct != null && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-indigo-400 w-10 shrink-0">You</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(dim.performance_pct / 100) * (dim.effective_weight / maxW) * 100}%`,
                  background: 'rgba(99,102,241,0.7)',
                }}
              />
            </div>
            <span className="text-[9px] text-indigo-400 w-4 text-right">{dim.dynamic_points}</span>
          </div>
        )}
      </div>

      {/* Rationale */}
      {dim.rationale && (
        <p className="text-[10px] text-slate-500 leading-relaxed">{dim.rationale}</p>
      )}
    </div>
  );
}

export default function WeightBreakdownChart({ dimensions, highestLeverageDimension }: Props) {
  return (
    <div className="space-y-2">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.15em] px-1"
        style={{ color: 'rgba(148,163,184,0.5)' }}
      >
        Weight Breakdown — Base → Specialization → You
      </p>
      {dimensions.map(dim => (
        <WeightRow
          key={dim.dimension}
          dim={dim}
          isHighestLeverage={dim.dimension === highestLeverageDimension}
        />
      ))}
    </div>
  );
}
