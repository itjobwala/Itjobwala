'use client';

import type { LearningPathItem } from '../../types/resume.types';

interface Props {
  item:        LearningPathItem;
  isExpanded:  boolean;
  onToggle:    () => void;
}

const URGENCY_CONFIG = {
  high:   { label: 'High Priority', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  text: '#fca5a5' },
  medium: { label: 'Medium',         bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#fcd34d' },
  low:    { label: 'Low',            bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', text: '#a5b4fc' },
};

const DIFF_COLOR: Record<string, string> = {
  'Beginner-Friendly': '#10b981',
  'Intermediate':      '#f59e0b',
  'Advanced':          '#ef4444',
};

export default function SkillLearningCard({ item, isExpanded, onToggle }: Props) {
  const urgency = URGENCY_CONFIG[item.urgency] ?? URGENCY_CONFIG.medium;
  const diffColor = DIFF_COLOR[item.difficulty] ?? '#94a3b8';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="text-[10px] font-black rounded-full px-2 py-0.5 shrink-0"
            style={{ background: `rgba(255,255,255,0.06)`, color: 'rgba(203,213,225,0.5)' }}
          >
            #{item.order}
          </span>
          <span className="text-[13px] font-bold text-slate-100 truncate">{item.skill}</span>
          <span
            className="text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: urgency.bg, border: `1px solid ${urgency.border}`, color: urgency.text }}
          >
            {urgency.label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold" style={{ color: diffColor }}>{item.difficulty}</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(148,163,184,0.5)" strokeWidth="2"
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

          {/* Stack tag + hours */}
          <div className="flex items-center gap-2 pt-3">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(6,182,212,0.12)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              {item.stack_tag}
            </span>
            <span className="text-[10px] text-slate-500">·</span>
            <span className="text-[10px] text-slate-400">{item.estimated_hours}h estimated</span>
          </div>

          {/* Why important */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Why It Matters</p>
            <p className="text-[12px] text-slate-300 leading-relaxed">{item.why_important}</p>
          </div>

          {/* Recruiter impact */}
          <div
            className="rounded-xl px-3 py-2"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#6ee7b7' }}>
              Recruiter Impact
            </p>
            <p className="text-[11.5px]" style={{ color: 'rgba(167,243,208,0.8)' }}>{item.recruiter_impact}</p>
          </div>

          {/* Project idea */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Portfolio Project</p>
            <p className="text-[12px] text-slate-300 leading-relaxed">{item.project_idea}</p>
            {item.project_outcome && (
              <p className="text-[11px] text-indigo-400 mt-1 leading-relaxed">↳ {item.project_outcome}</p>
            )}
          </div>

          {/* Resources */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded-xl p-2.5"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <p className="text-[9.5px] font-bold uppercase tracking-widest mb-1" style={{ color: '#a5b4fc' }}>
                Free Resource
              </p>
              <p className="text-[11px] text-slate-300 leading-snug">{item.free_resource?.name ?? '—'}</p>
            </div>
            <div
              className="rounded-xl p-2.5"
              style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}
            >
              <p className="text-[9.5px] font-bold uppercase tracking-widest mb-1" style={{ color: '#67e8f9' }}>
                Practice
              </p>
              <p className="text-[11px] text-slate-300 leading-snug">{item.practice_site ?? '—'}</p>
            </div>
          </div>

          {/* Certification */}
          {item.certification && (
            <div className="flex items-start gap-2">
              <span className="text-amber-400 text-sm shrink-0 leading-tight">★</span>
              <p className="text-[11.5px] text-amber-300 leading-snug">{item.certification}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
