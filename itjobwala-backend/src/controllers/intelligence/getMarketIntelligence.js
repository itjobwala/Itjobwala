import ResumeInsight              from '../../models/candidate/ResumeInsight.js';
import { getMarketIntelligence }  from '../../intelligence/market/marketIntelligenceEngine.js';

/**
 * GET /intelligence/market
 *
 * Returns QA market intelligence + personal market alignment score.
 * Candidate-auth'd — uses their resume_insights for personalization.
 * Falls back gracefully if resume not yet parsed.
 */
export const getMarketIntelligenceHandler = async (request, reply) => {
  const candidateId = request.user.id;

  // Fetch resume insight for personalization (optional)
  const insight = await ResumeInsight.query()
    .findOne({ candidate_id: candidateId })
    .select(
      'extracted_skills',
      'qa_specialization',
      'qa_match_score',
      'qa_seniority',
      'evidence_strength',
    );

  const data = await getMarketIntelligence(insight ?? null);

  return reply.send({
    success: true,
    message: 'Market intelligence computed.',
    data,
  });
};
