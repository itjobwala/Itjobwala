'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRecruiterInterviewsQuery, useScheduleInterviewMutation } from '@/features/recruiter/hooks';
import type { RecruiterInterview, ScheduleInterviewRequest } from '@/features/recruiter/types';
import { RecruiterShell } from '@/layout/shell';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import StatusBadge from '@/src/components/ui/StatusBadge';
import EmptyState from '@/src/components/ui/EmptyState';
import Avatar from '@/src/components/ui/Avatar';

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

interface ScheduleModalProps {
  interview: RecruiterInterview;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

function ScheduleModal({ interview, onClose, onSuccess, onError }: ScheduleModalProps) {
  const mutation = useScheduleInterviewMutation();
  const [form, setForm] = useState({
    interviewType: 'video' as 'video' | 'phone' | 'in_person',
    date: '',
    time: '',
    durationMinutes: '60',
    meetingLink: '',
    location: '',
    note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Date is required';
    if (!form.time) e.time = 'Time is required';
    if (form.date && form.time) {
      const dt = new Date(`${form.date}T${form.time}`);
      if (dt <= new Date()) e.date = 'Must be a future date and time';
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload: ScheduleInterviewRequest = {
      applicationId: interview.applicationId,
      interviewType: form.interviewType,
      scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
      ...(form.durationMinutes ? { durationMinutes: parseInt(form.durationMinutes, 10) } : {}),
      ...(form.meetingLink.trim() ? { meetingLink: form.meetingLink.trim() } : {}),
      ...(form.location.trim() ? { location: form.location.trim() } : {}),
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    };
    try {
      await mutation.mutateAsync(payload);
      onSuccess('Interview scheduled successfully');
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to schedule interview');
    }
  }

  const inputCls = (err?: string) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none bg-white transition-colors focus:border-primary focus:shadow-[0_0_0_3px_rgba(21,87,255,0.09)] ${err ? 'border-red-400' : 'border-gray-200'}`;

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#0f172a]">Schedule Interview</h2>
            <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[320px]">
              {interview.candidateName} · {interview.jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="schedule-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Interview type */}
            <div>
              <label className="block text-[13px] font-bold text-gray-600 mb-2">Interview Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['video', 'phone', 'in_person'] as const).map(type => {
                  const active = form.interviewType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set('interviewType', type)}
                      className="flex flex-col items-center gap-2 py-3.5 rounded-xl border text-[12px] font-semibold transition-all"
                      style={{
                        border: `1.5px solid ${active ? PRIMARY : '#e5e7eb'}`,
                        background: active ? `${PRIMARY}10` : '#fff',
                        color: active ? PRIMARY : '#6b7280',
                      }}
                    >
                      <span style={{ color: active ? PRIMARY : '#9ca3af' }}>{MODE_CONFIG[type].icon}</span>
                      {MODE_CONFIG[type].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
                  Date <span style={{ color: PRIMARY }}>*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls(errors.date)}
                />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
                  Time <span style={{ color: PRIMARY }}>*</span>
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => set('time', e.target.value)}
                  className={inputCls(errors.time)}
                />
                {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Duration</label>
              <select
                value={form.durationMinutes}
                onChange={e => set('durationMinutes', e.target.value)}
                className={inputCls()}
              >
                {[30, 45, 60, 90, 120].map(d => (
                  <option key={d} value={d}>{d} minutes</option>
                ))}
              </select>
            </div>

            {/* Meeting link (video only) */}
            {form.interviewType === 'video' && (
              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Meeting Link</label>
                <input
                  type="url"
                  value={form.meetingLink}
                  onChange={e => set('meetingLink', e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className={inputCls()}
                />
              </div>
            )}

            {/* Location (in_person only) */}
            {form.interviewType === 'in_person' && (
              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="e.g. Office, 3rd Floor, Conference Room A"
                  className={inputCls()}
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
                Notes <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
              </label>
              <textarea
                value={form.note}
                onChange={e => set('note', e.target.value)}
                rows={2}
                placeholder="e.g. Focus on system design, bring portfolio…"
                className={`${inputCls()} resize-none`}
              />
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="schedule-form"
            disabled={mutation.isPending}
            className="flex-[2] flex items-center justify-center gap-2 text-white font-bold text-[13px] rounded-xl py-2.5 transition-all"
            style={{
              background: mutation.isPending ? '#93aef5' : PRIMARY,
              cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              boxShadow: mutation.isPending ? 'none' : `0 4px 14px ${PRIMARY}40`,
            }}
          >
            {mutation.isPending
              ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Scheduling…</>
              : 'Schedule Interview'}
          </button>
        </div>
      </div>
    </div>
  );
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
  const { toast, show: showToast } = useToast();

  const { data: interviews = [], isLoading, error } = useRecruiterInterviewsQuery(true);

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
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-6">
          <h1 className="text-[22px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
            Interviews
          </h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {counts.scheduled} upcoming · {counts.not_scheduled} to schedule
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-6 space-y-5">

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',         value: counts.all,           color: '#0f172a',  bg: '#fff' },
            { label: 'Upcoming',      value: counts.scheduled,     color: '#2563eb',  bg: '#eff6ff' },
            { label: 'Not Scheduled', value: counts.not_scheduled, color: '#d97706',  bg: '#fffbeb' },
            { label: 'Past',          value: counts.past,          color: '#6b7280',  bg: '#f9fafb' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-gray-100 px-4 py-3.5" style={{ background: s.bg }}>
              <div className="text-[24px] font-extrabold" style={{ color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              <div className="text-[12px] text-gray-400 mt-0.5 font-medium">{s.label}</div>
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
                  className="px-3.5 py-1.5 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all"
                  style={{
                    background: active ? PRIMARY : '#fff',
                    color: active ? '#fff' : '#6b7280',
                    border: `1.5px solid ${active ? PRIMARY : '#e5e7eb'}`,
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
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search candidate or job..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-primary w-full sm:w-[240px] transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-400 text-[13px]">Loading interviews…</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-[13px]">
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
                  className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 hover:shadow-sm transition-all"
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
                              className="text-[14px] font-extrabold text-[#0f172a] hover:text-primary transition-colors"
                            >
                              {interview.candidateName}
                            </Link>
                            <StatusBadge status={interview.status} showDot />
                          </div>
                          <p className="text-[13px] text-gray-500 mt-0.5 truncate">{interview.jobTitle}</p>
                          <p className="text-[12px] text-gray-400 truncate">{interview.candidateEmail}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          {!isPast && (
                            <button
                              onClick={() => setSchedulingFor(interview)}
                              className="px-3 py-1.5 text-[12px] font-bold rounded-lg transition-colors"
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
                          {interview.meetingLink && interview.status === 'scheduled' && (
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-[12px] font-bold rounded-lg text-white transition-opacity hover:opacity-90"
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
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                            <span className="font-semibold">{formatDateTime(interview.scheduledAt)}</span>
                            {interview.durationMinutes && (
                              <span className="text-gray-400">· {interview.durationMinutes} min</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] text-amber-600 font-semibold">No time set yet</span>
                        )}

                        {mode && (
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <span className="text-gray-400">{mode.icon}</span>
                            <span>{mode.label}</span>
                          </div>
                        )}

                        {interview.location && (
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span className="truncate max-w-[160px]">{interview.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {interview.notes && (
                        <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="text-[12px] text-amber-700 font-medium leading-snug">{interview.notes}</p>
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
        <ScheduleModal
          interview={schedulingFor}
          onClose={() => setSchedulingFor(null)}
          onSuccess={msg => { showToast(msg, 'success'); }}
          onError={msg => { showToast(msg, 'error'); }}
        />
      )}

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
    </RecruiterShell>
  );
}
