'use client';

import { useState, useEffect, useCallback } from 'react';
import { RecruiterShell } from '@/layout/shell';
import Button from '@/src/components/ui/Button';
import { useCandidateSearchQuery, useBulkMessageMutation } from '@/features/recruiter/hooks';
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

function BulkMessageModal({
  selectedIds,
  onClose,
}: {
  selectedIds: string[];
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [result, setResult]   = useState<{ sent: number; skipped: number } | null>(null);
  const bulk = useBulkMessageMutation();

  async function handleSend() {
    const data = await bulk.mutateAsync({ candidate_ids: selectedIds, message });
    setResult({ sent: data.sent.length, skipped: data.skipped.length });
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-h6 text-heading">Message candidates</h2>
            <p className="text-sm text-subtle mt-0.5">{selectedIds.length} recipient{selectedIds.length !== 1 ? 's' : ''} selected</p>
          </div>
          <button onClick={onClose} className="text-subtle hover:text-muted" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {result ? (
          <div className="text-center space-y-3 py-4">
            <p className="text-2xl font-black text-heading">{result.sent} sent</p>
            {result.skipped > 0 && <p className="text-sm text-subtle">{result.skipped} skipped</p>}
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-110">Done</button>
          </div>
        ) : (
          <>
            <textarea
              autoFocus
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message here…"
              rows={5}
              maxLength={4000}
              className="w-full text-sm border border-token rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
            <p className="text-micro text-subtle text-right">{message.length}/4000</p>
            {bulk.isError && <p className="text-sm text-danger">Failed to send. Please try again.</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold border border-token text-muted">Cancel</button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || bulk.isPending}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-110 disabled:opacity-50"
              >
                {bulk.isPending ? 'Sending…' : `Send to ${selectedIds.length}`}
              </button>
            </div>
          </>
        )}
      </div>
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
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFilters, setShowFilters]   = useState(false);

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

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

      {/* Page header */}
      <div className="bg-surface border-b border-token">
        <div className="container-responsive mx-auto px-5 sm:px-8 py-8">
          <div className="flex items-center gap-3">
            <h1 className="text-h1 text-heading" style={{ letterSpacing: '-0.5px' }}>
              Find Candidates
            </h1>
            <a href="/recruiter/talent-pool" className="text-xs font-semibold text-primary hover:underline">
              Talent Pool →
            </a>
          </div>
          <p className="text-small-text text-subtle mt-1">
            {pagination
              ? `${pagination.total.toLocaleString()} candidate${pagination.total !== 1 ? 's' : ''} found`
              : 'Search and message candidates for your open roles'}
          </p>
        </div>
      </div>

      <div className="container-responsive mx-auto px-5 sm:px-8 py-7">

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className="lg:hidden mb-4 flex items-center justify-between w-full gap-2 text-sm font-semibold text-body-secondary bg-surface border border-token rounded-xl px-4 py-2.5 hover:border-primary/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Filters
            {hasFilters && (
              <span className="bg-primary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {[q, skills, location, expMin, expMax, qaSpec, qaSeniority, minQaScore, openToWork ? '1' : ''].filter(Boolean).length}
              </span>
            )}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {/* Toolbar */}
        {[...selectedIds].length > 0 && (
          <div className="flex items-center justify-end gap-2 mb-4">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 transition-all"
            >
              Message {[...selectedIds].length}
            </button>
          </div>
        )}

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Filter sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
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
          {/* Sort */}
          <div className="relative shrink-0 inline-block mb-4">
            <select
              value={sort}
              onChange={e => { setSort(e.target.value as CandidateSearchFilters['sort']); resetPage(); }}
              className="appearance-none text-sm border border-token rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-surface"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-token p-5 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-hover shrink-0" />
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

          {/* Table */}
          {!isLoading && !isError && candidates.length > 0 && (
            <div className="bg-surface rounded-2xl border border-token shadow-sm overflow-x-auto">
              <table className="w-full table-fixed min-w-[640px]">
                <thead className="bg-surface-alt/60">
                  <tr>
                    <th className="px-2 py-3 w-[5%]" />
                    <th className="text-left text-lg font-semibold text-subtle px-3 py-3 w-[30%]">Candidate</th>
                    <th className="text-left text-lg font-semibold text-subtle px-2 py-3 w-[10%]">Level</th>
                    <th className="text-center text-lg font-semibold text-subtle px-2 py-3 w-[16%]">Skill</th>
                    <th className="text-center text-lg font-semibold text-subtle px-2 py-3 w-[11%]">Location</th>
                    <th className="text-center text-lg font-semibold text-subtle px-3 py-3 w-[28%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <CandidateResultCard
                      key={c.id}
                      candidate={c}
                      onView={setActiveCandidateId}
                      selected={selectedIds.has(c.id)}
                      onSelect={toggleSelect}
                    />
                  ))}
                </tbody>
              </table>
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
      </div>

      {showBulkModal && (
        <BulkMessageModal
          selectedIds={[...selectedIds]}
          onClose={() => { setShowBulkModal(false); setSelectedIds(new Set()); }}
        />
      )}

      {/* Profile drawer */}
      <CandidateProfileDrawer
        candidateId={activeCandidateId}
        onClose={() => setActiveCandidateId(null)}
      />
    </div>
    </RecruiterShell>
  );
}
