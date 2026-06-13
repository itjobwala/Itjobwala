'use client';

import { useState } from 'react';
import Link from 'next/link';
import CompanyLogo from '@/src/components/ui/CompanyLogo';
import Card from '@/src/components/ui/Card';
import VerifiedBadge from '@/src/components/ui/VerifiedBadge';
import type { JobDetail } from '../../shared/types';
import { salaryLabel, hashColor } from '@/src/lib/utils/format';

const WORK_MODE_CLASS: Record<JobDetail['workMode'], string> = {
  remote: 'bg-success-bg text-success',
  hybrid: 'bg-blue-50 text-blue-700',
  onsite: 'bg-surface-hover text-body-secondary',
};
const WORK_MODE_LABEL: Record<JobDetail['workMode'], string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};
const JOB_TYPE_LABEL: Record<JobDetail['jobType'], string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

function postedLabel(days: number) {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function formatDeadline(closesAt: string): string {
  const deadline = new Date(closesAt);
  const now = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) return 'Closed';
  if (daysLeft === 1) return 'Closes tomorrow';
  if (daysLeft <= 7) return `Closes in ${daysLeft}d`;
  return `Closes on ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

interface Props {
  job: JobDetail;
  onApply: () => Promise<void>;
  applied: boolean;
  saved: boolean;
  onSave: () => Promise<void>;
  onUnsave: () => Promise<void>;
}

export default function JobDetailsHeader({ job, onApply, applied, saved, onSave, onUnsave }: Props) {
  const [savingState, setSavingState] = useState(false);
  const [applyingState, setApplyingState] = useState(false);



  async function handleApplyClick() {
    setApplyingState(true);
    try {
      await onApply();
    } finally {
      setApplyingState(false);
    }
  }

  async function handleSaveToggle() {
    setSavingState(true);
    try {
      if (saved) {
        await onUnsave();
      } else {
        await onSave();
      }
    } finally {
      setSavingState(false);
    }
  }

  const colorClass = job.companyColorClass || hashColor(job.company);

  return (
    <Card padding="none" className="p-6 sm:p-8" overflow>
      {/* Back */}
      <Link
        href="/candidate/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-subtle hover:text-primary transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to jobs
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        {/* Logo */}
        <CompanyLogo
          name={job.company}
          logo={job.companyLogo}
          colorClass={colorClass}
          className="w-16 h-16 rounded-2xl"
          textClassName="text-2xl"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {job.isNew && <span className="text-micro font-bold rounded-full py-[2px] px-2.5 bg-success-bg text-success">New</span>}
            {job.isHot && <span className="text-micro font-bold rounded-full py-[2px] px-2.5 bg-danger-bg text-danger">Hot</span>}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-heading leading-snug mb-1" style={{ letterSpacing: '-0.5px' }}>
            {job.title}
          </h1>

          <p className="text-md font-semibold text-muted mb-4 flex items-center gap-2 flex-wrap">
            <span>{job.company}</span>
            {job.companyVerified && <VerifiedBadge />}
            <span>&middot; {job.location}</span>
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {WORK_MODE_LABEL[job.workMode] && (
              <span className={`text-caption font-semibold rounded-full py-1 px-3 ${WORK_MODE_CLASS[job.workMode] ?? 'bg-surface-hover text-body-secondary'}`}>
                {WORK_MODE_LABEL[job.workMode]}
              </span>
            )}
            {JOB_TYPE_LABEL[job.jobType] && (
              <span className="text-caption font-semibold rounded-full py-1 px-3 bg-surface-hover text-body-secondary">
                {JOB_TYPE_LABEL[job.jobType]}
              </span>
            )}
            <span className="text-caption font-semibold rounded-full py-1 px-3 bg-primary/10 text-primary">
              {job.experienceMin === 0 && job.experienceMax === 0
                ? '0 yrs'
                : `${job.experienceMin}–${job.experienceMax} yrs`}
            </span>
            <span className="text-caption font-semibold rounded-full py-1 px-3 bg-emerald-50 text-emerald-700">
              ₹{salaryLabel(job.salaryLpaMin, job.salaryLpaMax)}
            </span>
            {job.jobLevel && (
              <span className="text-caption font-semibold rounded-full py-1 px-3 bg-purple-50 text-purple-600">
                {job.jobLevel}
              </span>
            )}
          </div>

          {/* Secondary meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-subtle mb-6">
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              Posted {postedLabel(job.postedDaysAgo)}
            </span>
            {job.closesAt && (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {formatDeadline(job.closesAt)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {job.metrics?.applicants ?? job.applicants} applicants
            </span>
            {job.vacancies && (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                {job.vacancies} vacancies
              </span>
            )}
            {job.companyIndustry && (
              <span>{job.companyIndustry}</span>
            )}
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleApplyClick}
              disabled={applied || applyingState}
              className={`flex items-center gap-2 font-bold text-base rounded-xl px-6 py-3 transition-all ${
                applied
                  ? 'bg-green-500 text-white cursor-default'
                  : applyingState
                  ? 'bg-primary/70 text-white cursor-wait'
                  : 'bg-primary text-white hover:brightness-110 cursor-pointer'
              }`}
            >
              {applied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Applied
                </>
              ) : applyingState ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  Applying...
                </>
              ) : (
                'Apply Now →'
              )}
            </button>

            <button
              onClick={handleSaveToggle}
              disabled={savingState}
              className={`flex items-center gap-2 text-base font-semibold rounded-xl px-4 py-3 border transition-all ${
                savingState
                  ? 'cursor-wait'
                  : 'cursor-pointer'
              } ${
                saved
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-token text-body-secondary hover:border-primary/40 hover:text-primary'
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>

          </div>
        </div>
      </div>
    </Card>
  );
}
