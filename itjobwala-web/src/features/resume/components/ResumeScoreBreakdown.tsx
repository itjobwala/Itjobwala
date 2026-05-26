'use client';

import { SECTION_LABELS, BAND_COLORS } from '../utils/scoreColor';
import type { ScoreBreakdown } from '../types/resume.types';

interface Props {
  breakdown: ScoreBreakdown;
}

export default function ResumeScoreBreakdown({ breakdown }: Props) {
  const sections = Object.entries(breakdown).map(([key, val]) => ({
    key,
    label:   SECTION_LABELS[key] ?? key,
    score:   val.score,
    max:     val.max,
    pct:     Math.round((val.score / val.max) * 100),
  }));

  return (
    <div className="space-y-3">
      {sections.map(s => {
        const color = s.pct >= 75 ? 'emerald' : s.pct >= 50 ? 'blue' : s.pct >= 25 ? 'amber' : 'red';
        const colors = BAND_COLORS[color as keyof typeof BAND_COLORS];
        return (
          <div key={s.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-medium text-gray-700">{s.label}</span>
              <span className={`text-[12px] font-semibold ${colors.text}`}>
                {s.score}/{s.max}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
