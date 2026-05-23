'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import SmartNavbar from '@/src/components/navbar/SmartNavbar';
import JobSearchBar from './JobSearchBar';
import JobFilterSidebar from './JobFilterSidebar';
import JobList from './JobList';
import type { FilterState, SearchState } from './types';
import { normalizeJob } from './types';
import { useJobsQuery } from '@/src/hooks/useJobs';
import { useSavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } from '@/src/hooks/useApplications';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import type { JobFilters } from '@/src/types/jobs';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';

const SORT_OPTIONS = [
  { value: 'newest',             label: 'Newest first' },
  { value: 'salary_high',        label: 'Highest salary' },
  { value: 'least_competitive',  label: 'Least competitive' },
];

const DEFAULT_FILTERS: FilterState = {
  jobType: [],
  workMode: [],
  experience: '',
  companyType: [],
  salaryMin: undefined,
  salaryMax: undefined,
  skills: [],
};

const DEFAULT_SEARCH: SearchState = { jobTitle: '', company: '', city: '' };

type SearchParamsReader = Pick<URLSearchParams, 'get'>;

function getCsvParam(searchParams: SearchParamsReader, key: string): string[] {
  return (searchParams.get(key) ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
}

function getNumberParam(searchParams: SearchParamsReader, key: string): number | undefined {
  const value = Number(searchParams.get(key));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function countActiveFilters(filters: FilterState): number {
  return (
    filters.jobType.length +
    filters.workMode.length +
    (filters.experience ? 1 : 0) +
    filters.companyType.length +
    (filters.salaryMin ? 1 : 0) +
    (filters.salaryMax ? 1 : 0) +
    filters.skills.length
  );
}

export default function JobsPageClient() {
  const searchParams  = useSearchParams();
  const { isHydrated, session, isLoading: authLoading } = useAuthHydration();

  const [filters, setFilters]           = useState<FilterState>({
    ...DEFAULT_FILTERS,
    jobType: getCsvParam(searchParams, 'job_type'),
    workMode: getCsvParam(searchParams, 'work_mode'),
    experience: searchParams.get('experience') ?? '',
    companyType: getCsvParam(searchParams, 'company_type'),
    salaryMin: getNumberParam(searchParams, 'salary_min'),
    salaryMax: getNumberParam(searchParams, 'salary_max'),
    skills: getCsvParam(searchParams, 'skills'),
  });
  const [salaryForApi, setSalaryForApi] = useState<{ min?: number; max?: number }>({
    min: getNumberParam(searchParams, 'salary_min'),
    max: getNumberParam(searchParams, 'salary_max'),
  });
  const salaryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounce salary filter changes — slider fires on every px drag
  useEffect(() => {
    salaryTimerRef.current = setTimeout(() => {
      setSalaryForApi({ min: filters.salaryMin, max: filters.salaryMax });
    }, 400);
    return () => clearTimeout(salaryTimerRef.current);
  }, [filters.salaryMin, filters.salaryMax]);

  const [search, setSearch]             = useState<SearchState>({
    jobTitle: searchParams.get('q') ?? '',
    company:  searchParams.get('company') ?? '',
    city:     searchParams.get('loc') ?? '',
  });
  const [appliedSearch, setAppliedSearch] = useState<SearchState>({
    jobTitle: searchParams.get('q') ?? '',
    company:  searchParams.get('company') ?? '',
    city:     searchParams.get('loc') ?? '',
  });
  const [sort, setSort]         = useState('newest');
  const [page, setPage]         = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { toast, show: showToast } = useToast();

  const canLoadSavedJobs = isHydrated && !authLoading && session?.userRole === 'candidate';
  const { data: savedData } = useSavedJobsQuery({ limit: 100 }, canLoadSavedJobs);
  const saveJobMutation = useSaveJobMutation();
  const unsaveJobMutation = useUnsaveJobMutation();

  // Build query params from local state
  const apiFilters: JobFilters = {
    page,
    limit:   20,
    sort,
    ...(appliedSearch.jobTitle ? { q: appliedSearch.jobTitle } : {}),
    ...(appliedSearch.company ? { company: appliedSearch.company } : {}),
    ...(appliedSearch.city ? { location: appliedSearch.city } : {}),
    ...(filters.jobType.length > 0 ? { job_type: filters.jobType.join(',') } : {}),
    ...(filters.workMode.length > 0 ? { work_mode: filters.workMode.join(',') } : {}),
    ...(filters.experience ? { experience: filters.experience } : {}),
    ...(filters.companyType.length > 0 ? { company_type: filters.companyType.join(',') } : {}),
    ...(salaryForApi.min ? { salary_min: salaryForApi.min } : {}),
    ...(salaryForApi.max ? { salary_max: salaryForApi.max } : {}),
    ...(filters.skills.length > 0 ? { skills: filters.skills.join(',') } : {}),
  };

  const { data, isLoading, isError } = useJobsQuery(apiFilters);

  const handleReset = useCallback(() => {
    clearTimeout(salaryTimerRef.current);
    setFilters(DEFAULT_FILTERS);
    setSearch(DEFAULT_SEARCH);
    setAppliedSearch(DEFAULT_SEARCH);
    setSalaryForApi({ min: undefined, max: undefined });
    setPage(1);
  }, []);

  // Build a Set of saved job IDs for quick lookup
  const savedJobIds = new Set<string>();
  if (savedData?.saved_jobs) {
    savedData.saved_jobs.forEach(job => savedJobIds.add(job.job_id));
  }

  const handleSaveJob = async (jobId: string) => {
    if (!canLoadSavedJobs) {
      const message = 'Please log in as a candidate to save jobs';
      showToast(message, 'error');
      throw new Error(message);
    }
    try {
      await saveJobMutation.mutateAsync(jobId);
      showToast('Job saved successfully', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Failed to save job', 'error');
      throw error;
    }
  };

  const handleUnsaveJob = async (jobId: string) => {
    if (!canLoadSavedJobs) {
      const message = 'Please log in as a candidate to manage saved jobs';
      showToast(message, 'error');
      throw new Error(message);
    }
    try {
      await unsaveJobMutation.mutateAsync(jobId);
      showToast('Job removed from saved list', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Failed to unsave job', 'error');
      throw error;
    }
  };

  const activeFilterCount = countActiveFilters(filters);
  const jobs       = (data?.jobs ?? []).map(normalizeJob);
  const pagination = data?.pagination;
  const total      = pagination?.total ?? 0;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <SmartNavbar />

      <div className="pt-[68px]">
        {/* Hero bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
            <h1
              className="text-[26px] sm:text-[32px] font-extrabold text-[#0f172a] mb-1"
              style={{ letterSpacing: '-0.5px' }}
            >
              Browse IT Jobs
            </h1>
            <p className="text-[14px] text-gray-500 mb-6">
              {isLoading ? 'Loading roles…' : `${total} curated roles — updated daily`}
            </p>
            <JobSearchBar
              search={search}
              onChange={setSearch}
              onSearch={() => { setAppliedSearch(search); setPage(1); }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
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
                    <span className="font-bold text-[#0f172a]">
                      {isLoading ? '–' : total}
                    </span>{' '}
                    jobs found
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13px] text-gray-400 hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                  className="appearance-none text-[13px] font-semibold text-[#0f172a] bg-white border border-gray-200 rounded-xl pl-3.5 pr-8 py-2 outline-none hover:border-primary/40 cursor-pointer transition-colors"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
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
              <JobList
                jobs={jobs}
                isLoading={isLoading}
                onReset={handleReset}
                savedJobIds={savedJobIds}
                onSaveJob={handleSaveJob}
                onUnsaveJob={handleUnsaveJob}
              />

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

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
    </div>
  );
}
