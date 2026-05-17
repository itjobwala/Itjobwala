'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useRecruiterPostedJobDetailQuery,
  useUpdateRecruiterJobMutation,
  useRecruiterApplicantsQuery,
} from '@/src/hooks/useRecruiter';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  draft:  'bg-yellow-50 text-yellow-700',
  closed: 'bg-gray-100 text-gray-500',
};

const APPLICANT_STATUS_STYLES: Record<string, string> = {
  applied:     'bg-blue-50 text-blue-700',
  shortlisted: 'bg-green-50 text-green-700',
  interview:   'bg-amber-50 text-amber-700',
  hired:       'bg-purple-50 text-purple-700',
  rejected:    'bg-red-50 text-red-600',
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return '—';
  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)} LPA`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-[13px] text-gray-700 leading-snug">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[14px] font-bold text-[#0f172a] mb-1">{title}</h3>
      {children}
    </div>
  );
}

function ApplicantInitials({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  return (
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <span className="text-[11px] font-bold text-primary">{initials}</span>
    </div>
  );
}

interface Props {
  jobId: string;
}

export default function RecruiterJobDetailPage({ jobId }: Props) {
  const router = useRouter();
  const { data: job, isLoading, error } = useRecruiterPostedJobDetailQuery(jobId, true);
  const { data: applicantsData } = useRecruiterApplicantsQuery({ jobId }, true);
  const updateMutation = useUpdateRecruiterJobMutation();

  async function handlePublish() {
    if (!job) return;
    await updateMutation.mutateAsync({ jobId: job.id, data: { status: 'active' } });
  }

  async function handleClose() {
    if (!job) return;
    await updateMutation.mutateAsync({ jobId: job.id, data: { status: 'closed' } });
  }

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-12 text-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error instanceof Error ? error.message : 'Job not found'}
        </div>
        <button onClick={() => router.back()} className="mt-4 text-primary font-semibold hover:underline text-[13px]">
          ← Back to Posted Jobs
        </button>
      </div>
    );
  }

  const applicants = applicantsData?.applicants ?? [];

  return (
    <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-8 space-y-6">
      {/* Back + header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-[13px] text-gray-500 hover:text-primary font-medium transition-colors mb-4 flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Posted Jobs
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[24px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
                {job.title}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold capitalize ${STATUS_STYLES[job.status] ?? STATUS_STYLES.closed}`}>
                {job.status}
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mt-1">
              {job.location} · {job.jobType} · {job.workMode}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            {job.status === 'draft' && (
              <button
                onClick={handlePublish}
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {updateMutation.isPending ? 'Publishing…' : 'Publish'}
              </button>
            )}
            {job.status === 'active' && (
              <button
                onClick={handleClose}
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {updateMutation.isPending ? 'Closing…' : 'Close Job'}
              </button>
            )}
            <Link
              href={`/recruiter/posted-jobs/${job.id}/edit`}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Edit
            </Link>
            <Link
              href={`/recruiter/applicants?jobId=${job.id}`}
              className="px-4 py-2 bg-white border border-gray-200 text-primary text-[13px] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              View All Applicants
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Applications', value: job.applicationCount ?? 0 },
          { label: 'Salary', value: formatSalary(job.salaryMin, job.salaryMax) },
          { label: 'Vacancies', value: job.vacancies ?? 1 },
          { label: 'Closes', value: formatDate(job.closesAt) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 font-medium">{label}</p>
            <p className="text-[18px] font-extrabold text-[#0f172a] mt-0.5" style={{ letterSpacing: '-0.5px' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: job content */}
        <div className="space-y-6">
          {/* Meta */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-[15px] font-extrabold text-[#0f172a] mb-4">Job Details</h2>
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div><span className="text-gray-400">Experience</span><p className="font-semibold text-[#0f172a] mt-0.5">{job.experienceLevel}</p></div>
              <div><span className="text-gray-400">Level</span><p className="font-semibold text-[#0f172a] mt-0.5">{job.jobLevel || '—'}</p></div>
              <div><span className="text-gray-400">Posted</span><p className="font-semibold text-[#0f172a] mt-0.5">{formatDate(job.postedDate ?? job.createdAt)}</p></div>
              <div><span className="text-gray-400">Last Updated</span><p className="font-semibold text-[#0f172a] mt-0.5">{formatDate(job.updatedAt)}</p></div>
            </div>

            {/* Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[12px] text-gray-400 font-medium mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-primary/5 text-primary text-[12px] font-semibold rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
            <h2 className="text-[15px] font-extrabold text-[#0f172a]">About the Role</h2>

            {job.description && (
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <Section title="Responsibilities">
                <BulletList items={job.responsibilities} />
              </Section>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <Section title="Requirements">
                <BulletList items={job.requirements} />
              </Section>
            )}

            {job.niceToHave && job.niceToHave.length > 0 && (
              <Section title="Nice to Have">
                <BulletList items={job.niceToHave} />
              </Section>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <Section title="Benefits">
                <BulletList items={job.benefits} />
              </Section>
            )}
          </div>
        </div>

        {/* Right: applicants sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-extrabold text-[#0f172a]">
                Applicants
                {applicants.length > 0 && (
                  <span className="ml-2 text-[12px] font-semibold text-gray-400">({job.applicationCount ?? applicants.length})</span>
                )}
              </h2>
              {applicants.length > 0 && (
                <Link
                  href={`/recruiter/applicants?jobId=${job.id}`}
                  className="text-[12px] font-bold text-primary hover:underline"
                >
                  View all →
                </Link>
              )}
            </div>

            {applicants.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-[28px] mb-2">📨</div>
                <p className="text-[12px] text-gray-400">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applicants.slice(0, 6).map((applicant) => (
                  <Link
                    key={applicant.id}
                    href={`/recruiter/applicants/${applicant.id}`}
                    className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                  >
                    {applicant.profilePhoto ? (
                      <img src={applicant.profilePhoto} alt={applicant.candidateName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    ) : (
                      <ApplicantInitials name={applicant.candidateName} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#0f172a] truncate">{applicant.candidateName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{applicant.candidateEmail}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${APPLICANT_STATUS_STYLES[applicant.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {applicant.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
