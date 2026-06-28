'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { SmartNavbar } from '@/layout/navbar';
import JobSearchBar from './JobSearchBar';
import JobFilterSidebar from './JobFilterSidebar';
import JobList from './JobList';
import type { FilterState, SearchState } from '../../shared/types';
import { normalizeJob } from '../../shared/types';
import { useJobsQuery } from '@/features/jobs/browse/hooks';
import { useResumeInsightsQuery } from '@/features/resume/hooks';
import { useSavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } from '@/features/candidate/applications/hooks';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import type { JobFilters } from '@/features/jobs/shared';
import { useToast } from '@/src/hooks/useToast';
import QueryErrorState from '@/src/components/ui/QueryErrorState';
import Toast from '@/src/components/ui/Toast';
import Button from '@/src/components/ui/Button';

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

  const canLoadSavedJobs  = isHydrated && !authLoading && session?.userRole === 'candidate';
  const { data: insightData } = useResumeInsightsQuery(canLoadSavedJobs);
  const candidateSkills       = insightData?.extracted_skills ?? [];
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

  const { data, isLoading: isQueryLoading, isError, refetch } = useJobsQuery(apiFilters, isHydrated);
  const isLoading = !isHydrated || isQueryLoading;

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
    <div className="min-h-screen bg-surface-alt">
      <SmartNavbar />

      <div className="pt-[68px]">
        {/* Hero bar */}
        <div className="bg-surface border-b border-token">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
            <button
              onClick={() => setShowFilters(v => !v)}
              className="lg:hidden self-start flex items-center gap-2 text-sm font-semibold text-body-secondary bg-surface border border-token rounded-xl px-4 py-2.5 hover:border-primary/40 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex items-center justify-between w-full mb-4 gap-3">
              <p className="text-sm text-muted font-medium">{isLoading || isError ? '–' : total} QA roles found</p>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="text-sm font-semibold border border-token rounded-lg px-3 py-1.5 bg-surface text-heading outline-none focus:border-primary/50"
              >
                {SORT_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
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
              {isError ? (
                <QueryErrorState
                  message="We couldn't load job listings. Please check your connection and try again."
                  onRetry={() => refetch()}
                />
              ) : (
              <JobList
                jobs={jobs}
                isLoading={isLoading}
                onReset={handleReset}
                savedJobIds={savedJobIds}
                onSaveJob={handleSaveJob}
                onUnsaveJob={handleUnsaveJob}
                candidateSkills={candidateSkills}
              />
              )}

              {/* Pagination */}
              {!isLoading && pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="md"
                    disabled={!pagination.has_prev}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Prev
                  </Button>
                  <span className="text-sm text-muted px-2">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="md"
                    disabled={!pagination.has_next}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </Button>
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
