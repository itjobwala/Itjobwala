'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SavedJob } from '@/features/candidate/applications';
import Card from '@/src/components/ui/Card';
import { hashColor, formatSalary } from '@/src/lib/utils/format';

interface Props {
  jobs: SavedJob[];
  total?: number;
  hasMore?: boolean;
  onUnsave?: (jobId: string) => void;
}

export default function SavedJobsCard({ jobs: initialJobs, total, hasMore, onUnsave }: Props) {
  const [localIds, setLocalIds] = useState<Set<string>>(new Set());

  const visible = initialJobs.filter(j => !localIds.has(j.id));

  function handleUnsave(job: SavedJob) {
    setLocalIds(s => new Set(s).add(job.id));
    onUnsave?.(job.job_id);
  }

  return (
    <Card overflow>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-extrabold text-heading">Saved jobs</h3>
        <span className="text-caption text-subtle">{total ?? visible.length} saved</span>
      </div>

      {visible.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-subtle mb-3">You haven't saved any jobs yet.</p>
          <Link
            href="/candidate/jobs"
            className="inline-block text-sm font-bold text-white bg-primary rounded-lg px-4 py-2.5 hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ color: '#fff' }}
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {visible.map(job => {
            const logoUrl = job.company_logo || null;
            const logoFallback = (job.company?.[0] || '?').toUpperCase();
            const color = job.company_color_class ?? hashColor(job.company);
            return (
              <div key={job.id} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-alt transition-colors">
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
                  <Link href={`/candidate/jobs/${job.job_id}`} className="text-caption font-bold text-heading truncate block hover:text-primary transition-colors">
                    {job.title}
                  </Link>
                  <p className="text-micro text-subtle">
                    {job.company}
                    {` · ${formatSalary(job.salary_min != null ? job.salary_min / 100000 : null, job.salary_max != null ? job.salary_max / 100000 : null, true)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/candidate/jobs/${job.job_id}`}
                    className="text-micro font-bold text-primary bg-primary/10 rounded-lg px-2 py-1 hover:bg-primary/20 transition-colors"
                  >
                    Apply
                  </Link>
                  <button
                    onClick={() => handleUnsave(job)}
                    className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <Link
          href="/candidate/saved-jobs"
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-token text-caption font-bold text-primary hover:bg-primary/5 transition-colors"
        >
          View all {total} saved jobs
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </Card>
  );
}
