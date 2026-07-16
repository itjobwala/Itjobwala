'use client';

import { useState } from 'react';
import { useAdminReportsQuery, useResolveReportMutation } from '../hooks/useAdmin';
import type { AdminReport } from '../types/admin.types';
import Modal from '@/src/components/ui/Modal';
import { downloadAdminCsv } from '../services/admin.api';

function ReportStatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    open:      ['#f59e0b', '#f59e0b18'],
    resolved:  ['#22c55e', '#22c55e18'],
    dismissed: ['#94a3b8', '#94a3b818'],
  };
  const [color, bg] = map[status] ?? ['#94a3b8', '#94a3b818'];
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize"
      style={{ color, background: bg }}>{status}</span>
  );
}

interface ConfirmState {
  report: AdminReport;
  action: 'resolved' | 'dismissed';
  note: string;
}

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<'open' | 'resolved' | 'dismissed' | ''>('');
  const [page, setPage]     = useState(1);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [note, setNote]     = useState('');
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadAdminCsv(
        '/admin/export/reports',
        statusFilter ? { status: statusFilter } : {},
        `reports_${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } finally {
      setExporting(false);
    }
  }

  const params = { status: statusFilter || undefined, page };
  const { data, isLoading, isError } = useAdminReportsQuery(params as { status?: 'open' | 'resolved' | 'dismissed'; page?: number });
  const resolve = useResolveReportMutation();

  const reports    = data?.reports ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.limit ?? 20));

  function openConfirm(report: AdminReport, action: 'resolved' | 'dismissed') {
    setNote('');
    setConfirm({ report, action, note: '' });
  }

  async function executeResolve() {
    if (!confirm) return;
    await resolve.mutateAsync({ id: confirm.report.id, status: confirm.action, resolution_note: note || undefined });
    setConfirm(null);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-h1 text-white">User Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Review reports submitted by users about jobs, recruiters, or candidates</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-50 transition-all"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
        >
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['', 'open', 'resolved', 'dismissed'] as const).map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={{
              background: statusFilter === s ? '#6366f1' : '#1e293b',
              color: statusFilter === s ? '#fff' : '#94a3b8',
            }}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : isError ? (
        <p className="text-red-400 text-sm">Failed to load reports</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-semibold">No reports</p>
          <p className="text-sm mt-1">No reports match the current filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="rounded-xl p-5" style={{ background: '#0f172a' }}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <ReportStatusBadge status={report.status} />
                    <span className="text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                      style={{ background: '#6366f122', color: '#818cf8' }}>
                      {report.target_type} #{report.target_id}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm">{report.reason}</p>
                  {report.details && (
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{report.details}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-1.5">
                    Reported by: {report.reporter_name ?? 'Unknown'} {report.reporter_email ? `(${report.reporter_email})` : ''}
                    {' · '}
                    {new Date(report.created_at).toLocaleString('en-IN')}
                  </p>
                  {report.resolution_note && (
                    <p className="text-slate-400 text-xs mt-1 italic">Resolution: {report.resolution_note}</p>
                  )}
                </div>
                {report.status === 'open' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openConfirm(report, 'resolved')}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-bold hover:opacity-80"
                      style={{ background: '#22c55e22', color: '#22c55e' }}
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => openConfirm(report, 'dismissed')}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-bold hover:opacity-80"
                      style={{ background: '#94a3b822', color: '#94a3b8' }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400 text-sm">{total} reports · Page {page} of {totalPages}</span>
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
        <Modal isOpen onClose={() => setConfirm(null)} titleId="resolve-report-title">
          <div className="p-5 lg:p-8 space-y-4">
            <h2 id="resolve-report-title" className="text-h6 text-heading">
              {confirm.action === 'resolved' ? 'Resolve' : 'Dismiss'} report
            </h2>
            <p className="text-sm text-gray-600">
              "{confirm.report.reason}" — {confirm.report.target_type} #{confirm.report.target_id}
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Resolution note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add an internal note about how this was resolved…"
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={executeResolve}
                disabled={resolve.isPending}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                style={{ background: confirm.action === 'resolved' ? '#22c55e' : '#6366f1' }}
              >
                {resolve.isPending ? 'Saving…' : confirm.action === 'resolved' ? 'Mark Resolved' : 'Dismiss'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
