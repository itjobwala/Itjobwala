/**
 * evidenceConfidence.js
 * Translates evidence analysis into a score calibration delta.
 * Applied BEFORE career soft-ceiling calibration.
 */

import { CALIBRATION_DELTAS, INFLATION_PENALTIES } from './evidenceSignals.js';

/**
 * Compute the score adjustment delta based on evidence quality.
 * Positive delta = rewarding real depth.
 * Negative delta = penalizing keyword inflation / lack of proof.
 *
 * @returns {number} delta to add to base_score (can be negative)
 */
export function computeEvidenceDelta(evidenceResult) {
  const { evidence_profile, inflationResult } = evidenceResult;
  const trust = evidence_profile.recruiter_trust_score;

  // Trust-based delta
  let delta = 0;
  if      (trust >= CALIBRATION_DELTAS.veryHigh.min) delta = CALIBRATION_DELTAS.veryHigh.delta;
  else if (trust >= CALIBRATION_DELTAS.high.min)     delta = CALIBRATION_DELTAS.high.delta;
  else if (trust >= CALIBRATION_DELTAS.neutral.min)  delta = CALIBRATION_DELTAS.neutral.delta;
  else if (trust >= CALIBRATION_DELTAS.low.min)      delta = CALIBRATION_DELTAS.low.delta;
  else                                                delta = CALIBRATION_DELTAS.veryLow.delta;

  // Additional inflation penalty
  delta += INFLATION_PENALTIES[inflationResult.risk] ?? 0;

  // Bonus for architecture depth (rewards real SDET-level work)
  if (evidence_profile.has_architecture_depth && trust >= 65) delta += 3;

  // Bonus for quantified outcomes (rewards measurable impact)
  if (evidence_profile.has_quantified_impact && trust >= 55) delta += 2;

  return delta;
}

/**
 * Evidence-aware SDET gate — P0 Fix 2.
 *
 * Old logic: assign SDET from keywords → downgrade if gate fails.
 * New logic: require at least 2 independent evidence signals before
 *            confirming SDET. Eliminates the "inflate-then-repair" pattern.
 *
 * Evidence signals checked (any 2 required):
 *   1. Framework architecture depth (arch_gate || has_architecture_depth)
 *   2. CI/CD pipeline integration  (cicd_gate || has_cicd_integration)
 *   3. Coding / programming evidence (coding_gate from implementation depth)
 *   4. Quantified automation impact (has_quantified_impact)
 *   5. Enterprise-scale maturity (implementation maturity = expert | advanced)
 *
 * @param {string}      qa_specialization
 * @param {number}      specialization_confidence
 * @param {object}      implementationDepth  — from implementationDepthAnalyzer
 * @param {object|null} evidence_profile     — from recruiterTrustEngine (optional)
 */
export function applySdetGate(
  qa_specialization,
  specialization_confidence,
  implementationDepth,
  evidence_profile = null,
) {
  if (qa_specialization !== 'sdet') {
    return { qa_specialization, specialization_confidence };
  }

  const { sdet_gate, maturity } = implementationDepth;

  // Count independent evidence signals
  let evidenceSignals = 0;
  if (sdet_gate.architecture || evidence_profile?.has_architecture_depth) evidenceSignals++;
  if (sdet_gate.cicd         || evidence_profile?.has_cicd_integration)   evidenceSignals++;
  if (sdet_gate.coding)                                                     evidenceSignals++;
  if (evidence_profile?.has_quantified_impact)                              evidenceSignals++;
  if (maturity === 'expert' || maturity === 'advanced')                     evidenceSignals++;

  // P0 Fix 2: require at least 2 evidence signals for SDET classification.
  // One keyword match (e.g. "parallel execution" + "ci/cd") is insufficient.
  if (evidenceSignals < 2) {
    return {
      qa_specialization:         'automation_qa',
      specialization_confidence: Math.min(specialization_confidence, 60),
    };
  }

  // Additional check: old passes gate still must hold (arch + cicd minimum from text)
  if (!sdet_gate.passes) {
    return {
      qa_specialization:         'automation_qa',
      specialization_confidence: Math.min(specialization_confidence, 60),
    };
  }

  // SDET confirmed — cap confidence if coding evidence is absent
  const cappedConf = !sdet_gate.coding
    ? Math.min(specialization_confidence, 78)
    : specialization_confidence;

  return { qa_specialization: 'sdet', specialization_confidence: cappedConf };
}

/**
 * Evidence-aware recruiter confidence adjustment.
 * Takes the existing 'low'|'medium'|'high' and adjusts based on evidence quality
 * and the ATS+trust combination to prevent misleading confidence signals.
 *
 * @param {string} existingConfidence - 'low' | 'medium' | 'high'
 * @param {object} evidenceResult
 * @param {number} qa_match_score - Final ATS capability score (0–100)
 */
export function adjustRecruiterConfidence(existingConfidence, evidenceResult, qa_match_score = 0) {
  const { evidence_profile, inflationResult } = evidenceResult;
  const trust = evidence_profile.recruiter_trust_score;

  // Preserve very_low — nothing can upgrade it here
  if (existingConfidence === 'very_low') return 'very_low';

  // High inflation risk always forces low confidence
  if (inflationResult.risk === 'high') return 'low';

  // Extremely low trust with already-low confidence → very_low
  if (trust < 20 && existingConfidence === 'low') return 'very_low';

  // ATS + trust combination — prevent misleading extreme signals
  // High capability but low credibility → medium (recruiter should verify)
  if (qa_match_score >= 65 && trust < 35) return 'medium';
  // Low capability but high trust → medium (honest but not yet strong enough)
  if (qa_match_score < 35 && trust >= 70) return 'medium';

  // Trust < 35 and existing medium → downgrade
  if (trust < 35 && existingConfidence === 'medium') return 'low';

  // Trust >= 75 and existing medium → upgrade
  if (trust >= 75 && existingConfidence === 'medium') return 'high';

  // Trust < 45 and existing high → downgrade
  if (trust < 45 && existingConfidence === 'high') return 'medium';

  return existingConfidence;
}
