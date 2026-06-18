'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRecruiterInterviewsQuery, useCancelInterviewMutation } from '@/features/recruiter/hooks';
import type { RecruiterInterview } from '@/features/recruiter/types';
import { RecruiterShell } from '@/layout/shell';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import StatusBadge from '@/src/components/ui/StatusBadge';
import EmptyState from '@/src/components/ui/EmptyState';
import Avatar from '@/src/components/ui/Avatar';
import ConfirmationDialog from '@/src/components/common/ConfirmationDialog';
import ScheduleInterviewModal from './ScheduleInterviewModal';

const PRIMARY = '#1557FF';

type FilterTab = 'all' | 'scheduled' | 'past' | 'not_scheduled';

const MODE_CONFIG = {
  video: {
    label: 'Video Call',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
  },
  phone: {
    label: 'Phone Call',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
      </svg>
    ),
  },
  in_person: {
    label: 'In Person',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  let dayLabel: string;
  if (d.toDateString() === today.toDateString()) dayLabel = 'Today';
  else if (d.toDateString() === tomorrow.toDateString()) dayLabel = 'Tomorrow';
  else dayLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${dayLabel} · ${time}`;
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'scheduled',     label: 'Upcoming' },
  { key: 'not_scheduled', label: 'Not Scheduled' },
  { key: 'past',          label: 'Past' },
];

export default function RecruiterInterviewsPage() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [schedulingFor, setSchedulingFor] = useState<RecruiterInterview | null>(null);
  const [cancelTarget, setCancelTarget] = useState<RecruiterInterview | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { toast, show: showToast } = useToast();

  const { data: interviews = [], isLoading, error } = useRecruiterInterviewsQuery(true);
  const cancelMutation = useCancelInterviewMutation();

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelMutation.mutateAsync(cancelTarget.id);
      showToast('Interview cancelled', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel interview', 'error');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  }

  const counts = {
    all:           interviews.length,
    scheduled:     interviews.filter(i => i.status === 'scheduled').length,
    past:          interviews.filter(i => i.status === 'past').length,
    not_scheduled: interviews.filter(i => i.status === 'not_scheduled').length,
  };

  const filtered = interviews.filter(i => {
    const matchesFilter = filter === 'all' || i.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      i.candidateName.toLowerCase().includes(q) ||
      i.jobTitle.toLowerCase().includes(q) ||
      i.candidateEmail.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <RecruiterShell>
      {/* Page header */}
      <div className="bg-surface border-b border-token">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-6">
          <h1 className="text-3xl font-extrabold text-heading" style={{ letterSpacing: '-0.5px' }}>
            Interviews
          </h1>
          <p className="text-sm text-subtle mt-0.5">
            {counts.scheduled} upcoming · {counts.not_scheduled} to schedule
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-6 space-y-5">

        {/* Stats strip — intentional semantic colors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',         value: counts.all,           color: 'var(--color-heading)',  bg: 'var(--color-surface)' },
            { label: 'Upcoming',      value: counts.scheduled,     color: '#2563eb',               bg: '#eff6ff' },
            { label: 'Not Scheduled', value: counts.not_scheduled, color: '#d97706',               bg: '#fffbeb' },
            { label: 'Past',          value: counts.past,          color: 'var(--color-muted)',    bg: 'var(--color-surface-alt)' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-token px-4 py-3.5" style={{ background: s.bg }}>
              <div className="text-[24px] font-extrabold" style={{ color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              <div className="text-caption text-subtle mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {TABS.map(tab => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className="px-3.5 py-1.5 rounded-lg text-caption font-bold whitespace-nowrap transition-all"
                  style={{
                    background: active ? PRIMARY : 'var(--color-surface)',
                    color: active ? '#fff' : 'var(--color-muted)',
                    border: `1.5px solid ${active ? PRIMARY : 'var(--color-border)'}`,
                  }}
                >
                  {tab.label}
                  {counts[tab.key] > 0 && tab.key !== 'all' && (
                    <span className="ml-1.5 opacity-70">({counts[tab.key]})</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative sm:ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search candidate or job..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-token rounded-xl outline-none focus:border-primary w-full sm:w-[240px] transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-token border-t-primary rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-subtle text-sm">Loading interviews…</p>
          </div>
        ) : error ? (
          <div className="bg-danger-bg border border-danger rounded-xl p-4 text-danger text-sm">
            {error instanceof Error ? error.message : 'Failed to load interviews'}
          </div>
        ) : interviews.length === 0 ? (
          <EmptyState
            title="No interviews yet"
            description="Move applicants to the Interview stage to see them here."
            className="py-16"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="No interviews found"
            description="Try adjusting your filters or search."
            className="py-16"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(interview => {
              const mode = interview.interviewType ? MODE_CONFIG[interview.interviewType] : null;
              const isPast = interview.status === 'past';
              return (
                <div
                  key={interview.id}
                  className="bg-surface rounded-2xl border border-token p-4 sm:p-5 hover:border-token-mid hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <Avatar name={interview.candidateName} photo={interview.candidatePhoto} size="md" />

                    <div className="flex-1 min-w-0">
                      {/* Top row: name + actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/recruiter/applicants/${interview.applicationId}`}
                              className="text-base font-extrabold text-heading hover:text-primary transition-colors"
                            >
                              {interview.candidateName}
                            </Link>
                            <StatusBadge status={interview.status} showDot />
                          </div>
                          <p className="text-sm text-muted mt-0.5 truncate">{interview.jobTitle}</p>
                          <p className="text-caption text-subtle truncate">{interview.candidateEmail}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 mt-0.5 flex-wrap justify-end">
                          {!isPast && (
                            <button
                              onClick={() => setSchedulingFor(interview)}
                              className="px-3 py-1.5 text-caption font-bold rounded-lg transition-colors"
                              style={{
                                border: `1.5px solid ${PRIMARY}`,
                                color: PRIMARY,
                                background: 'transparent',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = `${PRIMARY}08`; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              {interview.status === 'not_scheduled' ? 'Schedule' : 'Reschedule'}
                            </button>
                          )}
                          {interview.scheduledAt && !isPast && (
                            <button
                              onClick={() => setCancelTarget(interview)}
                              className="px-3 py-1.5 text-caption font-bold rounded-lg border border-danger text-danger hover:bg-danger-bg transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          {interview.meetingLink && interview.status === 'scheduled' && (
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-caption font-bold rounded-lg text-white transition-opacity hover:opacity-90"
                              style={{ background: PRIMARY }}
                            >
                              Join
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                        {interview.scheduledAt ? (
                          <div className="flex items-center gap-1.5 text-caption text-muted">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="20" height="20" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                            <span className="font-semibold">{formatDateTime(interview.scheduledAt)}</span>
                            {interview.durationMinutes && (
                              <span className="text-subtle">· {interview.durationMinutes} min</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-caption text-amber-600 font-semibold">No time set yet</span>
                        )}

                        {mode && (
                          <div className="flex items-center gap-1.5 text-caption text-muted">
                            <span className="text-subtle">{mode.icon}</span>
                            <span>{mode.label}</span>
                          </div>
                        )}

                        {interview.location && (
                          <div className="flex items-center gap-1.5 text-caption text-muted">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span className="truncate max-w-[160px]">{interview.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {interview.notes && (
                        <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="text-caption text-amber-700 font-medium leading-snug">{interview.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {schedulingFor && (
        <ScheduleInterviewModal
          applicationId={schedulingFor.applicationId}
          candidateName={schedulingFor.candidateName}
          jobTitle={schedulingFor.jobTitle}
          initialValues={schedulingFor.scheduledAt ? {
            interviewType:   schedulingFor.interviewType,
            scheduledAt:     schedulingFor.scheduledAt,
            durationMinutes: schedulingFor.durationMinutes,
            meetingLink:     schedulingFor.meetingLink,
            location:        schedulingFor.location,
            notes:           schedulingFor.notes,
          } : null}
          onClose={() => setSchedulingFor(null)}
          onSuccess={msg => { showToast(msg, 'success'); setSchedulingFor(null); }}
          onError={msg => { showToast(msg, 'error'); }}
        />
      )}

      <ConfirmationDialog
        isOpen={!!cancelTarget}
        title="Cancel Interview"
        message={`Cancel the interview with ${cancelTarget?.candidateName ?? ''}? The candidate will be notified.`}
        confirmText="Cancel Interview"
        cancelText="Keep It"
        isDangerous
        isLoading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
    </RecruiterShell>
  );
}
