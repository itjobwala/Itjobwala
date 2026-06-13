'use client';

import { useBenchmarkingQuery } from '../../hooks';
import BenchmarkRankCard        from './BenchmarkRankCard';
import PeerComparisonCard       from './PeerComparisonCard';
import SkillGapVsTopCard        from './SkillGapVsTopCard';

export default function BenchmarkingPanel() {
  const { data, isLoading, isError } = useBenchmarkingQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-sm text-red-300">Could not load benchmarking data.</p>
      </div>
    );
  }

  if (!data) {
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-300">Analyze your resume first</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Benchmarking compares your ATS score against other QA candidates on the platform.
            Parse your resume to unlock your percentile rank.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Percentile ring + tier */}
      <BenchmarkRankCard data={data} />

      {/* Score bar comparison */}
      <PeerComparisonCard data={data} />

      {/* Skill gap vs top performers */}
      {data.skills_top_candidates_have.length > 0 && (
        <SkillGapVsTopCard skills={data.skills_top_candidates_have} />
      )}
    </div>
  );
}
