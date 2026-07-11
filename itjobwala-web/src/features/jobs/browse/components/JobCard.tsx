'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompanyLogo from '@/src/components/ui/CompanyLogo';
import VerifiedBadge from '@/src/components/ui/VerifiedBadge';
import Badge from '@/src/components/ui/Badge';
import type { Job } from '../../shared/types';
import { salaryLabel } from '@/src/lib/utils/format';

interface Props {
  job:            Job;
  onSave?:        (jobId: string) => Promise<void>;
  onUnsave?:      (jobId: string) => Promise<void>;
  initialSaved?:  boolean;
  matchScore?:    number | null;
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IndianRupeeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <path d="M6 3h12M6 8h12M15 21 9 8" />
      <path d="M6 13h3a4 4 0 0 0 0-5H6" />
    </svg>
  );
}

const WORK_MODE_LABEL: Record<Job['workMode'], string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};

const WORK_MODE_CLASS: Record<Job['workMode'], string> = {
  remote: 'bg-success-bg text-success',
  hybrid: 'bg-info-bg text-info',
  onsite: 'bg-surface-hover text-body-secondary',
};

const JOB_TYPE_LABEL: Record<Job['jobType'], string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

function postedLabel(days: number) {
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function expiresInfo(closesAt: string | null | undefined): { label: string; className: string } | null {
  if (!closesAt) return null;
  const daysLeft = Math.ceil((new Date(closesAt).getTime() - Date.now()) / 86_400_000);
  if (daysLeft <= 0)  return { label: 'Closed',           className: 'text-danger' };
  if (daysLeft === 1) return { label: 'Closes today',     className: 'text-danger' };
  if (daysLeft <= 3)  return { label: `Closes in ${daysLeft}d`, className: 'text-danger' };
  if (daysLeft <= 7)  return { label: `Closes in ${daysLeft}d`, className: 'text-warning' };
  if (daysLeft <= 30) return { label: `Closes in ${daysLeft}d`, className: 'text-subtle' };
  const d = new Date(closesAt);
  return { label: `Closes ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, className: 'text-subtle' };
}

export default function JobCard({ job, onSave, onUnsave, initialSaved = false, matchScore }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const handleSaveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSaving(true);
    try {
      if (saved) {
        await onUnsave?.(job.id);
      } else {
        await onSave?.(job.id);
      }
      setSaved(!saved);
    } catch {
      // Error handling is done by parent component
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={() => router.push(`/candidate/jobs/${job.id}`)} className="group relative overflow-hidden bg-white rounded-2xl border border-token hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer p-5 sm:p-6">
      {job.hasApplied && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-success" />}
      <div className="flex items-start gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {job.hasApplied && (
                  <span className="text-micro font-bold rounded-full py-[2px] px-2 bg-success-bg text-success flex items-center gap-1">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    Applied
                  </span>
                )}
                {job.isNew && !job.hasApplied && (
                  <span className="text-micro font-bold rounded-full py-[2px] px-2 bg-success-bg text-success">New</span>
                )}
                {job.isHot && (
                  <span className="text-micro font-bold rounded-full py-[2px] px-2 bg-danger-bg text-danger">Hot</span>
                )}
              </div>
              {/* Title */}
              <h3 className="font-bold text-sm text-heading leading-snug group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                {job.company}
                {job.companyVerified && <VerifiedBadge />}
              </p>
            </div>

            {/* Company logo */}
            <CompanyLogo name={job.company} logo={job.companyLogo} colorClass={job.companyColorClass} />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <MapPinIcon /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <BriefcaseIcon />
              {job.experienceMin === 0 && job.experienceMax === 0
                ? '0 yrs'
                : `${job.experienceMin}–${job.experienceMax} yrs`}
            </span>
            <span className="flex items-center gap-1.5 bg-success-bg text-success font-semibold rounded-full px-3 py-1">
              <IndianRupeeIcon /> {salaryLabel(job.salaryLpaMin, job.salaryLpaMax)}
            </span>
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {WORK_MODE_LABEL[job.workMode] && (
              <span className={`text-caption font-semibold rounded-full py-[3px] px-3 ${WORK_MODE_CLASS[job.workMode] ?? 'bg-surface-hover text-body-secondary'}`}>
                {WORK_MODE_LABEL[job.workMode]}
              </span>
            )}
            {JOB_TYPE_LABEL[job.jobType] && (
              <span className="text-caption font-semibold rounded-full py-[3px] px-3 bg-surface-hover text-body-secondary">
                {JOB_TYPE_LABEL[job.jobType]}
              </span>
            )}
            {job.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="default" size="md">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <span className="text-caption text-subtle">+{job.skills.length - 3} more</span>
            )}
          </div>

          {matchScore != null && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: matchScore >= 70 ? 'rgba(16,185,129,0.12)' : matchScore >= 45 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.08)',
                  color:      matchScore >= 70 ? '#10b981' : matchScore >= 45 ? '#f59e0b' : '#ef4444',
                }}
              >
                {matchScore}% job fit
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-token">
        <div className="flex items-center gap-3">
          <span className="text-caption text-subtle flex items-center gap-1.5">
            <ClockIcon /> {postedLabel(job.postedDaysAgo)}
          </span>
          {(() => {
            const exp = expiresInfo(job.closesAt);
            return exp ? (
              <span className={`text-caption font-semibold flex items-center gap-1 ${exp.className}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
                  <rect x="3" y="4" width="20" height="20" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {exp.label}
              </span>
            ) : null;
          })()}
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveClick}
          disabled={saving}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${saved ? 'bg-primary/10 text-primary' : 'bg-surface-alt text-subtle hover:bg-primary/10 hover:text-primary'}`}
          aria-label={saved ? 'Unsave job' : 'Save job'}
        >
          {saving ? (
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 0 20" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
