import Link from 'next/link';
import CompanyLogo from '@/src/components/ui/CompanyLogo';
import VerifiedBadge from '@/src/components/ui/VerifiedBadge';
import JobDescription from '@/src/features/jobs/detail/components/JobDescription';
import type { JobDetail } from '@/src/features/jobs/shared/types';
import { salaryLabel, hashColor } from '@/src/lib/utils/format';

interface Props {
  job: JobDetail;
  jobId: string;
}

const WORK_MODE_LABEL: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};
const WORK_MODE_CLASS: Record<string, string> = {
  remote: 'bg-green-50 text-green-700',
  hybrid: 'bg-blue-50 text-blue-700',
  onsite: 'bg-gray-100 text-gray-600',
};
const JOB_TYPE_LABEL: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

export default function PublicJobDetail({ job, jobId }: Props) {
  const colorClass = job.companyColorClass || hashColor(job.company);
  const loginUrl = `/auth/login?next=/candidate/jobs/${jobId}&role=candidate`;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-[17px] tracking-tight">
            <span className="text-primary">it</span>
            <span className="text-[#0f172a]">Jobwala</span>
          </Link>
          <Link
            href={loginUrl}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <CompanyLogo
                name={job.company}
                logo={job.companyLogo}
                colorClass={colorClass}
                className="w-16 h-16 rounded-2xl"
                textClassName="text-2xl"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {job.isNew && (
                    <span className="text-[11px] font-bold rounded-full py-[2px] px-2.5 bg-green-50 text-green-700">New</span>
                  )}
                  {job.isHot && (
                    <span className="text-[11px] font-bold rounded-full py-[2px] px-2.5 bg-red-50 text-red-500">Hot</span>
                  )}
                </div>

                <h1
                  className="text-[22px] sm:text-[26px] font-extrabold text-[#0f172a] leading-snug mb-1"
                  style={{ letterSpacing: '-0.5px' }}
                >
                  {job.title}
                </h1>

                <p className="text-[15px] font-semibold text-gray-500 mb-4 flex items-center gap-2 flex-wrap">
                  <span>{job.company}</span>
                  {job.companyVerified && <VerifiedBadge />}
                  <span>&middot; {job.location}</span>
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {WORK_MODE_LABEL[job.workMode] && (
                    <span className={`text-[12px] font-semibold rounded-full py-1 px-3 ${WORK_MODE_CLASS[job.workMode] ?? 'bg-gray-100 text-gray-600'}`}>
                      {WORK_MODE_LABEL[job.workMode]}
                    </span>
                  )}
                  {JOB_TYPE_LABEL[job.jobType] && (
                    <span className="text-[12px] font-semibold rounded-full py-1 px-3 bg-gray-100 text-gray-600">
                      {JOB_TYPE_LABEL[job.jobType]}
                    </span>
                  )}
                  <span className="text-[12px] font-semibold rounded-full py-1 px-3 bg-primary/10 text-primary">
                    {job.experienceMin === 0 && job.experienceMax === 0
                      ? '0 yrs'
                      : `${job.experienceMin}–${job.experienceMax} yrs`}
                  </span>
                  <span className="text-[12px] font-semibold rounded-full py-1 px-3 bg-emerald-50 text-emerald-700">
                    ₹{salaryLabel(job.salaryLpaMin, job.salaryLpaMax)}
                  </span>
                </div>

                <Link
                  href={loginUrl}
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold text-[14px] rounded-xl px-6 py-3 hover:brightness-110 transition-all"
                >
                  Sign in to apply →
                </Link>
              </div>
            </div>
          </div>

          <JobDescription job={job} />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-[13px] font-bold text-[#0f172a] mb-1">Ready to apply?</p>
            <p className="text-[12px] text-gray-500 mb-4">
              Sign in or create a free account to apply in seconds.
            </p>
            <Link
              href={loginUrl}
              className="block w-full text-center bg-primary text-white font-bold text-[13px] rounded-xl px-4 py-2.5 hover:brightness-110 transition-all"
            >
              Sign in to apply
            </Link>
            <Link
              href="/auth/register?role=candidate"
              className="block w-full text-center mt-2 text-primary font-semibold text-[13px] rounded-xl px-4 py-2.5 border border-primary/30 hover:bg-primary/5 transition-all"
            >
              Create account
            </Link>
          </div>

          {job.skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[13px] font-bold text-[#0f172a] mb-3">Required skills</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map(s => (
                  <span
                    key={s}
                    className="text-[12px] font-semibold rounded-full py-[3px] px-3 bg-gray-100 text-gray-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
