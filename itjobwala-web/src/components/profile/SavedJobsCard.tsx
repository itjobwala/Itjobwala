'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SavedJob } from '@/src/types/applications';
import Card from '@/src/components/ui/Card';

const COLOR_CLASSES = [
  'bg-blue-600', 'bg-green-600', 'bg-indigo-600', 'bg-violet-600',
  'bg-orange-500', 'bg-teal-600', 'bg-red-600', 'bg-pink-600',
];
function hashColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return COLOR_CLASSES[h % COLOR_CLASSES.length];
}

function formatLpa(val: number): string {
  return val % 1 === 0 ? String(Math.round(val)) : val.toFixed(1);
}

function salaryLabel(min?: number, max?: number): string {
  const minLpa = (min ?? 0) / 100000;
  const maxLpa = (max ?? 0) / 100000;
  if (minLpa === 0 && maxLpa === 0) return '0 LPA';
  return `${formatLpa(minLpa)}–${formatLpa(maxLpa)} LPA`;
}

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
        <h3 className="text-[14px] font-extrabold text-[#0f172a]">Saved jobs</h3>
        <span className="text-[12px] text-gray-400">{total ?? visible.length} saved</span>
      </div>

      {visible.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-gray-400 mb-3">You haven't saved any jobs yet.</p>
          <Link
            href="/jobs"
            className="inline-block text-[13px] font-bold text-white bg-primary rounded-lg px-4 py-2.5 hover:opacity-90 active:opacity-80 transition-opacity"
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
              <div key={job.id} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={job.company}
                    className="w-8 h-8 rounded-lg object-contain bg-white border border-gray-100 shrink-0"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shrink-0 ${color}`}>
                    {logoFallback}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/jobs/${job.job_id}`} className="text-[12px] font-bold text-[#0f172a] truncate block hover:text-primary transition-colors">
                    {job.title}
                  </Link>
                  <p className="text-[11px] text-gray-400">
                    {job.company}
                    {` · ₹${salaryLabel(job.salary_min, job.salary_max)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/jobs/${job.job_id}`}
                    className="text-[11px] font-bold text-primary bg-primary/10 rounded-lg px-2 py-1 hover:bg-primary/20 transition-colors"
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
          href="/saved-jobs"
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-gray-100 text-[12px] font-bold text-primary hover:bg-primary/5 transition-colors"
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
