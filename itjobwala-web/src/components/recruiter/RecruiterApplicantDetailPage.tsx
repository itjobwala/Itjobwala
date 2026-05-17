'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  useRecruiterApplicantDetailQuery,
  useShortlistApplicantMutation,
  useRejectApplicantMutation,
  useHireApplicantMutation,
  useUpdateApplicantStatusMutation,
} from '@/src/hooks/useRecruiter';

const STATUS_STYLES: Record<string, string> = {
  applied:     'bg-blue-50 text-blue-700',
  shortlisted: 'bg-green-50 text-green-700',
  interview:   'bg-amber-50 text-amber-700',
  hired:       'bg-purple-50 text-purple-700',
  rejected:    'bg-red-50 text-red-600',
  selected:    'bg-green-50 text-green-700',
  withdrawn:   'bg-gray-100 text-gray-500',
  offer:       'bg-indigo-50 text-indigo-700',
};

const STATUS_LABELS: Record<string, string> = {
  applied:     'Applied',
  shortlisted: 'Shortlisted',
  interview:   'Interview',
  hired:       'Hired',
  rejected:    'Rejected',
  selected:    'Selected',
  withdrawn:   'Withdrawn',
  offer:       'Offer',
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function Avatar({ name, photo }: { name: string; photo?: string | null }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="w-20 h-20 rounded-2xl object-cover shrink-0"
      />
    );
  }
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
      <span className="text-[22px] font-bold text-primary">{initials}</span>
    </div>
  );
}

interface Props {
  applicantId: string;
}

export default function RecruiterApplicantDetailPage({ applicantId }: Props) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const { data: applicant, isLoading, error } = useRecruiterApplicantDetailQuery(applicantId, true);

  const shortlistMutation = useShortlistApplicantMutation();
  const rejectMutation    = useRejectApplicantMutation();
  const hireMutation      = useHireApplicantMutation();
  const statusMutation    = useUpdateApplicantStatusMutation();

  function showSuccess(msg: string) {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  }
  function showError(msg: string) {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(''), 4000);
  }

  async function handleShortlist() {
    setActionLoading(true);
    try {
      await shortlistMutation.mutateAsync(applicantId);
      showSuccess('Applicant shortlisted');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to shortlist');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleInterview() {
    setActionLoading(true);
    try {
      await statusMutation.mutateAsync({ applicantId, data: { status: 'interview' } });
      showSuccess('Moved to interview stage');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to schedule interview');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleHire() {
    setActionLoading(true);
    try {
      await hireMutation.mutateAsync(applicantId);
      showSuccess('Applicant hired');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to hire');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    setActionLoading(true);
    try {
      await rejectMutation.mutateAsync(applicantId);
      showSuccess('Applicant rejected');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-12 text-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500">Loading applicant details...</p>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error instanceof Error ? error.message : 'Applicant not found'}
        </div>
        <button onClick={() => router.back()} className="mt-4 text-primary font-semibold hover:underline text-[13px]">
          ← Back to Applicants
        </button>
      </div>
    );
  }

  const finalStatuses = new Set(['hired', 'rejected', 'withdrawn', 'selected']);
  const isFinal = finalStatuses.has(applicant.status);

  return (
    <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-[13px] text-gray-500 hover:text-primary font-medium transition-colors flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Applicants
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <Avatar name={applicant.candidateName} photo={applicant.profilePhoto} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-[22px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.4px' }}>
                  {applicant.candidateName}
                </h1>
                {applicant.profile?.title && (
                  <p className="text-[13px] text-gray-500 mt-0.5">{applicant.profile.title}</p>
                )}
                {applicant.profile?.location && (
                  <p className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {applicant.profile.location}
                  </p>
                )}
              </div>
              <span className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold ${STATUS_STYLES[applicant.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[applicant.status] ?? applicant.status}
              </span>
            </div>

            {/* Contact row */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {applicant.candidateEmail}
              </span>
              {applicant.profile?.phone && (
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {applicant.profile.phone}
                </span>
              )}
              {applicant.profile?.linkedin && (
                <a
                  href={applicant.profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  LinkedIn
                </a>
              )}
              {applicant.profile?.github && (
                <a
                  href={applicant.profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  GitHub
                </a>
              )}
              {applicant.resume && (
                <a
                  href={applicant.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  View Resume
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Left column: main content */}
        <div className="sm:col-span-2 space-y-5">

          {/* About */}
          {applicant.profile?.about && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-[14px] font-bold text-[#0f172a] mb-3">About</h2>
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {applicant.profile.about}
              </p>
            </div>
          )}

          {/* Cover letter */}
          {applicant.coverLetter && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-[14px] font-bold text-[#0f172a] mb-3">Cover Letter</h2>
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {applicant.coverLetter}
              </p>
            </div>
          )}

          {/* Skills */}
          {applicant.skills && applicant.skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-[14px] font-bold text-[#0f172a] mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {applicant.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 text-[12px] font-medium rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: meta + actions */}
        <div className="space-y-5">

          {/* Application info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-[13px] font-bold text-[#0f172a] mb-4">Application Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Applied For</p>
                <Link
                  href={`/recruiter/posted-jobs/${applicant.jobId}`}
                  className="text-[13px] font-semibold text-primary hover:underline"
                >
                  {applicant.jobTitle}
                </Link>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Applied On</p>
                <p className="text-[13px] text-gray-700">{formatDate(applicant.appliedDate)}</p>
              </div>
              {(applicant.experience ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Experience</p>
                  <p className="text-[13px] text-gray-700">
                    {applicant.experience} yr{applicant.experience !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Status</p>
                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLES[applicant.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[applicant.status] ?? applicant.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isFinal && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-[13px] font-bold text-[#0f172a] mb-4">Actions</h2>
              <div className="flex flex-col gap-2">
                {applicant.status === 'applied' && (
                  <button
                    onClick={handleShortlist}
                    disabled={actionLoading}
                    className="w-full px-4 py-2.5 text-[13px] font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Loading…' : 'Shortlist'}
                  </button>
                )}
                {applicant.status === 'shortlisted' && (
                  <button
                    onClick={handleInterview}
                    disabled={actionLoading}
                    className="w-full px-4 py-2.5 text-[13px] font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Loading…' : 'Schedule Interview'}
                  </button>
                )}
                {applicant.status === 'interview' && (
                  <button
                    onClick={handleHire}
                    disabled={actionLoading}
                    className="w-full px-4 py-2.5 text-[13px] font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Loading…' : 'Hire'}
                  </button>
                )}
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="w-full px-4 py-2.5 text-[13px] font-semibold bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Loading…' : 'Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 ${
          successToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-green-600 text-white text-[13px] font-semibold rounded-2xl px-5 py-3.5 shadow-2xl">
          <span className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M2 6l3 3 5-5" />
            </svg>
          </span>
          {successToast}
        </div>
      </div>

      {/* Error toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 ${
          errorToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-red-600 text-white text-[13px] font-semibold rounded-2xl px-5 py-3.5 shadow-2xl">
          <span className="w-5 h-5 rounded-full bg-red-700 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </span>
          {errorToast}
        </div>
      </div>
    </div>
  );
}
