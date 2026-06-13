/**
 * recruiterExplanation.js — Phase 3: Human-Readable Recruiter Reasoning
 *
 * Generates three reasoning arrays that explain WHY each score exists.
 * Answers: "capability_reasoning" (ATS), "trust_reasoning" (credibility),
 * "readiness_reasoning" (hiring decision).
 *
 * Every recruiter-facing score can now be explained in plain language.
 */

const SPEC_LABELS = {
  sdet:             'SDET',
  automation_qa:    'Automation QA',
  api_testing:      'API QA',
  mobile_testing:   'Mobile QA',
  performance_testing: 'Performance QA',
  hybrid_qa:        'Hybrid QA',
  manual_qa:        'Manual QA',
};

const LEVEL_LABELS = {
  fresher:   'Fresher',
  junior:    'Junior QA (1–3 yrs)',
  mid_level: 'Mid-Level QA (3–6 yrs)',
  senior:    'Senior QA (6–10 yrs)',
  lead:      'Lead QA (10+ yrs)',
};

/**
 * Generate human-readable reasoning for capability, trust, and readiness.
 *
 * @param {object} params — all scored intelligence fields
 * @returns {{ capability_reasoning, trust_reasoning, readiness_reasoning }}
 */
export function generateRecruiterExplanation({
  qa_match_score        = 0,
  recruiter_trust_score = 0,
  candidate_readiness_score = 0,
  qa_score_breakdown    = {},
  evidence_profile      = null,
  qa_specialization     = 'manual_qa',
  career_level          = 'junior',
  career_level_confidence = 'medium',
  hiring_recommendation = null,
  analysis_confidence   = 'medium',
  contradictions        = [],
  scoring_trace         = null,
} = {}) {

  // ── Capability reasoning ──────────────────────────────────────────────────
  const capability_reasoning = [];

  const dim = (key) => qa_score_breakdown[key];
  const pct = (key) => { const d = dim(key); return d ? d.score / d.max : 0; };

  if (pct('automation_testing') >= 0.78) {
    capability_reasoning.push(`Strong automation framework coverage — ${Math.round(pct('automation_testing') * 100)}% of automation scoring reached.`);
  } else if (pct('automation_testing') > 0) {
    capability_reasoning.push(`Partial automation coverage — ${Math.round(pct('automation_testing') * 100)}% of automation scoring reached (Selenium/Playwright/Cypress breadth limited).`);
  } else {
    capability_reasoning.push('Automation framework coverage absent — no automation tools detected in profile.');
  }

  if (pct('api_testing') >= 0.6) {
    capability_reasoning.push(`API testing capability confirmed — ${Math.round(pct('api_testing') * 100)}% of API scoring reached.`);
  } else if (pct('api_testing') > 0) {
    capability_reasoning.push(`Basic API testing detected — ${Math.round(pct('api_testing') * 100)}% of API scoring reached.`);
  }

  if (pct('ci_cd_readiness') >= 0.6) {
    capability_reasoning.push(`CI/CD pipeline exposure confirmed — strong automation-first mindset signal.`);
  } else if (pct('ci_cd_readiness') > 0) {
    capability_reasoning.push(`Limited CI/CD tool coverage detected.`);
  }

  if (pct('performance_testing') >= 0.7) {
    capability_reasoning.push(`Performance testing capability (JMeter/Gatling/K6) — differentiating signal.`);
  }

  const specLabel = SPEC_LABELS[qa_specialization] ?? qa_specialization;
  const levelLabel = LEVEL_LABELS[career_level] ?? career_level;
  capability_reasoning.push(`Career level: ${levelLabel} (confidence: ${career_level_confidence}).`);
  capability_reasoning.push(`Specialization: ${specLabel}.`);

  if (scoring_trace) {
    const ceiling = scoring_trace.career_ceiling_applied;
    if (ceiling === 'fresher' || ceiling === 'junior') {
      capability_reasoning.push(`Career ceiling applied: ${ceiling} profile — maximum ATS score bounded to prevent fresher/junior over-scoring.`);
    }
    if (scoring_trace.stuffing_penalty > 0) {
      capability_reasoning.push(`Keyword stuffing penalty of ${scoring_trace.stuffing_penalty} pts applied — excessive skill density detected.`);
    }
    if (scoring_trace.section_only_ratio > 0) {
      capability_reasoning.push(`Section-only attenuation: ${Math.round(scoring_trace.section_only_ratio * 100)}% of skills appear only in the Skills section — score attenuated by ×${scoring_trace.section_attenuation_multiplier}.`);
    }
  }

  // ── Trust reasoning ───────────────────────────────────────────────────────
  const trust_reasoning = [];

  if (evidence_profile?.has_quantified_impact) {
    trust_reasoning.push('✓ Quantified outcomes detected — measurable impact signals found in experience.');
  } else {
    trust_reasoning.push('✗ No quantified outcomes detected — experience descriptions lack measurable results.');
  }

  if (evidence_profile?.has_architecture_depth) {
    trust_reasoning.push('✓ Framework architecture evidence confirmed — implementation ownership verified.');
  } else {
    trust_reasoning.push('✗ No framework architecture evidence — tools may be known but not owned.');
  }

  if (evidence_profile?.has_cicd_integration) {
    trust_reasoning.push('✓ CI/CD integration evidence found — pipeline usage verified in experience context.');
  }

  const density = evidence_profile?.evidence_density ?? 0;
  trust_reasoning.push(`Evidence density: ${density}% of tracked skills have project or work-history proof.`);

  const inflationRisk = evidence_profile?.keyword_stuffing_risk ?? 'none';
  if (inflationRisk === 'high' || inflationRisk === 'moderate') {
    trust_reasoning.push(`⚠ Keyword inflation risk: ${inflationRisk} — skill breadth may exceed demonstrated experience.`);
  }

  if (contradictions.length > 0) {
    const highSev = contradictions.filter(c => c.severity === 'high');
    if (highSev.length > 0) {
      trust_reasoning.push(`⚠ ${highSev.length} high-severity contradiction(s) detected: ${highSev.map(c => c.type.replace(/_/g, ' ')).join(', ')}.`);
    }
  }

  const trustBand =
    recruiter_trust_score >= 75 ? 'strong' :
    recruiter_trust_score >= 55 ? 'moderate' :
    recruiter_trust_score >= 35 ? 'basic' : 'weak';
  trust_reasoning.push(`Recruiter trust score: ${recruiter_trust_score}/100 (${trustBand} evidence quality).`);

  // ── Readiness reasoning ───────────────────────────────────────────────────
  const readiness_reasoning = [];

  const rec = hiring_recommendation ?? 'unknown';
  readiness_reasoning.push(`Hiring recommendation: ${rec}.`);

  if (candidate_readiness_score >= 70 && recruiter_trust_score >= 65) {
    readiness_reasoning.push('High capability and high credibility — strong interview shortlist signal.');
  } else if (candidate_readiness_score >= 70 && recruiter_trust_score < 40) {
    readiness_reasoning.push('High ATS capability but weak evidence quality — ATS keywords present but implementation depth needs verification.');
  } else if (candidate_readiness_score >= 50) {
    readiness_reasoning.push('Moderate readiness — candidate has core skills but evidence depth or coverage could be stronger.');
  } else {
    readiness_reasoning.push('Limited readiness — significant gaps in either capability or credibility.');
  }

  readiness_reasoning.push(`Analysis confidence: ${analysis_confidence} — ${
    analysis_confidence === 'high'
      ? 'rich evidence available; ATS conclusions are reliable.'
      : analysis_confidence === 'medium'
      ? 'reasonable signal quality; treat scores as indicative.'
      : 'limited resume content; conclusions are tentative — seek additional information.'
  }`);

  return { capability_reasoning, trust_reasoning, readiness_reasoning };
}
