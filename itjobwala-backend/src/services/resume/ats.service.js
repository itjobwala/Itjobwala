/**
 * ats.service.js — QA Hiring Intelligence orchestrator.
 *
 * Delegates intelligence analysis to the adapter (rule-based today, LLM-ready).
 * Handles gap analysis and assembles the final ATS response.
 * Keeps routes, controllers, and frontend stable regardless of intelligence provider.
 */

import { analyzeQaResume }                                     from '../../utils/resume/intelligenceAdapter.js';
import { getScoreBand }                                        from '../../utils/resume/scoreCalculator.js';
import { computeMissingSkills }                                from '../../utils/resume/normalizeSkills.js';
import { detectSkillDomain, getDomainSkillPool }               from '../../utils/resume/domainDetection.js';
import { filterRelevantGaps }                                  from '../../utils/resume/skillWeights.js';
import { runGuidanceOrchestrator }                             from '../../intelligence/guidanceOrchestrator.js';
import { generateInsightNarrative }                            from '../../intelligence/guidance/insightNarrative.js';

const IS_DEV = process.env.NODE_ENV !== 'production';

export async function runATSAnalysis(parsed, profileSkills = []) {
  const allKnownSkills = [...new Set([...(parsed.extractedSkills || []), ...profileSkills])];

  // ── Domain detection ──────────────────────────────────────────────────────────
  const domainResult = detectSkillDomain(allKnownSkills);

  if (IS_DEV) {
    console.log(`[ATS] Domain: ${domainResult.domain} (${domainResult.confidence}%)`);
  }

  // ── QA eligibility gate ───────────────────────────────────────────────────────
  // This platform scores QA professionals only. Any resume whose dominant domain
  // is not qa_testing (even with the 1.6× QA boost applied) is returned early.
  // No scoring, no guidance, no DB write happens for ineligible resumes.
  if (domainResult.domain !== 'qa_testing') {
    return {
      eligible:          false,
      reason:            'non_qa_resume',
      detected_domain:   domainResult.domain,
      domain_confidence: domainResult.confidence,
      domain_label:      domainResult.label,
    };
  }

  // ── Full intelligence analysis (via adapter) ───────────────────────────────────
  const intelligence = await analyzeQaResume(parsed, domainResult, profileSkills);

  if (IS_DEV) {
    console.log(`[ATS] QA match score: ${intelligence.qa_match_score}`);
    console.log(`[ATS] Specialization: ${intelligence.qa_specialization} (${intelligence.specialization_confidence}%)`);
    console.log(`[ATS] Recruiter confidence: ${intelligence.recruiter_confidence}`);
    console.log(`[ATS] Career level: ${intelligence.career_level}`);
    console.log(`[ATS] Seniority: ${intelligence.qa_seniority} | Hiring label: ${intelligence.qa_hiring_label}`);
  }

  const band = getScoreBand(intelligence.qa_match_score);

  // ── Domain-aware gap analysis ─────────────────────────────────────────────────
  const domainPool        = getDomainSkillPool(domainResult.domain);
  const rawMissing        = computeMissingSkills(allKnownSkills, domainPool);
  const missingSkills     = filterRelevantGaps(rawMissing, domainResult.domain).slice(0, 12);
  const suggestedKeywords = missingSkills.slice(0, 6);

  // ── Guidance orchestrator ─────────────────────────────────────────────────────
  const experienceYears = parsed.experienceEntries
    ? parsed.experienceEntries.reduce((sum, e) => sum + (e.durationYears ?? 0), 0)
    : 0;

  const guidance = runGuidanceOrchestrator({ intelligence, missingSkills, experienceYears });

  // ── Evidence-weighted insight narrative ───────────────────────────────────────
  const { strengths, weaknesses } = generateInsightNarrative({
    qa_score_breakdown:    intelligence.qa_score_breakdown,
    qa_match_score:        intelligence.qa_match_score,
    recruiter_trust_score: intelligence.recruiter_trust_score   ?? 0,
    capability_score:      intelligence.capability_score        ?? 0,
    evidence_strength:     intelligence.evidence_strength       ?? 'weak',
    keyword_stuffing_risk: intelligence.keyword_stuffing_risk   ?? 'none',
    // section_only_ratio is stored as 0–100 integer; narrative expects 0.0–1.0 fraction
    section_only_ratio:    (intelligence.evidence_profile?.section_only_ratio ?? 0) / 100,
    shortlist_probability: guidance.recruiter_readiness?.shortlist_probability ?? null,
    career_level:          intelligence.career_level            ?? 'junior',
    qa_specialization:     intelligence.qa_specialization       ?? 'manual_qa',
    experience_years:      experienceYears,
    evidence_profile:      intelligence.evidence_profile        ?? null,
    certificationEntries:  parsed.certificationEntries          ?? [],
    weak_evidence_skills:  intelligence.weak_evidence_skills    ?? [],
  });

  return {
    // ── Primary QA scores ─────────────────────────────────────────────────────
    qa_match_score:               intelligence.qa_match_score,
    capability_score:             intelligence.capability_score,          // deprecated alias
    candidate_readiness_score:    intelligence.candidate_readiness_score, // P1 Fix 5
    qa_score_breakdown:           intelligence.qa_score_breakdown,

    // ── Hiring intelligence ───────────────────────────────────────────────────
    qa_seniority:                 intelligence.qa_seniority,
    qa_hiring_label:              intelligence.qa_hiring_label,
    qa_specialization:            intelligence.qa_specialization,
    specialization_confidence:    intelligence.specialization_confidence,
    recruiter_confidence:         intelligence.recruiter_confidence,
    career_level:                 intelligence.career_level,
    career_level_confidence:      intelligence.career_level_confidence,
    recommendation_mode:          intelligence.recommendation_mode,
    analysis_confidence:          intelligence.analysis_confidence,

    // ── Phase 3: Recruiter explanation ────────────────────────────────────────
    recruiter_explanation:        intelligence.recruiter_explanation,

    // ── Phase 4: Contradiction detection ─────────────────────────────────────
    contradictions:               intelligence.contradictions,
    contradiction_count:          intelligence.contradiction_count,
    contradiction_severity:       intelligence.contradiction_severity,

    // ── Phase 5: Hiring recommendation ───────────────────────────────────────
    hiring_recommendation:        intelligence.hiring_recommendation,
    recommendation_rationale:     intelligence.recommendation_rationale,
    readiness_tier:               intelligence.readiness_tier,

    // ── Phase 6: Explainability traces ────────────────────────────────────────
    scoring_trace:                intelligence.scoring_trace,
    evidence_trace:               intelligence.evidence_trace,
    penalty_trace:                intelligence.penalty_trace,
    rule_trace:                   intelligence.rule_trace,

    // ── Legacy alias — ats_score column stores QA score ───────────────────────
    ats_score:                 intelligence.qa_match_score,
    score_breakdown:           intelligence.qa_score_breakdown,

    // ── Band ─────────────────────────────────────────────────────────────────
    band_label:                band.label,
    band_color:                band.color,

    // ── QA qualitative feedback ───────────────────────────────────────────────
    strengths,
    weaknesses,
    suggestions:               intelligence.suggestions,

    // ── Gap analysis ─────────────────────────────────────────────────────────
    missing_skills:            missingSkills,
    suggested_keywords:        suggestedKeywords,

    // ── Domain intelligence ───────────────────────────────────────────────────
    detected_domain:           domainResult.domain,
    domain_confidence:         domainResult.confidence,
    domain_label:              domainResult.label,

    // ── Candidate guidance + recruiter coaching intelligence ──────────────────
    improvement_priorities:    guidance.improvement_priorities,
    score_explanations:        guidance.score_explanations,
    career_roadmap:            guidance.career_roadmap,
    recruiter_readiness:       guidance.recruiter_readiness,
    improvement_impacts:       guidance.improvement_impacts,
    specialization_guidance:   guidance.specialization_guidance,
    recruiter_insights:        guidance.recruiter_insights,
    action_plan:               guidance.action_plan,

    // ── Evidence intelligence (additive) ─────────────────────────────────────
    evidence_profile:          intelligence.evidence_profile,
    skill_evidence:            intelligence.skill_evidence,
    skill_timeline:            intelligence.skill_timeline,
    weak_evidence_skills:      intelligence.weak_evidence_skills,
    recruiter_trust_score:     intelligence.recruiter_trust_score,
    implementation_maturity:   intelligence.implementation_maturity,
    evidence_strength:         intelligence.evidence_strength,
    experience_depth_level:    intelligence.experience_depth_level,
    keyword_stuffing_risk:     intelligence.keyword_stuffing_risk,
    evidence_multiplier:       intelligence.evidence_multiplier,

    // ── Phase 4 + 5 intelligence (additive) ──────────────────────────────────
    trust_breakdown:           intelligence.trust_breakdown,
    skill_recency:             intelligence.skill_recency,
    recency_summary:           intelligence.recency_summary,
    authenticity_profile:      intelligence.authenticity_profile,
    risk_flags:                intelligence.risk_flags,
    overall_risk_score:        intelligence.overall_risk_score,
    overall_risk_level:        intelligence.overall_risk_level,
    trajectory_profile:        intelligence.trajectory_profile,
    first_impression:          guidance.first_impression,
  };
}
