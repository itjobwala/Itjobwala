'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompanyLogo from './CompanyLogo';
import type { Job } from './types';

interface Props {
  job: Job;
  onSave?: (jobId: string) => Promise<void>;
  onUnsave?: (jobId: string) => Promise<void>;
  initialSaved?: boolean;
}

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IndianRupeeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
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
  remote: 'bg-green-50 text-green-700',
  hybrid: 'bg-blue-50 text-blue-700',
  onsite: 'bg-gray-100 text-gray-600',
};

const JOB_TYPE_LABEL: Record<Job['jobType'], string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

function formatLpa(val: string | number): string {
  const n = parseFloat(String(val));
  if (isNaN(n)) return '0';
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
}

function salaryLabel(lpaMin: string, lpaMax: string): string {
  const min = parseFloat(lpaMin);
  const max = parseFloat(lpaMax);
  if (min === 0 && max === 0) return '0 LPA';
  return `${formatLpa(min)}–${formatLpa(max)} LPA`;
}

function postedLabel(days: number) {
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

export default function JobCard({ job, onSave, onUnsave, initialSaved = false }: Props) {
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
    <div onClick={() => router.push(`/jobs/${job.id}`)} className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer p-5 sm:p-6">
      <div className="flex items-start gap-4">
        {/* Company logo */}
        <CompanyLogo name={job.company} logo={job.companyLogo} colorClass={job.companyColorClass} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {job.isNew && (
                  <span className="text-[11px] font-bold rounded-full py-[2px] px-2 bg-green-50 text-green-700">New</span>
                )}
                {job.isHot && (
                  <span className="text-[11px] font-bold rounded-full py-[2px] px-2 bg-red-50 text-red-500">Hot</span>
                )}
              </div>
              {/* Title */}
              <h3 className="font-bold text-[15px] text-[#0f172a] leading-snug group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${saved ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400 hover:bg-primary/10 hover:text-primary'}`}
              aria-label={saved ? 'Unsave job' : 'Save job'}
            >
              {saving ? (
                <svg width="15" height="15" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 1 0 20" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[13px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPinIcon /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <BriefcaseIcon />
              {job.experienceMin === 0 && job.experienceMax === 0
                ? '0 yrs'
                : `${job.experienceMin}–${job.experienceMax} yrs`}
            </span>
            <span className="flex items-center gap-1.5">
              <IndianRupeeIcon /> {salaryLabel(job.salaryLpaMin, job.salaryLpaMax)}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon /> {postedLabel(job.postedDaysAgo)}
            </span>
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`text-[12px] font-semibold rounded-full py-[3px] px-3 ${WORK_MODE_CLASS[job.workMode]}`}>
              {WORK_MODE_LABEL[job.workMode]}
            </span>
            <span className="text-[12px] font-semibold rounded-full py-[3px] px-3 bg-gray-100 text-gray-600">
              {JOB_TYPE_LABEL[job.jobType]}
            </span>
            {job.skills.slice(0, 3).map(skill => (
              <span key={skill} className="text-[12px] font-medium rounded-full py-[3px] px-3 bg-gray-50 text-gray-500 border border-gray-100">
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-[12px] text-gray-400">+{job.skills.length - 3} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <span className="text-[12px] text-gray-400">{job.applicants} applicants</span>
        <span className="text-[13px] font-bold text-primary hover:bg-primary/10 rounded-lg px-4 py-2 transition-colors">
          View job →
        </span>
      </div>
    </div>
  );
}
