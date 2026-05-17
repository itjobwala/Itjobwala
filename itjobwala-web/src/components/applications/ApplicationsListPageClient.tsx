'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SmartNavbar from '@/src/components/SmartNavbar';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import ConfirmationDialog from '@/src/components/common/ConfirmationDialog';
import { useMyApplicationsInfiniteQuery, useWithdrawApplicationMutation } from '@/src/hooks/useApplications';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';

const STATUS_CONFIG: Record<string, { label: string; className: string; color: string }> = {
  applied:     { label: 'Applied',     className: 'bg-blue-50 text-blue-700',       color: 'bg-blue-100' },
  shortlisted: { label: 'Shortlisted', className: 'bg-purple-50 text-purple-700',   color: 'bg-purple-100' },
  interview:   { label: 'Interview',   className: 'bg-yellow-50 text-yellow-700',   color: 'bg-yellow-100' },
  offer:       { label: 'Offer',       className: 'bg-emerald-50 text-emerald-700', color: 'bg-emerald-100' },
  hired:       { label: 'Hired',       className: 'bg-green-50 text-green-700',     color: 'bg-green-100' },
  rejected:    { label: 'Rejected',    className: 'bg-red-50 text-red-500',         color: 'bg-red-100' },
  withdrawn:   { label: 'Withdrawn',   className: 'bg-gray-50 text-gray-500',       color: 'bg-gray-100' },
};

const COLOR_CLASSES = [
  'bg-blue-600', 'bg-green-600', 'bg-indigo-600', 'bg-violet-600',
  'bg-orange-500', 'bg-teal-600', 'bg-red-600', 'bg-pink-600',
];

function hashColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return COLOR_CLASSES[h % COLOR_CLASSES.length];
}

function relativeDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 14) return '1 week ago';
  return `${Math.floor(diff / 7)} weeks ago`;
}

export default function ApplicationsListPageClient() {
  const { isHydrated, session, isLoading: authLoading } = useAuthHydration();
  const canLoadCandidateData = isHydrated && !authLoading && session?.userRole === 'candidate';
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingWithdrawId, setPendingWithdrawId] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMyApplicationsInfiniteQuery({
    limit: 20,
    status: statusFilter || undefined,
    sort: sortOrder,
  }, canLoadCandidateData);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const withdrawMutation = useWithdrawApplicationMutation();

  const handleWithdrawClick = (appId: string) => {
    setPendingWithdrawId(appId);
    setConfirmOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!pendingWithdrawId) return;
    setConfirmOpen(false);
    setWithdrawingId(pendingWithdrawId);
    try {
      await withdrawMutation.mutateAsync(pendingWithdrawId);
    } catch (error) {
      const message = (error as Error).message || 'Failed to withdraw application';
      setErrorToast(message);
      setTimeout(() => setErrorToast(''), 4000);
    } finally {
      setWithdrawingId(null);
      setPendingWithdrawId(null);
    }
  };

  const handleCancelWithdraw = () => {
    setConfirmOpen(false);
    setPendingWithdrawId(null);
  };

  // Deduplicate applications by ID to prevent key errors
  const applications = (() => {
    const allApps = data?.pages.flatMap(page => page.applications) || [];
    const seen = new Set<string>();
    return allApps.filter(app => {
      if (seen.has(app.id)) return false;
      seen.add(app.id);
      return true;
    });
  })();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f9fafb]">
        <SmartNavbar />

        <div className="pt-[68px]">
          {/* Header bar */}
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[22px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>
                    My Applications
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    Track and manage your job applications
                  </p>
                </div>
                <Link
                  href="/jobs"
                  className="text-[13px] font-bold text-white bg-primary rounded-lg px-4 py-2.5 hover:brightness-110 transition-all"
                >
                  Find More Jobs
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([status, { label }]) => (
                      <option key={status} value={status}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applications List */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-[13px] text-gray-400">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto text-gray-300 mb-3"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <p className="text-[14px] font-semibold text-gray-500 mb-1">No applications yet</p>
                <p className="text-[13px] text-gray-400 mb-4">
                  {statusFilter ? 'No applications with this status' : 'You haven\'t applied to any jobs yet'}
                </p>
                <Link
                  href="/jobs"
                  className="inline-block text-[13px] font-bold text-white bg-primary rounded-lg px-4 py-2.5 hover:brightness-110 transition-all"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {applications.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.applied;
                  const logoUrl = app.company_logo || null;
                  const logoFallback = (app.company?.[0] || '?').toUpperCase();
                  const color = app.company_color_class ?? hashColor(app.company);

                  return (
                    <div
                      key={app.id}
                      className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-primary/20 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={app.company}
                            className="w-12 h-12 rounded-xl object-contain bg-white border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 ${color}`}>
                            {logoFallback}
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link
                                href={`/jobs/${app.job_id}`}
                                className="text-[15px] font-bold text-[#0f172a] hover:text-primary transition-colors block"
                              >
                                {app.title}
                              </Link>
                              <p className="text-[13px] text-gray-500 mt-1">
                                {app.company} {app.location && `· ${app.location}`}
                              </p>
                            </div>
                            <span className={`text-[11px] font-bold rounded-full px-3 py-1 shrink-0 ${cfg.className}`}>
                              {cfg.label}
                            </span>
                          </div>

                          {/* Meta */}
                          <p className="text-[12px] text-gray-400">
                            Applied {relativeDate(app.applied_at)}
                            {app.updated_at && app.updated_at !== app.applied_at && (
                              <> • Updated {relativeDate(app.updated_at)}</>
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/jobs/${app.job_id}`}
                            className="text-[12px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:border-primary/40 hover:text-primary transition-colors"
                          >
                            View Job
                          </Link>
                          {app.status === 'applied' && (
                            <button
                              onClick={() => handleWithdrawClick(app.id)}
                              disabled={withdrawingId === app.id}
                              className="text-[12px] font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Infinite scroll sentinel */}
            {applications.length > 0 && (
              <div ref={observerTarget} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="text-center">
                    <div className="inline-block">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
                    </div>
                    <p className="text-[13px] text-gray-400 mt-3">Loading more applications...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 ${
          errorToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-red-600 text-white text-[13px] font-semibold rounded-2xl px-5 py-3.5 shadow-2xl">
          <span className="w-5 h-5 rounded-full bg-red-700 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </span>
          {errorToast}
        </div>
      </div>

      {/* Withdraw confirmation dialog */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText="Withdraw"
        cancelText="Keep Application"
        isDangerous={true}
        isLoading={withdrawingId !== null}
        onConfirm={handleConfirmWithdraw}
        onCancel={handleCancelWithdraw}
      />
    </ProtectedRoute>
  );
}
