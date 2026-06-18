'use client';

import { useState } from 'react';
import { useScheduleInterviewMutation } from '@/features/recruiter/hooks';
import type { ScheduleInterviewRequest } from '@/features/recruiter/types';
import Button from '@/src/components/ui/Button';

const PRIMARY = '#1557FF';

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

export interface ScheduleInterviewInitialValues {
  interviewType?: 'video' | 'phone' | 'in_person' | null;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
}

interface Props {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  initialValues?: ScheduleInterviewInitialValues | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

function parseISOLocal(isoStr: string | null | undefined): { date: string; time: string } {
  if (!isoStr) return { date: '', time: '' };
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

export default function ScheduleInterviewModal({
  applicationId,
  candidateName,
  jobTitle,
  initialValues,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const mutation = useScheduleInterviewMutation();
  const isReschedule = !!initialValues?.scheduledAt;

  const { date: initDate, time: initTime } = parseISOLocal(initialValues?.scheduledAt);

  const [form, setForm] = useState({
    interviewType: (initialValues?.interviewType ?? 'video') as 'video' | 'phone' | 'in_person',
    date:           initDate,
    time:           initTime,
    durationMinutes: String(initialValues?.durationMinutes ?? 60),
    meetingLink:    initialValues?.meetingLink ?? '',
    location:       initialValues?.location ?? '',
    note:           initialValues?.notes ?? '',
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
      applicationId,
      interviewType: form.interviewType,
      scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
      ...(form.durationMinutes ? { durationMinutes: parseInt(form.durationMinutes, 10) } : {}),
      ...(form.meetingLink.trim() ? { meetingLink: form.meetingLink.trim() } : {}),
      ...(form.location.trim() ? { location: form.location.trim() } : {}),
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    };
    try {
      await mutation.mutateAsync(payload);
      onSuccess(isReschedule ? 'Interview rescheduled successfully' : 'Interview scheduled successfully');
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to schedule interview');
    }
  }

  const inputCls = (err?: string) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none bg-surface transition-colors focus:border-primary focus:shadow-[0_0_0_3px_rgba(21,87,255,0.09)] ${err ? 'border-danger' : 'border-token'}`;

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative bg-surface w-full sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-token shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-heading">
              {isReschedule ? 'Reschedule Interview' : 'Schedule Interview'}
            </h2>
            <p className="text-caption text-subtle mt-0.5 truncate max-w-[320px]">
              {candidateName} · {jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover text-subtle hover:text-muted transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="schedule-interview-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Interview type */}
            <div>
              <label className="block text-sm font-bold text-body-secondary mb-2">Interview Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['video', 'phone', 'in_person'] as const).map(type => {
                  const active = form.interviewType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set('interviewType', type)}
                      className="flex flex-col items-center gap-2 py-3.5 rounded-xl border text-caption font-semibold transition-all"
                      style={{
                        border: `1.5px solid ${active ? PRIMARY : 'var(--color-border)'}`,
                        background: active ? `${PRIMARY}10` : 'var(--color-surface)',
                        color: active ? PRIMARY : 'var(--color-muted)',
                      }}
                    >
                      <span style={{ color: active ? PRIMARY : 'var(--color-subtle)' }}>{MODE_CONFIG[type].icon}</span>
                      {MODE_CONFIG[type].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-body-secondary mb-1.5">
                  Date <span style={{ color: PRIMARY }}>*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls(errors.date)}
                />
                {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-body-secondary mb-1.5">
                  Time <span style={{ color: PRIMARY }}>*</span>
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => set('time', e.target.value)}
                  className={inputCls(errors.time)}
                />
                {errors.time && <p className="text-xs text-danger mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-bold text-body-secondary mb-1.5">Duration</label>
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
                <label className="block text-sm font-bold text-body-secondary mb-1.5">Meeting Link</label>
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
                <label className="block text-sm font-bold text-body-secondary mb-1.5">Location</label>
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
              <label className="block text-sm font-bold text-body-secondary mb-1.5">
                Notes <span className="text-subtle font-normal text-micro">(optional)</span>
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
        <div className="px-6 py-4 border-t border-token shrink-0 flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            rounded="xl"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            rounded="xl"
            type="submit"
            form="schedule-interview-form"
            loading={mutation.isPending}
            className="flex-[2]"
          >
            {isReschedule ? 'Reschedule Interview' : 'Schedule Interview'}
          </Button>
        </div>
      </div>
    </div>
  );
}
