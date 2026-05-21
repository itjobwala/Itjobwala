'use client';

import { COMPANIES } from '@/src/lib/data';
import { PRIMARY } from '@/src/lib/constants';

export default function CompanyMarquee() {
  const row1 = [...COMPANIES, ...COMPANIES];
  const row2 = [...COMPANIES.slice(6), ...COMPANIES.slice(0, 6), ...COMPANIES.slice(6), ...COMPANIES.slice(0, 6)];

  return (
    <div className="bg-white border-t border-b border-gray-100 py-9 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute top-0 left-0 bottom-0 w-[120px] z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #fff, transparent)' }} />
      <div className="absolute top-0 right-0 bottom-0 w-[120px] z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, #fff, transparent)' }} />

      {/* Label */}
      <div className="text-center mb-6">
        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-[2px]">
          Trusted by top companies
        </span>
      </div>

      {/* Row 1 — left to right */}
      <div className="overflow-hidden mb-3">
        <div className="marquee-track" style={{ animationDuration: '35s' }}>
          {row1.map((c, i) => (
            <CompanyCard key={i} company={c} />
          ))}
        </div>
      </div>

      {/* Row 2 — right to left */}
      <div className="overflow-hidden">
        <div className="marquee-track" style={{ animationDuration: '28s', animationDirection: 'reverse' }}>
          {row2.map((c, i) => (
            <CompanyCard key={i} company={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: { name: string; color: string; jobs: string } }) {
  return (
    <div
      className="flex items-center gap-2.5 mx-2.5 bg-[#fafafa] border-[1.5px] border-gray-100 rounded-xl py-[10px] px-[18px] whitespace-nowrap cursor-pointer transition-[border-color,box-shadow] duration-200"
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = PRIMARY;
        el.style.boxShadow = `0 4px 16px ${PRIMARY}18`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = '#f0f0f0';
        el.style.boxShadow = 'none';
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-extrabold text-[11px] shrink-0"
        style={{ background: company.color }}
      >
        {company.name[0]}
      </div>
      <div>
        <div className="text-[13px] font-bold text-[#111827] leading-[1.2]">{company.name}</div>
        <div className="text-[11px] text-gray-400 font-medium">{company.jobs}</div>
      </div>
    </div>
  );
}
