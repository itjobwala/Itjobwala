'use client';

import Link from 'next/link';

const JOB_STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  active: { badge: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  paused: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  closed: { badge: 'bg-gray-100 text-gray-500',  dot: 'bg-gray-400'  },
};

export interface Job {
  id: number;
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
  const s = JOB_STATUS_STYLES[job.status];

  return (
    <div className="px-5 py-4 hover:bg-gray-50/40 transition-colors group">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-[14px] font-bold text-[#0f172a] group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {job.type}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-gray-400">
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
            <span className="font-semibold text-[#374151]">{job.applications} applicants</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/recruiter/applicants?job=${job.id}`}
            className="text-[12px] font-semibold text-primary border border-primary/25 bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors hidden sm:block"
          >
            Applicants
          </Link>
          <Link
            href={`/recruiter/jobs/${job.id}/edit`}
            className="text-[12px] font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors hidden sm:block"
          >
            Edit
          </Link>
          <button className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors rounded-lg hover:bg-gray-100">
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
