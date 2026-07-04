import Application   from '../../models/jobs/Application.js';
import Job           from '../../models/jobs/Job.js';
import ResumeInsight from '../../models/candidate/ResumeInsight.js';
import { getScoreBand } from '../../utils/resume/scoreCalculator.js';

/**
 * GET /recruiter/applicants/:applicantId/ats-intelligence
 *
 * Returns ATS intelligence for a candidate — mirrors the same data the
 * candidate sees on their resume page, framed for hiring decisions.
 * Never returns raw resume text or personal contact info.
 */
export const getApplicantIntelligence = async (request, reply) => {
  const recruiterId   = request.user.id;
  const rawId         = request.params.applicantId.replace('applicant_', '');
  const applicationId = parseInt(rawId, 10);

  if (!applicationId) {
    return reply.status(400).send({ success: false, message: 'Invalid applicant ID.' });
  }

  // Verify the application belongs to a job owned by this recruiter
  const application = await Application.query()
    .join('jobs', 'applications.job_id', 'jobs.id')
    .where('applications.id', applicationId)
    .where('jobs.recruiter_id', recruiterId)
    .select('applications.id', 'applications.user_id', 'applications.job_id')
    .first();

  if (!application) {
    return reply.status(404).send({ success: false, message: 'Applicant not found.' });
  }

  const insight = await ResumeInsight.query()
    .findOne({ candidate_id: application.user_id })
    .select(
      'eligible',
      'detected_domain',
      'domain_label',
      'domain_confidence',
      'qa_match_score',
      'capability_score',
      'ats_score',
      'career_level',
      'experience_years',
      'certification_entries',
      'qa_specialization',
      'qa_seniority',
      'qa_hiring_label',
      'recruiter_confidence',
      'qa_score_breakdown',
      'extracted_skills',
      'missing_skills',
      'skill_metadata',
      'skill_evidence',
      'weak_evidence_skills',
      'risk_flags',
      'overall_risk_level',
      'overall_risk_score',
      'improvement_priorities',
      'evidence_profile',
      'trust_breakdown',
      'recruiter_readiness',
    );

  if (!insight) {
    return reply.send({ success: true, data: { has_data: false } });
  }

  const isIneligible    = insight.eligible === false;
  const band            = getScoreBand(insight.ats_score ?? insight.qa_match_score ?? 0);
  const readiness       = insight.recruiter_readiness ?? {};
  const evidenceProfile = insight.evidence_profile    ?? {};
  const trustBreakdown  = insight.trust_breakdown     ?? {};

  return reply.send({
    success: true,
    data: {
      has_data:             true,
      eligible:             insight.eligible ?? true,
      detected_domain:      isIneligible ? (insight.detected_domain ?? null) : null,
      domain_label:         isIneligible ? (insight.domain_label    ?? null) : null,

      qa_match_score:       insight.qa_match_score   ?? null,
      capability_score:     insight.capability_score ?? null,
      band_label:           band.label,
      band_color:           band.color,
      career_level:         insight.career_level     ?? null,
      experience_years:     insight.experience_years ?? null,
      certifications:       insight.certification_entries ?? [],
      certification_count:  (insight.certification_entries ?? []).length,

      qa_specialization:    insight.qa_specialization   ?? null,
      qa_seniority:         insight.qa_seniority         ?? null,
      qa_hiring_label:      insight.qa_hiring_label      ?? null,
      recruiter_confidence: insight.recruiter_confidence ?? null,
      qa_score_breakdown:   insight.qa_score_breakdown   ?? null,

      extracted_skills:     insight.extracted_skills     ?? [],
      missing_skills:       insight.missing_skills       ?? [],
      skill_metadata:       insight.skill_metadata       ?? [],
      skill_evidence:       insight.skill_evidence       ?? [],
      weak_evidence_skills: insight.weak_evidence_skills ?? [],

      risk_flags:           insight.risk_flags         ?? [],
      overall_risk_level:   insight.overall_risk_level ?? 'low',
      overall_risk_score:   insight.overall_risk_score ?? 0,

      improvement_priorities: insight.improvement_priorities ?? null,

      evidence_density:       evidenceProfile.evidence_density        ?? null,
      recruiter_trust_score:  evidenceProfile.recruiter_trust_score   ?? null,
      has_quantified_impact:  evidenceProfile.has_quantified_impact   ?? false,
      has_architecture_depth: evidenceProfile.has_architecture_depth  ?? false,

      trust_signals:          trustBreakdown.positive            ?? [],
      fastest_trust_gain:     trustBreakdown.fastest_trust_gain  ?? null,

      shortlist_probability:  readiness.shortlist_probability  ?? null,
      automation_maturity:    readiness.automation_maturity    ?? null,
      enterprise_readiness:   readiness.enterprise_readiness   ?? null,
      market_readiness:       readiness.market_readiness       ?? null,
      recruiter_visibility:   readiness.recruiter_visibility   ?? null,
    },
  });
};
