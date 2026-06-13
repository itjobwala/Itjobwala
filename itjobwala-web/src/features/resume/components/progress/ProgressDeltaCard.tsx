'use client';

import type { ResumeProgress } from '../../types/resume.types';

interface Props {
  progress: ResumeProgress;
}

const TREND_CONFIG = {
  improving: { icon: '↑', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', label: 'Improving' },
  declining: { icon: '↓', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  label: 'Declining' },
  stable:    { icon: '→', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'Stable'    },
};

const SPEC_LABEL: Record<string, string> = {
  sdet:           'SDET',
  automation_qa:  'Automation QA',
  api_qa:         'API QA',
  mobile_qa:      'Mobile QA',
  performance_qa: 'Performance QA',
  hybrid_qa:      'Hybrid QA',
  manual_qa:      'Manual QA',
};

export default function ProgressDeltaCard({ progress }: Props) {
  const trend   = TREND_CONFIG[progress.trend] ?? TREND_CONFIG.stable;
  const deltaSign = progress.score_delta > 0 ? '+' : '';

  return (
    <div className="space-y-3">

      {/* Milestone banner */}
      <div
        className="rounded-2xl px-4 py-3"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Milestone</p>
        <p className="text-[12.5px] font-semibold text-slate-200 leading-snug">{progress.milestone}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">

        {/* Score delta */}
        <div
          className="rounded-2xl p-3 flex flex-col gap-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500">Since Last</p>
          <p
            className="text-[22px] font-black leading-none"
            style={{ color: progress.score_delta > 0 ? '#6ee7b7' : progress.score_delta < 0 ? '#fca5a5' : '#94a3b8' }}
          >
            {deltaSign}{progress.score_delta}
          </p>
          <p className="text-[10px] text-slate-500">score points</p>
        </div>

        {/* Best score */}
        <div
          className="rounded-2xl p-3 flex flex-col gap-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500">Personal Best</p>
          <p className="text-[22px] font-black leading-none text-amber-300">{progress.best_score}</p>
          <p className="text-[10px] text-slate-500">highest score</p>
        </div>

        {/* Skills delta */}
        <div
          className="rounded-2xl p-3 flex flex-col gap-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500">Skills Delta</p>
          <p
            className="text-[22px] font-black leading-none"
            style={{ color: progress.skills_delta >= 0 ? '#6ee7b7' : '#fca5a5' }}
          >
            {progress.skills_delta >= 0 ? '+' : ''}{progress.skills_delta}
          </p>
          <p className="text-[10px] text-slate-500">skills detected</p>
        </div>

        {/* Trend */}
        <div
          className="rounded-2xl p-3 flex flex-col gap-1"
          style={{ background: trend.bg, border: `1px solid ${trend.border}` }}
        >
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500">Trend</p>
          <p className="text-[22px] font-black leading-none" style={{ color: trend.color }}>
            {trend.icon}
          </p>
          <p className="text-[10px] font-semibold" style={{ color: trend.color }}>{trend.label}</p>
        </div>
      </div>

      {/* Spec change notice */}
      {progress.spec_changed && progress.previous_specialization && progress.current_specialization && (
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.18)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-0.5">Specialization Shift</p>
            <p className="text-[11.5px] text-slate-300">
              <span className="text-slate-500">{SPEC_LABEL[progress.previous_specialization] ?? progress.previous_specialization}</span>
              {' → '}
              <span className="text-cyan-300 font-semibold">{SPEC_LABEL[progress.current_specialization] ?? progress.current_specialization}</span>
            </p>
          </div>
        </div>
      )}

      {/* Meta stats */}
      <div className="flex items-center gap-4 px-1">
        <div className="text-center">
          <p className="text-[18px] font-black text-slate-200">{progress.total_parses}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Analyzes</p>
        </div>
        <div className="w-px h-8 bg-slate-800" />
        <div className="text-center">
          <p className="text-[18px] font-black text-slate-200">{progress.days_since_first}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Days Active</p>
        </div>
        <div className="w-px h-8 bg-slate-800" />
        <div className="text-center">
          <p className="text-[18px] font-black text-slate-200">{progress.current_score}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Current</p>
        </div>
      </div>
    </div>
  );
}
