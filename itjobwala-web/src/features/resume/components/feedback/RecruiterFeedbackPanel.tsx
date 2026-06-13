'use client';

import { useHiringSignalsQuery } from '../../hooks';
import HiringSummaryCard         from './HiringSummaryCard';
import OutcomeTimelineList       from './OutcomeTimelineList';

export default function RecruiterFeedbackPanel() {
  const { data, isLoading, isError } = useHiringSignalsQuery();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-sm text-red-300">Could not load recruiter signals.</p>
      </div>
    );
  }

  const { signals, summary } = data;

  if (signals.length === 0 || !summary) {
    return (
      <div
        className="rounded-2xl px-4 py-5 flex items-start gap-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(99,102,241,0.12)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-slate-300">No recruiter decisions yet</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            When recruiters shortlist, interview, or update your application status,
            their decisions will appear here — anonymized and with score context.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section label */}
      <p
        className="text-[10px] font-bold uppercase tracking-[0.15em] px-1"
        style={{ color: 'rgba(148,163,184,0.5)' }}
      >
        Recruiter Signals
      </p>

      <HiringSummaryCard summary={summary} />
      <OutcomeTimelineList signals={signals} />
    </div>
  );
}
