'use client';

import { useState } from 'react';
import Link from 'next/link';
import { JobSearchBar } from '@/features/jobs/browse';
import { TRENDING } from '@/src/lib/data';
import { PRIMARY } from '@/src/lib/constants';
import type { SearchState } from '@/features/jobs/shared/types';

export default function HeroSection() {
  const [search, setSearch] = useState<SearchState>({ jobTitle: '', company: '', city: '' });

  function handleSearch() {
    if (!search.jobTitle && !search.company && !search.city) return;
    const query = new URLSearchParams();
    if (search.jobTitle) query.set('q', search.jobTitle);
    if (search.company) query.set('company', search.company);
    if (search.city) query.set('loc', search.city);
    window.location.href = `/candidate/jobs?${query.toString()}`;
  }

  return (
    <section
      className="relative pt-[84px] md:pt-[100px] pb-[48px] md:pb-[64px] overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)' }}
    >
      {/* Glow orbs */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: -80, right: '-5%', width: 400, height: 400,
          background: `radial-gradient(circle, ${PRIMARY}14 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          bottom: -80, left: '-5%', width: 300, height: 300,
          background: 'radial-gradient(circle, #8b5cf614 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[860px] mx-auto px-5 sm:px-8 lg:px-10 text-center relative z-10">
        {/* Live badge */}
        <div className="inline-flex items-center gap-1.5 bg-white border border-token rounded-full py-1.5 px-3.5 mb-6 shadow-sm">
          <span className="w-[7px] h-[7px] rounded-full bg-[#4ade80] inline-block pulse-dot" />
          <span className="text-sm font-semibold" style={{ color: PRIMARY, letterSpacing: 0.2 }}>
            4,000+ IT jobs listed this week
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-[48px] md:text-[64px] lg:text-[72px] font-extrabold text-heading mb-4 leading-[1.05]"
          style={{ letterSpacing: '-3px' }}
        >
          Find IT jobs.<br />
          <span style={{ color: PRIMARY }}> Without the noise.</span>
        </h1>

        <p className="text-lg text-muted leading-[1.7] max-w-[620px] mx-auto mb-8">
          Search relevant roles. Apply directly.<br />No middlemen. No spam.
        </p>

        {/* Search bar */}
        <div className="mb-6 max-w-[900px] mx-auto px-4">
          <JobSearchBar
            search={search}
            onChange={setSearch}
            onSearch={handleSearch}
          />
        </div>

        {/* Risk-reversal microcopy */}
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          {['Free forever', 'No recruiter spam', '2-min profile'].map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-sm text-muted font-medium">
              <svg width="14" height="14" fill="none" stroke="#16a34a" strokeWidth="3" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t}
            </div>
          ))}
        </div>

        {/* Trending tags */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <span className="text-sm text-subtle font-medium mr-1.5">Trending Skills:</span>
          {TRENDING.slice(0, 6).map((t) => (
            <Link
              key={t}
              href={`/candidate/jobs?skills=${encodeURIComponent(t)}`}
              className="inline-flex items-center justify-center text-sm font-semibold bg-white rounded-full h-8 px-[14px] border border-token transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
              style={{ color: PRIMARY }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = PRIMARY;
                el.style.color = '#fff';
                el.style.borderColor = PRIMARY;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = '#fff';
                el.style.color = PRIMARY;
                el.style.borderColor = 'var(--color-border)';
              }}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <svg
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-[-1px] left-0 right-0 w-full"
      >
        <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60 Z" fill="#fff" />
      </svg>
    </section>
  );
}
