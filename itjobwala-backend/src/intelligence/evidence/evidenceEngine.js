/**
 * evidenceEngine.js — Main orchestrator for evidence-based ATS intelligence.
 * Called from intelligenceAdapter.js after base scoring.
 * Pure function — no DB or external calls.
 */

import { extractSkillEvidence }         from './skillEvidenceExtractor.js';
import { analyzeImplementationDepth }   from './implementationDepthAnalyzer.js';
import { analyzeExperienceDepth }       from './experienceDepthAnalyzer.js';
import { detectKeywordInflation }       from './keywordInflationDetector.js';
import { computeRecruiterTrust }        from './recruiterTrustEngine.js';
import { analyzeSkillRecency }          from '../recency/skillRecencyAnalyzer.js';
import { computeAuthenticityProfile }   from '../authenticity/resumeAuthenticityEngine.js';
import { computeRiskFlags }             from '../flags/riskFlagEngine.js';
import { computeTrajectory }            from '../behavioral/trajectoryAnalyzer.js';

export function analyzeEvidence(parsed) {
  // 1. Per-skill evidence extraction (includes depth_level per skill)
  const { skill_evidence, skill_timeline } = extractSkillEvidence(parsed);

  // 2. Implementation depth analysis
  const implementationDepth = analyzeImplementationDepth(parsed, skill_evidence);

  // 3. Experience quality analysis
  const experienceDepth = analyzeExperienceDepth(parsed);

  // 4. Keyword inflation detection
  const inflationResult = detectKeywordInflation(parsed, skill_evidence);

  // 5. Recruiter trust (includes trust_breakdown)
  const trustResult = computeRecruiterTrust(skill_evidence, experienceDepth, inflationResult);

  // 6. Evidence profile
  const evidence_profile = {
    recruiter_trust_score:    trustResult.recruiter_trust_score,
    evidence_strength:        trustResult.evidence_strength,
    implementation_maturity:  implementationDepth.maturity,
    experience_depth:         experienceDepth.level,
    keyword_stuffing_risk:    inflationResult.risk,
    evidence_density:         trustResult.evidence_density,
    proven_skills_count:      trustResult.proven_skills_count,
    weak_evidence_count:      trustResult.weak_evidence_count,
    has_quantified_impact:    trustResult.has_quantified_impact,
    has_architecture_depth:   trustResult.has_architecture_depth,
    has_cicd_integration:     trustResult.has_cicd_integration,
    calibration_delta:        0,
  };

  const partialResult = { evidence_profile, skill_evidence, inflationResult };

  // 7. Skill recency (Phase 5: adds recency_confidence, recency_source, recency_summary)
  const recencyResult = analyzeSkillRecency(parsed, skill_evidence);

  // 8. Authenticity profile (Phase 5: includes toolchain_coherence)
  const authenticity_profile = computeAuthenticityProfile(parsed, partialResult);

  // 9. Risk flags (Phase 5: structured objects with severity; receives authenticity for coherence)
  const riskResult = computeRiskFlags(parsed, partialResult, authenticity_profile);

  // 10. Trajectory (Phase 5: evidence-gated; adds trajectory_confidence + trajectory_evidence_score)
  const trajectory_profile = computeTrajectory(parsed, {
    ...partialResult,
    // pass trust score into trajectory for the accelerating gate
    evidence_profile: {
      ...evidence_profile,
      recruiter_trust_score: trustResult.recruiter_trust_score,
    },
  }, recencyResult);

  return {
    evidence_profile,
    skill_evidence,
    skill_timeline,
    weak_evidence_skills:   trustResult.weak_evidence_skills,
    proven_skills:          trustResult.proven_skills,
    implementationDepth,
    experienceDepth,
    inflationResult,
    trust_breakdown:        trustResult.trust_breakdown,
    // Recency (Phase 5)
    skill_recency:          recencyResult.skill_recency,
    recency_stats:          recencyResult.recency_stats,
    recency_summary:        recencyResult.recency_summary,
    stale_high_sensitivity: recencyResult.stale_high_sensitivity,
    // Authenticity (Phase 5: includes toolchain_coherence)
    authenticity_profile,
    // Risk flags (Phase 5: structured with severity + overall_risk_score/level)
    risk_flags:             riskResult.risk_flags,
    overall_risk_score:     riskResult.overall_risk_score,
    overall_risk_level:     riskResult.overall_risk_level,
    // Trajectory (Phase 5: evidence-gated)
    trajectory_profile,
  };
}
