'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRecruiterPostedJobsQuery, useUpdateRecruiterJobMutation } from '@/src/hooks/useRecruiter';
import RecruiterShell from './RecruiterShell';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  draft:  'bg-yellow-50 text-yellow-700',
  closed: 'bg-gray-100 text-gray-500',
};

const STATUS_FILTERS = [
  { value: '',       label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft',  label: 'Draft' },
  { value: 'closed', label: 'Closed' },
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
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const filters = {
    page,
    limit: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading, error } = useRecruiterPostedJobsQuery(filters, true);
  const updateMutation = useUpdateRecruiterJobMutation();

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

  async function handlePublish(jobId: string) {
    setPublishingId(jobId);
    try {
      await updateMutation.mutateAsync({ jobId, data: { status: 'active' } });
      setSuccessToast('Job published successfully');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      setErrorToast(err instanceof Error ? err.message : 'Failed to publish job');
      setTimeout(() => setErrorToast(''), 4000);
    } finally {
      setPublishingId(null);
    }
  }

  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  return (
    <RecruiterShell>
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
                Posted Jobs
              </h1>
              <p className="text-[13px] text-gray-400 mt-1">
                Manage your active job listings
              </p>
            </div>
            <Link
              href="/recruiter/post-job"
              className="px-4 py-2.5 bg-primary text-white text-[13px] font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              + Post a Job
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">

        {/* Filters + Search row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleStatusFilter(value)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  statusFilter === value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by title..."
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-700 outline-none focus:border-primary transition-colors w-[200px]"
              />
              {searchInput && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button type="submit" className="px-4 py-2 bg-white border border-gray-200 text-[13px] font-semibold text-gray-600 rounded-xl hover:border-primary hover:text-primary transition-colors">
              Search
            </button>
          </form>
        </div>

        {/* Active search indicator */}
        {search && (
          <div className="mb-4 flex items-center gap-2 text-[13px] text-gray-500">
            Results for <span className="font-semibold text-gray-800">"{search}"</span>
            <button onClick={clearSearch} className="text-primary hover:underline font-medium">Clear</button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-gray-500">Loading posted jobs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error instanceof Error ? error.message : 'Failed to load posted jobs'}
          </div>
        ) : !data || data.jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[40px] mb-4">📋</div>
            <h3 className="text-[18px] font-semibold text-[#0f172a] mb-2">
              {search || statusFilter ? 'No jobs match your filters' : 'No jobs posted yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search || statusFilter ? 'Try changing the status filter or search term' : 'Start by posting your first job listing'}
            </p>
            {!search && !statusFilter && (
              <Link
                href="/recruiter/post-job"
                className="inline-block px-4 py-2.5 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                + Post a Job
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Job Title</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Location</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Applications</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Posted</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.jobs.map((job) => (
                      <tr key={job.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-semibold text-[#0f172a]">{job.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{job.jobType} · {job.workMode}</p>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-gray-600">{job.location}</td>
                        <td className="px-6 py-4 text-[13px] text-gray-600">{job.applicationCount ?? 0}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 text-[12px] font-semibold rounded-full capitalize ${STATUS_STYLES[job.status] ?? STATUS_STYLES.closed}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-gray-600">{formatDate(job.postedDate ?? job.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            {job.status === 'draft' && (
                              <button
                                onClick={() => handlePublish(job.id)}
                                disabled={publishingId === job.id}
                                className="text-[13px] font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-opacity flex items-center gap-1.5"
                              >
                                {publishingId === job.id
                                  ? <><div className="w-3 h-3 border-[2px] border-white/40 border-t-white rounded-full animate-spin" /> Publishing…</>
                                  : 'Publish'}
                              </button>
                            )}
                            <Link href={`/recruiter/posted-jobs/${job.id}`} className="text-primary text-[13px] font-semibold hover:underline">
                              View
                            </Link>
                            <Link href={`/recruiter/posted-jobs/${job.id}/edit`} className="text-gray-500 text-[13px] font-semibold hover:text-primary hover:underline transition-colors">
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-[13px] text-gray-500">
                  Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total} jobs
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-[13px] text-gray-500 px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Success toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 ${
          successToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-green-600 text-white text-[13px] font-semibold rounded-2xl px-5 py-3.5 shadow-2xl">
          <span className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M2 6l3 3 5-5" />
            </svg>
          </span>
          {successToast}
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
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </span>
          {errorToast}
        </div>
      </div>
    </RecruiterShell>
  );
}
