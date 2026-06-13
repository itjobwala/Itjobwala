/**
 * firstImpressionSimulator.js — Phase 4 Fix 9
 * Simulates the first impression a human recruiter would form from the resume.
 * Returns qualitative signals for UI display.
 */

/**
 * @param {object} resumeInsight - DB row with qa_match_score, recruiter_trust_score,
 *   evidence_strength, recruiter_confidence, qa_seniority, evidence_profile, risk_flags
 * @returns {{ recruiter_reaction, likely_interview_decision, biggest_positive_signal, biggest_red_flag }}
 */
export function simulateFirstImpression(resumeInsight) {
  const score      = resumeInsight?.qa_match_score       ?? 0;
  const trust      = resumeInsight?.recruiter_trust_score ?? 0;
  const confidence = resumeInsight?.recruiter_confidence  ?? 'low';
  const strength   = resumeInsight?.evidence_strength     ?? 'weak';
  const seniority  = resumeInsight?.qa_seniority          ?? null;
  // risk_flags is now an array of objects { flag, severity, ... } — extract flag keys
  const rawFlags   = resumeInsight?.risk_flags ?? [];
  const riskFlags  = rawFlags.map ? rawFlags.map(f => (typeof f === 'string' ? f : f.flag)) : [];
  const profile    = resumeInsight?.evidence_profile      ?? {};

  const hasQuant = profile.has_quantified_impact   ?? false;
  const hasArch  = profile.has_architecture_depth  ?? false;
  const hasCICD  = profile.has_cicd_integration    ?? false;

  // ── Interview decision ─────────────────────────────────────────────────────
  let likely_interview_decision;

  if (score >= 72 && trust >= 65 && confidence !== 'very_low') {
    likely_interview_decision = 'Strong Shortlist';
  } else if (score >= 55 && trust >= 50) {
    likely_interview_decision = 'Shortlist with Verification';
  } else if (score >= 35 && seniority === 'junior') {
    likely_interview_decision = 'Junior Pool';
  } else if (confidence === 'very_low' || riskFlags.includes('very_short_resume') || riskFlags.includes('shallow_resume')) {
    likely_interview_decision = 'Needs More Content';
  } else {
    likely_interview_decision = 'Pass';
  }

  // ── Positive signal ────────────────────────────────────────────────────────
  let biggest_positive_signal = null;

  if (hasArch && trust >= 65) {
    biggest_positive_signal = 'Architecture depth — shows engineering maturity beyond task execution.';
  } else if (hasQuant) {
    biggest_positive_signal = 'Quantified outcomes — measurable impact is rare and stands out.';
  } else if (hasCICD && score >= 55) {
    biggest_positive_signal = 'CI/CD integration — pipeline ownership signals DevQA readiness.';
  } else if (strength === 'strong') {
    biggest_positive_signal = 'Strong implementation evidence across multiple contexts.';
  } else if (score >= 50) {
    biggest_positive_signal = 'Solid QA coverage across key skill dimensions.';
  } else if (seniority === 'junior' && score >= 30) {
    biggest_positive_signal = 'Reasonable entry-level foundation with room to grow.';
  }

  // ── Red flag ──────────────────────────────────────────────────────────────
  let biggest_red_flag = null;

  if (riskFlags.includes('possible_keyword_stuffing')) {
    biggest_red_flag = 'Possible keyword stuffing — skills list doesn\'t align with experience depth.';
  } else if (riskFlags.includes('no_architecture_depth') && riskFlags.includes('skills_without_projects')) {
    biggest_red_flag = 'Seniority claims with no architectural or project evidence.';
  } else if (riskFlags.includes('shallow_resume') || riskFlags.includes('very_short_resume')) {
    biggest_red_flag = 'Resume is too thin to assess capability — not enough content.';
  } else if (riskFlags.includes('no_quantified_impact')) {
    biggest_red_flag = 'No measurable outcomes — hard to gauge real contribution.';
  } else if (riskFlags.includes('outdated_stack')) {
    biggest_red_flag = 'Toolstack appears dated — no modern automation frameworks detected.';
  } else if (riskFlags.includes('no_ci_cd_context') && score < 50) {
    biggest_red_flag = 'No CI/CD context despite multiple roles — gap in modern QA practice.';
  }

  // ── Recruiter reaction ────────────────────────────────────────────────────
  let recruiter_reaction;

  if (likely_interview_decision === 'Strong Shortlist') {
    recruiter_reaction = 'Impressed — this candidate shows real implementation depth. Would shortlist immediately.';
  } else if (likely_interview_decision === 'Shortlist with Verification') {
    recruiter_reaction = 'Interested but cautious — skill set looks right but needs a screening call to verify.';
  } else if (likely_interview_decision === 'Junior Pool') {
    recruiter_reaction = 'Potential entry-level fit — would route to junior QA pipeline, not senior roles.';
  } else if (likely_interview_decision === 'Needs More Content') {
    recruiter_reaction = 'Not enough to evaluate — would ask candidate to resubmit with a more complete resume.';
  } else {
    recruiter_reaction = 'Likely pass at resume stage — either skill gaps, weak evidence, or red flags outweigh positives.';
  }

  return {
    recruiter_reaction,
    likely_interview_decision,
    biggest_positive_signal,
    biggest_red_flag,
  };
}
