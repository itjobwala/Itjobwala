/**
 * genericScorer.js — domain-agnostic ATS scorer for non-QA resumes.
 *
 * Returns the same output shape as calculateQaResumeScore so that
 * intelligenceAdapter.js can swap scorers transparently.
 *
 * Dimensions (base sum = 100):
 *   domain_skills    35  — candidate skills vs domain skill pool
 *   experience       25  — years of professional experience
 *   projects         25  — domain-relevant project evidence
 *   skill_breadth    15  — total unique skill count
 */

import { getDomainSkillPool } from './domainDetection.js';
import { deriveCareerLevel }  from './careerCalibration.js';
import { skillMatches }       from './skillMatcher.js';

function hits(candidateSkills, pool) {
  const norm = candidateSkills.map(s => s.toLowerCase().trim());
  return pool.filter(kw => norm.some(s => skillMatches(s, kw))).length;
}

function domainSkillScore(extractedSkills, domain) {
  const pool = getDomainSkillPool(domain);
  const h    = hits(extractedSkills, pool);
  if (h >= 12) return 35;
  if (h >= 8)  return 28;
  if (h >= 5)  return 20;
  if (h >= 3)  return 12;
  if (h >= 1)  return 6;
  return 0;
}

function experienceScore(years) {
  if (years >= 8)  return 25;
  if (years >= 5)  return 20;
  if (years >= 3)  return 14;
  if (years >= 1)  return 8;
  return 0;
}

function projectScore(projectEntries, domain) {
  const pool = getDomainSkillPool(domain);
  const relevant = (projectEntries || []).filter(p => {
    const tools = (p.tools || []).map(t => t.toLowerCase());
    const desc  = ((p.description || '') + ' ' + (p.name || '')).toLowerCase();
    return tools.some(t => pool.some(kw => t.includes(kw) || kw.includes(t))) ||
           pool.some(kw => desc.includes(kw));
  }).length;

  if (relevant >= 3) return 25;
  if (relevant >= 2) return 18;
  if (relevant >= 1) return 12;
  return 0;
}

function breadthScore(extractedSkills) {
  const count = (extractedSkills || []).length;
  if (count >= 15) return 15;
  if (count >= 10) return 12;
  if (count >= 6)  return 8;
  if (count >= 3)  return 4;
  return 0;
}

function getGenericHiringLabel(score) {
  if (score >= 81) return 'High-Confidence Match';
  if (score >= 61) return 'Strong Technical Match';
  if (score >= 41) return 'Solid Candidate';
  if (score >= 21) return 'Developing Profile';
  return 'Early-Stage Profile';
}

/**
 * Score a non-QA resume. Returns same shape as calculateQaResumeScore.
 */
export function calculateGenericScore({
  extractedSkills      = [],
  experienceYears      = 0,
  projectEntries       = [],
  certificationEntries = [],
  detectedDomain       = 'general',
  contactInfo          = {},
  parsedText           = '',
} = {}) {
  const pool  = getDomainSkillPool(detectedDomain);
  const dS    = domainSkillScore(extractedSkills, detectedDomain);
  const expS  = experienceScore(experienceYears);
  const projS = projectScore(projectEntries, detectedDomain);
  const brdS  = breadthScore(extractedSkills);

  const rawTotal       = dS + expS + projS + brdS;
  const qa_match_score = Math.min(100, Math.max(0, rawTotal));

  const qa_score_breakdown = {
    domain_skills:  { score: dS,    max: 35, label: 'Domain Skill Coverage' },
    experience:     { score: expS,  max: 25, label: 'Experience Depth'      },
    projects:       { score: projS, max: 25, label: 'Project Relevance'     },
    skill_breadth:  { score: brdS,  max: 15, label: 'Skill Breadth'         },
  };

  const qa_seniority    = deriveCareerLevel(experienceYears);
  const qa_hiring_label = getGenericHiringLabel(qa_match_score);

  // Build domain-specific feedback
  const strengths   = [];
  const weaknesses  = [];
  const suggestions = [];

  const domainHits = hits(extractedSkills, pool);
  if (domainHits >= 8)  strengths.push(`Strong ${detectedDomain} skill coverage (${domainHits} domain skills matched)`);
  else if (domainHits >= 4) strengths.push(`Solid ${detectedDomain} foundation — room to expand`);

  if (projS >= 18)  strengths.push('Multiple domain-relevant projects demonstrating applied experience');
  else if (projS >= 12) strengths.push('Project experience demonstrates domain competency');

  if (experienceYears >= 6)  strengths.push(`${experienceYears}+ years professional experience`);
  else if (experienceYears >= 3) strengths.push(`${experienceYears} years professional experience`);

  if (brdS >= 12)  strengths.push('Broad technology stack — versatile contributor');

  if (domainHits === 0)
    weaknesses.push(`No ${detectedDomain} skills detected — ensure relevant technologies are listed`);
  else if (domainHits < 3)
    weaknesses.push(`Limited ${detectedDomain} skill coverage — add more domain-specific tools`);

  if (projS === 0)
    weaknesses.push('No domain-relevant projects found — add projects that showcase your skills');

  if (experienceYears === 0)
    weaknesses.push('Experience years undetected — ensure resume dates are clearly formatted');

  // Suggest top missing domain skills
  const normalizedSkills = extractedSkills.map(s => s.toLowerCase().trim());
  const missingPool = pool.filter(kw =>
    !normalizedSkills.some(s => s.includes(kw) || kw.includes(s))
  );
  if (missingPool.length > 0 && domainHits < 8) {
    const topMissing = missingPool.slice(0, 3).join(', ');
    suggestions.push(`Add key ${detectedDomain} skills: ${topMissing}`);
  }
  if (projS < 12)
    suggestions.push('Add more projects with specific tools and measurable outcomes');
  if (certificationEntries.length === 0)
    suggestions.push('Domain certifications strengthen recruiter confidence significantly');

  return {
    qa_match_score,
    qa_seniority,
    qa_hiring_label,
    qa_score_breakdown,
    strengths,
    weaknesses,
    suggestions,
  };
}
