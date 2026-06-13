'use client';

import Link from 'next/link';
import StatusBadge from '@/src/components/ui/StatusBadge';

export interface Job {
  id: string;
  title: string;
  location: string;
  applications: number;
  posted: string;
  status: 'active' | 'paused' | 'closed';
  type: string;
}

interface Props {
  job: Job;
}

export default function JobStatusCard({ job }: Props) {
  return (
    <div className="px-5 py-4 hover:bg-surface-alt/40 transition-colors group">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-heading group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <StatusBadge status={job.status} size="sm" showDot className="text-[10px]" />
            <span className="text-[10px] font-semibold text-subtle bg-surface-hover px-2 py-0.5 rounded-full">
              {job.type}
            </span>
          </div>
          <div className="flex items-center gap-3 text-caption text-subtle">
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {job.location}
            </span>
            <span>·</span>
            <span>{job.posted}</span>
            <span>·</span>
            <span className="font-semibold text-body">{job.applications} applicants</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/recruiter/applicants?jobId=${job.id}`}
            className="text-caption font-semibold text-primary border border-primary/25 bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors hidden sm:block"
          >
            Applicants
          </Link>
          <Link
            href={`/recruiter/posted-jobs/${job.id}/edit`}
            className="text-caption font-semibold text-muted border border-token px-3 py-1.5 rounded-lg hover:bg-surface-alt transition-colors hidden sm:block"
          >
            Edit
          </Link>
          <button className="p-1.5 text-gray-300 hover:text-muted transition-colors rounded-lg hover:bg-surface-hover">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="5"  r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
