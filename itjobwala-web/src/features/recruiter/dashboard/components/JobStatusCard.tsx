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
    <tr className="border-b border-token last:border-0 hover:bg-surface-alt transition-colors group">
      <td className="px-4 py-3.5">
        <div className="min-w-0">
          <Link
            href={`/recruiter/posted-jobs/${job.id}`}
            className="text-sm font-bold text-heading hover:text-primary transition-colors truncate block"
          >
            {job.title}
          </Link>
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            <StatusBadge status={job.status} size="sm" showDot className="text-[10px] shrink-0" />
            <span className="text-[10px] font-semibold text-subtle bg-surface-hover px-2 py-0.5 rounded-full shrink-0">
              {job.type}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-small-text text-body-secondary truncate overflow-hidden w-[130px]">{job.location}</td>
      <td className="px-4 py-3.5 text-small-text text-body-secondary whitespace-nowrap truncate overflow-hidden w-[110px]">{job.posted}</td>
      <td className="px-4 py-3.5 text-small-text text-body-secondary text-center whitespace-nowrap truncate overflow-hidden w-[110px]">
        {job.applications} applicants
      </td>
      <td className="px-3 py-3.5 w-[172px]">
        <div className="flex items-center justify-start gap-1.5">
          <Link
            href={`/recruiter/applicants?jobId=${job.id}`}
            className="w-[86px] shrink-0 text-caption font-semibold text-primary border border-primary/25 bg-primary/5 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-center whitespace-nowrap"
          >
            Applicants
          </Link>
          <Link
            href={`/recruiter/posted-jobs/${job.id}/edit`}
            className="w-[56px] shrink-0 text-caption font-semibold text-muted border border-token px-2 py-1.5 rounded-lg hover:bg-surface-alt transition-colors text-center whitespace-nowrap"
          >
            Edit
          </Link>
        </div>
      </td>
    </tr>
  );
}
