import ResumeInsight     from '../../models/candidate/ResumeInsight.js';
import Job               from '../../models/jobs/Job.js';
import { analyzeJobFit } from '../../intelligence/jobFit/qaJobFitAnalyzer.js';

/**
 * GET /resume/job-fit/:jobId
 *
 * Returns job-aware fit analysis: contextual score + gap analysis + recruiter reasoning.
 * job_fit_score is always separate from qa_match_score — it's role-specific.
 */
export const getJobFitAnalysis = async (request, reply) => {
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
      message: 'No resume analysis found. Parse your resume to see job fit.',
      data: {
        job_id:        jobId,
        job_title:     job.title,
        parsed:        false,
        job_fit_score: null,
      },
    });
  }

  const fitResult = analyzeJobFit(insight, job);

  return reply.send({
    success: true,
    message: 'Job fit analysis computed.',
    data: {
      job_id:    jobId,
      job_title: job.title,
      company:   job.company_name,
      parsed:    true,
      ...fitResult,
    },
  });
};
