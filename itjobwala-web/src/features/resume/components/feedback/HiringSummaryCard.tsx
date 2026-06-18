'use client';

import type { HiringSummary } from '../../types/resume.types';

interface Props {
  summary: HiringSummary;
}

const OUTCOME_CONFIG = {
  shortlisted: { label: 'Shortlisted', color: '#7c3aed',  bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.2)'  },
  interview:   { label: 'Interview',   color: '#d97706',  bg: 'rgba(217,119,6,0.1)',   border: 'rgba(217,119,6,0.2)'   },
  hired:       { label: 'Hired',       color: '#16a34a',  bg: 'rgba(22,163,74,0.12)',  border: 'rgba(22,163,74,0.25)'  },
  rejected:    { label: 'Rejected',    color: '#ef4444',  bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)'  },
};

export default function HiringSummaryCard({ summary }: Props) {
  const rateColor = summary.shortlist_rate >= 50 ? '#10b981' : summary.shortlist_rate >= 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-3">

      {/* Shortlist rate hero */}
      <div
        className="rounded-2xl px-4 py-4 flex items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.06))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Recruiter Feedback</p>
          <p className="text-[12px] text-slate-300 leading-relaxed max-w-[220px]">{summary.insight}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[32px] font-black leading-none" style={{ color: rateColor }}>
            {summary.shortlist_rate}%
          </p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Shortlist Rate</p>
        </div>
      </div>

      {/* Outcome breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['shortlisted', summary.shortlist_count],
            ['interview',   summary.interview_count],
            ['hired',       summary.hired_count],
            ['rejected',    summary.rejected_count],
          ] as const
        ).map(([outcome, count]) => {
          const cfg = OUTCOME_CONFIG[outcome];
          return (
            <div
              key={outcome}
              className="rounded-2xl p-3 flex items-center gap-3"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <p className="text-[22px] font-black leading-none" style={{ color: cfg.color }}>{count}</p>
              <p className="text-[10px] font-bold text-slate-400">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Score correlation */}
      {(summary.avg_positive_score != null || summary.avg_rejection_score != null) && (
        <div
          className="rounded-2xl px-4 py-3 space-y-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Score at Decision Time</p>
          <div className="flex items-center gap-4">
            {summary.avg_positive_score != null && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <p className="text-[18px] font-black text-emerald-300 leading-none">{summary.avg_positive_score}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Avg when positive</p>
                </div>
              </div>
            )}
            {summary.avg_positive_score != null && summary.avg_rejection_score != null && (
              <div className="w-px h-8 bg-slate-800" />
            )}
            {summary.avg_rejection_score != null && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <div>
                  <p className="text-[18px] font-black text-red-300 leading-none">{summary.avg_rejection_score}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Avg when rejected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
