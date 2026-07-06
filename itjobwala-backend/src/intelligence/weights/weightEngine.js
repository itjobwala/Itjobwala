/**
 * weightEngine.js
 * Phase 7: Dynamic ATS Weight Engine — main orchestrator.
 *
 * Takes a candidate's existing qa_score_breakdown and recomputes their score
 * using specialization-calibrated weights + market adjustments.
 * NEVER modifies the existing qa_match_score — runs alongside it.
 */

import {
  BASE_WEIGHTS,
  SPEC_WEIGHTS,
  DIMENSION_LABELS,
  WEIGHT_RATIONALE,
} from './specializationWeights.js';

// ── Market adjustment layer (mirrors Phase 2 static baseline) ─────────────────
// Small bumps based on 2025 QA market trends — applied on top of spec weights.
const MARKET_ADJUSTMENTS = {
  ci_cd_readiness:    { delta: +2, reason: 'GitHub Actions / pipeline adoption surging in QA stacks' },
  api_testing:        { delta: +2, reason: 'API testing now expected in 90%+ of mid-to-senior roles'  },
  automation_testing: { delta: +1, reason: 'Playwright/Cypress adoption rising — automation valued more' },
};

// Seniority bonus: senior/lead profiles get ci_cd_readiness weighted higher
const SENIORITY_ADJUSTMENTS = {
  senior: { ci_cd_readiness: +2, framework_expertise: +2 },
  lead:   { ci_cd_readiness: +4, framework_expertise: +3, qa_experience: +2 },
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {object} resumeInsight - candidate's DB row
 * @returns {DynamicWeightResult}
 */
export function runWeightEngine(resumeInsight) {
  const specialization = resumeInsight?.qa_specialization ?? 'manual_qa';
  const seniority      = resumeInsight?.qa_seniority      ?? null;
  const breakdown      = resumeInsight?.qa_score_breakdown ?? null;
  const staticScore    = resumeInsight?.qa_match_score     ?? null;

  const specWeights = SPEC_WEIGHTS[specialization] ?? SPEC_WEIGHTS.manual_qa;
  const rationale   = WEIGHT_RATIONALE[specialization] ?? {};

  // Build effective weights: spec base + market adjustments + seniority
  const effectiveWeights = buildEffectiveWeights(specWeights, seniority);

  // Build per-dimension breakdown
  const dimensions = buildDimensionBreakdown(breakdown, effectiveWeights, rationale);

  // Compute dynamic score (only if breakdown available). Deliberately NOT
  // attenuated by credibilityAdjustment here: staticScore isn't attenuated by
  // it either, and multiplying only one side before differencing would make
  // score_delta reflect two different adjustments (reweighting AND evidence
  // discount) instead of just the specialization-reweighting comparison it's
  // meant to show. credibility_adjustment is still returned below as its own
  // informational field for callers who want it separately.
  const dynamicScore = breakdown
    ? computeDynamicScore(breakdown, effectiveWeights)
    : null;

  const credibilityAdjustment = computeCredibilityAdjustment(resumeInsight);

  const scoreDelta = dynamicScore != null && staticScore != null
    ? dynamicScore - staticScore
    : null;

  // Find highest-leverage dimension
  const highestLeverage = breakdown
    ? findHighestLeverage(breakdown, effectiveWeights)
    : null;

  const insight = deriveInsight({
    specialization, dynamicScore, staticScore, scoreDelta, highestLeverage, dimensions,
  });

  return {
    specialization,
    static_score:             staticScore,
    dynamic_score:            dynamicScore,
    score_delta:              scoreDelta,
    dimensions,
    highest_leverage_dimension: highestLeverage,
    weight_insight:           insight,
    market_adjustments:       Object.entries(MARKET_ADJUSTMENTS).map(([dim, m]) => ({
      dimension: dim,
      label:     DIMENSION_LABELS[dim] ?? dim,
      delta:     m.delta,
      reason:    m.reason,
    })),
    seniority_applied:       seniority && SENIORITY_ADJUSTMENTS[seniority] ? seniority : null,
    credibility_adjustment:  credibilityAdjustment,
  };
}

// ── Credibility attenuation ───────────────────────────────────────────────────

/**
 * Dynamic score must reflect market-adjusted capability, not fantasy potential.
 * A candidate with all skills listed but no implementation evidence should not score 40
 * on a market-weighted score if their ATS score is 20.
 */
function computeCredibilityAdjustment(resumeInsight) {
  if (!resumeInsight) return 0.80; // no data → apply moderate attenuation

  const trust          = resumeInsight.recruiter_trust_score ?? 55;
  const evidenceStr    = resumeInsight.evidence_strength     ?? null;
  const wordCount      = resumeInsight.word_count            ?? 500;
  const experienceYears = resumeInsight.experience_years     ?? 0;

  // Evidence strength → base multiplier
  const STRENGTH_MULT = { strong: 0.95, moderate: 0.80, basic: 0.65, weak: 0.50 };
  let mult = evidenceStr ? (STRENGTH_MULT[evidenceStr] ?? 0.75) : 0.80;

  // Very low recruiter trust → floor the multiplier
  if (trust < 25) mult = Math.min(mult, 0.50);
  else if (trust < 40) mult = Math.min(mult, 0.65);

  // Ultra-shallow resume: few words + no experience → very constrained
  if (wordCount < 150 && experienceYears === 0) mult = Math.min(mult, 0.55);

  return mult;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildEffectiveWeights(specWeights, seniority) {
  const weights = { ...specWeights };

  // Apply market adjustments (capped so total stays near 100)
  for (const [dim, { delta }] of Object.entries(MARKET_ADJUSTMENTS)) {
    if (weights[dim] != null) weights[dim] += delta;
  }

  // Apply seniority adjustments
  if (seniority && SENIORITY_ADJUSTMENTS[seniority]) {
    for (const [dim, delta] of Object.entries(SENIORITY_ADJUSTMENTS[seniority])) {
      if (weights[dim] != null) weights[dim] += delta;
    }
  }

  // Normalise back to sum=100 using largest-remainder rounding — independently
  // Math.round()-ing each scaled value can sum to 99 or 101, which breaks the
  // "weights add to 100%" guarantee this function exists to provide.
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const scale = 100 / total;
  const scaled = Object.entries(weights).map(([k, v]) => {
    const exact = v * scale;
    return { k, floor: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  let remaining = 100 - scaled.reduce((sum, s) => sum + s.floor, 0);
  const byRemainderDesc = [...scaled].sort((a, b) => b.remainder - a.remainder);
  for (const s of byRemainderDesc) {
    if (remaining <= 0) break;
    s.floor += 1;
    remaining -= 1;
  }

  return Object.fromEntries(scaled.map(s => [s.k, s.floor]));
}

function buildDimensionBreakdown(breakdown, effectiveWeights, rationale) {
  return Object.entries(BASE_WEIGHTS).map(([dim, baseWeight]) => {
    const effectiveWeight = effectiveWeights[dim] ?? baseWeight;
    const weightDelta     = effectiveWeight - baseWeight;
    const bkd             = breakdown?.[dim];
    const rawScore        = bkd?.score ?? null;
    const rawMax          = bkd?.max   ?? baseWeight;
    const performance_pct = rawMax > 0 && rawScore != null ? Math.round((rawScore / rawMax) * 100) : null;
    const dynamic_points  = performance_pct != null ? Math.round((performance_pct / 100) * effectiveWeight) : null;
    const leverage_score  = performance_pct != null
      ? Math.round((1 - performance_pct / 100) * effectiveWeight)
      : null;

    return {
      dimension:        dim,
      label:            DIMENSION_LABELS[dim] ?? dim,
      base_weight:      baseWeight,
      effective_weight: effectiveWeight,
      weight_delta:     weightDelta,
      raw_score:        rawScore,
      raw_max:          rawMax,
      performance_pct,
      dynamic_points,
      leverage_score,
      rationale:        rationale[dim] ?? null,
      direction:        weightDelta > 0 ? 'up' : weightDelta < 0 ? 'down' : 'same',
    };
  }).sort((a, b) => (b.effective_weight ?? 0) - (a.effective_weight ?? 0));
}

function computeDynamicScore(breakdown, effectiveWeights) {
  let total = 0;
  for (const [dim, { score, max }] of Object.entries(breakdown)) {
    const pct = max > 0 ? score / max : 0;
    const ew  = effectiveWeights[dim] ?? BASE_WEIGHTS[dim] ?? 0;
    total += pct * ew;
  }
  return Math.min(100, Math.round(total));
}

function findHighestLeverage(breakdown, effectiveWeights) {
  let best = null;
  let bestScore = -1;
  for (const [dim, { score, max }] of Object.entries(breakdown)) {
    const pct      = max > 0 ? score / max : 0;
    const ew       = effectiveWeights[dim] ?? 0;
    const leverage = (1 - pct) * ew;
    if (leverage > bestScore) { bestScore = leverage; best = dim; }
  }
  return best;
}

function deriveInsight({ specialization, dynamicScore, staticScore, scoreDelta, highestLeverage, dimensions }) {
  const specLabel = specialization.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const topDim    = dimensions[0];

  if (dynamicScore == null) {
    return `Parse your resume to see your ${specLabel}-calibrated score. Weights are tailored to what ${specLabel} recruiters actually screen for.`;
  }

  const deltaText = scoreDelta > 0
    ? `Your ${specLabel} profile scores ${scoreDelta} points higher under market-calibrated weights — your strengths align well with what recruiters screen for.`
    : scoreDelta < 0
    ? `Market weights reveal a ${Math.abs(scoreDelta)}-point gap — ${specLabel} roles emphasise ${topDim?.label ?? 'certain dimensions'} more than the base ATS scores.`
    : `Your score holds steady under ${specLabel} weights — balanced across all key dimensions.`;

  const leverageText = highestLeverage
    ? ` Highest leverage: ${DIMENSION_LABELS[highestLeverage] ?? highestLeverage}.`
    : '';

  return deltaText + leverageText;
}
