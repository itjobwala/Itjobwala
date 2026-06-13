'use client';

import { useState } from 'react';
import { useAdminJobsQuery, usePatchJobStatusMutation } from '../hooks/useAdmin';
import type { AdminJob } from '../types/admin.types';
import Modal from '@/src/components/ui/Modal';

const ACCENT = '#6366f1';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, [string, string]> = {
    active:  ['#22c55e', '#22c55e18'],
    removed: ['#ef4444', '#ef444418'],
    closed:  ['#94a3b8', '#94a3b818'],
  };
  const [color, bg] = colors[status] ?? ['#94a3b8', '#94a3b818'];
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize"
      style={{ color, background: bg }}>{status}</span>
  );
}

export default function AdminJobsPage() {
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [page,   setPage]       = useState(1);
  const [confirm, setConfirm]   = useState<null | { job: AdminJob; newStatus: string }>(null);

  const params = { search: search || undefined, status: status || undefined, page };
  const { data, isLoading, isError } = useAdminJobsQuery(params);
  const patchStatus = usePatchJobStatusMutation();

  const jobs       = data?.jobs ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.limit ?? 20));

  async function executeAction() {
    if (!confirm) return;
    await patchStatus.mutateAsync({ id: confirm.job.id, status: confirm.newStatus });
    setConfirm(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl">Jobs</h1>
        <p className="text-slate-400 text-sm mt-1">Moderate job listings — take down or restore</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search title or company…"
          className="rounded-xl px-4 py-2 text-sm text-white outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', minWidth: 220 }}
          onFocus={e => { e.currentTarget.style.borderColor = ACCENT; }}
          onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        />
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl px-4 py-2 text-sm text-white outline-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="removed">Removed</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Title', 'Company', 'Poster', 'Type', 'Status', 'Posted', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)', width: 60 + j * 15 }} />
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoading && isError && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-red-400 text-sm">Failed to load jobs.</td></tr>
              )}
              {!isLoading && !isError && jobs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">No jobs found.</td></tr>
              )}
              {!isLoading && jobs.map((job: AdminJob) => (
                <tr key={job.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{job.title}</td>
                  <td className="px-4 py-3 text-slate-300">{job.company_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-400 text-xs">
                      <p>{job.poster_name}</p>
                      <p className="text-slate-500">{job.poster_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 capitalize text-xs">{job.job_type}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {job.status !== 'removed' ? (
                        <button onClick={() => setConfirm({ job, newStatus: 'removed' })}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border-none cursor-pointer"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                          Take down
                        </button>
                      ) : (
                        <button onClick={() => setConfirm({ job, newStatus: 'active' })}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border-none cursor-pointer"
                          style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-400 text-sm">{total} total</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
              Prev
            </button>
            <span className="px-3 py-1.5 text-xs text-slate-400">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirm && (
        <Modal isOpen onClose={() => setConfirm(null)} titleId="admin-job-confirm-title">
          <div className="p-6 space-y-4">
            <h2 id="admin-job-confirm-title" className="font-bold text-gray-900 text-base">
              {confirm.newStatus === 'removed' ? 'Take down job' : 'Restore job'}
            </h2>
            <p className="text-sm text-gray-600">
              {confirm.newStatus === 'removed'
                ? <>Take down <strong>{confirm.job.title}</strong> at {confirm.job.company_name}? It will be hidden from all public searches immediately.</>
                : <>Restore <strong>{confirm.job.title}</strong> at {confirm.job.company_name}? It will reappear in public job search.</>
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer"
                style={{ background: '#f1f5f9', color: '#64748b' }}>
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={patchStatus.isPending}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white border-none cursor-pointer disabled:opacity-60"
                style={{ background: confirm.newStatus === 'removed' ? '#ef4444' : '#6366f1' }}>
                {patchStatus.isPending ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
