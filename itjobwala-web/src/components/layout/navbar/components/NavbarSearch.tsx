'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NavbarSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  function handleSearch() {
    if (query.trim()) router.push(`/candidate/jobs?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="relative hidden lg:flex items-center shrink-0">
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="var(--color-subtle)" strokeWidth="2.2"
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
        className={`pl-9 pr-3 py-[7px] text-sm bg-surface-alt border rounded-xl outline-none transition-all duration-200 text-heading placeholder:text-subtle ${
          focused
            ? 'w-64 border-primary/40 bg-surface shadow-sm'
            : 'w-52 border-token-mid hover:border-token-mid'
        }`}
      />
      {query && (
        <button
          onMouseDown={e => { e.preventDefault(); setQuery(''); }}
          className="absolute right-3 text-disabled hover:text-muted transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
