/**
 * intelligenceAdapter.js — AI-Ready Architecture + Evidence Intelligence
 *
 * Single gateway for all QA resume intelligence. Rule-based today, LLM-ready.
 *
 * ── Phase 1: Score Ownership Audit ──────────────────────────────────────────
 *
 * Signal                  │ qa_match_score │ recruiter_trust_score │ Notes
 * ────────────────────────┼───────────────┼──────────────────────┼───────
 * Years of experience     │ ✓ (exp dim)   │ ✗ (removed)          │ Single owner: ATS
 * Framework coverage      │ ✓ (auto+fw)   │ ✗                    │ Capability
 * Architecture evidence   │ ✗             │ ✓ (+7 pts)           │ Credibility
 * Project depth           │ ✗             │ ✓ (+4 pts)           │ Credibility *
 * Quantified impact       │ ✗             │ ✓ (+6 pts)           │ Credibility
 * Certifications          │ ✓ (cert dim)  │ ✗ (removed)          │ Single owner: ATS
 * CI/CD evidence (usage)  │ ✗             │ ✓ (hasCICDSkill)     │ Credibility
 * CI/CD keywords (coverage)│ ✓ (cicd dim) │ ✗                    │ Capability
 * Keyword stuffing        │ ✓ (penalty)   │ ✓ (inflation→trust)  │ Acceptable: diff detectors
 * Section-only ratio      │ ✓ (attenuation)│ ✓ (via inflation)   │ Acceptable: different signals
 * Experience shortlist    │ ✓ (indirect)  │ ✗ (removed)          │ Fixed: no longer direct boost
 *
 * * Project depth contributes +1 to qa_experience dim AND +4 to trust.
 *   These measure different things: dim = has QA projects (keyword), trust = verified usage.
 *
 * ── Calibration pipeline (P2 Fix 9 — reordered) ─────────────────────────────
 *   Raw ATS → Career Ceiling → Section-Only Attenuation → Stuffing Penalty → Final ATS
 */

import { calculateQaResumeScore, getQaHiringLabel }                         from './scoreCalculator.js';
import { computeEvidenceMultiplier, computeSectionOnlyMultiplier, computeRecencyPenalty } from './atsCalibration.js';
import { calculateGenericScore }                                             from './genericScorer.js';
import { detectQaSpecialization }                                            from './qaSpecialization.js';
import { detectKeywordStuffing, calculateRecruiterConfidence }              from './recruiterIntelligence.js';
import { detectCareerLevelWithConfidence, calibrateQaScoreByCareerLevel }   from './careerCalibration.js';
import { analyzeEvidence }                                                   from '../../intelligence/evidence/evidenceEngine.js';
import { computeEvidenceDelta, adjustRecruiterConfidence }                  from '../../intelligence/evidence/evidenceConfidence.js';
import { calculateCapabilityScore }                                          from './capabilityScore.js';
import { computeAnalysisConfidence }                                         from './analysisConfidence.js';
import { detectSpecializationFromEvidence, getSdetEvidenceSummary }         from '../../intelligence/specialization/specializationEvidenceEngine.js';
import { detectContradictions }                                              from '../../intelligence/contradictions/contradictionDetector.js';
import { computeHiringRecommendation }                                       from '../../intelligence/hiring/hiringRecommendationEngine.js';
import { generateRecruiterExplanation }                                      from '../../intelligence/explanation/recruiterExplanation.js';

const PROVIDER = process.env.AI_INTELLIGENCE_PROVIDER ?? 'rules';

export async function analyzeQaResume(parsed, domainResult, profileSkills = []) {
  if (PROVIDER === 'llm') {
    console.warn('[intelligence] LLM provider configured but not yet implemented — using rule-based fallback');
  }
  return runRuleBasedAnalysis(parsed, domainResult, profileSkills);
}

function isQaDomain(domain) {
  return domain === 'qa_testing';
}

