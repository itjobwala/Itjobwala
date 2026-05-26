/**
 * ats.service.js — builds the full ATS analysis from parsed resume data.
 *
 * Combines:
 *  - ATS score calculation
 *  - Missing keywords from the candidate's profile skills
 *  - Suggested keywords based on skill gaps
 *
 * AI-ready: replace calculateATSScore with an LLM call for richer insights.
 */

import { calculateATSScore, getScoreBand } from '../../utils/resume/scoreCalculator.js';
import { ALL_SKILLS, computeMissingSkills } from '../../utils/resume/normalizeSkills.js';

/**
 * Run the full ATS analysis.
 *
 * @param {object} parsed         - Output from parser.service
 * @param {string[]} profileSkills - Candidate's existing profile skills (from DB)
 * @returns {ATSAnalysis}
 */
export function runATSAnalysis(parsed, profileSkills = []) {
  const {
    ats_score,
    score_breakdown,
    strengths,
    weaknesses,
    suggestions,
  } = calculateATSScore({
    ...parsed,
    userProfileSkills: profileSkills,
  });

  const band = getScoreBand(ats_score);

  // Missing skills: focus on high-value IT/web development skills, not every language
  const HIGH_VALUE_POOL = [
    'react', 'node.js', 'typescript', 'python', 'postgresql', 'mongodb',
    'docker', 'kubernetes', 'aws', 'git', 'redis', 'graphql',
    'next.js', 'tailwindcss', 'github actions', 'ci/cd', 'restful',
    'jest', 'linux', 'sql', 'express', 'fastify', 'prisma',
    'terraform', 'elasticsearch', 'nginx', 'websocket',
  ];
  const allKnownSkills = [...new Set([...(parsed.extractedSkills || []), ...profileSkills])];
  const missingSkills  = computeMissingSkills(allKnownSkills, HIGH_VALUE_POOL).slice(0, 12);

  // Suggested keywords: highest-priority missing skills
  const suggestedKeywords = missingSkills.slice(0, 6);

  return {
    ats_score,
    score_breakdown,
    band_label:         band.label,
    band_color:         band.color,
    strengths,
    weaknesses,
    suggestions,
    missing_skills:     missingSkills,
    suggested_keywords: suggestedKeywords,
  };
}
