'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SmartNavbar } from '@/layout/navbar';
import { ProtectedRoute } from '@/features/auth';
import ConfirmationDialog from '@/src/components/common/ConfirmationDialog';
import { useMyApplicationsInfiniteQuery, useWithdrawApplicationMutation } from '@/features/candidate/applications/hooks';
import VerifiedBadge from '@/src/components/ui/VerifiedBadge';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import StatusBadge from '@/src/components/ui/StatusBadge';
import Card from '@/src/components/ui/Card';
import { hashColor, relativeDate } from '@/src/lib/utils/format';

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
      <div className="min-h-screen bg-surface-alt">
        <SmartNavbar />

        <div className="pt-[68px]">
          {/* Header bar */}
          <div className="bg-surface border-b border-token">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>
                    My Applications
                  </h1>
                  <p className="text-sm text-subtle mt-0.5">
                    Track and manage your job applications
                  </p>
                </div>
                <Link
                  href="/candidate/jobs"
                  className="text-sm font-semibold text-white bg-primary rounded-xl px-4 py-2 hover:opacity-90 active:opacity-80 transition-opacity"
                >
                  Find More Jobs
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
            {/* Filters */}
            <div className="mb-6 flex items-end gap-4 flex-wrap">
                {/* Status Filter */}
                <div>
                  <label htmlFor="app-filter-status" className="block text-caption font-bold text-muted mb-2">
                    Filter by Status
                  </label>
                  <div className="relative">
                    <select
                      id="app-filter-status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none w-[180px] rounded-xl border border-token bg-surface pl-3.5 pr-9 py-2.5 text-sm font-medium text-heading outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="">All Status</option>
                      {(['applied','shortlisted','interview','hired','rejected','withdrawn'] as const).map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label htmlFor="app-sort-order" className="block text-caption font-bold text-muted mb-2">
                    Sort By
                  </label>
                  <div className="relative">
                    <select
                      id="app-sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                      className="appearance-none w-[180px] rounded-xl border border-token bg-surface pl-3.5 pr-9 py-2.5 text-sm font-medium text-heading outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
            </div>

            {/* Applications List */}
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-surface rounded-2xl border border-token p-5 flex gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-surface-alt shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-4 bg-surface-alt rounded w-1/2" />
                      <div className="h-3 bg-surface-alt rounded w-1/3" />
                      <div className="h-6 bg-surface-alt rounded-full w-24 mt-1" />
                    </div>
                    <div className="h-7 bg-surface-alt rounded-full w-24 shrink-0 self-start" />
                  </div>
                ))}
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
                  className="mx-auto text-subtle mb-3"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <p className="text-base font-bold text-heading mb-1">No applications yet</p>
                <p className="text-sm text-subtle mb-4">
                  {statusFilter ? 'No applications with this status' : 'You haven\'t applied to any jobs yet'}
                </p>
                <Link
                  href="/candidate/jobs"
                  className="inline-block text-sm font-bold text-white bg-primary rounded-lg px-4 py-2.5 hover:opacity-90 active:opacity-80 transition-opacity"
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
                            className="w-12 h-12 rounded-xl object-contain bg-surface border border-token shrink-0"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 ${color}`}>
                            {logoFallback}
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/candidate/jobs/${app.job_id}`}
                            className="text-sm font-bold text-heading hover:text-primary transition-colors block mb-0.5"
                          >
                            {app.title}
                          </Link>
                          <p className="text-sm text-muted mb-2 flex items-center gap-1.5 flex-wrap">
                            <span>{app.company}</span>
                            {app.company_verified && <VerifiedBadge />}
                            {app.location && <span>· {app.location}</span>}
                          </p>
                          {/* Meta */}
                          <p className="text-caption text-subtle">
                            Applied {relativeDate(app.applied_at)}
                            {app.updated_at && app.updated_at !== app.applied_at && (
                              <> • Updated {relativeDate(app.updated_at)}</>
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={app.status} size="md" className="shrink-0" />
                          <Link
                            href={`/candidate/applications/${app.id}`}
                            className="text-caption font-semibold text-body-secondary border border-token rounded-xl px-3 py-2 hover:border-primary/40 hover:text-primary transition-colors"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/candidate/jobs/${app.job_id}`}
                            className="text-caption font-semibold text-body-secondary border border-token rounded-xl px-3 py-2 hover:border-primary/40 hover:text-primary transition-colors"
                          >
                            View Job
                          </Link>
                          {app.status === 'applied' && (
                            <button
                              onClick={() => handleWithdrawClick(app.id)}
                              disabled={withdrawingId === app.id}
                              className="text-caption font-semibold text-danger border border-danger rounded-xl px-3 py-2 hover:bg-danger-bg disabled:opacity-50 transition-colors"
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
                      <div className="w-8 h-8 rounded-full border-2 border-token border-t-primary animate-spin" />
                    </div>
                    <p className="text-sm text-subtle mt-3">Loading more applications...</p>
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
