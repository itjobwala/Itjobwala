import ResumeInsight from '../../models/candidate/ResumeInsight.js';
import { getScoreBand } from '../../utils/resume/scoreCalculator.js';
import { detectSkillDomain } from '../../utils/resume/domainDetection.js';

/**
 * GET /resume/insights
 *
 * Pure read — returns persisted ATS analysis from DB.
 * qa_match_score and qa_score_breakdown are stored during POST /resume/parse.
 */
export const getResumeInsights = async (request, reply) => {
  const candidateId = request.user.id;

  // If the caller passes ?resume_url=..., return analysis for that specific file.
  // Otherwise return the most recently parsed resume for this candidate.
  const resumeUrl = request.query?.resume_url;
  const baseQuery = ResumeInsight.query().where({ candidate_id: candidateId });
  if (resumeUrl) baseQuery.andWhere({ resume_url: resumeUrl });
  const insight = await baseQuery.orderBy('last_parsed_at', 'desc').first();

  if (!insight) {
    return reply.status(404).send({
      success: false,
      message: 'No resume analysis found. Please parse your resume first.',
      data:    null,
    });
  }

  const band   = getScoreBand(insight.ats_score ?? 0);
  const domain = detectSkillDomain(insight.extracted_skills ?? []);

  return reply.send({
    success: true,
    message: 'Resume insights fetched.',
    data: {
      id:                       insight.id,

      // ── QA scores (persisted during parse) ───────────────────────────────
      qa_match_score:           insight.qa_match_score     ?? null,
      capability_score:         insight.capability_score   ?? null,
      qa_score_breakdown:       insight.qa_score_breakdown ?? null,
      qa_seniority:              insight.qa_seniority              ?? null,
      qa_hiring_label:           insight.qa_hiring_label           ?? null,
      qa_specialization:         insight.qa_specialization         ?? null,
      specialization_confidence: insight.specialization_confidence ?? null,
      recruiter_confidence:      insight.recruiter_confidence      ?? null,
      career_level:              insight.career_level              ?? null,

      // ── Legacy alias ──────────────────────────────────────────────────────
      ats_score:                insight.ats_score,

      // ── Profile & band ────────────────────────────────────────────────────
      profile_completion_score: insight.profile_completion_score,
      band_label:               band.label,
      band_color:               band.color,

      // ── Parsed content ────────────────────────────────────────────────────
      extracted_skills:         insight.extracted_skills      ?? [],
      missing_skills:           insight.missing_skills        ?? [],
      suggested_keywords:       insight.suggested_keywords    ?? [],
      strengths:                insight.strengths             ?? [],
      weaknesses:               insight.weaknesses            ?? [],
      suggestions:              insight.suggestions           ?? [],
      contact_info:             insight.contact_info          ?? {},
      experience_entries:       insight.experience_entries    ?? [],
      education_entries:        insight.education_entries     ?? [],
      project_entries:          insight.project_entries       ?? [],
      certification_entries:    insight.certification_entries ?? [],
      experience_years:         insight.experience_years      ?? 0,
      total_skills_found:       insight.total_skills_found    ?? 0,
      word_count:               insight.word_count            ?? 0,
      last_parsed_at:           insight.last_parsed_at,
      resume_url:               insight.resume_url,

      // ── Domain intelligence (lightweight, computed from stored skills) ─────
      detected_domain:          domain.domain,
      domain_confidence:        domain.confidence,
      domain_label:             domain.label,

      // ── Guidance intelligence (persisted during parse) ────────────────────
      improvement_priorities:  insight.improvement_priorities  ?? null,
      score_explanations:      insight.score_explanations      ?? null,
      career_roadmap:          insight.career_roadmap          ?? null,
      recruiter_readiness:     insight.recruiter_readiness     ?? null,
      improvement_impacts:     insight.improvement_impacts     ?? null,
      specialization_guidance: insight.specialization_guidance ?? null,
      recruiter_insights:      insight.recruiter_insights      ?? null,
      action_plan:             insight.action_plan             ?? null,

      // ── Evidence intelligence (persisted during parse) ────────────────────
      evidence_profile:        insight.evidence_profile        ?? null,
      skill_evidence:          insight.skill_evidence          ?? [],
      skill_timeline:          insight.skill_timeline          ?? {},
      weak_evidence_skills:    insight.weak_evidence_skills    ?? [],
      recruiter_trust_score:   insight.recruiter_trust_score   ?? null,
      implementation_maturity: insight.implementation_maturity ?? null,
      evidence_strength:       insight.evidence_strength       ?? null,
      experience_depth_level:  insight.experience_depth_level  ?? null,
      keyword_stuffing_risk:   insight.keyword_stuffing_risk   ?? null,
      evidence_multiplier:     insight.evidence_multiplier     ?? null,

      // ── Phase 4 + 5 intelligence (persisted during parse) ────────────────
      trust_breakdown:         insight.trust_breakdown         ?? null,
      skill_recency:           insight.skill_recency           ?? null,
      recency_summary:         insight.recency_summary         ?? null,
      authenticity_profile:    insight.authenticity_profile    ?? null,
      risk_flags:              insight.risk_flags              ?? [],
      overall_risk_score:      insight.overall_risk_score      ?? null,
      overall_risk_level:      insight.overall_risk_level      ?? null,
      trajectory_profile:      insight.trajectory_profile      ?? null,
      recommendation_mode:     insight.recommendation_mode     ?? null,
      first_impression:        insight.first_impression        ?? null,
    },
  });
};
