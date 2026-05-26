import ResumeInsight  from '../../models/candidate/ResumeInsight.js';
import { getScoreBand } from '../../utils/resume/scoreCalculator.js';

/**
 * GET /resume/insights
 *
 * Returns the stored ATS analysis for the authenticated candidate.
 * Returns 404 if the resume hasn't been parsed yet.
 */
export const getResumeInsights = async (request, reply) => {
  const candidateId = request.user.id;

  const insight = await ResumeInsight.query().findOne({ candidate_id: candidateId });

  if (!insight) {
    return reply.status(404).send({
      success: false,
      message: 'No resume analysis found. Please parse your resume first.',
      data:    null,
    });
  }

  const band = getScoreBand(insight.ats_score ?? 0);

  return reply.send({
    success: true,
    message: 'Resume insights fetched.',
    data: {
      id:                       insight.id,
      ats_score:                insight.ats_score,
      profile_completion_score: insight.profile_completion_score,
      band_label:               band.label,
      band_color:               band.color,
      score_breakdown:          insight.score_breakdown        ?? {},
      extracted_skills:         insight.extracted_skills       ?? [],
      missing_skills:           insight.missing_skills         ?? [],
      suggested_keywords:       insight.suggested_keywords     ?? [],
      strengths:                insight.strengths              ?? [],
      weaknesses:               insight.weaknesses             ?? [],
      suggestions:              insight.suggestions            ?? [],
      contact_info:             insight.contact_info           ?? {},
      experience_entries:       insight.experience_entries     ?? [],
      education_entries:        insight.education_entries      ?? [],
      project_entries:          insight.project_entries        ?? [],
      certification_entries:    insight.certification_entries  ?? [],
      experience_years:         insight.experience_years       ?? 0,
      total_skills_found:       insight.total_skills_found     ?? 0,
      word_count:               insight.word_count             ?? 0,
      last_parsed_at:           insight.last_parsed_at,
      resume_url:               insight.resume_url,
    },
  });
};
