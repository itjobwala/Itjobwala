'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SmartNavbar } from '@/layout/navbar';
import { ProtectedRoute } from '@/features/auth';
import Card from '@/src/components/ui/Card';
import StatusBadge from '@/src/components/ui/StatusBadge';
import ConfirmationDialog from '@/src/components/common/ConfirmationDialog';
import Toast from '@/src/components/ui/Toast';
import { useApplicationDetailQuery, useWithdrawApplicationMutation } from '@/features/candidate/applications/hooks';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import { useToast } from '@/src/hooks/useToast';
import { relativeDate, formatDate } from '@/src/lib/utils/format';
import type { ApplicationStatus } from '../types/applications.types';

const TERMINAL: Set<ApplicationStatus> = new Set(['rejected', 'hired', 'withdrawn']);

const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function ApplicationDetailPageClient() {
  const params   = useParams();
  const rawId    = typeof params.id === 'string' ? params.id : '';

  const { isHydrated, session, isLoading: authLoading } = useAuthHydration();
  const canLoad = isHydrated && !authLoading && session?.userRole === 'candidate';

  const { toast, show: showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const { data: app, isLoading, isError } = useApplicationDetailQuery(rawId);
  const withdrawMutation = useWithdrawApplicationMutation();

  const isTerminal = app ? TERMINAL.has(app.status) : false;

  async function handleConfirmWithdraw() {
    setConfirmOpen(false);
    setWithdrawing(true);
    try {
      await withdrawMutation.mutateAsync(rawId);
      showToast('Application withdrawn successfully.', 'success');
    } catch (err) {
      showToast((err as Error).message || 'Failed to withdraw application', 'error');
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-alt">
        <SmartNavbar />

        <div className="pt-16 lg:pt-[72px]">
          {/* Header bar */}
          <div className="bg-surface border-b border-token">
            <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-5">
              <Link
                href="/candidate/applications"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-body transition-colors mb-4"
              >
                <BackIcon /> My Applications
              </Link>
              <h3 className="text-h3 text-heading" style={{ letterSpacing: '-0.3px' }}>
                Application Details
              </h3>
            </div>
          </div>

          <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-8 space-y-5">

            {/* Loading */}
            {isLoading && (
              <Card padding="lg" overflow>
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="h-5 w-64 bg-surface-mid rounded" />
                  <div className="h-4 w-40 bg-surface-hover rounded" />
                </div>
              </Card>
            )}

            {/* Error / not found */}
            {isError && (
              <Card padding="lg" overflow>
                <p className="text-base font-semibold text-danger mb-1">Could not load application.</p>
                <p className="text-sm text-subtle">It may have been deleted or you may not have access.</p>
                <Link
                  href="/candidate/applications"
                  className="inline-block mt-4 text-sm font-bold text-primary hover:underline"
                >
                  Back to My Applications
                </Link>
              </Card>
            )}

            {/* Content */}
            {app && (
              <>
                {/* Job summary card */}
                <Card padding="lg" overflow>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <Link
                        href={`/candidate/jobs/${app.job.id}`}
                        className="text-xl font-extrabold text-heading hover:text-primary transition-colors"
                      >
                        {app.job.title}
                      </Link>
                      <p className="text-base text-muted mt-1">{app.job.company}</p>
                      <p className="text-caption text-subtle mt-1">
                        Applied {relativeDate(app.applied_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <StatusBadge status={app.status} size="lg" showDot />
                      {!isTerminal && (
                        <button
                          onClick={() => setConfirmOpen(true)}
                          disabled={withdrawing}
                          className="text-sm font-semibold text-danger border border-danger rounded-xl px-4 py-2 hover:bg-danger-bg disabled:opacity-50 transition-colors"
                        >
                          {withdrawing ? 'Withdrawing…' : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Interview details card */}
                {app.interview && (
                  <Card padding="lg" overflow>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200" style={{ width: 32, height: 32, flexShrink: 0 }}>
                        <svg width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="20" height="20" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                        </svg>
                      </div>
                      <h2 className="text-h6 text-heading">Interview Details</h2>
                      {app.interview.status === 'scheduled' && (
                        <span className="ml-auto text-micro font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                          Upcoming
                        </span>
                      )}
                      {app.interview.status === 'past' && (
                        <span className="ml-auto text-micro font-bold text-muted bg-surface-hover border border-token rounded-full px-2.5 py-0.5">
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 text-sm">
                      {/* Date & time */}
                      <div className="flex items-start gap-2">
                        <span className="text-subtle shrink-0 mt-0.5">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                        </span>
                        <span className="text-body font-semibold">
                          {new Date(app.interview.scheduled_at).toLocaleString('en-IN', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
                          })} IST
                          {app.interview.duration_minutes && (
                            <span className="font-normal text-subtle ml-1.5">· {app.interview.duration_minutes} min</span>
                          )}
                        </span>
                      </div>

                      {/* Type */}
                      <div className="flex items-center gap-2 text-body-secondary">
                        <span className="text-subtle shrink-0">
                          {app.interview.type === 'video' ? (
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                            </svg>
                          ) : app.interview.type === 'phone' ? (
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                          )}
                        </span>
                        <span>
                          {app.interview.type === 'video' ? 'Video Call' : app.interview.type === 'phone' ? 'Phone Call' : 'In-Person Interview'}
                        </span>
                      </div>

                      {/* Location */}
                      {app.interview.location && (
                        <div className="flex items-start gap-2 text-body-secondary">
                          <span className="text-subtle shrink-0 mt-0.5">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                          </span>
                          <span>{app.interview.location}</span>
                        </div>
                      )}

                      {/* Join link */}
                      {app.interview.meeting_link && app.interview.status === 'scheduled' && (
                        <a
                          href={app.interview.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline mt-1"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                          </svg>
                          Join Interview
                        </a>
                      )}

                      {/* Note */}
                      {app.interview.note && (
                        <div className="mt-1 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="text-caption text-amber-700 leading-snug">{app.interview.note}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Recruiter feedback note */}
                {app.feedback_note && (
                  <Card padding="lg" overflow>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 flex items-center justify-center rounded-lg bg-amber-50 border border-amber-200" style={{ width: 32, height: 32 }}>
                        <svg width="16" height="16" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-700 mb-1">Recruiter Feedback</p>
                        <p className="text-base text-body leading-relaxed">{app.feedback_note}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Timeline */}
                <Card padding="lg" overflow>
                  <h2 className="text-h6 text-heading mb-5">Application History</h2>

                  {app.timeline.length === 0 ? (
                    <p className="text-sm text-subtle">No history yet.</p>
                  ) : (
                    <ol className="relative">
                      {app.timeline.map((entry, i) => {
                        const isLast = i === app.timeline.length - 1;
                        return (
                          <li key={i} className="flex gap-4 pb-6 last:pb-0">
                            {/* Vertical connector */}
                            <div className="flex flex-col items-center shrink-0">
                              <span className="flex items-center justify-center w-3 h-3 rounded-full bg-primary mt-1 shrink-0" />
                              {!isLast && (
                                <span className="flex-1 w-px bg-surface-mid mt-1" />
                              )}
                            </div>
                            {/* Entry content */}
                            <div className="flex-1 min-w-0 pb-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <StatusBadge status={entry.status} size="sm" />
                                <span className="text-caption text-subtle">
                                  {formatDate(entry.at, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {entry.note && (
                                <p className="text-sm text-muted mt-1">{entry.note}</p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />

      <ConfirmationDialog
        isOpen={confirmOpen}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText="Withdraw"
        cancelText="Keep Application"
        isDangerous
        isLoading={withdrawing}
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setConfirmOpen(false)}
      />
    </ProtectedRoute>
  );
}
