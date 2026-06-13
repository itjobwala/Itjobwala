'use client';

import type { HiringSignal } from '../../types/resume.types';

interface Props {
  signals: HiringSignal[];
}

const OUTCOME_CONFIG = {
  shortlisted: { icon: '⬆', label: 'Shortlisted',   color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.2)'   },
  interview:   { icon: '●',  label: 'Interview',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)'  },
  hired:       { icon: '★',  label: 'Hired',         color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  rejected:    { icon: '✕',  label: 'Not Selected',  color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.12)' },
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OutcomeTimelineList({ signals }: Props) {
  if (signals.length === 0) return null;

  return (
    <div className="space-y-2">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.15em] px-1"
        style={{ color: 'rgba(148,163,184,0.5)' }}
      >
        Recruiter Decision Timeline
      </p>
      {signals.map(signal => {
        const cfg = OUTCOME_CONFIG[signal.outcome] ?? OUTCOME_CONFIG.rejected;
        return (
          <div
            key={signal.id}
            className="rounded-2xl px-4 py-3 space-y-1.5"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black" style={{ color: cfg.color }}>
                  {cfg.icon}
                </span>
                <span className="text-[12px] font-bold" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">{formatDate(signal.created_at)}</span>
            </div>

            {/* Context row */}
            <div className="flex items-center gap-2 flex-wrap">
              {signal.qa_score_at_time != null && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(203,213,225,0.7)' }}
                >
                  ATS {signal.qa_score_at_time}
                </span>
              )}
              {signal.qa_specialization && (
                <span className="text-[10px] text-slate-500">
                  {SPEC_LABEL[signal.qa_specialization] ?? signal.qa_specialization}
                </span>
              )}
              {signal.qa_seniority && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="text-[10px] text-slate-500 capitalize">{signal.qa_seniority}</span>
                </>
              )}
            </div>

            {/* Recruiter note */}
            {signal.feedback_note && (
              <div
                className="rounded-xl px-3 py-2 mt-1"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Recruiter Note
                </p>
                <p className="text-[11.5px] text-slate-300 leading-relaxed italic">
                  &quot;{signal.feedback_note}&quot;
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
