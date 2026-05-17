import Link from 'next/link';
import CompanyLogo from './CompanyLogo';
import type { Job } from './types';

export default function RecommendedJobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
    >
      <CompanyLogo
        name={job.company}
        logo={job.companyLogo}
        colorClass={job.companyColorClass}
        className="w-9 h-9 rounded-lg"
        textClassName="text-sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#0f172a] truncate group-hover:text-primary transition-colors">
          {job.title}
        </p>
        <p className="text-[12px] text-gray-400 truncate">
          {job.company} &middot; {job.location}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {job.experienceMin}–{job.experienceMax} yrs &middot; ₹{job.salaryMin}–{job.salaryMax} LPA
        </p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" className="shrink-0 group-hover:stroke-primary transition-colors">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
