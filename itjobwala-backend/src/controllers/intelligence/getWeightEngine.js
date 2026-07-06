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

  // resume_insights keeps one row per distinct resume upload — order by
  // last_parsed_at to get the candidate's current resume, not an arbitrary one.
  const insight = await ResumeInsight.query()
    .where({ candidate_id: candidateId })
    .select(
      'qa_match_score',
      'qa_specialization',
      'qa_seniority',
      'qa_score_breakdown',
      'recruiter_trust_score',
      'evidence_strength',
      'word_count',
      'experience_years',
    )
    .orderBy('last_parsed_at', 'desc')
    .first();

  const data = runWeightEngine(insight ?? null);
  const enterprise_profiles = computeEnterpriseProfileScores(insight?.qa_score_breakdown ?? null);

  return reply.send({
    success: true,
    message: 'Dynamic weight analysis computed.',
    data: { ...data, enterprise_profiles },
  });
};
