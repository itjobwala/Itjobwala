'use client';

import type { HireabilityBand } from '../../types/resume.types';

interface Props {
  score: number;
  band:  HireabilityBand;
  summary: string;
}

const BAND_CONFIG: Record<HireabilityBand, { color: string; bg: string; border: string }> = {
  Exceptional:   { color: '#6ee7b7', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)' },
  Strong:        { color: '#86efac', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.2)'   },
  Competent:     { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)'  },
  Developing:    { color: '#fb923c', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.2)'  },
  'Early Career':{ color: '#f87171', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.2)'   },
};

export default function HireabilityScoreGauge({ score, band, summary }: Props) {
  const cfg = BAND_CONFIG[band] ?? BAND_CONFIG['Developing'];

  // Gauge arc: semicircle (180°)
  const r      = 52;
  const cx     = 72;
  const cy     = 72;
  const stroke = 10;
  // Full semicircle circumference (half of full circle)
  const fullArc = Math.PI * r;  // πr
  const dashoffset = fullArc * (1 - score / 100);

  // SVG arc path for semicircle (left to right, bottom half as gauge)
  // We draw a semicircle from 180° to 0° (left to right)
  const gaugeArc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))',
        border: '1px solid rgba(99,102,241,0.15)',
      }}
    >
      <div className="flex items-center gap-5">
        {/* Gauge SVG */}
        <div className="relative shrink-0">
          <svg width="144" height="84" viewBox="0 0 144 84">
            {/* Track */}
            <path
              d={gaugeArc}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            {/* Fill */}
            <path
              d={gaugeArc}
              fill="none"
              stroke={cfg.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${fullArc} ${fullArc}`}
              strokeDashoffset={dashoffset}
            />
            {/* Score label */}
            <text x={cx} y={cy - 4} textAnchor="middle" fill={cfg.color} fontSize="26" fontWeight="900">{score}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="8.5" fontWeight="700">BEHAVIORAL</text>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <span
            className="inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full mb-1.5"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
          >
            {band}
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}
