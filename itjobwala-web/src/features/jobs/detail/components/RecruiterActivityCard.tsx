import type { JobDetail } from '../../shared/types';
import Card from '@/src/components/ui/Card';

interface Props {
  job: JobDetail;
}

export default function RecruiterActivityCard({ job }: Props) {
  const metrics = job.metrics || { views: 0, applicants: job.applicants, shortlisted: 0, interviews: 0 };

  return (
    <Card overflow>
      <h3 className="text-[14px] font-extrabold text-[#0f172a] mb-4">Recruiter activity</h3>

      {/* Recruiter info */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
          <span className="text-[14px] font-extrabold text-primary">
            {job.recruiterName.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#0f172a]">{job.recruiterName}</p>
          <p className="text-[12px] text-gray-400">{job.recruiterTitle}</p>
        </div>
      </div>

      {/* Activity stats */}
      <div className="flex flex-col gap-3">
        {/* Hiring status */}
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${job.isActivelyHiring ? 'bg-green-500' : 'bg-yellow-400'}`} />
          <span className="text-[13px] font-semibold text-gray-700">
            {job.isActivelyHiring ? 'Actively hiring' : 'Hiring in progress'}
          </span>
        </div>

        {/* Response time */}
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" className="shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span className="text-[13px] text-gray-500">
            Typically responds in <span className="font-semibold text-[#0f172a]">{job.recruiterResponseDays} day{job.recruiterResponseDays !== 1 ? 's' : ''}</span>
          </span>
        </div>

        {/* Views */}
        {metrics.views > 0 && (
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" className="shrink-0">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-[13px] text-gray-500">
              <span className="font-semibold text-[#0f172a]">{metrics.views}</span> views
            </span>
          </div>
        )}

        {/* Applicants */}
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" className="shrink-0">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-[13px] text-gray-500">
            <span className="font-semibold text-[#0f172a]">{metrics.applicants}</span> applied
          </span>
        </div>

        {/* Shortlisted */}
        {metrics.shortlisted > 0 && (
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" className="shrink-0">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[13px] text-gray-500">
              <span className="font-semibold text-[#0f172a]">{metrics.shortlisted}</span> shortlisted
            </span>
          </div>
        )}

        {/* Interviews */}
        {metrics.interviews > 0 && (
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" className="shrink-0">
              <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
            </svg>
            <span className="text-[13px] text-gray-500">
              <span className="font-semibold text-[#0f172a]">{metrics.interviews}</span> interviews scheduled
            </span>
          </div>
        )}

        {/* Posted */}
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" className="shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="text-[13px] text-gray-500">
            Posted{' '}
            <span className="font-semibold text-[#0f172a]">
              {job.postedDaysAgo === 0 ? 'today' : `${job.postedDaysAgo}d ago`}
            </span>
          </span>
        </div>
      </div>

      {/* Tip */}
      {job.isActivelyHiring && (
        <div className="mt-4 bg-green-50 rounded-xl px-3.5 py-3">
          <p className="text-[12px] text-green-700 font-medium">
            Apply now — this recruiter is reviewing applications daily.
          </p>
        </div>
      )}
    </Card>
  );
}
