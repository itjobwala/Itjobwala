'use client';

import type { BenchmarkResult } from '../../types/resume.types';

interface Props {
  data: BenchmarkResult;
}

const TIER_STYLES: Record<string, { ring: string; glow: string; text: string; badge: string }> = {
  emerald: { ring: '#10b981', glow: 'rgba(16,185,129,0.15)',  text: '#6ee7b7', badge: 'rgba(16,185,129,0.15)'  },
  cyan:    { ring: '#06b6d4', glow: 'rgba(6,182,212,0.15)',   text: '#67e8f9', badge: 'rgba(6,182,212,0.15)'   },
  blue:    { ring: '#6366f1', glow: 'rgba(99,102,241,0.15)',  text: '#a5b4fc', badge: 'rgba(99,102,241,0.15)'  },
  amber:   { ring: '#f59e0b', glow: 'rgba(245,158,11,0.12)',  text: '#fcd34d', badge: 'rgba(245,158,11,0.12)'  },
  red:     { ring: '#ef4444', glow: 'rgba(239,68,68,0.1)',    text: '#fca5a5', badge: 'rgba(239,68,68,0.1)'    },
};

const SIZE  = 120;
const R     = 46;
const CX    = SIZE / 2;
const CY    = SIZE / 2;
const CIRC  = 2 * Math.PI * R;

export default function BenchmarkRankCard({ data }: Props) {
  const style     = TIER_STYLES[data.tier_color] ?? TIER_STYLES.blue;
  const progress  = data.percentile_rank / 100;
  const dashLen   = CIRC * progress;
  const gapLen    = CIRC - dashLen;

  return (
    <div
      className="rounded-2xl px-4 py-4 flex items-center gap-4"
      style={{
        background: `linear-gradient(135deg, ${style.glow}, rgba(255,255,255,0.02))`,
        border: `1px solid ${style.ring}30`,
      }}
    >
      {/* Percentile ring */}
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx={CX} cy={CY} r={R} fill="none"
            stroke={style.ring} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${gapLen}`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[22px] font-black leading-none" style={{ color: style.text }}>
            {data.percentile_rank}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">percentile</p>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <span
            className="text-[10px] font-black px-2.5 py-1 rounded-full"
            style={{ background: style.badge, color: style.text, border: `1px solid ${style.ring}40` }}
          >
            {data.benchmark_tier}
          </span>
        </div>

        <p className="text-[12px] text-slate-300 leading-relaxed">{data.competitive_insight}</p>

        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span
            className="px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {data.data_source}
          </span>
          {data.peer_count > 0 && (
            <span>{data.peer_count} peers compared</span>
          )}
        </div>
      </div>
    </div>
  );
}
