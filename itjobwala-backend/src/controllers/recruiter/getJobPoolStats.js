import Application   from '../../models/jobs/Application.js';
import Job           from '../../models/jobs/Job.js';
import ResumeInsight from '../../models/candidate/ResumeInsight.js';

const SCORE_BUCKETS = [
  { label: 'Elite (85+)',    min: 85, max: 100 },
  { label: 'Strong (70–84)', min: 70, max: 84  },
  { label: 'Moderate (50–69)', min: 50, max: 69 },
  { label: 'Low (<50)',      min: 0,  max: 49  },
];

/**
 * GET /recruiter/jobs/:jobId/pool-stats
 *
 * Aggregated ATS intelligence across all applicants for a job.
 */
export const getJobPoolStats = async (request, reply) => {
  const recruiterId = request.user.id;
  const rawId       = request.params.jobId.replace('job_', '');
  const jobId       = parseInt(rawId, 10);

  if (!jobId) {
    return reply.status(400).send({ success: false, message: 'Invalid job ID.' });
  }

  // Verify ownership
  const job = await Job.query().findOne({ id: jobId, recruiter_id: recruiterId });
  if (!job) {
    return reply.status(404).send({ success: false, message: 'Job not found.' });
  }

  // Fetch all applications for this job
  const applications = await Application.query()
    .where('job_id', jobId)
    .whereNotIn('status', ['withdrawn'])
    .select('id', 'user_id', 'status');

  const totalApplicants = applications.length;

  if (totalApplicants === 0) {
    return reply.send({
      success: true,
      data: {
        total_applicants:    0,
        applicants_with_data: 0,
        avg_score:           null,
        score_distribution:  SCORE_BUCKETS.map(b => ({ ...b, count: 0 })),
        specialization_breakdown: {},
        top_candidates:      [],
      },
    });
  }

  const candidateIds = applications.map(a => a.user_id);

  const insights = await ResumeInsight.query()
    .whereIn('candidate_id', candidateIds)
    .select(
      'candidate_id',
      'qa_match_score',
      'qa_specialization',
      'qa_seniority',
      'qa_hiring_label',
      'recruiter_confidence',
    );

  const insightMap = new Map(insights.map(i => [i.candidate_id, i]));

  // Build candidate list with scores
  const candidates = applications
    .map(app => {
      const insight = insightMap.get(app.user_id);
      if (!insight) return null;
      return {
        application_id:   app.id,
        candidate_id:     app.user_id,
        status:           app.status,
        qa_match_score:   insight.qa_match_score,
        qa_specialization: insight.qa_specialization,
        qa_seniority:     insight.qa_seniority,
        qa_hiring_label:  insight.qa_hiring_label,
        recruiter_confidence: insight.recruiter_confidence,
      };
    })
    .filter(Boolean);

  const applicantsWithData = candidates.length;

  // Average score
  const avgScore = applicantsWithData > 0
    ? Math.round(candidates.reduce((sum, c) => sum + (c.qa_match_score ?? 0), 0) / applicantsWithData)
    : null;

  // Score distribution
  const scoreDistribution = SCORE_BUCKETS.map(bucket => ({
    label: bucket.label,
    min:   bucket.min,
    max:   bucket.max,
    count: candidates.filter(c => (c.qa_match_score ?? 0) >= bucket.min && (c.qa_match_score ?? 0) <= bucket.max).length,
  }));

  // Specialization breakdown
  const specBreakdown = {};
  for (const c of candidates) {
    const spec = c.qa_specialization ?? 'unknown';
    specBreakdown[spec] = (specBreakdown[spec] ?? 0) + 1;
  }

  // Top candidates (up to 5, sorted by score descending)
  const topCandidates = [...candidates]
    .sort((a, b) => (b.qa_match_score ?? 0) - (a.qa_match_score ?? 0))
    .slice(0, 5)
    .map(c => ({
      applicant_id:      `applicant_${c.application_id}`,
      qa_match_score:    c.qa_match_score,
      qa_specialization: c.qa_specialization,
      qa_seniority:      c.qa_seniority,
      qa_hiring_label:   c.qa_hiring_label,
      recruiter_confidence: c.recruiter_confidence,
      status:            c.status,
    }));

  return reply.send({
    success: true,
    data: {
      total_applicants:      totalApplicants,
      applicants_with_data:  applicantsWithData,
      avg_score:             avgScore,
      score_distribution:    scoreDistribution,
      specialization_breakdown: specBreakdown,
      top_candidates:        topCandidates,
    },
  });
};
