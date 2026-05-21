'use client';

import type { SearchState } from './types';

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 flex flex-col sm:hidden gap-2">
        {/* Job Title input */}
        <div className="flex items-center gap-3 px-4 py-2 text-gray-400 border border-gray-100 rounded-lg">
          <SearchIcon />
          <input
            type="text"
            placeholder="Job title"
            value={search.jobTitle}
            onChange={e => onChange({ ...search, jobTitle: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[14px] text-[#0f172a] placeholder-gray-400 outline-none"
          />
          {search.jobTitle && (
            <button onClick={() => onChange({ ...search, jobTitle: '' })} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Company input */}
        <div className="flex items-center gap-3 px-4 py-2 text-gray-400 border border-gray-100 rounded-lg">
          <BriefcaseIcon />
          <input
            type="text"
            placeholder="Company"
            value={search.company}
            onChange={e => onChange({ ...search, company: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[14px] text-[#0f172a] placeholder-gray-400 outline-none"
          />
          {search.company && (
            <button onClick={() => onChange({ ...search, company: '' })} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* City input */}
        <div className="flex items-center gap-3 px-4 py-2 text-gray-400 border border-gray-100 rounded-lg">
          <MapPinIcon />
          <input
            type="text"
            placeholder="City"
            value={search.city}
            onChange={e => onChange({ ...search, city: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[14px] text-[#0f172a] placeholder-gray-400 outline-none"
          />
          {search.city && (
            <button onClick={() => onChange({ ...search, city: '' })} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search button - full width on mobile */}
        <button
          onClick={onSearch}
          className="bg-primary text-white text-[14px] font-bold rounded-xl px-6 py-3 hover:brightness-110 transition-[filter] w-full"
        >
          Search
        </button>
      </div>

      {/* Desktop layout: Integrated button inside container */}
      <div className="hidden sm:flex bg-white rounded-[20px] border border-gray-200 shadow-sm p-1.5 items-center">
        {/* Job Title input */}
        <div className="flex items-center gap-2 flex-1 px-3 py-2 text-gray-400 min-w-0">
          <SearchIcon />
          <input
            type="text"
            placeholder="Job title"
            value={search.jobTitle}
            onChange={e => onChange({ ...search, jobTitle: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[14px] text-[#0f172a] placeholder-gray-400 outline-none min-w-0"
          />
          {search.jobTitle && (
            <button onClick={() => onChange({ ...search, jobTitle: '' })} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="w-[1px] h-8 bg-gray-200 shrink-0" />

        {/* Company input */}
        <div className="flex items-center gap-2 flex-1 px-3 py-2 text-gray-400 min-w-0">
          <BriefcaseIcon />
          <input
            type="text"
            placeholder="Company"
            value={search.company}
            onChange={e => onChange({ ...search, company: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[14px] text-[#0f172a] placeholder-gray-400 outline-none min-w-0"
          />
          {search.company && (
            <button onClick={() => onChange({ ...search, company: '' })} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="w-[1px] h-8 bg-gray-200 shrink-0" />

        {/* City input */}
        <div className="flex items-center gap-2 flex-1 px-3 py-2 text-gray-400 min-w-0">
          <MapPinIcon />
          <input
            type="text"
            placeholder="City"
            value={search.city}
            onChange={e => onChange({ ...search, city: e.target.value })}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[14px] text-[#0f172a] placeholder-gray-400 outline-none min-w-0"
          />
          {search.city && (
            <button onClick={() => onChange({ ...search, city: '' })} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search button - pill style inside container */}
        <button
          onClick={onSearch}
          className="bg-primary text-white text-[14px] font-bold px-8 py-2.5 rounded-xl hover:brightness-110 transition-[filter] shrink-0 flex items-center ml-1"
        >
          Search
        </button>
      </div>
    </div>
  );
}