function runRuleBasedAnalysis(parsed, domainResult, profileSkills) {
  const allSkills = [...new Set([...(parsed.extractedSkills || []), ...profileSkills])];
  const domain    = domainResult.domain;

  // ── 1. Core ATS scoring ──────────────────────────────────────────────────
  const scorerInput = {
    extractedSkills:      parsed.extractedSkills      || [],
    experienceEntries:    parsed.experienceEntries     || [],
    experienceYears:      parsed.experienceYears       || 0,
    projectEntries:       parsed.projectEntries        || [],
    certificationEntries: parsed.certificationEntries  || [],
    contactInfo:          parsed.contactInfo           || {},
    parsedText:           parsed.parsedText            || '',
    detectedDomain:       domain,
  };
  const qa = isQaDomain(domain)
    ? calculateQaResumeScore(scorerInput)
    : calculateGenericScore(scorerInput);

  // ── 2. Evidence analysis ─────────────────────────────────────────────────
  const evidenceResult = analyzeEvidence(parsed);

  // ── 3. Keyword stuffing ──────────────────────────────────────────────────
  const stuffing = detectKeywordStuffing({
    extractedSkills:   parsed.extractedSkills  || [],
    parsedText:        parsed.parsedText        || '',
    experienceEntries: parsed.experienceEntries || [],
  });

  // ── 4. Career level (year-only — P0 Fix 1) ───────────────────────────────
  const { career_level, career_level_confidence } = detectCareerLevelWithConfidence({
    experienceYears: parsed.experienceYears || 0,
    parsedText:      parsed.parsedText      || '',
  });

  // ── 5. Calibration pipeline ───────────────────────────────────────────────
  //   Raw ATS → Career Ceiling → Evidence Multiplier → Section-Only Attenuation
  //          → Stuffing Penalty → Recency Penalty → Final ATS
  const rawAfterCeiling = calibrateQaScoreByCareerLevel(qa.qa_match_score, career_level);

  // P1.1 — Evidence multiplier: proportional reward for proven skill usage.
  const evidenceMultiplier = computeEvidenceMultiplier(evidenceResult.skill_evidence);
  const rawAfterEvidMult   = Math.min(100, Math.round(rawAfterCeiling * evidenceMultiplier));

  // P1.3 — Graduated section-only attenuation (feature-flagged 50% band).
  const sectionOnlyCount = (evidenceResult.skill_evidence || [])
    .filter(s => s.proof_sources.length === 1 && s.proof_sources[0] === 'skills_section_only').length;
  const totalTracked     = (evidenceResult.skill_evidence || []).length;
  const sectionOnlyRatio = totalTracked > 0 ? sectionOnlyCount / totalTracked : 0;
  const capabilityMultiplier = computeSectionOnlyMultiplier(sectionOnlyRatio);
  const rawAfterAttenuation  = Math.round(rawAfterEvidMult * capabilityMultiplier);
  evidenceResult.evidence_profile.capability_multiplier = capabilityMultiplier;
  evidenceResult.evidence_profile.section_only_ratio    = Math.round(sectionOnlyRatio * 100);

  // P1.2 — Recency penalty: only direct-experience stale modern tools trigger this.
  const recencyPenalty = computeRecencyPenalty(evidenceResult.skill_recency);
  const qa_match_score = Math.min(100, Math.max(0, rawAfterAttenuation - stuffing.scorePenalty - recencyPenalty));

  const recruiter_trust_score = evidenceResult.evidence_profile.recruiter_trust_score;
  const { capability_score, candidate_readiness_score } =
    calculateCapabilityScore({ qa_match_score, recruiter_trust_score });

  const qa_hiring_label = getQaHiringLabel(qa_match_score);

  const evidenceDelta = computeEvidenceDelta(evidenceResult); // display-only
  evidenceResult.evidence_profile.calibration_delta = evidenceDelta;

  // ── 6. Evidence-first specialization (P2 — replaces keyword-only SDET) ───
  const evidenceSpec = detectSpecializationFromEvidence(
    allSkills,
    parsed.parsedText || '',
    evidenceResult.skill_evidence,
    evidenceResult.evidence_profile,
    evidenceResult.implementationDepth,
  );

  // Also run keyword-based detection as fallback/comparison
  const keywordSpec = detectQaSpecialization(allSkills, parsed.parsedText || '');

  // Evidence-based specialization wins for SDET; keyword-based for others
  // (evidence engine scores all specializations by verified skill evidence)
  const qa_specialization         = evidenceSpec.qa_specialization;
  let   specialization_confidence = evidenceSpec.specialization_confidence;

  // Apply evidence quality multiplier to confidence
  const EVIDENCE_CONF_MULTIPLIERS = { strong: 1.0, moderate: 0.85, basic: 0.65, weak: 0.45 };
  const evidenceStrength          = evidenceResult.evidence_profile.evidence_strength;
  const specEvidenceMultiplier    = EVIDENCE_CONF_MULTIPLIERS[evidenceStrength] ?? 0.65;
  specialization_confidence       = Math.round(specialization_confidence * specEvidenceMultiplier);

  // Hard caps for low-evidence resumes
  const noExperience = (parsed.experienceEntries || []).length === 0;
  if (noExperience && evidenceStrength === 'weak') {
    specialization_confidence = Math.min(specialization_confidence, 25);
  }

  // ── 7. Recruiter confidence ───────────────────────────────────────────────
  const baseConfidence = calculateRecruiterConfidence({
    parsedText:        parsed.parsedText        || '',
    experienceEntries: parsed.experienceEntries || [],
    extractedSkills:   parsed.extractedSkills   || [],
    qa_match_score:    qa.qa_match_score,
    experienceYears:   parsed.experienceYears   || 0,
    isStuffed:         stuffing.isStuffed,
  });
  const recruiter_confidence = adjustRecruiterConfidence(baseConfidence, evidenceResult, qa_match_score);

  // ── 8. Recommendation mode (P0 Fix 4 — 5-value) ──────────────────────────
  const trust = recruiter_trust_score;
  let recommendation_mode;
  if (trust < 40) {
    recommendation_mode = 'credibility_building';
  } else if (qa_match_score < 50) {
    recommendation_mode = 'capability_building';
  } else if ((career_level === 'senior' || career_level === 'lead') && qa_match_score >= 70) {
    recommendation_mode = 'leadership_building';
  } else if (qa_match_score <= 70) {
    recommendation_mode = 'career_building';
  } else {
    recommendation_mode = 'specialization_building';
  }

  // ── 9. Analysis confidence (P2 Fix 10) ───────────────────────────────────
  const analysis_confidence = computeAnalysisConfidence({ parsed, evidenceResult });

  // ── 10. Contradiction detection (Phase 4) ────────────────────────────────
  const sdet_evidence = getSdetEvidenceSummary(
    allSkills,
    parsed.parsedText || '',
    evidenceResult.skill_evidence,
    evidenceResult.evidence_profile,
    evidenceResult.implementationDepth,
  );

  const { contradictions, contradiction_count, contradiction_severity } = detectContradictions({
    parsed,
    evidenceResult,
    evidence_profile:  evidenceResult.evidence_profile,
    experienceYears:   parsed.experienceYears || 0,
    qa_specialization,
    sdet_evidence,
  });

  // ── 11. Hiring recommendation (Phase 5) ──────────────────────────────────
  const { hiring_recommendation, recommendation_rationale, readiness_tier } =
    computeHiringRecommendation({
      candidate_readiness_score,
      analysis_confidence,
      contradiction_severity,
    });

  // ── 12. Phase 6 — Scoring trace (explainability) ─────────────────────────
  const scoring_trace = {
    raw_ats_score:                  qa.qa_match_score,
    after_career_ceiling:           rawAfterCeiling,
    evidence_multiplier:            evidenceMultiplier,
    after_evidence_mult:            rawAfterEvidMult,
    after_section_attenuation:      rawAfterAttenuation,
    recency_penalty:                recencyPenalty,
    final_qa_match_score:           qa_match_score,
    net_calibration_delta:          qa_match_score - qa.qa_match_score,
    career_ceiling_applied:         career_level,
    section_only_ratio:             Math.round(sectionOnlyRatio * 100),
    section_attenuation_multiplier: capabilityMultiplier,
    stuffing_penalty:               stuffing.scorePenalty,
    is_stuffed:                     stuffing.isStuffed,
  };

  const evidence_trace = {
    has_architecture_depth:   evidenceResult.evidence_profile.has_architecture_depth,
    has_cicd_integration:     evidenceResult.evidence_profile.has_cicd_integration,
    has_quantified_impact:    evidenceResult.evidence_profile.has_quantified_impact,
    evidence_density:         evidenceResult.evidence_profile.evidence_density,
    evidence_strength:        evidenceResult.evidence_profile.evidence_strength,
    weak_skills_count:        (evidenceResult.weak_evidence_skills || []).length,
    keyword_inflation_risk:   evidenceResult.inflationResult?.risk ?? 'none',
    implementation_maturity:  evidenceResult.implementationDepth.maturity,
  };

  const penalty_trace = {
    stuffing_penalty:              stuffing.scorePenalty,
    section_attenuation_multiplier: capabilityMultiplier,
    recency_penalty:               recencyPenalty,
    stale_direct_experience_count: Object.values(evidenceResult.skill_recency ?? {})
      .filter(r => r.classification === 'stale' && r.recency_sensitive && r.recency_source === 'experience').length,
    career_ceiling:
      career_level === 'fresher' ? 70 :
      career_level === 'junior'  ? 82 : null,
    trust_penalties: {
      inflation_risk:     evidenceResult.inflationResult?.risk,
      weak_evidence_rate: Math.round(
        ((evidenceResult.skill_evidence || []).filter(s => s.evidence_level === 'weak').length /
          Math.max(1, (evidenceResult.skill_evidence || []).length)) * 100
      ),
    },
  };

  const rule_trace = {
    qa_eligibility_gate:      'passed',
    specialization_engine:    'evidence_first',
    specialization_result:    qa_specialization,
    sdet_evidence_groups:     sdet_evidence,
    career_ceiling_rule:      career_level,
    career_level_confidence,
    recommendation_mode,
    hiring_recommendation,
    contradiction_severity,
  };

  // ── 13. Recruiter explanation (Phase 3) ──────────────────────────────────
  const recruiter_explanation = generateRecruiterExplanation({
    qa_match_score,
    recruiter_trust_score,
    candidate_readiness_score,
    qa_score_breakdown:        qa.qa_score_breakdown,
    evidence_profile:          evidenceResult.evidence_profile,
    qa_specialization,
    career_level,
    career_level_confidence,
    hiring_recommendation,
    analysis_confidence,
    contradictions,
    scoring_trace,
  });

  return {
    // ── Primary scores ─────────────────────────────────────────────────────
    qa_match_score,
    capability_score,
    candidate_readiness_score,

    // ── Diagnostics ────────────────────────────────────────────────────────
    scorer_used:               isQaDomain(domain) ? 'calculateQaResumeScore' : 'calculateGenericScore',
    raw_ats_score:             qa.qa_match_score,

    // ── Hiring intelligence ────────────────────────────────────────────────
    qa_seniority:              career_level,
    career_level,
    career_level_confidence,
    qa_hiring_label,
    qa_score_breakdown:        qa.qa_score_breakdown,
    qa_specialization,
    specialization_confidence,
    recruiter_confidence,
    recommendation_mode,
    analysis_confidence,

    // ── New Phase outputs ──────────────────────────────────────────────────
    hiring_recommendation,                    // Phase 5
    recommendation_rationale,                 // Phase 5
    readiness_tier,                           // Phase 5
    contradictions,                           // Phase 4
    contradiction_count,                      // Phase 4
    contradiction_severity,                   // Phase 4
    recruiter_explanation,                    // Phase 3
    scoring_trace,                            // Phase 6
    evidence_trace,                           // Phase 6
    penalty_trace,                            // Phase 6
    rule_trace,                               // Phase 6

    // ── Qualitative feedback ───────────────────────────────────────────────
    strengths:                 qa.strengths,
    weaknesses:                qa.weaknesses,
    suggestions:               qa.suggestions,

    // ── Evidence intelligence ──────────────────────────────────────────────
    evidence_profile:          evidenceResult.evidence_profile,
    skill_evidence:            evidenceResult.skill_evidence,
    skill_timeline:            evidenceResult.skill_timeline,
    weak_evidence_skills:      evidenceResult.weak_evidence_skills,
    recruiter_trust_score,
    implementation_maturity:   evidenceResult.implementationDepth.maturity,
    evidence_strength:         evidenceResult.evidence_profile.evidence_strength,
    experience_depth_level:    evidenceResult.experienceDepth.level,
    keyword_stuffing_risk:     evidenceResult.inflationResult.risk,
    evidence_multiplier:       specEvidenceMultiplier,

    // ── Phase 4 + 5 intelligence ───────────────────────────────────────────
    trust_breakdown:           evidenceResult.trust_breakdown,
    skill_recency:             evidenceResult.skill_recency,
    recency_summary:           evidenceResult.recency_summary,
    authenticity_profile:      evidenceResult.authenticity_profile,
    risk_flags:                evidenceResult.risk_flags,
    overall_risk_score:        evidenceResult.overall_risk_score,
    overall_risk_level:        evidenceResult.overall_risk_level,
    trajectory_profile:        evidenceResult.trajectory_profile,
  };
}
