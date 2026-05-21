'use client';

import { useState, useEffect } from 'react';
import SmartNavbar from '@/src/components/navbar/SmartNavbar';
import JobDetailsHeader from './JobDetailsHeader';
import JobDescription from './JobDescription';
import SkillsTags from './SkillsTags';
import RecommendedJobs from './RecommendedJobs';
import SimilarCompanies from './SimilarCompanies';
import ProfileCompletionCard from './ProfileCompletionCard';
import JobDetailSkeleton from './JobDetailSkeleton';
import { useSaveJobMutation, useUnsaveJobMutation } from '@/src/hooks/useApplications';
import { useRecommendedJobsQuery, useSimilarCompaniesQuery } from '@/src/hooks/useJobs';
import { applyToJob } from '@/src/lib/api/applications';
import { normalizeJob } from './types';
import type { JobDetail } from './types';

interface Props {
  job: JobDetail;
}

export default function JobDetailPageClient({ job }: Props) {
  const saveJobMutation = useSaveJobMutation();
  const unsaveJobMutation = useUnsaveJobMutation();
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(job.hasApplied ?? false);
  const [saved, setSaved] = useState(job.isSaved ?? false);
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  const { data: recommendedJobs = [] } = useRecommendedJobsQuery();
  const { data: companies = [] } = useSimilarCompaniesQuery(job.id, 5);
  const recommended = recommendedJobs.map(normalizeJob);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  async function handleApply() {
    if (applied) return;
    try {
      await applyToJob(String(job.id));
      setApplied(true);
      setShowAppliedToast(true);
      setTimeout(() => setShowAppliedToast(false), 4000);
    } catch (error) {
      console.error('[JobDetailPageClient] Failed to apply for job:', error);
      // Error handling can be enhanced with a toast notification
    }
  }

  async function handleSave() {
    await saveJobMutation.mutateAsync(String(job.id));
    setSaved(true);
  }

  async function handleUnsave() {
    await unsaveJobMutation.mutateAsync(String(job.id));
    setSaved(false);
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <SmartNavbar />

      <div className="pt-[68px]">
<div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
          {loading ? (
            <JobDetailSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              {/* ── Left column ── */}
              <div className="flex flex-col gap-5 min-w-0">
                <JobDetailsHeader
                  job={job}
                  onApply={handleApply}
                  applied={applied}
                  saved={saved}
                  onSave={handleSave}
                  onUnsave={handleUnsave}
                />
                <JobDescription job={job} />
                <SkillsTags skills={job.skills} />
              </div>

              {/* ── Right sidebar ── */}
              <div className="flex flex-col gap-5 lg:sticky lg:top-24">
                <RecommendedJobs jobs={recommended} />
                <SimilarCompanies companies={companies} />
                <ProfileCompletionCard />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applied toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 ${
          showAppliedToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-[#0f172a] text-white text-[13px] font-semibold rounded-2xl px-5 py-3.5 shadow-2xl">
          <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M2 6l3 3 5-5" />
            </svg>
          </span>
          Application submitted! The recruiter will reach out soon.
        </div>
      </div>
    </div>
  );
}
