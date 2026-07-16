'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SmartNavbar } from '@/layout/navbar';
import { ProtectedRoute } from '@/features/auth';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import { useJobAlerts, type JobAlert } from '../hooks/useJobAlerts';

// ── Constants ────────────────────────────────────────────────────────────────

const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const JOB_TYPES = [
  { value: 'full-time',  label: 'Full-time' },
  { value: 'part-time',  label: 'Part-time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const FREQUENCIES = [
  { value: 'instant', label: 'Instant',    sub: 'As soon as a match is found' },
  { value: 'daily',   label: 'Daily digest', sub: 'One email per day' },
  { value: 'weekly',  label: 'Weekly digest', sub: 'Every Monday morning' },
] as const;

const FREQ_COLOR: Record<string, string> = {
  instant: 'bg-danger-bg text-danger',
  daily:   'bg-primary/10 text-primary',
  weekly:  'bg-surface-hover text-muted',
};

// ── Form type + blank ─────────────────────────────────────────────────────────

interface AlertForm {
  keywords:  string;
  location:  string;
  workModes: string[];
  jobTypes:  string[];
  frequency: 'instant' | 'daily' | 'weekly';
}

const BLANK: AlertForm = {
  keywords:  '',
  location:  '',
  workModes: [],
  jobTypes:  [],
  frequency: 'daily',
};

// ── Alert summary line ────────────────────────────────────────────────────────

function alertSummary(a: JobAlert) {
  const parts: string[] = [];
  if (a.keywords)         parts.push(a.keywords);
  if (a.location)         parts.push(a.location);
  if (a.workModes.length) parts.push(a.workModes.join(', '));
  if (a.jobTypes.length)  parts.push(a.jobTypes.join(', '));
  return parts.join(' · ') || 'All IT jobs';
}

function relDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

// ── Create Alert Modal ────────────────────────────────────────────────────────

function CreateAlertModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (data: AlertForm) => void;
}) {
  const [form, setForm] = useState<AlertForm>({ ...BLANK });
  const [errors, setErrors] = useState<{ keywords?: string }>({});

  function toggleArr(key: 'workModes' | 'jobTypes', val: string) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
    }));
  }

  function handleSubmit() {
    if (!form.keywords.trim()) {
      setErrors({ keywords: 'Enter at least one keyword or job title' });
      return;
    }
    onCreate(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-token">
          <h2 className="text-h6 text-heading">Create job alert</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center text-muted transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Keywords */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
              Keywords / Job title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. QA Engineer, Selenium, React"
              value={form.keywords}
              onChange={e => { setForm(f => ({ ...f, keywords: e.target.value })); setErrors({}); }}
              className="w-full bg-surface-alt border border-token rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
            {errors.keywords && <p className="text-xs text-danger mt-1.5">{errors.keywords}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Bangalore, Mumbai, Remote"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full bg-surface-alt border border-token rounded-xl px-4 py-3 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
          </div>

          {/* Work mode */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Work mode
            </label>
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map(m => {
                const active = form.workModes.includes(m.value);
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => toggleArr('workModes', m.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-alt text-muted border-token hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job type */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Job type
            </label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map(t => {
                const active = form.jobTypes.includes(t.value);
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => toggleArr('jobTypes', t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-alt text-muted border-token hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Alert frequency
            </label>
            <div className="flex flex-col gap-2">
              {FREQUENCIES.map(f => (
                <label
                  key={f.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    form.frequency === f.value
                      ? 'border-primary bg-primary/5'
                      : 'border-token bg-surface-alt hover:border-primary/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={f.value}
                    checked={form.frequency === f.value}
                    onChange={() => setForm(prev => ({ ...prev, frequency: f.value }))}
                    className="accent-primary"
                  />
                  <div>
                    <div className="text-sm font-semibold text-heading">{f.label}</div>
                    <div className="text-xs text-muted">{f.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" size="md" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" fullWidth onClick={handleSubmit}>Create alert</Button>
        </div>
      </div>
    </div>
  );
}

// ── Alert Card ────────────────────────────────────────────────────────────────

function AlertCard({ alert, onToggle, onDelete }: {
  alert: JobAlert;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card padding="md" className={`transition-opacity ${alert.active ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-heading truncate">{alert.keywords || 'All IT jobs'}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${FREQ_COLOR[alert.frequency]}`}>
              {alert.frequency}
            </span>
            {!alert.active && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-hover text-subtle">
                Paused
              </span>
            )}
          </div>
          <p className="text-xs text-muted leading-relaxed">{alertSummary(alert)}</p>
          <p className="text-[11px] text-subtle mt-1.5">Created {relDate(alert.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle */}
          <button
            onClick={onToggle}
            title={alert.active ? 'Pause alert' : 'Resume alert'}
            className={`relative w-10 h-5.5 rounded-full transition-colors ${alert.active ? 'bg-primary' : 'bg-surface-hover border border-token'}`}
            style={{ width: 40, height: 22 }}
          >
            <span
              className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform ${alert.active ? 'translate-x-[18px]' : 'translate-x-0'}`}
            />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            title="Delete alert"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-danger-bg hover:text-danger transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function JobAlertsPageClient() {
  const { alerts, hydrated, create, toggle, remove } = useJobAlerts();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeCount   = alerts.filter(a => a.active).length;
  const pausedCount   = alerts.filter(a => !a.active).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-alt">
        <SmartNavbar />

        <div className="pt-16 lg:pt-[72px]">
          <div className="max-w-[780px] mx-auto px-5 sm:px-8 py-8">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link href="/candidate/dashboard" className="text-sm text-muted hover:text-primary transition-colors font-medium">
                    ← Dashboard
                  </Link>
                </div>
                <h3 className="text-h3 text-heading" style={{ letterSpacing: '-0.5px' }}>
                  Job Alerts
                </h3>
                <p className="text-small-text text-muted mt-1">
                  Get notified when new jobs match your criteria.
                </p>
              </div>
              <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New alert
              </Button>
            </div>

            {/* Email notice */}
            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3.5 mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              <p className="text-xs text-primary leading-relaxed">
                <span className="font-bold">Email delivery coming soon.</span> Your alerts are saved and will start sending once email dispatch is live. You can already create and manage them.
              </p>
            </div>

            {/* Stats row */}
            {hydrated && alerts.length > 0 && (
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-surface border border-token rounded-xl px-4 py-3 text-center">
                  <div className="text-xl font-extrabold text-heading">{alerts.length}</div>
                  <div className="text-xs text-muted mt-0.5">Total alerts</div>
                </div>
                <div className="flex-1 bg-surface border border-token rounded-xl px-4 py-3 text-center">
                  <div className="text-xl font-extrabold text-success">{activeCount}</div>
                  <div className="text-xs text-muted mt-0.5">Active</div>
                </div>
                <div className="flex-1 bg-surface border border-token rounded-xl px-4 py-3 text-center">
                  <div className="text-xl font-extrabold text-muted">{pausedCount}</div>
                  <div className="text-xs text-muted mt-0.5">Paused</div>
                </div>
              </div>
            )}

            {/* Alert list */}
            {!hydrated ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-surface border border-token rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : alerts.length === 0 ? (
              /* Empty state */
              <div className="bg-surface border border-token rounded-2xl px-8 py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <h3 className="text-base font-extrabold text-heading mb-2">No job alerts yet</h3>
                <p className="text-sm text-muted mb-6 max-w-xs mx-auto leading-relaxed">
                  Create an alert and we&apos;ll notify you whenever a matching IT job is posted.
                </p>
                <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
                  Create your first alert
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onToggle={() => toggle(alert.id)}
                    onDelete={() => setDeleteId(alert.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create modal */}
        {showModal && (
          <CreateAlertModal
            onClose={() => setShowModal(false)}
            onCreate={data => {
              create({
                name: data.keywords || 'All IT jobs',
                keywords:  data.keywords,
                location:  data.location,
                workModes: data.workModes,
                jobTypes:  data.jobTypes,
                frequency: data.frequency,
              });
            }}
          />
        )}

        {/* Delete confirm */}
        {deleteId && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="text-base font-extrabold text-heading mb-2">Delete alert?</h3>
              <p className="text-sm text-muted mb-6">This alert will be permanently removed.</p>
              <div className="flex gap-3">
                <Button variant="outline" size="md" fullWidth onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button variant="danger" size="md" fullWidth onClick={() => { remove(deleteId); setDeleteId(null); }}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
