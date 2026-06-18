'use client';

import { useReveal } from '@/src/hooks/useReveal';
import { useHomeStatsQuery } from '@/features/jobs/browse/hooks';
import { PRIMARY } from '@/src/lib/constants';

const FALLBACK_STATS = [
  { value: '4,000+', label: 'Live QA roles',              sub: 'across India'         },
  { value: '800+',   label: 'Companies hiring',          sub: 'startups to MNCs'     },
  { value: '7 days', label: 'Avg. time to first reply',  sub: 'from real recruiters' },
  { value: '92%',    label: 'Applications go direct',    sub: 'no middlemen'         },
];

function fmt(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}k+`;
  return String(n);
}

export default function StatsStrip() {
  const ref = useReveal();
  const { data: apiStats } = useHomeStatsQuery();

  const stats = apiStats
    ? [
        {
          value: apiStats.total_jobs != null ? `${fmt(apiStats.total_jobs)}+` : FALLBACK_STATS[0].value,
          label: 'Live QA roles', sub: 'across India',
        },
        {
          value: apiStats.total_companies != null ? `${fmt(apiStats.total_companies)}+` : FALLBACK_STATS[1].value,
          label: 'Companies hiring', sub: 'startups to MNCs',
        },
        {
          value: apiStats.avg_response_days != null ? `${apiStats.avg_response_days} days` : FALLBACK_STATS[2].value,
          label: 'Avg. time to first reply', sub: 'from real recruiters',
        },
        {
          value: apiStats.direct_apply_pct != null ? `${apiStats.direct_apply_pct}%` : FALLBACK_STATS[3].value,
          label: 'Applications go direct', sub: 'no middlemen',
        },
      ]
    : FALLBACK_STATS;

  return (
    <section
      ref={ref}
      className="bg-white py-14 px-5 sm:px-8 lg:px-10"
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className={[
              `reveal stagger-${i + 1} text-center px-6 py-4 border-token`,
              i % 2 === 0 ? 'border-r' : 'md:border-r',
              i < 2 ? 'border-b md:border-b-0' : '',
              i === 3 ? 'md:border-r-0' : '',
            ].join(' ')}
          >
            <div
              className="text-[40px] md:text-[44px] font-extrabold leading-none mb-2.5"
              style={{ color: PRIMARY, letterSpacing: '-2px' }}
            >
              {s.value}
            </div>
            <div className="text-sm font-semibold text-heading mb-1">{s.label}</div>
            <div className="text-xs text-subtle font-medium">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
