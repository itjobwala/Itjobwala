'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRecruiterInterviewsQuery, useScheduleInterviewMutation } from '@/src/hooks/useRecruiter';
import type { RecruiterInterview, ScheduleInterviewRequest } from '@/src/types/recruiter';
import RecruiterShell from './RecruiterShell';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import StatusBadge from '@/src/components/ui/StatusBadge';
import EmptyState from '@/src/components/ui/EmptyState';
import Avatar from '@/src/components/ui/Avatar';
import Input from '@/src/components/ui/Input';
import Textarea from '@/src/components/ui/Textarea';
import Select from '@/src/components/ui/Select';
import FormField from '@/src/components/ui/FormField';
import Button from '@/src/components/ui/Button';

type FilterTab = 'all' | 'scheduled' | 'past' | 'not_scheduled';


const MODE_CONFIG = {
  video:     { label: 'Video Call',  icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
  phone:     { label: 'Phone Call',  icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg> },
  in_person: { label: 'In Person',   icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
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
  const [form, setForm] = useState<{
    interviewType: 'video' | 'phone' | 'in_person';
    date: string;
    time: string;
    durationMinutes: string;
    meetingLink: string;
    location: string;
    note: string;
  }>({
    interviewType: 'video',
    date: '',
    time: '',
    durationMinutes: '60',
    meetingLink: '',
    location: '',
    note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#0f172a]">Schedule Interview</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{interview.candidateName} · {interview.jobTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Interview type */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-2">Interview Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['video', 'phone', 'in_person'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, interviewType: type }))}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[11px] font-semibold transition-colors ${
                    form.interviewType === type
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className={form.interviewType === type ? 'text-primary' : 'text-gray-400'}>
                    {MODE_CONFIG[type].icon}
                  </span>
                  {MODE_CONFIG[type].label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & time */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" htmlFor="si-date" required error={errors.date}>
              <Input
                id="si-date"
                type="date"
                value={form.date}
                onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(ev => ({ ...ev, date: '' })); }}
                min={new Date().toISOString().split('T')[0]}
                inputSize="sm"
                error={errors.date}
              />
            </FormField>
            <FormField label="Time" htmlFor="si-time" required error={errors.time}>
              <Input
                id="si-time"
                type="time"
                value={form.time}
                onChange={e => { setForm(f => ({ ...f, time: e.target.value })); setErrors(ev => ({ ...ev, time: '' })); }}
                inputSize="sm"
                error={errors.time}
              />
            </FormField>
          </div>

          {/* Duration */}
          <FormField label="Duration (minutes)" htmlFor="si-duration">
            <Select
              id="si-duration"
              value={form.durationMinutes}
              onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
              inputSize="sm"
            >
              {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} minutes</option>)}
            </Select>
          </FormField>

          {/* Meeting link (video only) */}
          {form.interviewType === 'video' && (
            <FormField label="Meeting Link" htmlFor="si-meetingLink">
              <Input
                id="si-meetingLink"
                type="url"
                value={form.meetingLink}
                onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
                inputSize="sm"
              />
            </FormField>
          )}

          {/* Location (in_person only) */}
          {form.interviewType === 'in_person' && (
            <FormField label="Location" htmlFor="si-location">
              <Input
                id="si-location"
                type="text"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Office, 3rd Floor, Conference Room A"
                inputSize="sm"
              />
            </FormField>
          )}

          {/* Notes */}
          <FormField label="Notes (optional)" htmlFor="si-note">
            <Textarea
              id="si-note"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              rows={2}
              placeholder="e.g. Focus on system design, bring portfolio…"
              inputSize="sm"
            />
          </FormField>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={mutation.isPending}>
              Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'scheduled',     label: 'Scheduled' },
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
    all: interviews.length,
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

  function showSuccess(msg: string) { showToast(msg, 'success'); }
  function showError(msg: string)   { showToast(msg, 'error');   }

  return (
    <RecruiterShell>
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
                Interviews
              </h1>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {counts.scheduled} upcoming · {counts.not_scheduled} to schedule
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6 space-y-5">

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',         value: counts.all,           color: 'text-[#0f172a]', bg: 'bg-white' },
            { label: 'Upcoming',      value: counts.scheduled,     color: 'text-blue-600',  bg: 'bg-blue-50' },
            { label: 'Not Scheduled', value: counts.not_scheduled, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Past',          value: counts.past,          color: 'text-gray-500',  bg: 'bg-gray-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 px-4 py-3.5`}>
              <div className={`text-[22px] font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[12px] text-gray-400 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {counts[tab.key] > 0 && tab.key !== 'all' && (
                  <span className="ml-1.5 opacity-70">({counts[tab.key]})</span>
                )}
              </button>
            ))}
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
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-500 text-[13px]">Loading interviews...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-[13px]">
            {error instanceof Error ? error.message : 'Failed to load interviews'}
          </div>
        ) : interviews.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="No interviews yet"
            description="Move applicants to the Interview stage to see them here."
            cta={{ label: 'Go to Applicants', href: '/recruiter/applicants' }}
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
              return (
                <div
                  key={interview.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <Avatar name={interview.candidateName} photo={interview.candidatePhoto} size="md" />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
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
                          <p className="text-[13px] text-gray-500 mt-0.5">{interview.jobTitle}</p>
                          <p className="text-[12px] text-gray-400">{interview.candidateEmail}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0">
                          {interview.status !== 'past' && (
                            <button
                              onClick={() => setSchedulingFor(interview)}
                              className="px-3 py-1.5 text-[12px] font-bold rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors"
                            >
                              {interview.status === 'not_scheduled' ? 'Schedule' : 'Reschedule'}
                            </button>
                          )}
                          {interview.meetingLink && interview.status === 'scheduled' && (
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-[12px] font-bold rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
                            >
                              Join
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 mt-2.5">
                        {interview.scheduledAt ? (
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                            <span className="font-semibold">{formatDateTime(interview.scheduledAt)}</span>
                            {interview.durationMinutes && (
                              <><span>·</span><span>{interview.durationMinutes} min</span></>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] text-amber-600 font-medium">No time set yet</span>
                        )}

                        {mode && (
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            {mode.icon}
                            <span>{mode.label}</span>
                          </div>
                        )}

                        {interview.location && (
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>{interview.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {interview.notes && (
                        <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="text-[12px] text-amber-700 font-medium">{interview.notes}</p>
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

      {/* Schedule modal */}
      {schedulingFor && (
        <ScheduleModal
          interview={schedulingFor}
          onClose={() => setSchedulingFor(null)}
          onSuccess={showSuccess}
          onError={showError}
        />
      )}

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
    </RecruiterShell>
  );
}
