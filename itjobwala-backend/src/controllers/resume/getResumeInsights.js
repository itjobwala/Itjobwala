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
    return reply.send({
      success: true,
      message: 'No resume analysis found.',
      data:    null,
    });
  }

  const band = getScoreBand(insight.ats_score ?? 0);

  const wc = insight.word_count ?? 0;
  const parse_quality = wc < 50 ? 'failed' : wc < 150 ? 'poor' : wc < 300 ? 'fair' : wc < 500 ? 'good' : 'excellent';
  const parse_warning = wc < 150 ? 'Very little text was extracted from your resume. Some skills may not have been detected.' : null;

  const isIneligible = insight.eligible === false;

  // Use stored domain when available (rows parsed after the migration).
  // Fall back to recomputation for older rows whose domain columns are still null.
  const domain = (isIneligible && insight.detected_domain != null)
    ? { domain: insight.detected_domain, confidence: insight.domain_confidence ?? 0, label: insight.domain_label ?? '' }
    : detectSkillDomain(insight.extracted_skills ?? [], insight.parsed_text ?? '');

  return reply.send({
    success: true,
    message: 'Resume insights fetched.',
    data: {
      id:                       insight.id,
      eligible:                 insight.eligible ?? true,
      ...(isIneligible && { reason: insight.reason ?? 'non_qa_resume' }),

      // ── QA scores ────────────────────────────────────────────────────────
      qa_match_score:            insight.qa_match_score            ?? null,
      capability_score:          insight.capability_score          ?? null,
      qa_score_breakdown:        insight.qa_score_breakdown        ?? null,
      qa_hiring_label:           insight.qa_hiring_label           ?? null,
      qa_specialization:         insight.qa_specialization         ?? null,
      recruiter_confidence:      insight.recruiter_confidence      ?? null,
      career_level:              insight.career_level              ?? null,

      // ── Profile & band ────────────────────────────────────────────────────
      band_label:               band.label,
      band_color:               band.color,

      // ── Parsed content ────────────────────────────────────────────────────
      extracted_skills:         insight.extracted_skills   ?? [],
      missing_skills:           insight.missing_skills     ?? [],
      suggested_keywords:       insight.suggested_keywords ?? [],
      weaknesses:               insight.weaknesses         ?? [],
      suggestions:              insight.suggestions        ?? [],
      experience_entries:       insight.experience_entries ?? [],
      education_entries:        insight.education_entries  ?? [],
      project_entries:          insight.project_entries    ?? [],
      experience_years:         insight.experience_years   ?? 0,
      total_skills_found:       insight.total_skills_found ?? 0,
      last_parsed_at:           insight.last_parsed_at,
      resume_url:               insight.resume_url,

      // ── Structured profile convenience fields ─────────────────────────────
      name:                     insight.contact_info?.name     ?? null,
      email:                    insight.contact_info?.email    ?? null,
      current_title:            insight.experience_entries?.[0]?.title   ?? null,
      current_company:          insight.experience_entries?.[0]?.company ?? null,
      skill_metadata:           insight.skill_metadata        ?? [],
      skill_strength_summary:   (() => {
        const meta = insight.skill_metadata ?? [];
        return {
          very_strong: meta.filter(s => s.evidence_level === 'very_strong').length,
          strong:      meta.filter(s => s.evidence_level === 'strong').length,
          moderate:    meta.filter(s => s.evidence_level === 'moderate').length,
          weak:        meta.filter(s => s.evidence_level === 'weak').length,
          inferred:    meta.filter(s => s.evidence_level === 'inferred').length,
        };
      })(),
      certifications:           insight.certification_entries ?? [],
      certification_count:      (insight.certification_entries ?? []).length,
      achievements:             insight.achievement_entries   ?? [],

      // ── Domain intelligence ───────────────────────────────────────────────
      detected_domain:          domain.domain,
      domain_confidence:        domain.confidence,
      // domain_label kept only for ineligible rows (used by NonQaResumeState UI)
      ...(isIneligible && { domain_label: domain.label }),

      // ── Guidance intelligence ─────────────────────────────────────────────
      improvement_priorities:  insight.improvement_priorities  ?? null,
      recruiter_readiness:     insight.recruiter_readiness     ?? null,
      improvement_impacts:     insight.improvement_impacts     ?? null,

      // ── Evidence intelligence ─────────────────────────────────────────────
      evidence_profile:        insight.evidence_profile     ?? null,
      skill_evidence:          insight.skill_evidence       ?? [],
      weak_evidence_skills:    insight.weak_evidence_skills ?? [],

      // ── Phase 4 + 5 intelligence ──────────────────────────────────────────
      trust_breakdown:         insight.trust_breakdown      ?? null,
      skill_recency:           insight.skill_recency        ?? null,
      recency_summary:         insight.recency_summary      ?? null,
      risk_flags:              insight.risk_flags           ?? [],
      overall_risk_score:      insight.overall_risk_score   ?? null,
      overall_risk_level:      insight.overall_risk_level   ?? null,

      // ── Parse quality ─────────────────────────────────────────────────────
      parse_quality,
      parse_warning,
    },
  });
};
