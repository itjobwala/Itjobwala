'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useRecruiterApplicantsQuery,
  useShortlistApplicantMutation,
  useRejectApplicantMutation,
  useHireApplicantMutation,
  useUpdateApplicantStatusMutation,
} from '@/src/hooks/useRecruiter';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import StatusBadge from '@/src/components/ui/StatusBadge';
import EmptyState from '@/src/components/ui/EmptyState';
import Avatar from '@/src/components/ui/Avatar';
import type { RecruiterApplicant } from '@/src/types/recruiter';
import RecruiterShell from './RecruiterShell';

type ApplicantStatus = RecruiterApplicant['status'];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'applied',     label: 'Applied' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview',   label: 'Interview' },
  { value: 'hired',       label: 'Hired' },
  { value: 'rejected',    label: 'Rejected' },
];



function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

interface ActionButtonsProps {
  applicant: RecruiterApplicant;
  loadingId: string | null;
  onShortlist: (id: string) => void;
  onInterview: (id: string) => void;
  onHire: (id: string) => void;
  onReject: (id: string) => void;
}

function ActionButtons({ applicant, loadingId, onShortlist, onInterview, onHire, onReject }: ActionButtonsProps) {
  const isLoading = loadingId === applicant.id;
  const { status } = applicant;

  const finalStatuses = new Set(['hired', 'rejected', 'withdrawn', 'selected']);
  if (finalStatuses.has(status)) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
      {status === 'applied' && (
        <button
          onClick={() => onShortlist(applicant.id)}
          disabled={isLoading}
          className="px-3 py-1.5 text-[12px] font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Loading…' : 'Shortlist'}
        </button>
      )}
      {status === 'shortlisted' && (
        <button
          onClick={() => onInterview(applicant.id)}
          disabled={isLoading}
          className="px-3 py-1.5 text-[12px] font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Loading…' : 'Schedule Interview'}
        </button>
      )}
      {status === 'interview' && (
        <button
          onClick={() => onHire(applicant.id)}
          disabled={isLoading}
          className="px-3 py-1.5 text-[12px] font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Loading…' : 'Hire'}
        </button>
      )}
      <button
        onClick={() => onReject(applicant.id)}
        disabled={isLoading}
        className="px-3 py-1.5 text-[12px] font-semibold bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Loading…' : 'Reject'}
      </button>
    </div>
  );
}

export default function RecruiterApplicantsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast, show: showToast } = useToast();

  const filters = filterStatus === 'all' ? {} : { status: filterStatus as ApplicantStatus };
  const { data, isLoading, error } = useRecruiterApplicantsQuery(filters, true);

  const shortlistMutation = useShortlistApplicantMutation();
  const rejectMutation    = useRejectApplicantMutation();
  const hireMutation      = useHireApplicantMutation();
  const statusMutation    = useUpdateApplicantStatusMutation();

  function showSuccess(msg: string) { showToast(msg, 'success'); }
  function showError(msg: string)   { showToast(msg, 'error');   }

  async function handleShortlist(id: string) {
    setLoadingId(id);
    try {
      await shortlistMutation.mutateAsync(id);
      showSuccess('Applicant shortlisted');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to shortlist');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleInterview(id: string) {
    setLoadingId(id);
    try {
      await statusMutation.mutateAsync({ applicantId: id, data: { status: 'interview' } });
      showSuccess('Interview scheduled');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to schedule interview');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleHire(id: string) {
    setLoadingId(id);
    try {
      await hireMutation.mutateAsync(id);
      showSuccess('Applicant hired');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to hire');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    try {
      await rejectMutation.mutateAsync(id);
      showSuccess('Applicant rejected');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to reject');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <RecruiterShell>
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
          <h1 className="text-[28px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
            Applicants
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">
            Review and manage applications for your job postings
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className={`px-4 py-2 rounded-lg font-medium text-[13px] transition-colors ${
                filterStatus === value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-gray-500">Loading applicants...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error instanceof Error ? error.message : 'Failed to load applicants'}
          </div>
        ) : !data || data.applicants.length === 0 ? (
          <EmptyState emoji="📨" title="No applicants yet" description="Applications for your jobs will appear here" />
        ) : (
          <div className="space-y-3">
            {data.applicants.map((applicant) => (
              <div key={applicant.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar name={applicant.candidateName} photo={applicant.profilePhoto} size="lg" />

                  <div className="flex-1 min-w-0">
                    {/* Top row: name + status + view link */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/recruiter/applicants/${applicant.id}`}
                          className="text-[14px] font-semibold text-[#0f172a] hover:text-primary transition-colors"
                        >
                          {applicant.candidateName}
                        </Link>
                        {applicant.profile?.title && (
                          <p className="text-[12px] text-gray-500 mt-0.5">{applicant.profile.title}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={applicant.status} />
                        <Link
                          href={`/recruiter/applicants/${applicant.id}`}
                          className="text-[12px] font-semibold text-primary hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-gray-500">
                      <span>{applicant.candidateEmail}</span>
                      <span>Applied for: <span className="font-medium text-gray-700">{applicant.jobTitle || 'Unknown Position'}</span></span>
                      {applicant.experience !== undefined && applicant.experience > 0 && (
                        <span>{applicant.experience} yr{applicant.experience !== 1 ? 's' : ''} experience</span>
                      )}
                      <span className="text-gray-400">{formatDate(applicant.appliedDate)}</span>
                    </div>

                    {/* Skills */}
                    {applicant.skills && applicant.skills.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {applicant.skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-md">
                            {skill}
                          </span>
                        ))}
                        {applicant.skills.length > 5 && (
                          <span className="px-2 py-0.5 text-gray-400 text-[11px]">+{applicant.skills.length - 5} more</span>
                        )}
                      </div>
                    )}

                    {/* Resume link */}
                    {applicant.resume && (
                      <a
                        href={applicant.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-[12px] text-primary font-medium hover:underline"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        View Resume
                      </a>
                    )}

                    {/* Action buttons */}
                    <ActionButtons
                      applicant={applicant}
                      loadingId={loadingId}
                      onShortlist={handleShortlist}
                      onInterview={handleInterview}
                      onHire={handleHire}
                      onReject={handleReject}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
    </RecruiterShell>
  );
}
