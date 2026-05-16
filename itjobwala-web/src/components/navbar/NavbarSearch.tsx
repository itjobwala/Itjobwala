'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NavbarSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  function handleSearch() {
    if (query.trim()) router.push(`/jobs?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="relative hidden lg:flex items-center shrink-0">
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="#9ca3af" strokeWidth="2.2"
        className="absolute left-3 pointer-events-none shrink-0"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search jobs, companies, skills"
        className={`pl-9 pr-3 py-[7px] text-[13px] bg-gray-50 border rounded-xl outline-none transition-all duration-200 text-[#0f172a] placeholder-gray-400 ${
          focused
            ? 'w-64 border-primary/40 bg-white shadow-sm'
            : 'w-52 border-gray-200 hover:border-gray-300'
        }`}
      />
      {query && (
        <button
          onMouseDown={e => { e.preventDefault(); setQuery(''); }}
          className="absolute right-3 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
