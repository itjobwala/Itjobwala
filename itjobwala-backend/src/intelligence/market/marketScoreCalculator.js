/**
 * marketScoreCalculator.js
 * Phase 2: Computes a candidate's personal market alignment score.
 *
 * Answers: "How well does THIS candidate's profile match what recruiters are paying for RIGHT NOW?"
 */

const DEMAND_LEVEL_SCORE = { 'Very High': 100, High: 75, Moderate: 45, Niche: 20 };

/**
 * @param {object} resumeInsight       - DB row from resume_insights
 * @param {SkillDemandEntry[]} skillDemand   - From skillDemandAnalyzer
 * @param {SpecDemandEntry[]}  specDemand    - From specializationTrendAnalyzer
 */
export function computePersonalMarketScore(resumeInsight, skillDemand, specDemand) {
  const candidateSkills = (resumeInsight?.extracted_skills ?? []).map(s => s.toLowerCase().trim());
  const candidateSpec   = resumeInsight?.qa_specialization ?? 'manual_qa';
  const qaScore         = resumeInsight?.qa_match_score    ?? 0;

  // ── Skill market alignment ────────────────────────────────────────────────
  // Score candidate's top skills against market demand

  const demandMap = Object.fromEntries(
    skillDemand.map(s => [s.skill.toLowerCase(), s.demand_pct])
  );

  let skillAlignmentTotal = 0;
  let skillAlignmentCount = 0;

  for (const cs of candidateSkills.slice(0, 20)) {
    const demandPct = demandMap[cs];
    if (demandPct !== undefined) {
      skillAlignmentTotal += demandPct;
      skillAlignmentCount++;
    }
  }

  const avgSkillAlignment = skillAlignmentCount > 0
    ? Math.round(skillAlignmentTotal / skillAlignmentCount)
    : 30;

  // ── Specialization market alignment ───────────────────────────────────────
  const specEntry      = specDemand.find(s => s.spec === candidateSpec);
  const specAlignment  = specEntry ? specEntry.demand_pct : 20;
  const specTrend      = specEntry?.trend ?? 'stable';

  // ── High-demand skills the candidate has ──────────────────────────────────
  const top10Skills = skillDemand.slice(0, 10).map(s => s.skill.toLowerCase());
  const highDemandMatches = candidateSkills.filter(s => top10Skills.includes(s));

  // ── Market demand score (weighted) ────────────────────────────────────────
  // 40% skill alignment, 35% specialization demand, 15% top-10 skill coverage, 10% qa quality
  const top10Coverage   = Math.min(100, Math.round((highDemandMatches.length / Math.max(1, Math.min(10, candidateSkills.length))) * 100));
  const qaBonus         = Math.min(10, Math.round(qaScore * 0.10));

  const market_demand_score = Math.min(98, Math.max(5, Math.round(
    avgSkillAlignment * 0.40 +
    specAlignment     * 0.35 +
    top10Coverage     * 0.15 +
    qaBonus           * 0.10,
  )));

  // ── Recruiter demand level label ──────────────────────────────────────────
  let recruiter_demand_level;
  if (market_demand_score >= 72)      recruiter_demand_level = 'High Demand';
  else if (market_demand_score >= 55) recruiter_demand_level = 'In Demand';
  else if (market_demand_score >= 38) recruiter_demand_level = 'Moderate Demand';
  else                                recruiter_demand_level = 'Low Demand';

  // ── Skills candidate has that are in high/very-high demand ───────────────
  const high_demand_skills_you_have = skillDemand
    .filter(s => ['Very High', 'High'].includes(s.demand_level) && candidateSkills.includes(s.skill.toLowerCase()))
    .map(s => s.skill)
    .slice(0, 5);

  // ── High-demand skills candidate is missing ───────────────────────────────
  const high_demand_skills_to_add = skillDemand
    .filter(s => ['Very High', 'High'].includes(s.demand_level) && !candidateSkills.includes(s.skill.toLowerCase()))
    .map(s => ({ skill: s.skill, demand_pct: s.demand_pct, trend: s.trend_label }))
    .slice(0, 4);

  // ── Market tip ────────────────────────────────────────────────────────────
  let market_tip = '';
  if (specTrend === 'declining') {
    market_tip = `Your ${specEntry?.label ?? 'current'} specialization is declining in market demand. Transitioning to Automation QA or SDET significantly improves marketability.`;
  } else if (specTrend === 'rising' && market_demand_score >= 65) {
    market_tip = `Your profile aligns well with a rising market segment. Keep adding trending tools to maintain your competitive edge.`;
  } else if (highDemandMatches.length === 0) {
    market_tip = `None of your top skills appear in the high-demand tier. Adding Playwright, Selenium, or Postman would immediately boost your market visibility.`;
  } else {
    market_tip = `You have ${highDemandMatches.length} high-demand skill${highDemandMatches.length !== 1 ? 's' : ''}. Adding ${high_demand_skills_to_add[0]?.skill ?? 'CI/CD tools'} would further increase recruiter visibility.`;
  }

  // Demonstrated alignment: keyword score attenuated by implementation credibility.
  // High keyword_alignment + weak evidence = strong market awareness, not market readiness.
  const EVIDENCE_MULT = { strong: 1.0, moderate: 0.65, basic: 0.40, weak: 0.25 };
  const evidenceStrength = resumeInsight?.evidence_strength ?? null;
  const demonstratedMult = evidenceStrength ? (EVIDENCE_MULT[evidenceStrength] ?? 0.65) : null;
  const demonstrated_alignment_score = demonstratedMult != null
    ? Math.round(avgSkillAlignment * demonstratedMult)
    : null;

  return {
    market_demand_score,
    recruiter_demand_level,
    specialization_demand_pct:  specAlignment,
    specialization_trend:       specTrend,
    skill_alignment_score:      avgSkillAlignment,
    demonstrated_alignment_score,
    high_demand_skills_you_have,
    high_demand_skills_to_add,
    market_tip,
  };
}
