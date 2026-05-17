'use client';

import Link from 'next/link';
import JobStatusCard, { type Job } from './JobStatusCard';
import { useRecruiterPostedJobsQuery } from '@/src/hooks/useRecruiter';

function relativeDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return `${diff} days ago`;
  if (diff < 14) return '1 week ago';
  return `${Math.floor(diff / 7)} weeks ago`;
}

export default function PostedJobs() {
  const { data, isLoading } = useRecruiterPostedJobsQuery({ limit: 5 }, true);
  const jobs: Job[] = (data?.jobs ?? []).map((j) => ({
    id:           j.id,
    title:        j.title,
    location:     [j.location, j.workMode].filter(Boolean).join(' · '),
    applications: j.applicationCount,
    posted:       relativeDate(j.postedDate ?? j.createdAt),
    status:       j.status === 'draft' ? 'paused' : j.status as Job['status'],
    type:         j.jobType,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>
            Posted Jobs
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Manage your active and paused listings</p>
        </div>
        <Link
          href="/recruiter/post-job"
          className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-primary px-3.5 py-1.5 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5"  y1="12" x2="19" y2="12" />
          </svg>
          Post Job
        </Link>
      </div>

      {isLoading ? (
        <div className="divide-y divide-gray-50 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-[72px] px-5 py-4 bg-gray-50" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="px-5 py-8 text-center text-[13px] text-gray-400">No active jobs posted yet.</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {jobs.map(job => <JobStatusCard key={job.id} job={job} />)}
        </div>
      )}

      <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/40">
        <Link href="/recruiter/posted-jobs" className="text-[12px] font-bold text-primary hover:text-primary/80 transition-colors">
          View all jobs →
        </Link>
      </div>
    </div>
  );
}
