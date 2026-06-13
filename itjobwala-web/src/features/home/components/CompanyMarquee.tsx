'use client';

import { COMPANIES } from '@/src/lib/data';
import { PRIMARY } from '@/src/lib/constants';

function CompanyCard({ company }: { company: { name: string; color: string; jobs: string } }) {
  return (
    <div
      className="flex items-center gap-3 bg-surface-alt border border-token rounded-xl py-[10px] px-[18px] min-w-[170px] h-[64px] shrink-0 select-none"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-[12px] shrink-0"
        style={{ background: company.color }}
      >
        {company.name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-heading leading-tight truncate">{company.name}</div>
        <div className="text-micro text-subtle font-semibold mt-0.5">{company.jobs}</div>
      </div>
    </div>
  );
}

export default function CompanyMarquee() {
  const row1 = [...COMPANIES, ...COMPANIES];
  const row2 = [...COMPANIES.slice(6), ...COMPANIES.slice(0, 6), ...COMPANIES.slice(6), ...COMPANIES.slice(0, 6)];

  return (
    <section className="bg-surface py-8 border-y border-token relative overflow-hidden">
      {/* Fade edges */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[80px] md:w-[160px] z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0) 100%)' }}
      />
      <div
        className="absolute top-0 right-0 bottom-0 w-[80px] md:w-[160px] z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, #fff 0%, rgba(255,255,255,0) 100%)' }}
      />

      {/* Label */}
      <div className="text-center mb-6">
        <span className="text-caption font-bold text-subtle uppercase tracking-[2px]">
          Trusted by top companies
        </span>
      </div>

      {/* Row 1 — left to right */}
      <div className="overflow-hidden mb-4">
        <div className="marquee-track flex gap-4" style={{ animationDuration: '35s' }}>
          {row1.map((c, i) => (
            <CompanyCard key={i} company={c} />
          ))}
        </div>
      </div>

      {/* Row 2 — right to left */}
      <div className="overflow-hidden">
        <div className="marquee-track flex gap-4" style={{ animationDuration: '28s', animationDirection: 'reverse' }}>
          {row2.map((c, i) => (
            <CompanyCard key={i} company={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
