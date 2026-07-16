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
        <div className="text-micro text-subtle font-semibold mt-0.5">hiring QA talent</div>
      </div>
    </div>
  );
}

export default function CompanyMarquee() {
  return (
    <section className="bg-surface py-12">
      <div className="max-w-[860px] mx-auto px-5 text-center">
        <p className="text-caption font-bold text-subtle uppercase tracking-[1.5px] mb-3">
          QA teams hiring on itJobwala
        </p>
        <p className="text-sm text-[#474d6a]">
          Companies posting QA roles — from early-stage startups to large product companies across India.
        </p>
      </div>
    </section>
  );
}
