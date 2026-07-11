import type { JobDetail } from '../../shared/types';
import Card from '@/src/components/ui/Card';

interface Props {
  job: JobDetail;
}

export default function RecruiterActivityCard({ job }: Props) {
  const metrics = job.metrics || { views: 0, applicants: job.applicants, shortlisted: 0, interviews: 0 };

  return (
    <Card overflow>
      <h3 className="text-base font-extrabold text-heading mb-4">Recruiter activity</h3>

      {/* Recruiter info */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-token">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
          <span className="text-base font-extrabold text-primary">
            {job.recruiterName.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-heading">{job.recruiterName}</p>
          <p className="text-caption text-[#474d6a]">{job.recruiterTitle}</p>
        </div>
      </div>

      {/* Activity stats */}
      <div className="flex flex-col gap-3">
        {/* Hiring status */}
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${job.isActivelyHiring ? 'bg-success' : 'bg-yellow-400'}`} />
          <span className="text-sm font-semibold text-body">
            {job.isActivelyHiring ? 'Actively hiring' : 'Hiring in progress'}
          </span>
        </div>

        {/* Response time */}
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-[#474d6a]">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span className="text-sm text-[#474d6a]">
            Typically responds in <span className="font-semibold text-heading">{job.recruiterResponseDays} day{job.recruiterResponseDays !== 1 ? 's' : ''}</span>
          </span>
        </div>

        {/* Views */}
        {metrics.views > 0 && (
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-[#474d6a]">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-sm text-[#474d6a]">
              <span className="font-semibold text-heading">{metrics.views}</span> views
            </span>
          </div>
        )}

        {/* Applicants */}
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-[#474d6a]">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-sm text-[#474d6a]">
            <span className="font-semibold text-heading">{metrics.applicants}</span> applied
          </span>
        </div>

        {/* Shortlisted */}
        {metrics.shortlisted > 0 && (
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-[#474d6a]">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm text-[#474d6a]">
              <span className="font-semibold text-heading">{metrics.shortlisted}</span> shortlisted
            </span>
          </div>
        )}

        {/* Interviews */}
        {metrics.interviews > 0 && (
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-[#474d6a]">
              <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
            </svg>
            <span className="text-sm text-[#474d6a]">
              <span className="font-semibold text-heading">{metrics.interviews}</span> interviews scheduled
            </span>
          </div>
        )}

        {/* Posted */}
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-[#474d6a]">
            <rect x="3" y="4" width="20" height="20" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="text-sm text-[#474d6a]">
            Posted{' '}
            <span className="font-semibold text-heading">
              {job.postedDaysAgo === 0 ? 'today' : `${job.postedDaysAgo}d ago`}
            </span>
          </span>
        </div>
      </div>

      {/* Tip */}
      {job.isActivelyHiring && (
        <div className="mt-4 bg-success-bg rounded-xl px-3.5 py-3">
          <p className="text-caption text-success font-medium">
            Apply now — this recruiter is reviewing applications daily.
          </p>
        </div>
      )}
    </Card>
  );
}
