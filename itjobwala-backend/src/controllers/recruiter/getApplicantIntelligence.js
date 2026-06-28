import Application   from '../../models/jobs/Application.js';
import Job           from '../../models/jobs/Job.js';
import ResumeInsight from '../../models/candidate/ResumeInsight.js';

/**
 * GET /recruiter/applicants/:applicantId/ats-intelligence
 *
 * Returns ATS intelligence for a candidate — intelligence metrics only,
 * never raw resume text or personal contact info.
 */
export const getApplicantIntelligence = async (request, reply) => {
  const recruiterId  = request.user.id;
  const rawId        = request.params.applicantId.replace('applicant_', '');
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
      'qa_match_score',
      'qa_specialization',
      'qa_seniority',
      'qa_hiring_label',
      'recruiter_confidence',
      'specialization_confidence',
      'extracted_skills',
      'missing_skills',
      'strengths',
      'weaknesses',
      'skill_evidence',
      'weak_evidence_skills',
      'risk_flags',
      'overall_risk_level',
      'overall_risk_score',
      'qa_score_breakdown',
      'evidence_profile',
      'trust_breakdown',
      'recruiter_readiness',
      'recruiter_insights',
    );

  if (!insight) {
    return reply.send({ success: true, data: { has_data: false } });
  }

  const readiness      = insight.recruiter_readiness ?? {};
  const insights       = insight.recruiter_insights  ?? {};
  const evidenceProfile = insight.evidence_profile   ?? {};
  const trustBreakdown  = insight.trust_breakdown    ?? {};

  const provenFromEvidence = (insight.skill_evidence ?? [])
    .filter(e => e.evidence_level === 'strong' || e.evidence_level === 'very_strong')
    .slice(0, 5)
    .map(e => `${e.skill.charAt(0).toUpperCase() + e.skill.slice(1)} — confirmed in ${e.proof_sources?.join(', ') ?? 'experience'}`);

  const accurateStrengths = provenFromEvidence.length > 0
    ? provenFromEvidence
    : (insight.strengths ?? []);

  return reply.send({
    success: true,
    data: {
      has_data:                  true,
      qa_match_score:            insight.qa_match_score,
      qa_specialization:         insight.qa_specialization,
      qa_seniority:              insight.qa_seniority,
      qa_hiring_label:           insight.qa_hiring_label,
      recruiter_confidence:      insight.recruiter_confidence,
      specialization_confidence: insight.specialization_confidence,
      shortlist_probability:     readiness.shortlist_probability    ?? null,
      recruiter_visibility:      readiness.recruiter_visibility     ?? null,
      market_readiness:          readiness.market_readiness         ?? null,
      best_fit_roles:            insights.best_fit_roles            ?? [],
      recruiter_tip:             insights.recruiter_tip             ?? null,
      concerns:                  insights.concerns                  ?? [],
      extracted_skills:          insight.extracted_skills           ?? [],
      missing_skills:            insight.missing_skills             ?? [],
      strengths:                 accurateStrengths,
      weaknesses:                insight.weaknesses                 ?? [],
      skill_evidence:            insight.skill_evidence             ?? [],
      weak_evidence_skills:      insight.weak_evidence_skills       ?? [],
      risk_flags:                insight.risk_flags                 ?? [],
      overall_risk_level:        insight.overall_risk_level         ?? 'low',
      overall_risk_score:        insight.overall_risk_score         ?? 0,
      qa_score_breakdown:        insight.qa_score_breakdown         ?? null,
      evidence_density:          evidenceProfile.evidence_density        ?? null,
      recruiter_trust_score:     evidenceProfile.recruiter_trust_score   ?? null,
      has_quantified_impact:     evidenceProfile.has_quantified_impact   ?? false,
      has_architecture_depth:    evidenceProfile.has_architecture_depth  ?? false,
      trust_signals:             trustBreakdown.positive                 ?? [],
      fastest_trust_gain:        trustBreakdown.fastest_trust_gain       ?? null,
    },
  });
};
