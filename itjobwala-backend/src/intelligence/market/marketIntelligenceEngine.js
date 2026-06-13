/**
 * marketIntelligenceEngine.js
 * Phase 2 orchestrator: Market Intelligence Engine.
 *
 * Two-layer data model:
 *   Layer 1 — Static baseline (always available, industry-grade)
 *   Layer 2 — DB signal overlay (live platform jobs boost real demand)
 *
 * 1-hour in-memory cache on the DB query — market data doesn't change per-request.
 */

import knex                              from '../../config/db.js';
import { computeSkillDemand }           from './skillDemandAnalyzer.js';
import { computeSpecializationDemand }  from './specializationTrendAnalyzer.js';
import { computePersonalMarketScore }   from './marketScoreCalculator.js';

// ── In-memory cache ───────────────────────────────────────────────────────────

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
let _cache       = null;
let _cacheTime   = 0;

async function fetchDbSignals() {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;

  const jobs = await knex('jobs')
    .where('status', 'active')
    .select('title', 'skills');

  // Flatten all skills into one array
  const allSkills = jobs.flatMap(j => Array.isArray(j.skills) ? j.skills : []);
  const allTitles = jobs.map(j => j.title ?? '');

  _cache     = { allSkills, allTitles, jobCount: jobs.length };
  _cacheTime = Date.now();
  return _cache;
}

export function invalidateMarketCache() {
  _cache = null;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {object|null} resumeInsight - Pass null for market-only (no personal score)
 * @returns {MarketIntelligenceResult}
 */
export async function getMarketIntelligence(resumeInsight = null) {
  const { allSkills, allTitles, jobCount } = await fetchDbSignals();

  // ── Layer 1+2: Skill + specialization demand ────────────────────────────
  const skill_demand        = computeSkillDemand(allSkills);
  const specialization_demand = computeSpecializationDemand(allTitles);

  // ── Top insights (human-readable) ────────────────────────────────────────
  const rising_skills = skill_demand
    .filter(s => s.trend === 'rising')
    .slice(0, 5)
    .map(s => ({
      skill:      s.skill,
      demand_pct: s.demand_pct,
      label:      `${s.skill} demand increasing — ${s.demand_pct}% of QA job postings`,
    }));

  const top_skills = skill_demand.slice(0, 8);

  const rising_specializations = specialization_demand
    .filter(s => s.trend === 'rising')
    .slice(0, 4)
    .map(s => ({
      spec:       s.spec,
      label:      s.label,
      demand_pct: s.demand_pct,
      insight:    s.insight,
    }));

  const market_highlights = [
    `Playwright adoption up — now in ${skill_demand.find(s => s.skill === 'Playwright')?.demand_pct ?? 78}% of automation QA job postings`,
    `SDET roles are the highest-paying QA category — demand rising 40% YoY`,
    `API testing is now expected in 90%+ of mid-to-senior QA roles`,
    `Manual-only QA profiles face increasing ATS filtering in enterprise hiring`,
    `GitHub Actions is replacing Jenkins in modern QA automation stacks`,
  ];

  const platform_stats = {
    active_jobs_analyzed: jobCount,
    data_source:          jobCount >= 10 ? 'Platform + Industry Baseline' : 'Industry Baseline',
    last_updated:         new Date().toISOString(),
  };

  // ── Personal market score (only if resume provided) ───────────────────────
  const personal = resumeInsight
    ? computePersonalMarketScore(resumeInsight, skill_demand, specialization_demand)
    : null;

  return {
    trending_skills:         rising_skills,
    top_demanded_skills:     top_skills,
    specialization_demand,
    rising_specializations,
    market_highlights,
    platform_stats,
    // Personal intelligence
    market_demand_score:            personal?.market_demand_score             ?? null,
    recruiter_demand_level:         personal?.recruiter_demand_level           ?? null,
    specialization_demand_pct:      personal?.specialization_demand_pct        ?? null,
    specialization_trend:           personal?.specialization_trend              ?? null,
    skill_alignment_score:          personal?.skill_alignment_score             ?? null,
    demonstrated_alignment_score:   personal?.demonstrated_alignment_score      ?? null,
    high_demand_skills_you_have:    personal?.high_demand_skills_you_have       ?? [],
    high_demand_skills_to_add:      personal?.high_demand_skills_to_add         ?? [],
    market_tip:                     personal?.market_tip                         ?? null,
  };
}
