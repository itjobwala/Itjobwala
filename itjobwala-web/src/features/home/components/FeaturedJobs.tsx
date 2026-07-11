'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReveal } from '@/src/hooks/useReveal';
import { useFeaturedJobsQuery } from '@/features/jobs/browse/hooks';
import { normalizeJob } from '@/features/jobs/shared/types';
import { PRIMARY } from '@/src/lib/constants';

export default function 
() {
  const ref = useReveal();
  const [hovered, setHovered] = useState<number | null>(null);

  // Fetch featured jobs — no default so undefined means "not yet arrived"
  const { data: apiJobs, isLoading, isFetching, isError } = useFeaturedJobsQuery();

  // Normalize only when we actually have data
  let jobs: any[] = [];
  let normalizationError: Error | null = null;

  if (apiJobs && apiJobs.length > 0) {
    try {
      jobs = apiJobs
        .map((job: any) => {
          try { return normalizeJob(job); }
          catch { return null; }
        })
        .filter((j: any): j is any => j !== null);
    } catch (err) {
      normalizationError = err as Error;
    }
  }

  // Stay in skeleton until data has arrived (undefined = not yet fetched)
  const isWaitingForData = apiJobs === undefined || isLoading || isFetching;

  return (
    <section
      ref={ref}
      className="bg-surface-alt py-20 px-5 sm:px-8 lg:px-10"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">

          {/* Left Content */}
          <div className="reveal-left lg:pt-2">
            <div
              className="text-caption font-bold uppercase mb-3"
              style={{ color: PRIMARY, letterSpacing: 1.5 }}
            >
              Opportunities
            </div>

            <h2
              className="text-[36px] md:text-[42px] font-extrabold text-[#0f172a] leading-[1.1] mb-5"
              style={{ letterSpacing: '-1.5px' }}
            >
              Featured jobs
            </h2>

            <p className="text-sm text-muted leading-[1.7] mb-8">
              Hand-picked roles from the best companies in India&apos;s tech ecosystem.
            </p>

            <Link
              href="/candidate/jobs"
              className="inline-flex items-center gap-2 text-sm font-bold text-white rounded-full py-[13px] px-6 transition-[filter] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
              style={{ background: PRIMARY, color: '#fff' }}
            >
              Browse all jobs

              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Jobs List */}
          <div className="flex flex-col gap-3">

            {/* Show skeleton while waiting for data - THIS IS THE ONLY THING SHOWN WHILE LOADING */}
            {isWaitingForData ? (
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-[88px] bg-surface rounded-2xl border border-token animate-pulse"
                />
              ))
            ) : normalizationError ? (
              <div className="py-12 text-center text-[14px] text-red-500">
                <div className="font-semibold mb-2">Error processing featured jobs</div>
                <div className="text-xs text-muted">{String(normalizationError)}</div>
              </div>
            ) : isError ? (
              <div className="py-12 text-center text-[14px] text-red-400">
                Unable to load featured jobs.
              </div>
            ) : jobs.length === 0 ? (
              <div className="w-full py-16 flex flex-col items-center justify-center bg-surface border border-token rounded-2xl">
                <span className="text-base text-subtle font-medium">No featured jobs available right now.</span>
              </div>
            ) : (
              jobs.map((job: any, i: number) => {
                const logoUrl = job?.companyLogo || null;
                const logoFallback = job?.company?.[0]?.toUpperCase() || '?';

                const badge = job?.isNew
                  ? {
                      label: '🔥 New',
                      color: '#ef4444',
                      bg: '#fff1f2',
                    }
                  : job?.isHot
                    ? {
                        label: '⚡ Hot',
                        color: '#f97316',
                        bg: '#fff7ed',
                      }
                    : null;

                return (
                  <Link
                    href={`/candidate/jobs/${job?.id}`}
                    key={job?.id}
                    className={`reveal stagger-${i + 1} bg-white rounded-2xl py-5 px-5 sm:px-6 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer transition-all duration-[250ms] focus:outline-none focus:ring-4 focus:ring-primary/20`}
                    style={{
                      border: `1.5px solid ${
                        hovered === i ? PRIMARY : '#f0f0f0'
                      }`,
                      transform:
                        hovered === i ? 'translateX(6px)' : 'none',
                      boxShadow:
                        hovered === i
                          ? '0 8px 32px rgba(0,0,0,0.07)'
                          : 'none',
                    }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
 
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={job?.company}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain bg-surface border border-token shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 bg-gradient-to-br ${job?.companyColorClass}`}
                        >
                          {logoFallback}
                        </div>
                      )}
 
                      <div className="min-w-0">
 
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-sm text-heading">
                            {job?.title}
                          </span>
 
                          {badge && (
                            <span
                              className="text-[11px] font-bold rounded-full py-[2px] px-2"
                              style={{
                                color: badge.color,
                                background: badge.bg,
                              }}
                            >
                              {badge.label}
                            </span>
                          )}
                        </div>
 
                        <div className="text-sm text-subtle flex gap-2 flex-wrap">
                          <span>{job?.company}</span>
                          <span>·</span>
                          <span>{job?.location}</span>
                          <span>·</span>
                          <span>
                            {job?.experienceMin === 0 && job?.experienceMax === 0
                              ? '0 yrs'
                              : `${job?.experienceMin}–${job?.experienceMax} yrs`}
                          </span>
                          <span>·</span>
                          <span>
                            ₹{job?.salaryLpaMin}–{job?.salaryLpaMax} LPA
                          </span>
                        </div>
                      </div>
                    </div>
 
                    <span
                      className="py-[9px] px-5 rounded-full text-sm font-bold border-[1.5px] transition-all duration-200 whitespace-nowrap self-start sm:self-auto"
                      style={{
                        background:
                          hovered === i ? PRIMARY : 'transparent',
                        color:
                          hovered === i ? '#fff' : PRIMARY,
                        borderColor: PRIMARY,
                      }}
                    >
                      View job
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}