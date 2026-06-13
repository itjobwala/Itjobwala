import Link from 'next/link';
import type { Application } from '@/features/candidate/applications';
import StatusBadge from '@/src/components/ui/StatusBadge';
import Card from '@/src/components/ui/Card';
import { hashColor, relativeDate } from '@/src/lib/utils/format';

interface Props {
  jobs: Application[];
}

export default function AppliedJobsCard({ jobs }: Props) {
  return (
    <Card overflow>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-extrabold text-heading">Applied jobs</h3>
        {jobs.length > 0 && (
          <Link href="/candidate/jobs" className="text-caption font-semibold text-primary hover:underline">
            Browse more
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-subtle mb-3">You haven't applied to any jobs yet.</p>
          <Link
            href="/candidate/jobs"
            className="inline-block text-sm font-bold text-white bg-primary rounded-lg px-4 py-2.5 hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ color: '#fff' }}
          >
            Find Jobs to Apply
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {jobs.map(job => {
            const logoUrl = job.company_logo || null;
            const logoFallback = (job.company?.[0] || '?').toUpperCase();
            const color = job.company_color_class ?? hashColor(job.company);
            return (
              <Link
                key={job.id}
                href={`/candidate/jobs/${job.job_id}`}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-alt transition-colors"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={job.company}
                    className="w-8 h-8 rounded-lg object-contain bg-surface border border-token shrink-0"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shrink-0 ${color}`}>
                    {logoFallback}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-bold text-heading truncate group-hover:text-primary transition-colors">
                    {job.title}
                  </p>
                  <p className="text-micro text-subtle">{job.company} &middot; {relativeDate(job.applied_at)}</p>
                </div>
                <StatusBadge status={job.status} size="sm" className="shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
