/**
 * capabilityScore.js — Capability / Readiness Score calculation.
 *
 * Formula: ATS skill coverage (60%) × evidence-backed trust quality (40%).
 *
 * P1 Fix 5: Added `candidate_readiness_score` as the canonical name for this
 * blended signal. `capability_score` is kept identical for backward compatibility
 * with existing DB columns and frontend consumers, but is considered deprecated.
 *
 * Use `candidate_readiness_score` in all new code.
 */

/**
 * @param {{ qa_match_score: number, recruiter_trust_score: number }} input
 * @returns {{ capability_score: number, candidate_readiness_score: number }}
 */
export function calculateCapabilityScore({ qa_match_score, recruiter_trust_score }) {
  const raw = Math.round(qa_match_score * 0.6 + recruiter_trust_score * 0.4);
  const score = Math.max(0, Math.min(100, raw));
  return {
    capability_score:          score,  // deprecated alias — kept for backward compat
    candidate_readiness_score: score,  // canonical name (P1 Fix 5)
  };
}
