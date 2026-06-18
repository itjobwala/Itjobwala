'use client';

import { useState } from 'react';
import { useAdminJobQueueQuery, useModerateJobMutation } from '../hooks/useAdmin';
import type { AdminQueueJob } from '../types/admin.types';
import Modal from '@/src/components/ui/Modal';

const ACCENT = '#6366f1';

function QueueStatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    pending:       ['#f59e0b', '#f59e0b18'],
    needs_changes: ['#ef4444', '#ef444418'],
  };
  const [color, bg] = map[status] ?? ['#94a3b8', '#94a3b818'];
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color, background: bg }}>{status === 'needs_changes' ? 'Needs Changes' : 'Pending'}</span>
  );
}

function FlagBadge({ severity }: { severity: 'block' | 'warn' }) {
  return (
    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
      style={{ color: severity === 'block' ? '#ef4444' : '#f59e0b', background: severity === 'block' ? '#ef444418' : '#f59e0b18' }}>
      {severity}
    </span>
  );
}

type Decision = 'approve' | 'needs_changes' | 'remove';

interface ConfirmState {
  job: AdminQueueJob;
  decision: Decision;
  reason: string;
}

export default function AdminJobQueuePage() {
  const [page, setPage]       = useState(1);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [reason, setReason]   = useState('');

  const { data, isLoading, isError } = useAdminJobQueueQuery(page);
  const moderate = useModerateJobMutation();

  const jobs       = data?.jobs ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.limit ?? 20));

  function openConfirm(job: AdminQueueJob, decision: Decision) {
    setReason('');
    setConfirm({ job, decision, reason: '' });
  }

  async function executeModeration() {
    if (!confirm) return;
    await moderate.mutateAsync({ id: confirm.job.id, decision: confirm.decision, reason: reason || undefined });
    setConfirm(null);
  }

  const decisionLabel = (d?: Decision) =>
    d === 'approve' ? 'Approve & Publish' : d === 'needs_changes' ? 'Request Changes' : 'Remove';

  const decisionColor = (d?: Decision) =>
    d === 'approve' ? '#22c55e' : d === 'needs_changes' ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl">Job Moderation Queue</h1>
        <p className="text-slate-400 text-sm mt-1">Review pending and flagged job listings before they go live</p>
      </div>

      {isLoading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : isError ? (
        <p className="text-red-400 text-sm">Failed to load queue</p>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-semibold">Queue is empty</p>
          <p className="text-sm mt-1">All job submissions have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="rounded-xl p-5" style={{ background: '#0f172a' }}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white font-bold text-base">{job.title}</span>
                    <QueueStatusBadge status={job.status} />
                    {job.recruiter_verified && (
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ color: '#22c55e', background: '#22c55e18' }}>
                        Verified Recruiter
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">
                    {job.company_name} · {job.location} · {job.job_type}
                  </p>
                  {job.poster_email && (
                    <p className="text-slate-500 text-xs mt-0.5">Posted by: {job.poster_name} ({job.poster_email})</p>
                  )}
                  {job.submitted_at && (
                    <p className="text-slate-500 text-xs mt-0.5">
                      Submitted: {new Date(job.submitted_at).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openConfirm(job, 'approve')}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition-opacity hover:opacity-80"
                    style={{ background: '#22c55e22', color: '#22c55e' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openConfirm(job, 'needs_changes')}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition-opacity hover:opacity-80"
                    style={{ background: '#f59e0b22', color: '#f59e0b' }}
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => openConfirm(job, 'remove')}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition-opacity hover:opacity-80"
                    style={{ background: '#ef444422', color: '#ef4444' }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Auto-flags */}
              {job.auto_flags && job.auto_flags.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Content flags</p>
                  {job.auto_flags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <FlagBadge severity={f.severity} />
                      <span className="text-[12px] text-slate-300">[{f.field}] {f.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Previous moderation reason */}
              {job.moderation_reason && (
                <div className="mt-3 p-2.5 rounded-lg text-[12px] text-amber-300" style={{ background: '#f59e0b11' }}>
                  Previous note: {job.moderation_reason}
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400 text-sm">
                {total} items · Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-40"
                  style={{ background: '#1e293b', color: '#94a3b8' }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-40"
                  style={{ background: '#1e293b', color: '#94a3b8' }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {confirm && (
        <Modal isOpen onClose={() => setConfirm(null)} titleId="moderate-job-title">
          <div className="p-6 space-y-4">
            <h2 id="moderate-job-title" className="text-base font-bold text-heading">
              {decisionLabel(confirm.decision)}: "{confirm.job.title}"
            </h2>

            {confirm.decision !== 'approve' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Explain why this job needs changes or is being removed…"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            )}

            {confirm.decision === 'approve' && (
              <p className="text-sm text-gray-600">
                This job will be published and visible to candidates immediately.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={executeModeration}
                disabled={moderate.isPending || (confirm.decision !== 'approve' && !reason.trim())}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                style={{ background: decisionColor(confirm.decision) }}
              >
                {moderate.isPending ? 'Processing…' : decisionLabel(confirm.decision)}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
