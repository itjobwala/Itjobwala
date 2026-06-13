/**
 * candidateBenchmark.js
 * Phase 6: Candidate Benchmarking System.
 *
 * Two-layer model — same pattern as Phase 2 market intelligence:
 *   Layer 1 — Industry baseline (always available, meaningful on day 1)
 *   Layer 2 — Platform peer overlay (enriches baseline when enough peers exist)
 */

// ── Industry baseline ─────────────────────────────────────────────────────────
// Recalibrated for capability-only ATS v2 (2026-05).
// Legacy scores (v1) inflated by ~15-20pts due to evidence penalties in the ATS pipeline.
// These baselines reflect pure technical capability without credibility contamination.

const SCORE_MODEL_VERSION = 2;

const PERCENTILE_BANDS = [
  { min: 75, percentile: 93 },
  { min: 65, percentile: 85 },
  { min: 55, percentile: 75 },
  { min: 45, percentile: 62 },
  { min: 38, percentile: 50 },
  { min: 30, percentile: 38 },
  { min: 22, percentile: 26 },
  { min: 15, percentile: 16 },
  { min: 0,  percentile:  8 },
];

const BASELINE_STATS = {
  median_score:           40,
  top_quartile_threshold: 57,
  top_10pct_threshold:    70,
  avg_score:              38,
};

// Skills most frequently seen in top-25% profiles per specialization
const TOP_PERFORMER_SKILLS = {
  sdet:           ['Docker', 'Kubernetes', 'Jenkins', 'Playwright', 'Java', 'GitHub Actions', 'REST Assured', 'TestNG'],
  automation_qa:  ['Playwright', 'Selenium', 'TestNG', 'Cucumber', 'CI/CD', 'GitHub Actions', 'REST Assured', 'Page Object Model'],
  api_testing:         ['Postman', 'REST Assured', 'Newman', 'GraphQL', 'Contract Testing', 'Karate', 'OAuth', 'API Automation'],
  mobile_testing:      ['Appium', 'XCUITest', 'Espresso', 'BrowserStack', 'LambdaTest', 'Detox', 'Charles Proxy', 'adb'],
  performance_testing: ['JMeter', 'k6', 'Gatling', 'BlazeMeter', 'Grafana', 'InfluxDB', 'Load Testing', 'Artillery'],
  hybrid_qa:      ['Playwright', 'Postman', 'JMeter', 'Jenkins', 'Docker', 'BDD', 'REST Assured', 'Allure'],
  manual_qa:      ['JIRA', 'TestRail', 'Zephyr', 'Bug Tracking', 'Test Cases', 'RTM', 'Agile', 'Selenium'],
};

const TIER_LABELS = [
  { min: 90, label: 'Top 10%',       color: 'emerald' },
  { min: 75, label: 'Top 25%',       color: 'cyan'    },
  { min: 50, label: 'Above Average', color: 'blue'    },
  { min: 25, label: 'Average',       color: 'amber'   },
  { min: 0,  label: 'Below Average', color: 'red'     },
];

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {object} candidateInsight - candidate's resume_insights row
 * @param {object[]} peerInsights - all other candidates' rows
 */
