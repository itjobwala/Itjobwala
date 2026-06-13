'use client';

import { safeLocalStorageGetItem } from '@/src/lib/hydration-safe';
import { useJobFitQuery }          from '../../hooks';
import JobFitInsightsCard          from './JobFitInsightsCard';
import FitGapAnalysis              from './FitGapAnalysis';
import RecruiterFitSummary         from './RecruiterFitSummary';
import MissingRequirementsList     from './MissingRequirementsList';

interface Props {
  jobId: number;
}

export default function JobFitIntelligencePanel({ jobId }: Props) {
  const token   = safeLocalStorageGetItem('token');
  const isLoggedIn = !!token;

  const { data, isLoading, isError } = useJobFitQuery(jobId, isLoggedIn);

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-token-mid bg-surface-alt p-5 text-center space-y-2">
        <p className="text-sm font-semibold text-body-secondary">See Your Job Fit Score</p>
        <p className="text-xs text-subtle">
          Sign in and analyze your resume to see how well you match this specific role.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-token bg-surface p-5 space-y-3 animate-pulse">
        <div className="h-4 bg-surface-hover rounded w-1/2" />
        <div className="h-16 bg-surface-hover rounded-xl" />
        <div className="h-3 bg-surface-hover rounded w-3/4" />
        <div className="h-3 bg-surface-hover rounded w-2/3" />
      </div>
    );
  }

  if (isError || !data) return null;

  // Resume not parsed yet — intentional indigo teaser
  if (!data.parsed) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 p-5 text-center space-y-2">
        <p className="text-sm font-semibold text-indigo-700">Resume Not Yet Analyzed</p>
        <p className="text-xs text-indigo-400 leading-relaxed">
          Go to your profile → ATS Score tab and analyze your resume to see your job fit score for this role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-indigo-500" />
        <h3 className="text-sm font-bold text-body">QA Job Fit Analysis</h3>
        <span className="text-[10px] text-subtle bg-surface-hover px-2 py-0.5 rounded-full font-medium">Phase 1</span>
      </div>

      <JobFitInsightsCard    data={data} />
      <FitGapAnalysis        data={data} />
      <MissingRequirementsList data={data} />
      <RecruiterFitSummary   data={data} />
    </div>
  );
}
