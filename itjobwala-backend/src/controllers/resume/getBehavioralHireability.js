import ResumeInsight                   from '../../models/candidate/ResumeInsight.js';
import { computeBehavioralHireability } from '../../intelligence/behavioral/behavioralEngine.js';

/**
 * GET /resume/behavioral-hireability
 *
 * Phase 10: Behavioral Hireability Intelligence
 * Analyzes resume content quality signals: action verb strength, quantification,
 * career trajectory, leadership language, and resume depth.
 */
export const getBehavioralHireability = async (request, reply) => {
  const candidateId = request.user.id;

  const insight = await ResumeInsight.query()
    .findOne({ candidate_id: candidateId })
    .select(
      'parsed_text',
      'experience_entries',
      'project_entries',
      'certification_entries',
      'education_entries',
      'word_count',
    );

  if (!insight || !insight.parsed_text) {
    return reply.send({
      success: true,
      data: { parsed: false },
    });
  }

  const result = computeBehavioralHireability(insight);

  return reply.send({
    success: true,
    data: { parsed: true, ...result },
  });
};
