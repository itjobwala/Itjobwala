'use client';

import { useState, useEffect } from 'react';
import { SmartNavbar } from '@/layout/navbar';
import JobDetailsHeader from './JobDetailsHeader';
import JobDescription from './JobDescription';
import SkillsTags from './SkillsTags';
import { RecommendedJobs } from '@/features/jobs/browse';
import SimilarCompanies from './SimilarCompanies';
import { ProfileCompletionCard } from '@/features/jobs/browse';
import Link from 'next/link';
import JobDetailSkeleton from './JobDetailSkeleton';
import { useSaveJobMutation, useUnsaveJobMutation } from '@/features/candidate/applications/hooks';
import { useRecommendedJobsQuery, useSimilarCompaniesQuery } from '@/features/jobs/browse/hooks';
import { applyToJob, getMyApplications } from '@/features/candidate/applications';
import { getSavedJobs } from '@/features/candidate/saved-jobs';
import { safeLocalStorageGetItem } from '@/src/lib/hydration-safe';
import { normalizeJob } from '../../shared/types';
import type { JobDetail } from '../../shared/types';
import { ReportModal }          from '@/src/features/reports';

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
  const [showReportModal, setShowReportModal]   = useState(false);

  const { data: recommendedJobs = [] } = useRecommendedJobsQuery(String(job.id));
  const { data: companies = [] } = useSimilarCompaniesQuery(job.id, 5);
  const recommended = recommendedJobs.map(normalizeJob);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Client-side applied check — SSR doesn't have candidate's token, so we verify after mount
  useEffect(() => {
    if (applied) return;
    const token = safeLocalStorageGetItem('token');
    if (!token) return;
    getMyApplications({ limit: 200 })
      .then(data => {
        const alreadyApplied = data.applications.some(a => a.job_id === String(job.id));
        if (alreadyApplied) setApplied(true);
      })
      .catch(() => {});
  }, [job.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side saved check — same reason as applied check above
  useEffect(() => {
    if (saved) return;
    const token = safeLocalStorageGetItem('token');
    if (!token) return;
    getSavedJobs({ limit: 200 })
      .then(data => {
        const alreadySaved = data.saved_jobs.some(j => j.job_id === String(job.id));
        if (alreadySaved) setSaved(true);
      })
      .catch(() => {});
  }, [job.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleApply() {
    const token = safeLocalStorageGetItem('token');
    if (!token) {
      window.location.href = `/auth/login?next=${encodeURIComponent(`/candidate/jobs/${job.id}`)}&role=candidate`;
      return;
    }
    if (applied) return;
    try {
      await applyToJob(String(job.id));
      setApplied(true);
      setShowAppliedToast(true);
      setTimeout(() => setShowAppliedToast(false), 4000);
    } catch (error) {
      const err = error as { status?: number };
      if (err.status === 409) {
        setApplied(true); // already applied — sync state silently
        return;
      }
      console.error('[JobDetailPageClient] Failed to apply for job:', error);
    }
  }

  async function handleSave() {
    const token = safeLocalStorageGetItem('token');
    if (!token) {
      window.location.href = `/auth/login?next=${encodeURIComponent(`/candidate/jobs/${job.id}`)}&role=candidate`;
      return;
    }
    await saveJobMutation.mutateAsync(String(job.id));
    setSaved(true);
  }

  async function handleUnsave() {
    await unsaveJobMutation.mutateAsync(String(job.id));
    setSaved(false);
  }

  function handleReportClick() {
    const token = safeLocalStorageGetItem('token');
    if (!token) {
      window.location.href = `/auth/login?next=${encodeURIComponent(`/candidate/jobs/${job.id}`)}&role=candidate`;
      return;
    }
    setShowReportModal(true);
  }

  return (
    <div className="min-h-screen bg-surface-alt">
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
                  applied={applied}
                  saved={saved}
                  onApply={handleApply}
                  onSave={handleSave}
                  onUnsave={handleUnsave}
                  loading={loading}
                />
                <JobDescription job={job} />
                <SkillsTags skills={job.skills} />

                {/* Report this job */}
                <div className="flex justify-end">
                  <button
                    onClick={handleReportClick}
                    className="flex items-center gap-1.5 text-caption text-[#474d6a] hover:text-danger transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Report this job
                  </button>
                </div>
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

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="job"
        targetId={job.numericId ?? 0}
        targetLabel={job.title}
      />

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-white/20 z-40 lg:hidden bg-primary/95 backdrop-blur-sm shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        {applied ? (
          <Link
            href="/candidate/applications"
            className="flex items-center justify-center w-full bg-white text-primary font-bold text-base rounded-xl py-3.5"
          >
            Applied ✓ · View status →
          </Link>
        ) : (
          <button
            onClick={handleApply}
            disabled={loading}
            className="flex items-center justify-center w-full bg-white text-primary font-bold text-base rounded-xl py-3.5 disabled:opacity-70"
          >
            ₹{job.salaryLpaMin ? `${job.salaryLpaMin}–${job.salaryLpaMax}` : job.salaryLpaMax} LPA · Apply Now →
          </button>
        )}
      </div>

      {/* Applied toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ${
          showAppliedToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-heading text-white text-[13px] font-semibold rounded-2xl px-5 py-3.5 shadow-2xl">
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
