/**
 * matching.service.js — compute job-to-resume match score.
 *
 * AI-ready: add semantic/vector matching here when embeddings are available.
 */

import { normalizeSkill, computeMissingSkills } from '../../utils/resume/normalizeSkills.js';

/**
 * Score how well a candidate's resume matches a specific job.
 *
 * @param {object} resumeInsight  - Stored resume_insights row
 * @param {object} job            - Job row with skills[], description, title
 * @returns {JobMatchResult}
 */
export function computeJobMatch(resumeInsight, job) {
  const resumeSkills   = (resumeInsight.extracted_skills  || []).map(normalizeSkill);
  const jobSkills      = (job.skills                      || []).map(normalizeSkill);
  const jobTitle       = (job.title                       || '').toLowerCase();
  const jobDescription = (job.description                 || '').toLowerCase();

  // Skill overlap
  const matchedSkills  = jobSkills.filter(s => resumeSkills.includes(s));
  const missingSkills  = computeMissingSkills(resumeSkills, jobSkills);
  const skillScore     = jobSkills.length
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 50;

  // Title keyword match (simple heuristic)
  const titleWords     = jobTitle.split(/\s+/).filter(w => w.length > 3);
  const resumeText     = (resumeInsight.parsed_text || '').toLowerCase();
  const titleHits      = titleWords.filter(w => resumeText.includes(w)).length;
  const titleScore     = titleWords.length ? Math.round((titleHits / titleWords.length) * 100) : 50;

  // Experience fit
  const expRequired    = job.experience_min ?? 0;
  const candidateExp   = resumeInsight.experience_years ?? 0;
  const expScore       = expRequired === 0 ? 80 : Math.min(100, Math.round((candidateExp / expRequired) * 80));

  // Overall match (weighted)
  const overall = Math.round(skillScore * 0.50 + titleScore * 0.20 + expScore * 0.30);

  return {
    overall_score:   Math.min(100, Math.max(0, overall)),
    skill_score:     skillScore,
    title_score:     titleScore,
    experience_score: expScore,
    matched_skills:  matchedSkills,
    missing_skills:  missingSkills,
    total_job_skills: jobSkills.length,
    recommendation:  getMatchRecommendation(overall, missingSkills),
  };
}

function getMatchRecommendation(score, missing) {
  if (score >= 80) return 'Strong match — apply with confidence!';
  if (score >= 60) return `Good match. Consider adding: ${missing.slice(0, 3).join(', ')}.`;
  if (score >= 40) return `Partial match. Upskill in: ${missing.slice(0, 4).join(', ')}.`;
  return 'Low match — focus on skill gaps before applying.';
}
