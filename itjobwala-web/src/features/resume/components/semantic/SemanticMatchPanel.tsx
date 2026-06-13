'use client';

import { safeLocalStorageGetItem } from '@/src/lib/hydration-safe';
import { useSemanticMatchQuery }   from '../../hooks';
import SemanticScoreRing           from './SemanticScoreRing';
import ThemeAlignmentChart         from './ThemeAlignmentChart';
import HiddenMatchesList           from './HiddenMatchesList';
import SemanticGapsList            from './SemanticGapsList';

interface Props {
  jobId: number;
}

export default function SemanticMatchPanel({ jobId }: Props) {
  const token      = safeLocalStorageGetItem('token');
  const isLoggedIn = !!token;

  const { data, isLoading, isError } = useSemanticMatchQuery(jobId, isLoggedIn);

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-token-mid bg-surface-alt p-5 text-center space-y-2">
        <p className="text-sm font-semibold text-body-secondary">See Your Semantic Fit Score</p>
        <p className="text-xs text-subtle">
          Sign in and analyze your resume to discover hidden matches and language alignment with this role.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-token bg-surface p-5 space-y-3 animate-pulse">
        <div className="h-4 bg-surface-hover rounded w-1/2" />
        <div className="h-20 bg-surface-hover rounded-xl" />
        <div className="h-3 bg-surface-hover rounded w-3/4" />
        <div className="h-3 bg-surface-hover rounded w-2/3" />
      </div>
    );
  }

  if (isError || !data) return null;

  if (!data.parsed) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50 p-5 text-center space-y-2">
        <p className="text-sm font-semibold text-violet-700">Semantic Analysis Not Available</p>
        <p className="text-xs text-violet-400 leading-relaxed">
          Go to your profile → ATS Score tab and analyze your resume to unlock semantic matching for this role.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(139,92,246,0.15)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-black text-slate-200">Semantic Match Intelligence</p>
          <p className="text-[9.5px] text-slate-500">TF-IDF similarity · synonym expansion · theme alignment</p>
        </div>
        <div className="ml-auto">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd' }}>
            Phase 9
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Score ring */}
        <SemanticScoreRing
          semanticScore={data.semantic_score}
          rawSimilarity={data.raw_similarity}
          skillsCoverage={data.skills_coverage}
        />

        {/* Summary */}
        <div
          className="rounded-2xl px-4 py-2.5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[11px] text-slate-300 leading-relaxed">{data.semantic_summary}</p>
        </div>

        {/* Theme alignment chart */}
        <ThemeAlignmentChart themes={data.theme_alignment} />

        {/* Hidden matches */}
        <HiddenMatchesList matches={data.hidden_matches} />

        {/* Semantic gaps */}
        <SemanticGapsList gaps={data.semantic_gaps} />
      </div>
    </div>
  );
}
