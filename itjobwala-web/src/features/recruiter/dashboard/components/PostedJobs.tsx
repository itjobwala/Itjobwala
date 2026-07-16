'use client';

import Link from 'next/link';
import JobStatusCard, { type Job } from './JobStatusCard';
import { useRecruiterPostedJobsQuery } from '@/features/recruiter/hooks';
import Card from '@/src/components/ui/Card';
import { relativeTime } from '@/src/lib/utils/format';

export default function PostedJobs() {
  const { data, isLoading } = useRecruiterPostedJobsQuery({ limit: 5 }, true);
  const jobs: Job[] = (data?.jobs ?? []).map((j) => ({
    id:           j.id,
    title:        j.title,
    location:     [j.location, j.workMode].filter(Boolean).join(' · '),
    applications: j.applicationCount,
    posted:       relativeTime(j.postedDate ?? j.createdAt),
    status:       j.status === 'draft' ? 'paused' : j.status as Job['status'],
    type:         j.jobType,
  }));

  return (
    <Card padding="none" className="shadow-sm">
      <div className="px-5 py-4 border-b border-token flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-h6 text-heading" style={{ letterSpacing: '-0.3px' }}>
            Posted Jobs
          </h2>
          <p className="text-caption text-subtle mt-0.5">Manage your active and paused listings</p>
        </div>
        <Link
          href="/recruiter/post-job"
          className="flex items-center gap-1.5 text-caption font-bold text-white bg-primary px-3.5 py-1.5 rounded-xl hover:bg-primary/90 transition-colors"
          style={{ color: '#fff' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5"  y1="12" x2="19" y2="12" />
          </svg>
          Post Job
        </Link>
      </div>

      {isLoading ? (
        <div className="divide-y divide-gray-50 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-[72px] px-5 py-4 bg-surface-alt" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-subtle">No active jobs posted yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[700px]">
            <thead className="bg-surface-alt/60">
              <tr>
                <th className="text-left text-caption font-semibold text-subtle px-4 py-3">Job</th>
                <th className="text-left text-caption font-semibold text-subtle px-4 py-3 w-[130px]">Location</th>
                <th className="text-left text-caption font-semibold text-subtle px-4 py-3 w-[110px]">Posted</th>
                <th className="text-center text-caption font-semibold text-subtle px-4 py-3 w-[110px]">Applicants</th>
                <th className="text-center text-caption font-semibold text-subtle px-3 py-3 w-[172px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => <JobStatusCard key={job.id} job={job} />)}
            </tbody>
          </table>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="px-5 py-3.5 border-t border-token bg-surface-alt/40">
          <Link href="/recruiter/posted-jobs" className="text-caption font-bold text-primary hover:text-primary/80 transition-colors">
            View all jobs →
          </Link>
        </div>
      )}
    </Card>
  );
}
