import ResumeInsight          from '../../models/candidate/ResumeInsight.js';
import { computeBenchmark }  from '../../intelligence/benchmarking/candidateBenchmark.js';

/**
 * GET /intelligence/benchmarking
 *
 * Returns the candidate's percentile rank + peer comparison + skill gap vs top performers.
 * Uses hybrid model: industry baseline always available, platform data overlaid when peers exist.
 */
export const getBenchmarkingHandler = async (request, reply) => {
  const candidateId = request.user.id;

  // Candidate's own insight
  const candidateInsight = await ResumeInsight.query()
    .findOne({ candidate_id: candidateId })
    .select('qa_match_score', 'qa_specialization', 'qa_seniority', 'extracted_skills');

  if (!candidateInsight?.qa_match_score) {
    return reply.send({
      success: true,
      message: 'Benchmarking requires a parsed resume.',
      data: null,
    });
  }

  // Fetch peers with same specialization first
  const specPeers = await ResumeInsight.query()
    .whereNot('candidate_id', candidateId)
    .where('qa_specialization', candidateInsight.qa_specialization)
    .whereNotNull('qa_match_score')
    .select('qa_match_score', 'extracted_skills', 'qa_seniority');

  // Fall back to all QA profiles if fewer than 3 spec-peers
  const peerInsights = specPeers.length >= 3
    ? specPeers
    : await ResumeInsight.query()
        .whereNot('candidate_id', candidateId)
        .whereNotNull('qa_match_score')
        .select('qa_match_score', 'extracted_skills', 'qa_seniority');

  const data = computeBenchmark(candidateInsight, peerInsights);

  return reply.send({
    success: true,
    message: 'Benchmarking computed.',
    data,
  });
};
