'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminUsersQuery, usePatchUserStatusMutation, usePatchRecruiterVerifyMutation } from '../hooks/useAdmin';
import type { AdminCandidate, AdminRecruiter } from '../types/admin.types';
import Modal from '@/src/components/ui/Modal';

const ACCENT = '#6366f1';

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: color + '18', color }}>
      {label}
    </span>
  );
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [role,   setRole]   = useState<'candidate' | 'recruiter'>((searchParams.get('role') as 'candidate' | 'recruiter') ?? 'candidate');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | ''>('');
  const [page,   setPage]   = useState(1);

  const [confirmAction, setConfirmAction] = useState<null | {
    type: 'suspend' | 'reactivate' | 'verify' | 'unverify';
    userId: number;
    userName: string;
  }>(null);

  const params = { role, search: search || undefined, status: status || undefined, page };
  const { data, isLoading, isError } = useAdminUsersQuery(params);

  const patchStatus = usePatchUserStatusMutation();
  const patchVerify = usePatchRecruiterVerifyMutation();

  function changeRole(r: 'candidate' | 'recruiter') {
    setRole(r); setPage(1); setSearch(''); setStatus('');
    router.replace(`/admin/users?role=${r}`);
  }

  async function confirmAndExecute() {
    if (!confirmAction) return;
    const { type, userId } = confirmAction;
    if (type === 'suspend')     await patchStatus.mutateAsync({ role, id: userId, is_active: false });
    if (type === 'reactivate')  await patchStatus.mutateAsync({ role, id: userId, is_active: true });
    if (type === 'verify')      await patchVerify.mutateAsync({ id: userId, is_verified: true });
    if (type === 'unverify')    await patchVerify.mutateAsync({ id: userId, is_verified: false });
    setConfirmAction(null);
  }

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.limit ?? 20));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl">Users</h1>
        <p className="text-slate-400 text-sm mt-1">Manage candidates and recruiters</p>
      </div>

      {/* Role toggle */}
      <div className="flex gap-2 mb-5">
        {(['candidate', 'recruiter'] as const).map(r => (
          <button key={r} onClick={() => changeRole(r)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer capitalize transition-all"
            style={role === r
              ? { background: ACCENT, color: '#fff' }
              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }
            }>
            {r}s
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name or email…"
          className="rounded-xl px-4 py-2 text-sm text-white outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', minWidth: 220 }}
          onFocus={e => { e.currentTarget.style.borderColor = ACCENT; }}
          onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        />
        <select
          value={status}
          onChange={e => { setStatus(e.target.value as 'active' | 'suspended' | ''); setPage(1); }}
          className="rounded-xl px-4 py-2 text-sm text-white outline-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Email</th>
                {role === 'recruiter' && (
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Company</th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Status</th>
                {role === 'recruiter' && (
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Verified</th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {Array.from({ length: role === 'recruiter' ? 7 : 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.07)', width: 80 + (j * 20) }} />
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoading && isError && (
                <tr><td colSpan={role === 'recruiter' ? 7 : 5} className="px-4 py-8 text-center text-red-400 text-sm">Failed to load users.</td></tr>
              )}
              {!isLoading && !isError && users.length === 0 && (
                <tr><td colSpan={role === 'recruiter' ? 7 : 5} className="px-4 py-12 text-center text-slate-500 text-sm">No users found.</td></tr>
              )}
              {!isLoading && users.map(u => {
                const rec = role === 'recruiter' ? (u as AdminRecruiter) : null;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{u.full_name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    {role === 'recruiter' && (
                      <td className="px-4 py-3 text-slate-300">{rec?.company_name}</td>
                    )}
                    <td className="px-4 py-3">
                      {u.is_active
                        ? <Badge label="Active"    color="#22c55e" />
                        : <Badge label="Suspended" color="#ef4444" />
                      }
                    </td>
                    {role === 'recruiter' && rec && (
                      <td className="px-4 py-3">
                        {rec.is_verified
                          ? <Badge label="Verified"   color="#6366f1" />
                          : <Badge label="Unverified" color="#94a3b8" />
                        }
                      </td>
                    )}
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {u.is_active
                          ? (
                            <button onClick={() => setConfirmAction({ type: 'suspend', userId: u.id, userName: u.full_name })}
                              className="px-3 py-1 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all"
                              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                              Suspend
                            </button>
                          ) : (
                            <button onClick={() => setConfirmAction({ type: 'reactivate', userId: u.id, userName: u.full_name })}
                              className="px-3 py-1 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all"
                              style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                              Reactivate
                            </button>
                          )
                        }
                        {role === 'recruiter' && rec && (
                          rec.is_verified
                            ? (
                              <button onClick={() => setConfirmAction({ type: 'unverify', userId: u.id, userName: u.full_name })}
                                className="px-3 py-1 rounded-lg text-xs font-semibold border-none cursor-pointer"
                                style={{ background: 'rgba(99,102,241,0.12)', color: ACCENT }}>
                                Unverify
                              </button>
                            ) : (
                              <button onClick={() => setConfirmAction({ type: 'verify', userId: u.id, userName: u.full_name })}
                                className="px-3 py-1 rounded-lg text-xs font-semibold border-none cursor-pointer"
                                style={{ background: 'rgba(99,102,241,0.12)', color: ACCENT }}>
                                Verify
                              </button>
                            )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
      {confirmAction && (
        <Modal isOpen onClose={() => setConfirmAction(null)} titleId="admin-confirm-title">
          <div className="p-6 space-y-4">
            <h2 id="admin-confirm-title" className="text-base font-bold text-heading">
              {confirmAction.type === 'suspend'    ? 'Suspend account' :
               confirmAction.type === 'reactivate' ? 'Reactivate account' :
               confirmAction.type === 'verify'     ? 'Verify recruiter' : 'Remove verification'}
            </h2>
            <p className="text-sm text-gray-600">
              {confirmAction.type === 'suspend'    && <>Suspend <strong>{confirmAction.userName}</strong>? They will be signed out immediately and unable to log in.</>}
              {confirmAction.type === 'reactivate' && <>Reactivate <strong>{confirmAction.userName}</strong>? They will be able to log in again.</>}
              {confirmAction.type === 'verify'     && <>Mark <strong>{confirmAction.userName}</strong> as a verified employer?</>}
              {confirmAction.type === 'unverify'   && <>Remove verified status from <strong>{confirmAction.userName}</strong>?</>}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer"
                style={{ background: '#f1f5f9', color: '#64748b' }}>
                Cancel
              </button>
              <button
                onClick={confirmAndExecute}
                disabled={patchStatus.isPending || patchVerify.isPending}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white border-none cursor-pointer disabled:opacity-60"
                style={{
                  background: ['suspend', 'unverify'].includes(confirmAction.type) ? '#ef4444' : '#6366f1',
                }}>
                {patchStatus.isPending || patchVerify.isPending ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
