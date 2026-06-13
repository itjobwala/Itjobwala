'use client';

import type { SemanticThemeAlignment } from '../../types/resume.types';

interface Props {
  themes: SemanticThemeAlignment[];
}

export default function ThemeAlignmentChart({ themes }: Props) {
  if (themes.length === 0) return null;

  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-3">
        Theme Alignment — Job Weight vs. Your Coverage
      </p>
      <div className="space-y-2.5">
        {themes.map(t => {
          const coverageColor =
            t.resume_coverage >= 70 ? '#6ee7b7' :
            t.resume_coverage >= 40 ? '#fbbf24' :
            '#f87171';

          return (
            <div key={t.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {t.aligned ? (
                    <span className="text-[8px] font-black px-1 py-0.5 rounded"
                      style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}>✓</span>
                  ) : t.job_weight > 15 ? (
                    <span className="text-[8px] font-black px-1 py-0.5 rounded"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>!</span>
                  ) : null}
                  <span className="text-[11px] font-semibold text-slate-300">{t.label}</span>
                </div>
                <span className="text-[10px] font-bold" style={{ color: coverageColor }}>
                  {t.resume_coverage}%
                </span>
              </div>

              {/* Stacked bars: job weight (grey) → your coverage (colored) */}
              <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {/* Job weight bar (how present in job) */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${t.job_weight}%`, background: 'rgba(148,163,184,0.15)' }}
                />
                {/* Coverage bar (how much resume covers) */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${(t.resume_coverage / 100) * t.job_weight}%`,
                    background: coverageColor,
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
