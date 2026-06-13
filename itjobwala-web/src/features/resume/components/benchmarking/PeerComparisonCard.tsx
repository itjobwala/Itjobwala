'use client';

import type { BenchmarkResult } from '../../types/resume.types';

interface Props {
  data: BenchmarkResult;
}

interface BarRowProps {
  label:    string;
  value:    number;
  max:      number;
  color:    string;
  isYou?:   boolean;
}

function BarRow({ label, value, max, color, isYou }: BarRowProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10.5px]">
        <span className={isYou ? 'font-bold text-slate-200' : 'text-slate-500'}>{label}</span>
        <span className="font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function PeerComparisonCard({ data }: Props) {
  const maxScore = Math.max(100, data.top_10pct_threshold + 5);
  const avgScore = data.platform_avg_score ?? 57; // fallback to baseline avg

  const deltaSign = data.score_gap_to_average > 0 ? '+' : '';
  const deltaColor = data.score_gap_to_average > 0 ? '#6ee7b7' : data.score_gap_to_average < 0 ? '#fca5a5' : '#94a3b8';

  return (
    <div
      className="rounded-2xl px-4 py-4 space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Score Comparison</p>

      {/* Bars */}
      <div className="space-y-3">
        <BarRow
          label="You"
          value={data.candidate_score}
          max={maxScore}
          color="#a5b4fc"
          isYou
        />
        {data.platform_avg_score != null && (
          <BarRow
            label="Platform Average"
            value={data.platform_avg_score}
            max={maxScore}
            color="#64748b"
          />
        )}
        <BarRow
          label="Top 25% Threshold"
          value={data.top_quartile_threshold}
          max={maxScore}
          color="#06b6d4"
        />
        <BarRow
          label="Top 10% Threshold"
          value={data.top_10pct_threshold}
          max={maxScore}
          color="#10b981"
        />
      </div>

      {/* Gap summary */}
      <div className="flex items-center gap-4 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">vs Average</p>
          <p className="text-[16px] font-black" style={{ color: deltaColor }}>
            {deltaSign}{data.score_gap_to_average}
          </p>
        </div>
        <div className="w-px h-8 bg-slate-800" />
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">To Top 25%</p>
          <p
            className="text-[16px] font-black"
            style={{ color: data.score_gap_to_top >= 0 ? '#6ee7b7' : '#f59e0b' }}
          >
            {data.score_gap_to_top >= 0 ? `+${data.score_gap_to_top}` : data.score_gap_to_top}
          </p>
        </div>
        <div className="w-px h-8 bg-slate-800" />
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">To Top 10%</p>
          <p className="text-[16px] font-black text-slate-400">
            {data.candidate_score - data.top_10pct_threshold >= 0
              ? `+${data.candidate_score - data.top_10pct_threshold}`
              : data.candidate_score - data.top_10pct_threshold}
          </p>
        </div>
      </div>
    </div>
  );
}
