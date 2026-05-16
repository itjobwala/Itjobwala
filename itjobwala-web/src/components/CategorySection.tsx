'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReveal } from '@/src/hooks/useReveal';
import { useJobCategoriesQuery } from '@/src/hooks/useJobs';
import { PRIMARY } from '@/src/lib/constants';
import type { JobCategory } from '@/src/types/jobs';

const CATEGORY_CONFIG: Record<string, { icon: string; color: string; border: string; accent: string; desc: string }> = {
  startup:   { icon: '🚀', color: '#fff7ed', border: '#fed7aa', accent: '#f97316', desc: 'Fast-paced, high-growth' },
  mnc:       { icon: '🏢', color: '#eff6ff', border: '#bfdbfe', accent: '#3b82f6', desc: 'Global tech giants' },
  product:   { icon: '📦', color: '#f0fdf4', border: '#bbf7d0', accent: '#22c55e', desc: 'Build real products' },
  remote:    { icon: '🌐', color: '#faf5ff', border: '#ddd6fe', accent: '#8b5cf6', desc: 'Work from anywhere' },
  fintech:   { icon: '💳', color: '#fff1f2', border: '#fecdd3', accent: '#e11d48', desc: 'Finance meets tech' },
  saas:      { icon: '☁️', color: '#f0f9ff', border: '#bae6fd', accent: '#0ea5e9', desc: 'Cloud-first companies' },
  ecommerce: { icon: '🛍️', color: '#fefce8', border: '#fde68a', accent: '#eab308', desc: 'Scale digital retail' },
  ai_ml:     { icon: '🤖', color: '#f5f3ff', border: '#c4b5fd', accent: '#a855f7', desc: 'The future of tech' },
  hybrid:    { icon: '🔄', color: '#f3f4f6', border: '#d1d5db', accent: '#6b7280', desc: 'Mixed work modes' },
  onsite:    { icon: '🏢', color: '#eff6ff', border: '#bfdbfe', accent: '#3b82f6', desc: 'Office-based roles' },
  service:   { icon: '⚙️', color: '#fef3c7', border: '#fcd34d', accent: '#d97706', desc: 'Service-driven' },
  fulltime:  { icon: '💼', color: '#e0e7ff', border: '#c7d2fe', accent: '#6366f1', desc: 'Full-time positions' },
  parttime:  { icon: '🕐', color: '#dbeafe', border: '#93c5fd', accent: '#0284c7', desc: 'Part-time work' },
  contract:  { icon: '📋', color: '#f3e8ff', border: '#e9d5ff', accent: '#d946ef', desc: 'Contract roles' },
  internship: { icon: '🎓', color: '#fef2f2', border: '#fecaca', accent: '#dc2626', desc: 'Internship programs' },
};

const ArrowIcon = ({ color = '#9ca3af' }: { color?: string }) => (
  <svg width="12" height="12" fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

function getCategoryHref(category: JobCategory) {
  return `/jobs?${category.filter_key}=${category.key}`;
}

function getConfig(key: string) {
  return CATEGORY_CONFIG[key] || CATEGORY_CONFIG.startup;
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
          <Link
            href="/jobs"
            className="reveal-right flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: PRIMARY }}
          >
            View all categories
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {isWaitingForData ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`reveal stagger-${(i % 4) + 1} h-[240px] rounded-[20px] bg-gray-100 animate-pulse`}
              />
            ))
          ) : isError ? (
            <div className="col-span-full py-10 text-center text-sm text-red-400">
              Unable to load categories right now.
            </div>
          ) : categoriesData.length === 0 ? (
            <div className="col-span-full py-10 text-center text-sm text-gray-400">
              No categories available right now.
            </div>
          ) : (
            categoriesData.map((cat, i) => {
              const config = getConfig(cat.key);
              const highlighted = hovered === i;
              const isFeatured = i < 2;

              return (
                <Link
                  href={getCategoryHref(cat)}
                  key={cat.key}
                  className={`reveal stagger-${(i % 4) + 1} block rounded-[20px] relative overflow-hidden transition-all duration-[280ms] no-underline`}
                  style={{
                    padding: isFeatured ? '32px 28px' : '24px 22px',
                    background: highlighted ? config.color : '#fafafa',
                    border: `1.5px solid ${highlighted ? config.border : '#efefef'}`,
                    transform: highlighted ? 'translateY(-5px)' : 'none',
                    boxShadow: highlighted
                      ? '0 20px 48px rgba(0,0,0,0.09)'
                      : '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Accent circle */}
                  <div
                    className="absolute rounded-full pointer-events-none transition-all duration-300"
                    style={{
                      top: -20, right: -20, width: 80, height: 80,
                      background: highlighted ? config.border : 'transparent',
                      opacity: 0.4,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="flex items-center justify-center rounded-[14px] transition-all duration-[250ms]"
                    style={{
                      width: isFeatured ? 52 : 44,
                      height: isFeatured ? 52 : 44,
                      marginBottom: isFeatured ? 20 : 14,
                      background: highlighted ? '#fff' : config.color,
                      border: `1.5px solid ${config.border}`,
                      fontSize: isFeatured ? 24 : 20,
                      boxShadow: highlighted ? `0 4px 12px ${config.accent}22` : 'none',
                    }}
                  >
                    {config.icon}
                  </div>

                  {/* Label */}
                  <div
                    className="font-extrabold text-[#0f172a] mb-1 leading-[1.2] capitalize"
                    style={{ fontSize: isFeatured ? 18 : 15 }}
                  >
                    {cat.label}
                  </div>

                  {/* Desc */}
                  <div
                    className="text-[12px] font-medium mb-3.5 leading-[1.4]"
                    style={{ color: highlighted ? '#6b7280' : '#9ca3af' }}
                  >
                    {config.desc}
                  </div>

                  {/* Count + arrow */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-extrabold leading-none"
                        style={{
                          fontSize: isFeatured ? 28 : 22,
                          color: highlighted ? config.accent : PRIMARY,
                          letterSpacing: -1,
                        }}
                      >
                        {cat.count}
                      </span>
                      <span className="text-[12px] text-gray-400 font-medium">jobs</span>
                    </div>
                    <div
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all duration-[250ms]"
                      style={{ background: highlighted ? config.accent : '#f0f0f0' }}
                    >
                      <ArrowIcon color={highlighted ? '#fff' : '#9ca3af'} />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="reveal text-center mt-9">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold border-[1.5px] rounded-full py-[10px] px-6 transition-colors"
            style={{ color: '#6b7280', borderColor: '#e5e7eb' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = PRIMARY;
              e.currentTarget.style.borderColor = PRIMARY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            Explore all categories
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
