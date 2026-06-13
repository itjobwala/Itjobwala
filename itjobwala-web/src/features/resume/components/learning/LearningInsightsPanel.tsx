'use client';

import { useLearningIntelligenceQuery } from '../../hooks';
import LearningPathTimeline             from './LearningPathTimeline';
import CertificationAdvisorCard         from './CertificationAdvisorCard';

export default function LearningInsightsPanel() {
  const { data, isLoading, isError } = useLearningIntelligenceQuery();

  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-800 rounded w-1/2" />
          <div className="h-20 bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-sm font-semibold text-red-300">Could not load learning recommendations</p>
        <p className="text-xs text-slate-500">Make sure your resume has been analyzed first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top stat bar */}
      {data.has_learning_data && (
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-black text-slate-200">
              {data.learning_path.length} skills in your personalized path
            </p>
            {data.top_skill && (
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                Start with: <span className="text-indigo-300 font-semibold">{data.top_skill}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Certification advisor */}
      {data.certification_advice && (
        <CertificationAdvisorCard data={data.certification_advice} />
      )}

      {/* Learning path timeline */}
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 px-1"
          style={{ color: 'rgba(148,163,184,0.6)' }}
        >
          Your Learning Path
        </p>
        <LearningPathTimeline
          learningPath={data.learning_path}
          learningInvestment={data.learning_investment}
        />
      </div>
    </div>
  );
}
