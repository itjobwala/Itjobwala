'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReveal } from '@/src/hooks/useReveal';
import { useJobCategoriesQuery } from '@/src/hooks/useJobs';
import { PRIMARY } from '@/src/lib/constants';
import type { JobCategory } from '@/src/types/jobs';

const TYPE_THEME: Record<string, {
  bg: string; bgHover: string; border: string; borderHover: string;
  accent: string; textAccent: string; badge: string; badgeText: string;
  label: string;
}> = {
  work_mode: {
    bg: '#f5f3ff', bgHover: '#ede9fe',
    border: '#e9d5ff', borderHover: '#c4b5fd',
    accent: '#8b5cf6', textAccent: '#7c3aed',
    badge: '#ede9fe', badgeText: '#6d28d9',
    label: 'Work Mode',
  },
  company_type: {
    bg: '#fff7ed', bgHover: '#ffedd5',
    border: '#fed7aa', borderHover: '#fb923c',
    accent: '#f97316', textAccent: '#ea580c',
    badge: '#ffedd5', badgeText: '#c2410c',
    label: 'Company Type',
  },
  company_industry: {
    bg: '#eff6ff', bgHover: '#dbeafe',
    border: '#bfdbfe', borderHover: '#93c5fd',
    accent: '#3b82f6', textAccent: '#2563eb',
    badge: '#dbeafe', badgeText: '#1d4ed8',
    label: 'Industry',
  },
  job_category: {
    bg: '#f0fdf4', bgHover: '#dcfce7',
    border: '#bbf7d0', borderHover: '#86efac',
    accent: '#22c55e', textAccent: '#16a34a',
    badge: '#dcfce7', badgeText: '#15803d',
    label: 'Job Type',
  },
};

const DEFAULT_THEME = {
  bg: '#f8fafc', bgHover: '#f1f5f9',
  border: '#e2e8f0', borderHover: '#cbd5e1',
  accent: '#64748b', textAccent: '#475569',
  badge: '#f1f5f9', badgeText: '#475569',
  label: 'Category',
};

function getTheme(categoryType: string) {
  return TYPE_THEME[categoryType] ?? DEFAULT_THEME;
}

function getCategoryHref(category: JobCategory) {
  return `/candidate/jobs?${category.filter_key}=${category.key}`;
}

export default function CategorySection() {
  const ref = useReveal();
  const [hovered, setHovered] = useState<number | null>(null);

  const { data: categories, isLoading, isError } = useJobCategoriesQuery();
  const categoriesData = categories ?? [];
  const isWaitingForData = categories === undefined || isLoading;

  return (
    <section
      ref={ref}
      className="bg-white py-[88px] px-5 sm:px-8 lg:px-10"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end mb-12 gap-4">
          <div className="reveal-left">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PRIMARY, letterSpacing: 2 }}
            >
              Browse by type
            </div>
            <h2
              className="text-[36px] md:text-[42px] font-extrabold text-[#0f172a] leading-[1.1]"
              style={{ letterSpacing: '-1.5px' }}
            >
              Explore jobs<br />by category
            </h2>
          </div>
          {!isWaitingForData && !isError && categoriesData.length > 0 && (
            <Link
              href="/candidate/jobs"
              className="reveal-right flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: PRIMARY }}
            >
              View all categories
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isWaitingForData ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`reveal stagger-${(i % 4) + 1} h-[180px] rounded-2xl bg-gray-100 animate-pulse`}
              />
            ))
          ) : isError ? (
            <div className="col-span-full py-10 text-center text-sm text-red-400">
              Unable to load categories right now.
            </div>
          ) : categoriesData.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl">
              <span className="text-[14px] text-gray-400 font-medium">No categories available right now.</span>
            </div>
          ) : (
            categoriesData.map((cat, i) => {
              const theme = getTheme(cat.category_type);
              const highlighted = hovered === i;

              return (
                <Link
                  href={getCategoryHref(cat)}
                  key={`${cat.category_type}-${cat.key}-${i}`}
                  className={`reveal stagger-${(i % 4) + 1} block rounded-2xl relative overflow-hidden transition-all duration-300 no-underline`}
                  style={{
                    padding: '22px 22px 20px',
                    background: highlighted ? theme.bgHover : theme.bg,
                    border: `1.5px solid ${highlighted ? theme.borderHover : theme.border}`,
                    transform: highlighted ? 'translateY(-6px)' : 'none',
                    boxShadow: highlighted
                      ? `0 20px 48px -8px ${theme.accent}30`
                      : '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Decorative circles */}
                  <div
                    className="absolute rounded-full pointer-events-none transition-all duration-500"
                    style={{
                      width: 90, height: 90,
                      top: -28, right: -28,
                      background: theme.accent,
                      opacity: highlighted ? 0.14 : 0.08,
                    }}
                  />
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 48, height: 48,
                      top: 10, right: 10,
                      background: theme.accent,
                      opacity: highlighted ? 0.1 : 0.05,
                    }}
                  />

                  {/* Type badge */}
                  <div
                    className="inline-flex items-center rounded-full text-[10px] font-bold uppercase tracking-wide mb-4"
                    style={{
                      padding: '3px 10px',
                      background: theme.badge,
                      color: theme.badgeText,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {theme.label}
                  </div>

                  {/* Count — hero number */}
                  <div
                    className="font-black leading-none mb-1 transition-colors duration-300"
                    style={{
                      fontSize: 40,
                      color: highlighted ? theme.textAccent : '#0f172a',
                      letterSpacing: '-2px',
                    }}
                  >
                    {cat.count}
                  </div>
                  <div
                    className="text-[12px] font-semibold mb-4"
                    style={{ color: highlighted ? theme.accent : '#9ca3af' }}
                  >
                    open positions
                  </div>

                  {/* Label + arrow */}
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold capitalize leading-tight"
                      style={{
                        fontSize: 14,
                        color: highlighted ? theme.textAccent : '#374151',
                        maxWidth: '70%',
                      }}
                    >
                      {cat.label}
                    </span>
                    <div
                      className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={{ background: highlighted ? theme.accent : '#fff', border: `1.5px solid ${theme.border}` }}
                    >
                      <svg
                        width="13" height="13" fill="none"
                        stroke={highlighted ? '#fff' : theme.accent}
                        strokeWidth="2.5" viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
