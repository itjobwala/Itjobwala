'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import SmartNavbar from '@/src/components/SmartNavbar';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import JobSearchBar from '@/src/components/jobs/JobSearchBar';
import JobFilterSidebar from '@/src/components/jobs/JobFilterSidebar';
import JobList from '@/src/components/jobs/JobList';
import { useJobsQuery } from '@/src/hooks/useJobs';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useLoading } from '@/src/contexts/LoadingContext';
import { normalizeJob } from '@/src/components/jobs/types';
import type { FilterState, SearchState } from '@/src/components/jobs/types';
import type { JobFilters } from '@/src/types/jobs';

const SORT_OPTIONS = [
  { value: 'newest',            label: 'Newest first'      },
  { value: 'salary_high',       label: 'Highest salary'    },
  { value: 'least_competitive', label: 'Least competitive' },
];

const DEFAULT_FILTERS: FilterState = {
  jobType: [], workMode: [], experience: '', companyType: [], salaryMin: undefined, salaryMax: undefined, skills: [],
};
const DEFAULT_SEARCH: SearchState = { jobTitle: '', company: '', city: '' };

function countActiveFilters(f: FilterState) {
  return f.jobType.length + f.workMode.length + (f.experience ? 1 : 0) + f.companyType.length +
         (f.salaryMin ? 1 : 0) + (f.salaryMax ? 1 : 0) + f.skills.length;
}


export default function CandidateDashboardPage() {
  const searchParams = useSearchParams();
  const { setLoading } = useLoading();

  // ── Job filters ──
  const [filters, setFilters]             = useState<FilterState>(DEFAULT_FILTERS);
  const [search, setSearch]               = useState<SearchState>({
    jobTitle: searchParams.get('q') ?? '', company: '', city: searchParams.get('loc') ?? '',
  });
  const [appliedSearch, setAppliedSearch] = useState<SearchState>({
    jobTitle: searchParams.get('q') ?? '', company: '', city: searchParams.get('loc') ?? '',
  });
  const [sort, setSort]       = useState('newest');
  const [page, setPage]       = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedFilters = useDebounce(filters, 500);
  const isFiltersChanged = JSON.stringify(filters) !== JSON.stringify(debouncedFilters);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters, appliedSearch, sort]);

  const apiFilters: JobFilters = {
    page,
    limit: 20,
    sort,
    ...(appliedSearch.jobTitle ? { q: appliedSearch.jobTitle } : {}),
    ...(appliedSearch.company ? { company: appliedSearch.company } : {}),
    ...(appliedSearch.city ? { location: appliedSearch.city } : {}),
    ...(debouncedFilters.jobType.length > 0 ? { job_type: debouncedFilters.jobType.join(',') } : {}),
    ...(debouncedFilters.workMode.length > 0 ? { work_mode: debouncedFilters.workMode.join(',') } : {}),
    ...(debouncedFilters.experience ? { experience: debouncedFilters.experience } : {}),
    ...(debouncedFilters.companyType.length > 0 ? { company_type: debouncedFilters.companyType.join(',') } : {}),
    ...(debouncedFilters.salaryMin ? { salary_min: debouncedFilters.salaryMin } : {}),
    ...(debouncedFilters.salaryMax ? { salary_max: debouncedFilters.salaryMax } : {}),
    ...(debouncedFilters.skills && debouncedFilters.skills.length > 0 ? { skills: debouncedFilters.skills.join(',') } : {}),
  };

  const { data, isLoading, isError } = useJobsQuery(apiFilters);

  useEffect(() => {
    const shouldShowLoader = isFiltersChanged || isLoading;
    setLoading(shouldShowLoader, 'Applying filters...');
  }, [isFiltersChanged, isLoading, setLoading]);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearch(DEFAULT_SEARCH);
    setAppliedSearch(DEFAULT_SEARCH);
    setPage(1);
  }, []);

  const jobs       = (data?.jobs ?? []).map(normalizeJob);
  const pagination = data?.pagination;
  const total      = pagination?.total ?? 0;
  const activeFilterCount = countActiveFilters(filters);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f9fafb]">
      <SmartNavbar />

      <div className="pt-[68px]">
        {/* ── Job listing ── */}
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
          {/* Search bar */}
          <div className="mb-8">
            <JobSearchBar
              search={search}
              onChange={setSearch}
              onSearch={() => { setAppliedSearch(search); setPage(1); }}
            />
          </div>
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(v => !v)}
                className="lg:hidden flex items-center gap-2 text-[13px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-primary/40 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <p className="text-[14px] text-gray-500">
                {isError ? (
                  <span className="text-red-500">Failed to load jobs</span>
                ) : (
                  <>
                    <span className="font-bold text-[#0f172a]">{isLoading ? '–' : total}</span>{' '}jobs found
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13px] text-gray-400 hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="text-[13px] font-semibold text-[#0f172a] bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none hover:border-primary/40 cursor-pointer transition-colors"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="sticky top-24 self-start">
                <JobFilterSidebar
                  filters={filters}
                  onChange={f => { setFilters(f); setPage(1); }}
                  onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
                  activeCount={activeFilterCount}
                />
              </div>
            </div>

            <div>
              <JobList jobs={jobs} isLoading={isLoading} onReset={handleReset} />

              {/* Pagination */}
              {!isLoading && pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    disabled={!pagination.has_prev}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 text-[13px] font-semibold rounded-xl border border-gray-200 disabled:opacity-40 hover:border-primary/40 transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-[13px] text-gray-500 px-2">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <button
                    disabled={!pagination.has_next}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 text-[13px] font-semibold rounded-xl border border-gray-200 disabled:opacity-40 hover:border-primary/40 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
