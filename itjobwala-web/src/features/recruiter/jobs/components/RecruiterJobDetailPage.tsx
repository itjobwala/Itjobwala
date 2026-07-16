'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useRecruiterPostedJobDetailQuery,
  useUpdateRecruiterJobMutation,
  useSubmitJobMutation,
  useRecruiterApplicantsQuery,
  useJobAnalyticsQuery,
} from '@/features/recruiter/hooks';
import StatusBadge from '@/src/components/ui/StatusBadge';
import Avatar from '@/src/components/ui/Avatar';
import Button, { buttonVariants } from '@/src/components/ui/Button';
import { formatSalary as fmtSalary, formatDateShort } from '@/src/lib/utils/format';

function formatDate(dateStr: string | null | undefined): string {
  return formatDateShort(dateStr) || '—';
}

function formatSalary(min?: number, max?: number): string {
  const minLpa = min != null ? min / 100000 : null;
  const maxLpa = max != null ? max / 100000 : null;
  if (minLpa == null && maxLpa == null) return '—';
  return fmtSalary(minLpa, maxLpa);
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-body leading-snug">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function FieldBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-heading mb-1">{title}</h3>
      {children}
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
  const { data: analytics } = useJobAnalyticsQuery(jobId, true);
  const updateMutation = useUpdateRecruiterJobMutation();
  const submitMutation = useSubmitJobMutation();

  async function handleSubmit() {
    if (!job) return;
    await submitMutation.mutateAsync(job.id);
  }

  async function handleClose() {
    if (!job) return;
    await updateMutation.mutateAsync({ jobId: job.id, data: { status: 'closed' } });
  }

  if (isLoading) {
    return (
      <div className="px-5 py-20 text-center">
        <div className="w-8 h-8 border-4 border-token border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-muted">Loading job details…</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="px-6 sm:px-10 py-8">
        <div className="bg-danger-bg border border-danger rounded-xl p-4 text-danger">
          {error instanceof Error ? error.message : 'Job not found'}
        </div>
        <button onClick={() => router.back()} className="mt-4 text-primary font-semibold hover:underline text-sm">
          ← Back to Posted Jobs
        </button>
      </div>
    );
  }

  const applicants = applicantsData?.applicants ?? [];
  const isLive = job.status === 'active' || job.status === 'closed';

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-token">
        <button type="button" onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-body transition-colors mb-4">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-h3 text-heading" style={{ letterSpacing: -0.8 }}>
                {job.title}
              </h3>
              <StatusBadge status={job.status} size="md" />
            </div>
            <p className="text-sm text-muted mt-1">
              {job.location} · {job.jobType} · {job.workMode}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap shrink-0">
            {(job.status === 'draft' || job.status === 'needs_changes') && (
              <Button onClick={handleSubmit} loading={submitMutation.isPending}>
                Submit for Review
              </Button>
            )}
            {job.status === 'active' && (
              <Button variant="secondary" onClick={handleClose} loading={updateMutation.isPending}>
                Close Job
              </Button>
            )}
            <Link
              href={`/recruiter/posted-jobs/${job.id}/edit`}
              className={buttonVariants({ variant: 'secondary' })}
            >
              Edit
            </Link>
            {isLive && (
              <Link
                href={`/recruiter/applicants?jobId=${job.id}`}
                className={buttonVariants({ variant: 'secondary', className: 'text-primary' })}
              >
                View All Applicants
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Moderation banners */}
      {job.status === 'needs_changes' && job.moderationReason && (
        <div className="mx-6 sm:mx-10 mt-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-sm font-bold text-amber-800 mb-1">Action required: changes needed</p>
          <p className="text-sm text-amber-700">{job.moderationReason}</p>
          {job.autoFlags && job.autoFlags.length > 0 && (
            <ul className="mt-2 space-y-1">
              {job.autoFlags.map((f, i) => (
                <li key={i} className="text-caption text-amber-600">• [{f.field}] {f.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {job.status === 'pending' && (
        <div className="mx-6 sm:mx-10 mt-6 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-sm font-bold text-blue-800">Under review</p>
          <p className="text-sm text-blue-600 mt-0.5">Your job listing is awaiting review by our team. We'll notify you once it's approved.</p>
        </div>
      )}
      {job.status === 'removed' && (
        <div className="mx-6 sm:mx-10 mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-bold text-red-800">Listing removed</p>
          {job.moderationReason && <p className="text-sm text-red-600 mt-0.5">{job.moderationReason}</p>}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-6 sm:px-10 py-8 flex flex-col gap-8">

        {/* Overview */}
        <section>
          <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Applications', value: job.applicationCount ?? 0 },
              { label: 'Salary', value: formatSalary(job.salaryMin, job.salaryMax) },
              { label: 'Vacancies', value: job.vacancies ?? 1 },
              { label: 'Closes', value: formatDate(job.closesAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-micro text-subtle font-medium">{label}</p>
                <p className="text-xl font-extrabold text-heading mt-0.5" style={{ letterSpacing: '-0.5px' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {isLive && analytics && (
          <>
            <div className="border-t border-token" />
            <section>
              <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Analytics</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Views',       value: analytics.views.toLocaleString() },
                  { label: 'Conversion Rate',   value: analytics.views > 0 ? `${analytics.conversion_rate}%` : '—' },
                  { label: 'Views (7 days)',    value: analytics.views_last_7d.toLocaleString() },
                  { label: 'Applied (7 days)',  value: analytics.applications_last_7d.toLocaleString() },
                  { label: 'Shortlisted',       value: (analytics.applications_by_status['shortlisted'] ?? 0).toLocaleString() },
                  { label: 'Interviews',        value: (analytics.applications_by_status['interview'] ?? 0).toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-micro text-subtle font-medium">{label}</p>
                    <p className="text-xl font-extrabold text-heading mt-0.5" style={{ letterSpacing: '-0.5px' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="border-t border-token" />

        {/* Job details */}
        <section>
          <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Job details</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted">Location</span><p className="font-semibold text-heading mt-0.5">{job.location || '—'}</p></div>
            <div><span className="text-muted">Work Mode</span><p className="font-semibold text-heading mt-0.5">{job.workMode || '—'}</p></div>
            <div><span className="text-muted">Experience</span><p className="font-semibold text-heading mt-0.5">{job.experienceLevel}</p></div>
            <div><span className="text-muted">Level</span><p className="font-semibold text-heading mt-0.5">{job.jobLevel || '—'}</p></div>
            <div><span className="text-muted">Posted</span><p className="font-semibold text-heading mt-0.5">{formatDate(job.postedDate ?? job.createdAt)}</p></div>
            <div><span className="text-muted">Last Updated</span><p className="font-semibold text-heading mt-0.5">{formatDate(job.updatedAt)}</p></div>
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="mt-5">
              <p className="text-caption text-subtle font-medium mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 bg-primary/5 text-primary text-caption font-semibold rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="border-t border-token" />

        {/* Description */}
        <section>
          <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Description</p>
          <div className="flex flex-col gap-5">
            {job.description && (
              <p className="text-sm text-body leading-relaxed whitespace-pre-line">{job.description}</p>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <FieldBlock title="Responsibilities">
                <BulletList items={job.responsibilities} />
              </FieldBlock>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <FieldBlock title="Requirements">
                <BulletList items={job.requirements} />
              </FieldBlock>
            )}

            {job.niceToHave && job.niceToHave.length > 0 && (
              <FieldBlock title="Nice to Have">
                <BulletList items={job.niceToHave} />
              </FieldBlock>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <FieldBlock title="Benefits">
                <BulletList items={job.benefits} />
              </FieldBlock>
            )}
          </div>
        </section>

        <div className="border-t border-token" />

        {/* Applicants */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <p className="text-caption font-bold text-subtle uppercase tracking-wider">
              Applicants
              {applicants.length > 0 && (
                <span className="ml-2 normal-case text-subtle font-semibold">({job.applicationCount ?? applicants.length})</span>
              )}
            </p>
            {applicants.length > 0 && (
              <Link
                href={`/recruiter/applicants?jobId=${job.id}`}
                className="text-caption font-bold text-primary hover:underline"
              >
                View all →
              </Link>
            )}
          </div>

          {applicants.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-[28px] mb-2">📨</div>
              <p className="text-caption text-subtle">No applications yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {applicants.slice(0, 6).map((applicant) => (
                <Link
                  key={applicant.id}
                  href={`/recruiter/applicants/${applicant.id}`}
                  className="flex items-center gap-3 rounded-xl border border-token hover:bg-surface-alt px-3 py-2.5 transition-colors"
                >
                  <Avatar name={applicant.candidateName} photo={applicant.profilePhoto} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-heading truncate">{applicant.candidateName}</p>
                    <p className="text-micro text-subtle truncate">{applicant.candidateEmail}</p>
                  </div>
                  <StatusBadge status={applicant.status} size="sm" className="shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
