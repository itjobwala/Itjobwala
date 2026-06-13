import ResumeInsight             from '../../models/candidate/ResumeInsight.js';
import Job                       from '../../models/jobs/Job.js';
import { computeSemanticMatch }  from '../../intelligence/semantic/semanticEngine.js';

/**
 * GET /resume/semantic-match/:jobId
 *
 * Phase 9: Semantic Embedding Intelligence
 * Returns TF-IDF cosine similarity + synonym-expanded hidden matches + theme alignment.
 * Distinct from Phase 1 job_fit_score (keyword overlap) and qa_match_score (domain ATS).
 */
export const getSemanticMatch = async (request, reply) => {
  const candidateId = request.user.id;
  const jobId       = parseInt(request.params.jobId, 10);

  const [insight, job] = await Promise.all([
    ResumeInsight.query()
      .findOne({ candidate_id: candidateId })
      .select(
        'parsed_text',
        'extracted_skills',
        'strengths',
        'experience_entries',
      ),
    Job.query()
      .findById(jobId)
      .select(
        'id',
        'title',
        'description',
        'required_skills',
        'responsibilities',
        'requirements',
        'nice_to_have',
      ),
  ]);

  if (!job) {
    return reply.status(404).send({ success: false, message: 'Job not found.' });
  }

  if (!insight || !insight.parsed_text) {
    return reply.send({
      success: true,
      data: {
        parsed:    false,
        job_id:    jobId,
        job_title: job.title,
      },
    });
  }

  const result = computeSemanticMatch(insight, job);

  return reply.send({
    success: true,
    data: {
      parsed:    true,
      job_id:    jobId,
      job_title: job.title,
      ...result,
    },
  });
};
