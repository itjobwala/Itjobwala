import Link from 'next/link';
import CompanyLogo from '@/src/components/ui/CompanyLogo';
import VerifiedBadge from '@/src/components/ui/VerifiedBadge';
import type { Job } from '../../shared/types';

export default function RecommendedJobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/candidate/jobs/${job.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-surface-alt transition-colors border border-transparent hover:border-token"
    >
      <CompanyLogo
        name={job.company}
        logo={job.companyLogo}
        colorClass={job.companyColorClass}
        className="w-9 h-9 rounded-lg"
        textClassName="text-sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-heading truncate group-hover:text-primary transition-colors">
          {job.title}
        </p>
        <p className="text-caption text-[#474d6a] flex items-center gap-1 flex-wrap">
          <span className="truncate">{job.company}</span>
          {job.companyVerified && <VerifiedBadge />}
          <span>&middot; {job.location}</span>
        </p>
        <p className="text-micro text-[#474d6a] mt-0.5">
          {job.experienceMin === job.experienceMax
            ? `${job.experienceMin} yrs`
            : `${job.experienceMin}–${job.experienceMax} yrs`}
          {job.salaryMin != null && job.salaryMax != null && (
            <> &middot; ₹{Math.round(job.salaryMin / 100000)}–{Math.round(job.salaryMax / 100000)} LPA</>
          )}
        </p>
        {job.jobFitScore != null && (
          <span
            className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: job.jobFitScore >= 70 ? 'rgba(16,185,129,0.12)' : job.jobFitScore >= 45 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.08)',
              color:      job.jobFitScore >= 70 ? '#10b981' : job.jobFitScore >= 45 ? '#f59e0b' : '#ef4444',
            }}
          >
            {job.jobFitScore}% job fit
          </span>
        )}
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" className="shrink-0 group-hover:stroke-primary transition-colors">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
