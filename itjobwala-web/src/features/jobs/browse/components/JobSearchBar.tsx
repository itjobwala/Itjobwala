'use client';

import type { SearchState } from '../../shared/types';

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M12 12v2M8 12v2M16 12v2" />
    </svg>
  );
}

interface Props {
  search: SearchState;
  onChange: (s: SearchState) => void;
  onSearch: () => void;
}

export default function JobSearchBar({ search, onChange, onSearch }: Props) {
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') onSearch();
  }

  return (
    <div>
      {/* Mobile layout: Stack vertically */}
      <div className="bg-surface rounded-2xl border border-token shadow-sm p-2 flex flex-col sm:hidden gap-2">
        {/* Job Title input */}
        <div className="flex items-center gap-3 px-4 py-2.5 text-subtle border border-token rounded-lg focus-within:border-primary/50 focus-within:text-primary focus-within:bg-surface-alt/70 transition-all duration-200">
          <SearchIcon />
          <input
            type="text"
            placeholder="Job title"
            value={search.jobTitle}
            onChange={e => onChange({ ...search, jobTitle: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-lg text-heading placeholder:text-muted outline-none"
          />
          {search.jobTitle && (
            <button onClick={() => onChange({ ...search, jobTitle: '' })} className="text-subtle hover:text-muted transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Company input */}
        <div className="flex items-center gap-3 px-4 py-2.5 text-subtle border border-token rounded-lg focus-within:border-primary/50 focus-within:text-primary focus-within:bg-surface-alt/70 transition-all duration-200">
          <BriefcaseIcon />
          <input
            type="text"
            placeholder="Company"
            value={search.company}
            onChange={e => onChange({ ...search, company: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-lg text-heading placeholder:text-muted outline-none"
          />
          {search.company && (
            <button onClick={() => onChange({ ...search, company: '' })} className="text-subtle hover:text-muted transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* City input */}
        <div className="flex items-center gap-3 px-4 py-2.5 text-subtle border border-token rounded-lg focus-within:border-primary/50 focus-within:text-primary focus-within:bg-surface-alt/70 transition-all duration-200">
          <MapPinIcon />
          <input
            type="text"
            placeholder="City"
            value={search.city}
            onChange={e => onChange({ ...search, city: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-lg text-heading placeholder:text-muted outline-none"
          />
          {search.city && (
            <button onClick={() => onChange({ ...search, city: '' })} className="text-subtle hover:text-muted transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search button - full width on mobile */}
        <button
          onClick={onSearch}
          className="bg-primary text-white text-lg font-bold rounded-full px-6 py-3 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all w-full cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Desktop layout: Integrated button inside container */}
      <div className="hidden sm:flex bg-surface rounded-xl border border-token-mid shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-1 items-center focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200">
        {/* Job Title input */}
        <div className="flex items-center gap-3 flex-1 px-3 py-2 text-subtle min-w-0 transition-colors duration-150 focus-within:text-primary focus-within:bg-surface-alt/70 rounded-lg">
          <SearchIcon />
          <input
            type="text"
            placeholder="Job title"
            value={search.jobTitle}
            onChange={e => onChange({ ...search, jobTitle: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-sm text-heading placeholder:text-muted outline-none min-w-0"
          />
          {search.jobTitle && (
            <button onClick={() => onChange({ ...search, jobTitle: '' })} className="text-subtle hover:text-muted transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="w-[1px] h-5 bg-surface-mid/60 shrink-0" />

        {/* Company input */}
        <div className="flex items-center gap-3 flex-1 px-3 py-2 text-subtle min-w-0 transition-colors duration-150 focus-within:text-primary focus-within:bg-surface-alt/70 rounded-lg">
          <BriefcaseIcon />
          <input
            type="text"
            placeholder="Company"
            value={search.company}
            onChange={e => onChange({ ...search, company: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-sm text-heading placeholder:text-muted outline-none min-w-0"
          />
          {search.company && (
            <button onClick={() => onChange({ ...search, company: '' })} className="text-subtle hover:text-muted transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="w-[1px] h-5 bg-surface-mid/60 shrink-0" />

        {/* City input */}
        <div className="flex items-center gap-3 flex-1 px-3 py-2 text-subtle min-w-0 transition-colors duration-150 focus-within:text-primary focus-within:bg-surface-alt/70 rounded-lg">
          <MapPinIcon />
          <input
            type="text"
            placeholder="City"
            value={search.city}
            onChange={e => onChange({ ...search, city: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-sm text-heading placeholder:text-muted outline-none min-w-0"
          />
          {search.city && (
            <button onClick={() => onChange({ ...search, city: '' })} className="text-subtle hover:text-muted transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search button - pill style inside container */}
        <button
          onClick={onSearch}
          className="bg-primary text-white text-base font-bold px-6 py-2 rounded-full hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-[filter,box-shadow] shrink-0 flex items-center ml-1 cursor-pointer"
        >
          Search
        </button>
      </div>
    </div>
  );
}
