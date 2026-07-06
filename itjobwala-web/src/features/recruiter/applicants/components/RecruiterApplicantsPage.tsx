'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  useRecruiterApplicantsQuery,
  useShortlistApplicantMutation,
  useRejectApplicantMutation,
  useHireApplicantMutation,
  useUpdateApplicantStatusMutation,
  useBulkRejectMutation,
  useBulkRejectByScoreMutation,
} from '@/features/recruiter/hooks';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import StatusBadge from '@/src/components/ui/StatusBadge';
import EmptyState from '@/src/components/ui/EmptyState';
import Avatar from '@/src/components/ui/Avatar';
import type { RecruiterApplicant } from '@/features/recruiter/types';
import { RecruiterShell } from '@/layout/shell';

type ApplicantStatus = RecruiterApplicant['status'];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'applied',     label: 'Applied' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview',   label: 'Interview' },
  { value: 'hired',       label: 'Hired' },
  { value: 'rejected',    label: 'Rejected' },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'appliedDate', label: 'Applied Date' },
  { value: 'status',      label: 'Status' },
  { value: 'qaScore',     label: 'QA Score' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function QAScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro font-semibold bg-surface-hover text-subtle border border-token">
        No score
      </span>
    );
  }
  const color =
    score >= 70 ? 'bg-green-50 text-green-700 border-green-200' :
    score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-micro font-semibold border ${color}`}
      title="General QA capability score — not specific to this job"
    >
      QA {score}
    </span>
  );
}

interface ActionButtonsProps {
  applicant: RecruiterApplicant;
  loadingKey: string | null;
  onShortlist: (id: string) => void;
  onInterview: (id: string) => void;
  onHire: (id: string) => void;
  onReject: (id: string) => void;
}

function ActionButtons({ applicant, loadingKey, onShortlist, onInterview, onHire, onReject }: ActionButtonsProps) {
  const { id, status } = applicant;
  const isShortlisting = loadingKey === `${id}:shortlist`;
  const isInterviewing = loadingKey === `${id}:interview`;
  const isHiring       = loadingKey === `${id}:hire`;
  const isRejecting    = loadingKey === `${id}:reject`;
  const anyLoading     = isShortlisting || isInterviewing || isHiring || isRejecting;

  const finalStatuses = new Set(['hired', 'rejected', 'withdrawn', 'selected']);
  if (finalStatuses.has(status)) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-token">
      {status === 'applied' && (
        <button
          onClick={() => onShortlist(id)}
          disabled={anyLoading}
          className="px-3 py-1.5 text-caption font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isShortlisting ? 'Loading…' : 'Shortlist'}
        </button>
      )}
      {status === 'shortlisted' && (
        <button
          onClick={() => onInterview(id)}
          disabled={anyLoading}
          className="px-3 py-1.5 text-caption font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {isInterviewing ? 'Loading…' : 'Schedule Interview'}
        </button>
      )}
      {status === 'interview' && (
        <button
          onClick={() => onHire(id)}
          disabled={anyLoading}
          className="px-3 py-1.5 text-caption font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {isHiring ? 'Loading…' : 'Hire'}
        </button>
      )}
      <button
        onClick={() => onReject(id)}
        disabled={anyLoading}
        className="px-3 py-1.5 text-caption font-semibold bg-surface text-danger border border-danger rounded-lg hover:bg-danger-bg disabled:opacity-50 transition-colors"
      >
        {isRejecting ? 'Loading…' : 'Reject'}
      </button>
    </div>
  );
}

interface ConfirmModalProps {
  count: number;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ count, isPending, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl border border-token shadow-2xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-base font-extrabold text-heading mb-1">Reject {count} applicant{count !== 1 ? 's' : ''}?</h2>
        <p className="text-sm text-subtle mb-5">
          Each candidate will receive a rejection notification. Applicants already in a terminal state (hired, rejected, withdrawn) will be skipped automatically.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-xl border border-token text-sm font-semibold text-heading hover:bg-surface-alt transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Rejecting…' : `Reject ${count}`}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ScoreRejectModalProps {
  threshold: number;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ScoreRejectModal({ threshold, isPending, onConfirm, onCancel }: ScoreRejectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl border border-token shadow-2xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-base font-extrabold text-heading mb-1">Bulk reject below {threshold}?</h2>
        <p className="text-sm text-subtle mb-5">
          All active applicants with a QA match score below {threshold} will be rejected. Applicants in a terminal state (hired, rejected, withdrawn) will be skipped automatically.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-xl border border-token text-sm font-semibold text-heading hover:bg-surface-alt transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Rejecting…' : `Reject below ${threshold}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterApplicantsPage() {
  const searchParams   = useSearchParams();
  const jobIdParam     = searchParams.get('jobId') ?? undefined;

  const [filterStatus,      setFilterStatus]      = useState('all');
  const [sortBy,            setSortBy]            = useState('appliedDate');
  const [sortOrder,         setSortOrder]         = useState<'asc' | 'desc'>('desc');
  const [minScoreFilter,    setMinScoreFilter]    = useState(0);
  const [loadingKey,        setLoadingKey]        = useState<string | null>(null);
  const [selected,          setSelected]          = useState<Set<string>>(new Set());
  const [showConfirm,       setShowConfirm]       = useState(false);
  const [showScoreModal,    setShowScoreModal]    = useState(false);
  const [scoreThreshold,    setScoreThreshold]    = useState(50);
  const { toast, show: showToast } = useToast();

  const filters = {
    ...(jobIdParam ? { jobId: jobIdParam } : {}),
    ...(filterStatus !== 'all' ? { status: filterStatus as ApplicantStatus } : {}),
    ...(minScoreFilter > 0 ? { minScore: minScoreFilter } : {}),
    sortBy,
    sortOrder,
  };
  const { data, isLoading, error } = useRecruiterApplicantsQuery(filters, true);

  const shortlistMutation  = useShortlistApplicantMutation();
  const rejectMutation     = useRejectApplicantMutation();
  const hireMutation       = useHireApplicantMutation();
  const statusMutation     = useUpdateApplicantStatusMutation();
  const bulkRejectMutation        = useBulkRejectMutation();
  const bulkRejectByScoreMutation = useBulkRejectByScoreMutation();

  const applicants = data?.applicants ?? [];

  // ── Selection helpers ─────────────────────────────────────────────────────
  const rejectableStatuses = new Set(['applied', 'shortlisted', 'interview']);
  const selectableIds = applicants
    .filter(a => rejectableStatuses.has(a.status))
    .map(a => a.id);
  const allSelected  = selectableIds.length > 0 && selectableIds.every(id => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableIds));
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  // ── Single-applicant actions ──────────────────────────────────────────────
  function showSuccess(msg: string) { showToast(msg, 'success'); }
  function showError(msg: string)   { showToast(msg, 'error');   }

  async function handleShortlist(id: string) {
    setLoadingKey(`${id}:shortlist`);
    try {
      await shortlistMutation.mutateAsync(id);
      showSuccess('Applicant shortlisted');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to shortlist');
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleInterview(id: string) {
    setLoadingKey(`${id}:interview`);
    try {
      await statusMutation.mutateAsync({ applicantId: id, data: { status: 'interview' } });
      showSuccess('Interview scheduled');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to schedule interview');
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleHire(id: string) {
    setLoadingKey(`${id}:hire`);
    try {
      await hireMutation.mutateAsync(id);
      showSuccess('Applicant hired');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to hire');
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleReject(id: string) {
    setLoadingKey(`${id}:reject`);
    try {
      await rejectMutation.mutateAsync(id);
      showSuccess('Applicant rejected');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to reject');
    } finally {
      setLoadingKey(null);
    }
  }

  // ── Bulk reject ───────────────────────────────────────────────────────────
  async function handleBulkReject() {
    try {
      const ids = [...selected];
      const result = await bulkRejectMutation.mutateAsync(ids);
      setShowConfirm(false);
      clearSelection();
      const rejectedCount = result.rejected.length;
      const skippedCount  = result.skipped.length;
      if (skippedCount > 0) {
        showSuccess(`${rejectedCount} rejected, ${skippedCount} skipped (invalid transition)`);
      } else {
        showSuccess(`${rejectedCount} applicant${rejectedCount !== 1 ? 's' : ''} rejected`);
      }
    } catch (e) {
      setShowConfirm(false);
      showError(e instanceof Error ? e.message : 'Bulk reject failed');
    }
  }

  async function handleBulkRejectByScore() {
    try {
      const result = await bulkRejectByScoreMutation.mutateAsync({
        minScore: scoreThreshold,
        ...(jobIdParam ? { jobId: jobIdParam } : {}),
      });
      setShowScoreModal(false);
      const rejectedCount = result.rejected.length;
      showSuccess(`${rejectedCount} applicant${rejectedCount !== 1 ? 's' : ''} rejected (score < ${scoreThreshold})`);
    } catch (e) {
      setShowScoreModal(false);
      showError(e instanceof Error ? e.message : 'Bulk reject by score failed');
    }
  }

  return (
    <RecruiterShell>
      {/* Page header */}
      <div className="bg-surface border-b border-token">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
          <h1 className="text-4xl font-extrabold text-heading" style={{ letterSpacing: '-0.5px' }}>
            Applicants
          </h1>
          <p className="text-sm text-subtle mt-1">
            Review and manage applications for your job postings
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">

        {/* ── Filter + Sort bar ──────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setFilterStatus(value); clearSelection(); }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filterStatus === value
                    ? 'bg-primary text-white'
                    : 'bg-surface text-body-secondary border border-token hover:border-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Score filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-caption text-subtle font-medium">Score:</span>
            <select
              value={minScoreFilter}
              onChange={e => { setMinScoreFilter(Number(e.target.value)); clearSelection(); }}
              className="text-sm border border-token rounded-lg px-3 py-1.5 bg-surface text-body-secondary focus:outline-none focus:border-primary transition-colors"
            >
              <option value={0}>All</option>
              <option value={50}>50+ Mid</option>
              <option value={70}>70+ High</option>
            </select>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-caption text-subtle font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); clearSelection(); }}
              className="text-sm border border-token rounded-lg px-3 py-1.5 bg-surface text-body-secondary focus:outline-none focus:border-primary transition-colors"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
              title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-token text-muted hover:bg-surface-alt hover:text-heading transition-colors"
            >
              {sortOrder === 'desc' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 20V4M5 13l7 7 7-7" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 4v16M5 11l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Score distribution banner */}
        {!isLoading && data?.score_distribution && data.score_distribution.total > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-4 px-4 py-3 bg-surface border border-token rounded-xl">
            <span className="text-caption font-semibold text-muted">Score pool:</span>
            <span className="text-caption font-bold" style={{ color: '#10b981' }}>
              {data.score_distribution.high_count} high ≥70
            </span>
            <span className="text-caption font-bold" style={{ color: '#f59e0b' }}>
              {data.score_distribution.mid_count} mid 50–69
            </span>
            <span className="text-caption font-bold" style={{ color: '#ef4444' }}>
              {data.score_distribution.low_count} low &lt;50
            </span>
            {data.score_distribution.unscored_count > 0 && (
              <span className="text-caption text-muted">{data.score_distribution.unscored_count} unscored</span>
            )}
            {data.score_distribution.low_count > 0 && (
              <button
                onClick={() => { setScoreThreshold(50); setShowScoreModal(true); }}
                className="ml-auto text-caption font-bold hover:underline"
                style={{ color: '#ef4444' }}
              >
                Bulk reject below 50
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-token border-t-primary rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-muted">Loading applicants...</p>
          </div>
        ) : error ? (
          <div className="bg-danger-bg border border-danger rounded-xl p-4 text-danger">
            {error instanceof Error ? error.message : 'Failed to load applicants'}
          </div>
        ) : !data || applicants.length === 0 ? (
          <EmptyState emoji="📨" title="No applicants yet" description="Applications for your jobs will appear here" />
        ) : (
          <>
            {/* ── Select-all header ───────────────────────────────────────── */}
            {selectableIds.length > 0 && (
              <div className="flex items-center gap-3 mb-3 px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-token accent-primary cursor-pointer"
                  />
                  <span className="text-caption text-muted font-medium">
                    {allSelected ? 'Deselect all' : `Select all (${selectableIds.length})`}
                  </span>
                </label>
                {someSelected && (
                  <span className="text-caption text-primary font-semibold">
                    {selected.size} selected
                  </span>
                )}
              </div>
            )}

            {/* ── Applicant list ──────────────────────────────────────────── */}
            <div className="space-y-3">
              {applicants.map((applicant) => {
                const isSelectable = rejectableStatuses.has(applicant.status);
                const isChecked    = selected.has(applicant.id);
                return (
                  <div
                    key={applicant.id}
                    className={`bg-surface rounded-2xl border transition-colors p-5 hover:border-token-mid ${
                      isChecked ? 'border-primary/40 bg-primary/[0.01]' : 'border-token'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-0.5 shrink-0">
                        {isSelectable ? (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOne(applicant.id)}
                            className="w-4 h-4 rounded border-token accent-primary cursor-pointer"
                          />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </div>

                      <Avatar name={applicant.candidateName} photo={applicant.profilePhoto} size="lg" />

                      <div className="flex-1 min-w-0">
                        {/* Top row: name + badges + view link */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/recruiter/applicants/${applicant.id}`}
                              className="text-base font-semibold text-heading hover:text-primary transition-colors"
                            >
                              {applicant.candidateName}
                            </Link>
                            {applicant.profile?.title && (
                              <p className="text-caption text-muted mt-0.5">{applicant.profile.title}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mt-1 sm:mt-0 sm:justify-end sm:shrink-0">
                            <QAScoreBadge score={applicant.qaMatchScore} />
                            <StatusBadge status={applicant.status} />
                            <Link
                              href={`/recruiter/applicants/${applicant.id}`}
                              className="text-caption font-semibold text-primary hover:underline"
                            >
                              View
                            </Link>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted">
                          <span className="truncate max-w-[180px] sm:max-w-none">{applicant.candidateEmail}</span>
                          <span>Applied for: <span className="font-medium text-body">{applicant.jobTitle || 'Unknown Position'}</span></span>
                          {applicant.experience !== undefined && applicant.experience > 0 && (
                            <span>{applicant.experience} yr{applicant.experience !== 1 ? 's' : ''} experience</span>
                          )}
                          <span className="text-subtle">{formatDate(applicant.appliedDate)}</span>
                        </div>

                        {/* Skills */}
                        {applicant.skills && applicant.skills.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {applicant.skills.slice(0, 5).map((skill) => (
                              <span key={skill} className="px-2 py-0.5 bg-surface-hover text-body-secondary text-micro font-medium rounded-md">
                                {skill}
                              </span>
                            ))}
                            {applicant.skills.length > 5 && (
                              <span className="px-2 py-0.5 text-subtle text-micro">+{applicant.skills.length - 5} more</span>
                            )}
                          </div>
                        )}

                        {/* Risk flags */}
                        {applicant.riskFlags && applicant.riskFlags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {applicant.riskFlags.slice(0, 2).map(flag => (
                              <span
                                key={flag.flag}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md capitalize"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}
                              >
                                ⚠ {flag.flag.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Skill evidence: proven + missing */}
                        {(applicant.skillEvidence?.some(e => e.evidence_level === 'strong' || e.evidence_level === 'very_strong') ||
                          (applicant.missingSkills && applicant.missingSkills.length > 0)) && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {applicant.skillEvidence
                              ?.filter(e => e.evidence_level === 'strong' || e.evidence_level === 'very_strong')
                              .slice(0, 3)
                              .map(e => (
                                <span
                                  key={e.skill}
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                  style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}
                                >
                                  ✓ {e.skill}
                                </span>
                              ))}
                            {applicant.missingSkills?.slice(0, 2).map(skill => (
                              <span
                                key={skill}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '1px solid rgba(239,68,68,0.12)' }}
                              >
                                − {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Resume link */}
                        {applicant.resume && (
                          <a
                            href={applicant.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-caption text-primary font-medium hover:underline"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            View Resume
                          </a>
                        )}

                        {/* Action buttons */}
                        <ActionButtons
                          applicant={applicant}
                          loadingKey={loadingKey}
                          onShortlist={handleShortlist}
                          onInterview={handleInterview}
                          onHire={handleHire}
                          onReject={handleReject}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Bulk action bar (sticky, shown when ≥1 selected) ─────────────── */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-4 bg-surface-elevated border border-token rounded-2xl shadow-2xl px-5 py-3">
            <span className="text-sm font-semibold text-heading">
              {selected.size} selected
            </span>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              Reject {selected.size}
            </button>
            <button
              onClick={clearSelection}
              className="text-caption text-muted hover:text-heading transition-colors"
              aria-label="Clear selection"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm modal ─────────────────────────────────────────────────── */}
      {showConfirm && (
        <ConfirmModal
          count={selected.size}
          isPending={bulkRejectMutation.isPending}
          onConfirm={handleBulkReject}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* ── Score reject modal ────────────────────────────────────────────── */}
      {showScoreModal && (
        <ScoreRejectModal
          threshold={scoreThreshold}
          isPending={bulkRejectByScoreMutation.isPending}
          onConfirm={handleBulkRejectByScore}
          onCancel={() => setShowScoreModal(false)}
        />
      )}

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
    </RecruiterShell>
  );
}
