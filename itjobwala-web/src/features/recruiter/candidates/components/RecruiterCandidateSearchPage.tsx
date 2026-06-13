'use client';

import { useState, useEffect, useCallback } from 'react';
import { RecruiterShell } from '@/layout/shell';
import Button from '@/src/components/ui/Button';
import { useCandidateSearchQuery } from '@/features/recruiter/hooks';
import type { CandidateSearchFilters } from '../types/candidateSearch.types';
import CandidateResultCard from './CandidateResultCard';
import CandidateProfileDrawer from './CandidateProfileDrawer';

const QA_SPECIALIZATIONS = [
  '', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Data Science',
  'Machine Learning', 'Cloud', 'Security', 'QA / Testing', 'Embedded', 'Blockchain',
];
const QA_SENIORITIES = ['', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Principal', 'Staff'];
const SORT_OPTIONS: { value: CandidateSearchFilters['sort']; label: string }[] = [
  { value: 'relevance',  label: 'Most relevant' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'recent',     label: 'Recently updated' },
];

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-micro font-extrabold text-subtle uppercase tracking-[1px] mb-1">
      {children}
    </label>
  );
}

const inputCls = 'w-full text-sm border border-token rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-subtle';

function FilterInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${inputCls} bg-surface`}
    >
      {options.map(o => (
        <option key={o} value={o}>{o || 'Any'}</option>
      ))}
    </select>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-subtle">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <p className="text-base font-semibold text-heading mb-1">
        {hasFilters ? 'No candidates match your filters' : 'No candidates available'}
      </p>
      <p className="text-sm text-subtle max-w-xs">
        {hasFilters
          ? 'Try broadening your search — remove a filter or lower the minimum QA score.'
          : 'Candidates who have opted into recruiter visibility will appear here.'}
      </p>
    </div>
  );
}

export default function RecruiterCandidateSearchPage() {
  const [qInput, setQInput]             = useState('');
  const [q, setQ]                       = useState('');
  const [skillsInput, setSkillsInput]   = useState('');
  const [skills, setSkills]             = useState('');
  const [location, setLocation]         = useState('');
  const [expMin, setExpMin]             = useState('');
  const [expMax, setExpMax]             = useState('');
  const [qaSpec, setQaSpec]             = useState('');
  const [qaSeniority, setQaSeniority]   = useState('');
  const [minQaScore, setMinQaScore]     = useState('');
  const [openToWork, setOpenToWork]     = useState(false);
  const [sort, setSort]                 = useState<CandidateSearchFilters['sort']>('relevance');
  const [page, setPage]                 = useState(1);
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setQ(qInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    const t = setTimeout(() => { setSkills(skillsInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [skillsInput]);

  const resetPage = useCallback(() => setPage(1), []);

  const filters: CandidateSearchFilters = {
    ...(q              ? { q }                                     : {}),
    ...(skills         ? { skills }                                : {}),
    ...(location       ? { location }                              : {}),
    ...(expMin !== ''  ? { experience_min: parseInt(expMin, 10) }  : {}),
    ...(expMax !== ''  ? { experience_max: parseInt(expMax, 10) }  : {}),
    ...(qaSpec         ? { qa_specialization: qaSpec }             : {}),
    ...(qaSeniority    ? { qa_seniority: qaSeniority }             : {}),
    ...(minQaScore !== '' ? { min_qa_score: parseInt(minQaScore, 10) } : {}),
    ...(openToWork     ? { open_to_work: true }                    : {}),
    sort,
    page,
    limit: 12,
  };

  const { data, isLoading, isError } = useCandidateSearchQuery(filters);

  const candidates = data?.candidates ?? [];
  const pagination = data?.pagination;
  const hasFilters = !!(q || skills || location || expMin || expMax || qaSpec || qaSeniority || minQaScore || openToWork);

  function handleClearFilters() {
    setQInput(''); setQ('');
    setSkillsInput(''); setSkills('');
    setLocation(''); setExpMin(''); setExpMax('');
    setQaSpec(''); setQaSeniority(''); setMinQaScore('');
    setOpenToWork(false); setSort('relevance');
    setPage(1);
  }

  return (
    <RecruiterShell>
    <div className="min-h-screen bg-surface-alt">
      <div className="max-w-7xl mx-auto px-4 py-7 flex flex-col lg:flex-row gap-6">

        {/* Filter sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-surface rounded-2xl border border-token shadow-sm p-5 space-y-5 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold text-heading">Filters</p>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear all
                </Button>
              )}
            </div>

            <div>
              <FilterLabel>Keyword</FilterLabel>
              <FilterInput placeholder="Role, skill, tech…" value={qInput} onChange={setQInput} />
            </div>

            <div>
              <FilterLabel>Skills (comma-separated)</FilterLabel>
              <FilterInput placeholder="React, Node.js, AWS…" value={skillsInput} onChange={setSkillsInput} />
              <p className="text-micro text-subtle mt-1">All listed skills must match</p>
            </div>

            <div>
              <FilterLabel>Location</FilterLabel>
              <FilterInput placeholder="Bangalore, Remote…" value={location} onChange={v => { setLocation(v); resetPage(); }} />
            </div>

            <div>
              <FilterLabel>Experience (years)</FilterLabel>
              <div className="flex gap-2">
                <input
                  type="number" min={0} max={40}
                  value={expMin}
                  onChange={e => { setExpMin(e.target.value); resetPage(); }}
                  placeholder="Min"
                  className={inputCls}
                />
                <input
                  type="number" min={0} max={40}
                  value={expMax}
                  onChange={e => { setExpMax(e.target.value); resetPage(); }}
                  placeholder="Max"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <FilterLabel>QA Specialization</FilterLabel>
              <FilterSelect value={qaSpec} onChange={v => { setQaSpec(v); resetPage(); }} options={QA_SPECIALIZATIONS} />
            </div>

            <div>
              <FilterLabel>QA Seniority</FilterLabel>
              <FilterSelect value={qaSeniority} onChange={v => { setQaSeniority(v); resetPage(); }} options={QA_SENIORITIES} />
            </div>

            <div>
              <FilterLabel>Min QA Score (0–100)</FilterLabel>
              <input
                type="number" min={0} max={100}
                value={minQaScore}
                onChange={e => { setMinQaScore(e.target.value); resetPage(); }}
                placeholder="e.g. 70"
                className={inputCls}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <FilterLabel>Open to work only</FilterLabel>
              <button
                onClick={() => { setOpenToWork(v => !v); resetPage(); }}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${openToWork ? 'bg-primary' : 'bg-surface-mid'}`}
                role="switch"
                aria-checked={openToWork}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${openToWork ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h1 className="text-xl font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>
                Find Candidates
              </h1>
              {pagination && (
                <p className="text-sm text-subtle mt-0.5">
                  {pagination.total.toLocaleString()} candidate{pagination.total !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <select
              value={sort}
              onChange={e => { setSort(e.target.value as CandidateSearchFilters['sort']); resetPage(); }}
              className="text-sm border border-token rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-surface"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-token p-5 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-xl bg-surface-hover shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-surface-hover rounded-full w-1/3" />
                      <div className="h-3 bg-surface-hover rounded-full w-1/2" />
                      <div className="h-3 bg-surface-hover rounded-full w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="bg-surface rounded-2xl border border-danger p-8 text-center">
              <p className="text-base text-danger font-semibold">Failed to load candidates.</p>
              <p className="text-sm text-subtle mt-1">Check your connection and try again.</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && candidates.length === 0 && (
            <EmptyState hasFilters={hasFilters} />
          )}

          {/* Cards */}
          {!isLoading && !isError && candidates.length > 0 && (
            <div className="space-y-3">
              {candidates.map(c => (
                <CandidateResultCard
                  key={c.id}
                  candidate={c}
                  onView={setActiveCandidateId}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-subtle">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border border-token disabled:opacity-40 hover:border-primary/40 hover:text-primary transition-colors disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border border-token disabled:opacity-40 hover:border-primary/40 hover:text-primary transition-colors disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile drawer */}
      <CandidateProfileDrawer
        candidateId={activeCandidateId}
        onClose={() => setActiveCandidateId(null)}
      />
    </div>
    </RecruiterShell>
  );
}
