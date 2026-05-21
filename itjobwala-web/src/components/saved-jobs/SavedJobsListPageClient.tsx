'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SmartNavbar from '@/src/components/SmartNavbar';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import ConfirmationDialog from '@/src/components/common/ConfirmationDialog';
import { useSavedJobsInfiniteQuery, useUnsaveJobMutation } from '@/src/hooks/useApplications';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
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

export default function SavedJobsListPageClient() {
  const { isHydrated, session, isLoading: authLoading } = useAuthHydration();
  const canLoadCandidateData = isHydrated && !authLoading && session?.userRole === 'candidate';
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [unsavingId, setUnsavingId] = useState<string | null>(null);
  const { toast, show: showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUnsaveId, setPendingUnsaveId] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSavedJobsInfiniteQuery({
    limit: 20,
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

  const unsaveMutation = useUnsaveJobMutation();

  const handleUnsaveClick = (jobId: string) => {
    setPendingUnsaveId(jobId);
    setConfirmOpen(true);
  };

  const handleConfirmUnsave = async () => {
    if (!pendingUnsaveId) return;
    setConfirmOpen(false);
    setUnsavingId(pendingUnsaveId);
    try {
      await unsaveMutation.mutateAsync(pendingUnsaveId);
      showToast('Job removed from saved list', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Failed to unsave job', 'error');
    } finally {
      setUnsavingId(null);
      setPendingUnsaveId(null);
    }
  };

  const handleCancelUnsave = () => {
    setConfirmOpen(false);
    setPendingUnsaveId(null);
  };

  // Deduplicate jobs by ID to prevent key errors
  const savedJobs = (() => {
    const allJobs = data?.pages.flatMap(page => page.saved_jobs) || [];
    const seen = new Set<string>();
    return allJobs.filter(job => {
      if (seen.has(job.id)) return false;
      seen.add(job.id);
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
                    Saved Jobs
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    Browse and manage your saved job listings
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
            {/* Sort Filter */}
            <Card padding="lg" className="mb-6" overflow>
              <div className="w-full sm:w-64">
                <label htmlFor="saved-sort-order" className="block text-[12px] font-bold text-gray-500 mb-2">
                  Sort By
                </label>
                <select
                  id="saved-sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="newest">Recently Saved</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </Card>

            {/* Saved Jobs List */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-[13px] text-gray-400">Loading saved jobs...</p>
              </div>
            ) : savedJobs.length === 0 ? (
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
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-[14px] font-semibold text-gray-500 mb-1">No saved jobs yet</p>
                <p className="text-[13px] text-gray-400 mb-4">
                  Save jobs to revisit them later
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
                {savedJobs.map((job) => {
                  const logoUrl = job.company_logo || null;
                  const logoFallback = (job.company?.[0] || '?').toUpperCase();
                  const color = job.company_color_class ?? hashColor(job.company);

                  return (
                    <Card
                      key={job.id}
                      className="hover:border-primary/20 transition-colors group"
                      overflow
                    >
                      <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={job.company}
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
                                href={`/jobs/${job.job_id}`}
                                className="text-[15px] font-bold text-[#0f172a] hover:text-primary transition-colors block"
                              >
                                {job.title}
                              </Link>
                              <p className="text-[13px] text-gray-500 mt-1">
                                {job.company} {job.location && `· ${job.location}`}
                              </p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex items-center gap-3 flex-wrap text-[12px] text-gray-400 mb-2">
                            {job.salary_min && job.salary_max && (
                              <span>₹{Math.floor(job.salary_min / 100000)}–{Math.floor(job.salary_max / 100000)} LPA</span>
                            )}
                            {job.job_type && <span>·</span>}
                            {job.job_type && <span className="capitalize">{job.job_type}</span>}
                            {job.work_mode && <span>·</span>}
                            {job.work_mode && <span className="capitalize">{job.work_mode}</span>}
                          </div>

                          {/* Meta */}
                          <p className="text-[12px] text-gray-400">
                            Saved {relativeDate(job.saved_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/jobs/${job.job_id}`}
                            className="text-[12px] font-semibold text-primary bg-primary/10 rounded-lg px-3 py-2 hover:bg-primary/20 transition-colors"
                          >
                            View & Apply
                          </Link>
                          <button
                            onClick={() => handleUnsaveClick(job.job_id)}
                            disabled={unsavingId === job.job_id}
                            className="text-[12px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:border-red-200 hover:text-red-600 disabled:opacity-50 transition-colors"
                          >
                            {unsavingId === job.job_id ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Infinite scroll sentinel */}
            {savedJobs.length > 0 && (
              <div ref={observerTarget} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="text-center">
                    <div className="inline-block">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
                    </div>
                    <p className="text-[13px] text-gray-400 mt-3">Loading more jobs...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />

      {/* Unsave confirmation dialog */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        title="Remove Saved Job"
        message="Are you sure you want to remove this job from your saved list?"
        confirmText="Remove"
        cancelText="Keep Saved"
        isDangerous={true}
        isLoading={unsavingId !== null}
        onConfirm={handleConfirmUnsave}
        onCancel={handleCancelUnsave}
      />
    </ProtectedRoute>
  );
}
