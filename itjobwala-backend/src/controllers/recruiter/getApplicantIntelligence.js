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
      'recruiter_readiness',
      'recruiter_insights',
    );

  if (!insight) {
    return reply.send({ success: true, data: { has_data: false } });
  }

  const readiness = insight.recruiter_readiness ?? {};
  const insights  = insight.recruiter_insights  ?? {};

  return reply.send({
    success: true,
    data: {
      has_data:                 true,
      qa_match_score:           insight.qa_match_score,
      qa_specialization:        insight.qa_specialization,
      qa_seniority:             insight.qa_seniority,
      qa_hiring_label:          insight.qa_hiring_label,
      recruiter_confidence:     insight.recruiter_confidence,
      specialization_confidence: insight.specialization_confidence,
      shortlist_probability:    readiness.shortlist_probability    ?? null,
      recruiter_visibility:     readiness.recruiter_visibility     ?? null,
      market_readiness:         readiness.market_readiness         ?? null,
      best_fit_roles:           insights.best_fit_roles            ?? [],
      recruiter_tip:            insights.recruiter_tip             ?? null,
      concerns:                 insights.concerns                  ?? [],
      extracted_skills:         insight.extracted_skills           ?? [],
      missing_skills:           insight.missing_skills             ?? [],
      strengths:                insight.strengths                  ?? [],
      weaknesses:               insight.weaknesses                 ?? [],
    },
  });
};
