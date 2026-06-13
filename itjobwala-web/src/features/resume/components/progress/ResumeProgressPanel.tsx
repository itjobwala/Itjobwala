'use client';

import { useResumeProgressQuery } from '../../hooks';
import ScoreProgressChart         from './ScoreProgressChart';
import ProgressDeltaCard          from './ProgressDeltaCard';
import VersionHistoryList         from './VersionHistoryList';
import RecruiterFeedbackPanel     from '../feedback/RecruiterFeedbackPanel';

export default function ResumeProgressPanel() {
  const { data, isLoading, isError } = useResumeProgressQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-sm font-semibold text-red-300">Could not load progress data</p>
      </div>
    );
  }

  const { versions, progress } = data;

  // No history yet
  if (versions.length === 0 || !progress) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.12)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-300">No history yet</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Analyze your resume at least once to start tracking progress.<br />
            Each re-analyze adds a data point to your score chart.
          </p>
        </div>
      </div>
    );
  }

  const hasMultiple = versions.length > 1;

  return (
    <div className="space-y-4">

      {/* Chart (only meaningful with 2+ versions) */}
      {hasMultiple ? (
        <div
          className="rounded-2xl px-3 pt-3 pb-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">
            Score Over Time
          </p>
          <ScoreProgressChart versions={versions} />
        </div>
      ) : (
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[11.5px] text-indigo-300">
            Re-analyze after updating your resume to see your score chart grow.
          </p>
        </div>
      )}

      {/* Progress delta + milestone */}
      <ProgressDeltaCard progress={progress} />

      {/* Full history */}
      <VersionHistoryList versions={versions} />

      {/* Phase 5: Recruiter feedback signals */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <RecruiterFeedbackPanel />
      </div>
    </div>
  );
}
