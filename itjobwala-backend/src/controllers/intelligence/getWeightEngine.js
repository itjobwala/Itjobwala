import ResumeInsight                     from '../../models/candidate/ResumeInsight.js';
import { runWeightEngine }               from '../../intelligence/weights/weightEngine.js';
import { computeEnterpriseProfileScores } from '../../intelligence/scoring/enterpriseScoringProfiles.js';

/**
 * GET /intelligence/weights
 *
 * Returns the dynamic weight breakdown for the candidate's specialization,
 * plus enterprise-profile score comparisons.
 */
export const getWeightEngineHandler = async (request, reply) => {
  const candidateId = request.user.id;

  const insight = await ResumeInsight.query()
    .findOne({ candidate_id: candidateId })
    .select(
      'qa_match_score',
      'qa_specialization',
      'qa_seniority',
      'qa_score_breakdown',
      'recruiter_trust_score',
      'evidence_strength',
      'word_count',
      'experience_years',
    );

  const data = runWeightEngine(insight ?? null);
  const enterprise_profiles = computeEnterpriseProfileScores(insight?.qa_score_breakdown ?? null);

  return reply.send({
    success: true,
    message: 'Dynamic weight analysis computed.',
    data: { ...data, enterprise_profiles },
  });
};
