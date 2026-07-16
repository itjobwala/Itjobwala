'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Button from '@/src/components/ui/Button';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import StatusBadge from '@/src/components/ui/StatusBadge';
import Avatar from '@/src/components/ui/Avatar';
import ConfirmationDialog from '@/src/components/common/ConfirmationDialog';
import {
  useRecruiterApplicantDetailQuery,
  useShortlistApplicantMutation,
  useRejectApplicantMutation,
  useHireApplicantMutation,
  useUpdateApplicantStatusMutation,
  useCancelInterviewMutation,
} from '@/features/recruiter/hooks';
import { useGetOrCreateConversationMutation } from '@/features/chat';
import RecruiterIntelligencePanel from './RecruiterIntelligencePanel';
import ScheduleInterviewModal from '@/features/recruiter/interviews/components/ScheduleInterviewModal';


function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}


interface Props {
  applicantId: string;
}

export default function RecruiterApplicantDetailPage({ applicantId }: Props) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { toast, show: showToast } = useToast();

  const { data: applicant, isLoading, error } = useRecruiterApplicantDetailQuery(applicantId, true);

  const shortlistMutation  = useShortlistApplicantMutation();
  const rejectMutation     = useRejectApplicantMutation();
  const hireMutation       = useHireApplicantMutation();
  const statusMutation     = useUpdateApplicantStatusMutation();
  const cancelMutation     = useCancelInterviewMutation();
  const messageMutation    = useGetOrCreateConversationMutation();

  function showSuccess(msg: string) { showToast(msg, 'success'); }
  function showError(msg: string)   { showToast(msg, 'error');   }

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

  async function handleMoveToInterview() {
    setActionLoading(true);
    try {
      await statusMutation.mutateAsync({ applicantId, data: { status: 'interview' } });
      showSuccess('Moved to interview stage');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmCancelInterview() {
    if (!applicant?.interview?.id) return;
    setCancelling(true);
    try {
      await cancelMutation.mutateAsync(applicant.interview.id);
      showSuccess('Interview cancelled');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to cancel interview');
    } finally {
      setCancelling(false);
      setCancelConfirmOpen(false);
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

  async function handleMessage() {
    if (!applicant) return;
    // Strip "candidate_" prefix to get numeric user ID
    const numericId = parseInt(applicant.candidateId.replace('candidate_', ''), 10);
    if (!numericId) return;
    try {
      const { conversation_id } = await messageMutation.mutateAsync({ otherId: numericId });
      router.push(`/recruiter/chat?conv=${conversation_id}`);
    } catch {
      showError('Could not open conversation');
    }
  }

  if (isLoading) {
    return (
      <div className="px-5 py-20 text-center">
        <div className="w-8 h-8 border-4 border-token border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-muted">Loading applicant details…</p>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="px-6 sm:px-10 py-8">
        <div className="bg-danger-bg border border-danger rounded-xl p-4 text-danger">
          {error instanceof Error ? error.message : 'Applicant not found'}
        </div>
        <button onClick={() => router.back()} className="mt-4 text-primary font-semibold hover:underline text-sm">
          ← Back to Applicants
        </button>
      </div>
    );
  }

  const finalStatuses = new Set(['hired', 'rejected', 'withdrawn']);
  const isFinal = finalStatuses.has(applicant.status);

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

        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <Avatar name={applicant.candidateName} photo={applicant.profilePhoto} size="xl" />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-h1 text-heading" style={{ letterSpacing: -0.8 }}>
                  {applicant.candidateName}
                </h1>
                {applicant.profile?.title && (
                  <p className="text-sm text-muted mt-0.5">{applicant.profile.title}</p>
                )}
                {applicant.profile?.location && (
                  <p className="text-caption text-subtle mt-0.5 flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {applicant.profile.location}
                  </p>
                )}
              </div>
              <StatusBadge status={applicant.status} size="lg" className="shrink-0" />
            </div>

            {/* Contact row */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-muted">
              <span className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {applicant.candidateEmail}
              </span>
              {applicant.profile?.phone && (
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  View Resume
                </a>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex gap-2 flex-wrap">
              <Button
                variant="primary"
                rounded="full"
                disabled={messageMutation.isPending}
                loading={messageMutation.isPending}
                leftIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
                onClick={handleMessage}
              >
                Message Candidate
              </Button>

              {!isFinal && (
                <>
                  {applicant.status === 'applied' && (
                    <button
                      onClick={handleShortlist}
                      disabled={actionLoading}
                      className="px-4 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading ? 'Loading…' : 'Shortlist'}
                    </button>
                  )}
                  {applicant.status === 'shortlisted' && (
                    <button
                      onClick={handleMoveToInterview}
                      disabled={actionLoading}
                      className="px-4 py-2.5 text-sm font-semibold bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading ? 'Loading…' : 'Move to Interview Stage'}
                    </button>
                  )}
                  {applicant.status === 'interview' && (
                    <>
                      <button
                        onClick={() => setScheduleOpen(true)}
                        className="px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      >
                        {applicant.interview?.scheduled_at ? 'Reschedule Interview' : 'Schedule Interview'}
                      </button>
                      {applicant.interview?.id && (
                        <button
                          onClick={() => setCancelConfirmOpen(true)}
                          className="px-4 py-2.5 text-sm font-semibold bg-surface text-orange-600 border border-orange-200 rounded-full hover:bg-orange-50 transition-colors"
                        >
                          Cancel Interview
                        </button>
                      )}
                      <button
                        onClick={handleHire}
                        disabled={actionLoading}
                        className="px-4 py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        {actionLoading ? 'Loading…' : 'Hire'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="px-4 py-2.5 text-sm font-semibold bg-surface text-danger border border-danger rounded-full hover:bg-danger-bg disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Loading…' : 'Reject'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 sm:px-10 py-8 flex flex-col gap-8">

        {/* Application */}
        <section>
          <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Application</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted">Applied For</span>
              <Link
                href={`/recruiter/posted-jobs/${applicant.jobId}`}
                className="block font-semibold text-primary hover:underline mt-0.5 truncate"
              >
                {applicant.jobTitle}
              </Link>
            </div>
            <div>
              <span className="text-muted">Applied On</span>
              <p className="font-semibold text-heading mt-0.5">{formatDate(applicant.appliedDate)}</p>
            </div>
            {(applicant.experience ?? 0) > 0 && (
              <div>
                <span className="text-muted">Experience</span>
                <p className="font-semibold text-heading mt-0.5">
                  {applicant.experience} yr{applicant.experience !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            <div>
              <span className="text-muted">Status</span>
              <div className="mt-0.5"><StatusBadge status={applicant.status} /></div>
            </div>
          </div>
        </section>

        {(applicant.profile?.about || applicant.coverLetter || (applicant.skills && applicant.skills.length > 0)) && (
          <div className="border-t border-token" />
        )}

        {/* About */}
        {applicant.profile?.about && (
          <section>
            <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">About</p>
            <p className="text-sm text-body leading-relaxed whitespace-pre-wrap">
              {applicant.profile.about}
            </p>
          </section>
        )}

        {applicant.profile?.about && applicant.coverLetter && <div className="border-t border-token" />}

        {/* Cover letter */}
        {applicant.coverLetter && (
          <section>
            <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Cover Letter</p>
            <p className="text-sm text-body leading-relaxed whitespace-pre-wrap">
              {applicant.coverLetter}
            </p>
          </section>
        )}

        {(applicant.profile?.about || applicant.coverLetter) && applicant.skills && applicant.skills.length > 0 && (
          <div className="border-t border-token" />
        )}

        {/* Skills */}
        {applicant.skills && applicant.skills.length > 0 && (
          <section>
            <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Skills</p>
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-surface-hover text-body text-caption font-medium rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-token" />

        {/* ATS Intelligence */}
        <RecruiterIntelligencePanel
          applicantId={applicantId}
          jobId={applicant.jobId}
        />
      </div>

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />

      {scheduleOpen && applicant && (
        <ScheduleInterviewModal
          applicationId={applicantId}
          candidateName={applicant.candidateName}
          jobTitle={applicant.jobTitle}
          initialValues={applicant.interview ? {
            interviewType:   applicant.interview.type,
            scheduledAt:     applicant.interview.scheduled_at,
            durationMinutes: applicant.interview.duration_minutes,
            meetingLink:     applicant.interview.meeting_link,
            location:        applicant.interview.location,
            notes:           applicant.interview.notes,
          } : null}
          onClose={() => setScheduleOpen(false)}
          onSuccess={msg => { showSuccess(msg); setScheduleOpen(false); }}
          onError={msg => showError(msg)}
        />
      )}

      <ConfirmationDialog
        isOpen={cancelConfirmOpen}
        title="Cancel Interview"
        message="Cancel this scheduled interview? The candidate will be notified by email."
        confirmText="Cancel Interview"
        cancelText="Keep It"
        isDangerous
        isLoading={cancelling}
        onConfirm={handleConfirmCancelInterview}
        onCancel={() => setCancelConfirmOpen(false)}
      />
    </div>
  );
}
