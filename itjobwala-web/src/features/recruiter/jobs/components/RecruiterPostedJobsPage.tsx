'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRecruiterPostedJobsQuery, useSubmitJobMutation } from '@/features/recruiter/hooks';
import { RecruiterShell } from '@/layout/shell';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import StatusBadge from '@/src/components/ui/StatusBadge';
import EmptyState from '@/src/components/ui/EmptyState';
import Button, { buttonVariants } from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';

const STATUS_FILTERS = [
  { value: '',              label: 'All' },
  { value: 'active',        label: 'Active' },
  { value: 'draft',         label: 'Draft' },
  { value: 'pending',       label: 'Pending Review' },
  { value: 'closed',        label: 'Closed' },
  { value: 'removed',       label: 'Removed' },
];

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RecruiterPostedJobsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const { toast, show: showToast } = useToast();
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const filters = {
    page,
    limit: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading, error } = useRecruiterPostedJobsQuery(filters, true);
  const submitMutation = useSubmitJobMutation();

  function handleStatusFilter(val: string) {
    setStatusFilter(val);
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  async function handleSubmit(jobId: string) {
    setPublishingId(jobId);
    try {
      const result = await submitMutation.mutateAsync(jobId);
      const msg = result.status === 'active'
        ? 'Job is now live!'
        : result.status === 'pending'
        ? 'Job submitted for review'
        : 'Job needs changes before publishing';
      showToast(msg, result.status === 'needs_changes' ? 'error' : 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to submit job', 'error');
    } finally {
      setPublishingId(null);
    }
  }

  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  return (
    <RecruiterShell>
      {/* Page header */}
      <div className="bg-surface border-b border-token">
        <div className="container-responsive mx-auto px-5 sm:px-8 py-8">
          <h3 className="text-h3 text-heading" style={{ letterSpacing: '-0.5px' }}>
            Posted Jobs
          </h3>
          <p className="text-small-text text-subtle mt-1">
            Manage your active job listings
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-responsive mx-auto px-5 sm:px-8 py-8">

        {/* Filters + Search row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          {/* Status tabs */}
          <div className="grid grid-cols-3 sm:flex gap-2 sm:flex-wrap">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleStatusFilter(value)}
                className={`px-4 py-2 rounded-sm text-sm font-medium text-center transition-colors ${
                  statusFilter === value
                    ? 'bg-primary text-white'
                    : 'bg-surface text-body-secondary border border-token hover:border-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search + Post a Job — always one row */}
          <div className="flex gap-2 sm:ml-auto items-center">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:flex-none">
              <div className="relative flex-1 sm:flex-none">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search by title..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-token text-sm text-body placeholder:text-muted outline-none focus:border-primary transition-colors w-full sm:w-[200px]"
                />
                {searchInput && (
                  <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <Button variant="outline" size="sm" type="submit" className="shrink-0">
                Search
              </Button>
            </form>
            {(!data || data.jobs.length > 0 || search || statusFilter) && (
              <Link
                href="/recruiter/post-job"
                className={buttonVariants({ variant: 'primary', size: 'sm', className: 'px-4 shrink-0' })}
              >
                + Post a Job
              </Link>
            )}
          </div>
        </div>

        {/* Active search indicator */}
        {search && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted">
            Results for <span className="font-semibold text-heading">"{search}"</span>
            <button onClick={clearSearch} className="text-primary hover:underline font-medium">Clear</button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-token border-t-primary rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-muted">Loading posted jobs...</p>
          </div>
        ) : error ? (
          <div className="bg-danger-bg border border-danger rounded-xl p-4 text-danger">
            {error instanceof Error ? error.message : 'Failed to load posted jobs'}
          </div>
        ) : !data || data.jobs.length === 0 ? (
          <EmptyState
            emoji="📋"
            title={search || statusFilter ? 'No jobs match your filters' : 'No jobs posted yet'}
            description={search || statusFilter ? 'Try changing the status filter or search term' : 'Start by posting your first job listing'}
            cta={!search && !statusFilter ? { label: '+ Post a Job', href: '/recruiter/post-job' } : undefined}
          />
        ) : (
          <>
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-surface-alt border-b border-token">
                    <tr>
                      <th className="px-6 py-4 text-left text-lg font-semibold text-body-secondary min-w-[220px]">Job Title</th>
                      <th className="px-6 py-4 text-left text-lg font-semibold text-body-secondary">Location</th>
                      <th className="px-6 py-4 text-center text-lg font-semibold text-body-secondary">Applications</th>
                      <th className="px-6 py-4 text-left text-lg font-semibold text-body-secondary">Status</th>
                      <th className="px-6 py-4 text-left text-lg font-semibold text-body-secondary">Posted</th>
                      <th className="px-6 py-4 text-center text-lg font-semibold text-body-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.jobs.map((job) => (
                      <tr key={job.id} className="border-b border-token last:border-0 hover:bg-surface-alt transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-heading">{job.title}</p>
                          <p className="text-micro text-subtle mt-0.5">{job.jobType} · {job.workMode}</p>
                          {job.moderationReason && (
                            <p className="text-micro text-amber-600 mt-1 font-medium">⚠ {job.moderationReason}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-small-text text-body-secondary align-middle">{job.location}</td>
                        <td className="px-6 py-4 text-small-text text-body-secondary text-center align-middle">{job.applicationCount ?? 0}</td>
                        <td className="px-6 py-4 align-middle">
                          <StatusBadge status={job.status} size="md" />
                        </td>
                        <td className="px-6 py-4 text-small-text text-body-secondary align-middle">{formatDate(job.postedDate ?? job.createdAt)}</td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center justify-center gap-3 flex-wrap">
                            {(job.status === 'draft' || job.status === 'needs_changes') && (
                              <Button
                                variant="primary"
                                size="sm"
                                loading={publishingId === job.id}
                                disabled={publishingId === job.id}
                                onClick={() => handleSubmit(job.id)}
                              >
                                Submit for Review
                              </Button>
                            )}
                            <Link href={`/recruiter/posted-jobs/${job.id}`} className="text-primary text-sm font-semibold hover:underline">
                              View
                            </Link>
                            {job.status !== 'removed' && (
                              <Link href={`/recruiter/posted-jobs/${job.id}/edit`} className="text-muted text-sm font-semibold hover:text-primary hover:underline transition-colors">
                                Edit
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted">
                  Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total} jobs
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </Button>
                  <span className="text-sm text-muted px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="md"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
    </RecruiterShell>
  );
}
