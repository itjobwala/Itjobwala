import Link from 'next/link';
import type { Application } from '@/src/types/applications';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  applied:     { label: 'Applied',     className: 'bg-blue-50 text-blue-700'     },
  shortlisted: { label: 'Shortlisted', className: 'bg-purple-50 text-purple-700' },
  interview:   { label: 'Interview',   className: 'bg-yellow-50 text-yellow-700' },
  offer:       { label: 'Offer',       className: 'bg-emerald-50 text-emerald-700' },
  hired:       { label: 'Hired',       className: 'bg-green-50 text-green-700'   },
  rejected:    { label: 'Rejected',    className: 'bg-red-50 text-red-500'       },
  withdrawn:   { label: 'Withdrawn',   className: 'bg-gray-50 text-gray-500'     },
};

const COLOR_CLASSES = [
  'bg-blue-600', 'bg-green-600', 'bg-indigo-600', 'bg-violet-600',
  'bg-orange-500', 'bg-teal-600', 'bg-red-600', 'bg-pink-600',
];
function hashColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return COLOR_CLASSES[h % COLOR_CLASSES.length];
}

function relativeDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 7)  return `${diff} days ago`;
  if (diff < 14) return '1 week ago';
  return `${Math.floor(diff / 7)} weeks ago`;
}

interface Props {
  jobs: Application[];
}

export default function AppliedJobsCard({ jobs }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-extrabold text-[#0f172a]">Applied jobs</h3>
        {jobs.length > 0 && (
          <Link href="/jobs" className="text-[12px] font-semibold text-primary hover:underline">
            Browse more
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-gray-400 mb-3">You haven't applied to any jobs yet.</p>
          <Link
            href="/jobs"
            className="inline-block text-[13px] font-bold text-white bg-primary rounded-lg px-4 py-2.5 hover:brightness-110 transition-all"
          >
            Find Jobs to Apply
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {jobs.map(job => {
            const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.applied;
            const logoUrl = job.company_logo || null;
            const logoFallback = (job.company?.[0] || '?').toUpperCase();
            const color = job.company_color_class ?? hashColor(job.company);
            return (
              <Link
                key={job.id}
                href={`/jobs/${job.job_id}`}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
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
                  <p className="text-[12px] font-bold text-[#0f172a] truncate group-hover:text-primary transition-colors">
                    {job.title}
                  </p>
                  <p className="text-[11px] text-gray-400">{job.company} &middot; {relativeDate(job.applied_at)}</p>
                </div>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0 ${cfg.className}`}>
                  {cfg.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