export function computeBenchmark(candidateInsight, peerInsights) {
  const score           = candidateInsight.qa_match_score ?? 0;
  const specialization  = candidateInsight.qa_specialization ?? 'manual_qa';
  const candidateSkills = (candidateInsight.extracted_skills ?? []).map(s => s.toLowerCase());

  // ── Layer 1: Industry baseline percentile ─────────────────────────────────
  const baselinePercentile = computeBaselinePercentile(score);
  const tier               = deriveTier(baselinePercentile);

  // ── Layer 2: Platform peer overlay ────────────────────────────────────────
  const peers       = peerInsights.filter(p => p.qa_match_score != null);
  const peerScores  = peers.map(p => p.qa_match_score).sort((a, b) => a - b);
  const hasPeerData = peerScores.length >= 3;

  let platform_avg_score       = null;
  let platform_median_score    = null;
  let platform_percentile      = null;
  let top_quartile_threshold   = BASELINE_STATS.top_quartile_threshold;
  let top_10pct_threshold      = BASELINE_STATS.top_10pct_threshold;
  let data_source              = 'Industry Baseline';

  if (hasPeerData) {
    platform_avg_score       = Math.round(peerScores.reduce((a, b) => a + b, 0) / peerScores.length);
    platform_median_score    = computeMedian(peerScores);
    platform_percentile      = computePlatformPercentile(score, peerScores);
    top_quartile_threshold   = computePercentileValue(peerScores, 75);
    top_10pct_threshold      = computePercentileValue(peerScores, 90);
    data_source              = 'Platform + Baseline';
  }

  // Blend: if platform percentile available, weight 60% platform + 40% baseline
  const final_percentile = platform_percentile != null
    ? Math.round(platform_percentile * 0.6 + baselinePercentile * 0.4)
    : baselinePercentile;

  // ── Skill gap vs top performers ───────────────────────────────────────────
  const topSkills = computeTopSkillGap(specialization, peers, candidateSkills);

  // ── Score gap metrics ─────────────────────────────────────────────────────
  const effective_avg = platform_avg_score ?? BASELINE_STATS.avg_score;
  const score_gap_to_average = score - effective_avg;
  const score_gap_to_top     = score - top_quartile_threshold;

  const insight = deriveInsight({
    score, final_percentile, tier, score_gap_to_average,
    score_gap_to_top, topSkills, hasPeerData, specialization,
  });

  return {
    candidate_score:          score,
    percentile_rank:          final_percentile,
    benchmark_tier:           tier.label,
    tier_color:               tier.color,
    peer_count:               peerScores.length,
    platform_avg_score,
    platform_median_score,
    top_quartile_threshold,
    top_10pct_threshold,
    score_gap_to_average,
    score_gap_to_top,
    skills_top_candidates_have: topSkills,
    competitive_insight:       insight,
    data_source,
    score_model_version:       SCORE_MODEL_VERSION,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeBaselinePercentile(score) {
  for (const band of PERCENTILE_BANDS) {
    if (score >= band.min) return band.percentile;
  }
  return 5;
}

function deriveTier(percentile) {
  for (const t of TIER_LABELS) {
    if (percentile >= t.min) return t;
  }
  return TIER_LABELS[TIER_LABELS.length - 1];
}

function computeMedian(sorted) {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function computePlatformPercentile(score, sortedPeerScores) {
  const below = sortedPeerScores.filter(s => s < score).length;
  return Math.round((below / sortedPeerScores.length) * 100);
}

function computePercentileValue(sortedScores, pct) {
  const idx = Math.ceil((pct / 100) * sortedScores.length) - 1;
  return sortedScores[Math.max(0, Math.min(idx, sortedScores.length - 1))];
}

function computeTopSkillGap(specialization, peers, candidateSkillsLower) {
  const baseline = TOP_PERFORMER_SKILLS[specialization] ?? TOP_PERFORMER_SKILLS.manual_qa;

  // If enough peers, compute top-25% skill frequency
  const peerScores = peers.filter(p => p.qa_match_score != null);
  if (peerScores.length >= 4) {
    const sorted    = [...peerScores].sort((a, b) => b.qa_match_score - a.qa_match_score);
    const topTier   = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.25)));
    const freq      = {};
    for (const peer of topTier) {
      for (const skill of (peer.extracted_skills ?? [])) {
        const key = skill.toLowerCase();
        freq[key] = (freq[key] ?? 0) + 1;
      }
    }
    const topPeerSkills = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .map(([s]) => s)
      .filter(s => !candidateSkillsLower.includes(s))
      .slice(0, 6);

    if (topPeerSkills.length >= 3) return topPeerSkills;
  }

  // Fallback: baseline top skills the candidate doesn't have
  return baseline
    .filter(s => !candidateSkillsLower.includes(s.toLowerCase()))
    .slice(0, 5);
}

function deriveInsight({ score, final_percentile, tier, score_gap_to_average, score_gap_to_top, topSkills, hasPeerData, specialization }) {
  const specLabel = specialization.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (final_percentile >= 90) {
    return `You're in the top 10% of ${specLabel} profiles — elite positioning. Focus on visibility (GitHub, certifications) rather than score improvement.`;
  }
  if (final_percentile >= 75) {
    return `Top 25% ${specLabel} profile. ${score_gap_to_top < 0 ? `Just ${Math.abs(score_gap_to_top)} points separate you from the top tier.` : 'You\'re at the top quartile threshold.'} Adding ${topSkills[0] ?? 'advanced tools'} could push you into the top 10%.`;
  }
  if (score_gap_to_average > 5) {
    return `${Math.abs(score_gap_to_average)} points above the ${specLabel} average — a solid position. ${topSkills.length > 0 ? `Top performers additionally have: ${topSkills.slice(0, 3).join(', ')}.` : ''}`;
  }
  if (score_gap_to_average >= -5) {
    return `Your score is near the ${specLabel} average. ${topSkills.length > 0 ? `To break into the top 25%, focus on: ${topSkills.slice(0, 3).join(', ')}.` : 'Use the Coach tab to identify the highest-impact improvements.'}`;
  }
  return `You're ${Math.abs(score_gap_to_average)} points below the ${specLabel} average. The Coach tab has a prioritized action plan to close this gap efficiently.`;
}
