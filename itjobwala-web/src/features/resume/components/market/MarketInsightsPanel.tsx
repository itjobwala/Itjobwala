'use client';

import { useMarketIntelligenceQuery }  from '../../hooks';
import PersonalMarketScore             from './PersonalMarketScore';
import TrendingSkillsCard              from './TrendingSkillsCard';
import SpecializationDemandCard        from './SpecializationDemandCard';
import type { QaSpecialization }       from '../../types/resume.types';

interface Props {
  candidateSpec?: QaSpecialization | null;
}

export default function MarketInsightsPanel({ candidateSpec }: Props) {
  const { data, isLoading } = useMarketIntelligenceQuery();

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-32 bg-surface-hover rounded-2xl" />
        <div className="h-48 bg-surface-hover rounded-2xl" />
        <div className="h-64 bg-surface-hover rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      {/* Market highlights ticker */}
      <div className="bg-slate-900 rounded-2xl px-4 py-3 space-y-1 overflow-hidden">
        <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1.5">
          QA Market Intelligence · 2025
        </p>
        {data.market_highlights.map((h, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-indigo-400 text-xs mt-0.5 shrink-0">▸</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">{h}</p>
          </div>
        ))}
        <p className="text-[9px] text-slate-500 pt-1">
          Source: {data.platform_stats.data_source} · {data.platform_stats.active_jobs_analyzed} jobs analyzed
        </p>
      </div>

      {/* Personal market score (only if resume parsed) */}
      {data.market_demand_score !== null && (
        <PersonalMarketScore data={data} />
      )}

      {/* Trending skills with bars */}
      <TrendingSkillsCard
        topSkills={data.top_demanded_skills}
        skillsToAdd={data.high_demand_skills_to_add}
      />

      {/* Specialization demand breakdown */}
      <SpecializationDemandCard
        data={data.specialization_demand}
        candidateSpec={candidateSpec ?? null}
      />
    </div>
  );
}
