import ResumeInsight               from '../../models/candidate/ResumeInsight.js';
import { getLearningIntelligence } from '../../intelligence/learning/learningIntelligenceEngine.js';

/**
 * GET /intelligence/learning
 *
 * Returns a personalized learning path + certification advice.
 * Requires improvement_priorities from the guidance orchestrator.
 * Falls back gracefully if resume not yet analyzed.
 */
export const getLearningIntelligenceHandler = async (request, reply) => {
  const candidateId = request.user.id;

  const insight = await ResumeInsight.query()
    .findOne({ candidate_id: candidateId })
    .select(
      'improvement_priorities',
      'qa_specialization',
      'qa_seniority',
    );

  const data = getLearningIntelligence(insight ?? null);

  return reply.send({
    success: true,
    message: 'Learning intelligence computed.',
    data,
  });
};
