import ResumeInsight       from '../../models/candidate/ResumeInsight.js';
import Job                 from '../../models/jobs/Job.js';
import { computeJobMatch } from '../../services/resume/matching.service.js';

/**
 * POST /resume/match-job/:jobId
 *
 * Returns a job-specific match score for the authenticated candidate.
 */
export const matchResumeToJob = async (request, reply) => {
  const candidateId = request.user.id;
  const jobId       = parseInt(request.params.jobId, 10);

  const [insight, job] = await Promise.all([
    ResumeInsight.query().findOne({ candidate_id: candidateId }),
    Job.query().findById(jobId),
  ]);

  if (!job) {
    return reply.status(404).send({ success: false, message: 'Job not found.' });
  }

  if (!insight) {
    return reply.send({
      success: true,
      message: 'No resume analysis yet. Showing job details only.',
      data: {
        job_id:        jobId,
        job_title:     job.title,
        overall_score: null,
        parsed:        false,
      },
    });
  }

  const match = computeJobMatch(insight, job);

  return reply.send({
    success: true,
    message: 'Job match computed.',
    data: {
      job_id:          jobId,
      job_title:       job.title,
      company:         job.company_name,
      parsed:          true,
      ...match,
    },
  });
};
