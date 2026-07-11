'use client';

import { useState } from 'react';
import Link from 'next/link';
import CompanyLogo from '@/src/components/ui/CompanyLogo';
import Card from '@/src/components/ui/Card';
import VerifiedBadge from '@/src/components/ui/VerifiedBadge';
import Button from '@/src/components/ui/Button';
import type { JobDetail } from '../../shared/types';
import { salaryLabel, hashColor } from '@/src/lib/utils/format';

const WORK_MODE_CLASS: Record<JobDetail['workMode'], string> = {
  remote: 'bg-success-bg text-success',
  hybrid: 'bg-info-bg text-info',
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

function deadlineInfo(closesAt: string): { label: string; className: string } {
  const daysLeft = Math.ceil((new Date(closesAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0)  return { label: 'Closed',                   className: 'text-danger' };
  if (daysLeft === 1) return { label: 'Closes today',             className: 'text-danger' };
  if (daysLeft <= 3)  return { label: `Closes in ${daysLeft}d`,   className: 'text-danger' };
  if (daysLeft <= 7)  return { label: `Closes in ${daysLeft}d`,   className: 'text-warning' };
  return {
    label: `Closes ${new Date(closesAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    className: 'text-[#474d6a]',
  };
}

interface Props {
  job: JobDetail;
  applied: boolean;
  saved: boolean;
  loading?: boolean;
  onApply?: () => void;
  onSave: () => Promise<void>;
  onUnsave: () => Promise<void>;
}

export default function JobDetailsHeader({ job, applied, saved, loading = false, onApply, onSave, onUnsave }: Props) {
  const [savingState, setSavingState] = useState(false);

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
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#474d6a] hover:text-primary transition-colors mb-6"
      >
        ← Back to QA jobs
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
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

          <p className="text-sm font-semibold text-[#474d6a] mb-4 flex items-center gap-2 flex-wrap">
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
            <span className="text-caption font-semibold rounded-full py-1 px-3 bg-success-bg text-success">
              ₹{salaryLabel(job.salaryLpaMin, job.salaryLpaMax)}
            </span>
            {job.jobLevel && (
              <span className="text-caption font-semibold rounded-full py-1 px-3 bg-violet-bg text-violet">
                {job.jobLevel}
              </span>
            )}
          </div>

          {/* Secondary meta */}
          <div className="flex flex-wrap items-center gap-4 text-caption text-[#474d6a] mb-6">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              Posted {postedLabel(job.postedDaysAgo)}
            </span>
            {job.closesAt && (() => {
              const dl = deadlineInfo(job.closesAt);
              return (
                <span className={`flex items-center gap-1.5 font-semibold ${dl.className}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="20" height="20" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {dl.label}
                </span>
              );
            })()}
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {job.metrics?.applicants ?? job.applicants} applicants
            </span>
            {job.vacancies && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
            {applied ? (
              <Button variant="primary" size="md" disabled>
                Applied ✓
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={onApply} loading={loading}>
                Apply now
              </Button>
            )}
            <Button
              variant="outline"
              size="md"
              onClick={handleSaveToggle}
              disabled={savingState}
              className={saved ? 'border-primary text-primary bg-primary/10' : ''}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Logo */}
        <CompanyLogo
          name={job.company}
          logo={job.companyLogo}
          colorClass={colorClass}
          className="w-16 h-16 rounded-full shrink-0"
          textClassName="text-2xl"
        />
      </div>
    </Card>
  );
}
