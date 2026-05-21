'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SmartNavbar from '@/src/components/navbar/SmartNavbar';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import ConfirmationDialog from '@/src/components/common/ConfirmationDialog';
import { useMyApplicationsInfiniteQuery, useWithdrawApplicationMutation } from '@/src/hooks/useApplications';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import StatusBadge from '@/src/components/ui/StatusBadge';
import Card from '@/src/components/ui/Card';

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
  const { toast, show: showToast } = useToast();
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
      showToast((error as Error).message || 'Failed to withdraw application', 'error');
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
                  className="text-[13px] font-bold text-white bg-primary rounded-lg px-4 py-2.5 hover:opacity-90 active:opacity-80 transition-opacity"
                  style={{ color: '#fff' }}
                >
                  Find More Jobs
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
            {/* Filters */}
            <Card padding="lg" className="mb-6" overflow>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label htmlFor="app-filter-status" className="block text-[12px] font-bold text-gray-500 mb-2">
                    Filter by Status
                  </label>
                  <select
                    id="app-filter-status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">All Status</option>
                    {(['applied','shortlisted','interview','offer','hired','rejected','withdrawn'] as const).map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label htmlFor="app-sort-order" className="block text-[12px] font-bold text-gray-500 mb-2">
                    Sort By
                  </label>
                  <select
                    id="app-sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Applications List */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-[13px] text-gray-400">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <Card padding="none" className="p-12 text-center" overflow>
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
                  className="inline-block text-[13px] font-bold text-white bg-primary rounded-lg px-4 py-2.5 hover:opacity-90 active:opacity-80 transition-opacity"
                  style={{ color: '#fff' }}
                >
                  Browse Jobs
                </Link>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {applications.map((app) => {
                  const logoUrl = app.company_logo || null;
                  const logoFallback = (app.company?.[0] || '?').toUpperCase();
                  const color = app.company_color_class ?? hashColor(app.company);

                  return (
                    <Card
                      key={app.id}
                      className="hover:border-primary/20 transition-colors group"
                      overflow
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
                            <StatusBadge status={app.status} size="md" className="shrink-0" />
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
                    </Card>
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

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />

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
