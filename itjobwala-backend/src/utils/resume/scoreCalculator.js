/**
 * ATS Score Calculator — pure algorithmic scoring, AI-ready architecture.
 *
 * Score bands:
 *   0–40   Poor    — major gaps
 *  41–60   Fair    — needs improvement
 *  61–75   Good    — competitive
 *  76–89   Great   — strong candidate
 *  90–100  Excellent — top tier
 *
 * Section weights (sum = 100):
 *   contact_info     10
 *   skills           20
 *   experience       20
 *   education        15
 *   projects         10
 *   certifications    5
 *   summary           5
 *   readability      10
 *   keyword_density   5
 */

const WEIGHTS = {
  contact_info:     10,
  skills:           20,
  experience:       20,
  education:        15,
  projects:         10,
  certifications:    5,
  summary:           5,
  readability:      10,
  keyword_density:   5,
};

// ── Section scorers ───────────────────────────────────────────────────────────

function scoreContactInfo(contactInfo = {}) {
  let score = 0;
  if (contactInfo.name)     score += 3;
  if (contactInfo.email)    score += 3;
  if (contactInfo.phone)    score += 2;
  if (contactInfo.linkedin) score += 1;
  if (contactInfo.github)   score += 1;
  return Math.min(score, 10);
}

function scoreSkills(skills = [], userProfileSkills = []) {
  // Combine resume-extracted + profile skills
  const unique = new Set([...skills, ...userProfileSkills]);
  const count  = unique.size;

  if (count === 0)  return 0;
  if (count < 3)   return 5;
  if (count < 6)   return 10;
  if (count < 10)  return 14;
  if (count < 15)  return 17;
  return 20;
}

function scoreExperience(expEntries = [], expYears = 0) {
  let score = 0;

  // Years of experience
  if (expYears >= 1)  score += 4;
  if (expYears >= 3)  score += 3;
  if (expYears >= 5)  score += 3;

  // Entry quality
  if (expEntries.length >= 1) score += 4;
  if (expEntries.length >= 2) score += 3;
  if (expEntries.some(e => e.description && e.description.length > 50)) score += 3;

  return Math.min(score, 20);
}

function scoreEducation(eduEntries = []) {
  if (!eduEntries.length) return 0;
  let score = 8; // has at least one entry
  if (eduEntries.some(e => e.institution)) score += 4;
  if (eduEntries.some(e => e.year))        score += 3;
  return Math.min(score, 15);
}

function scoreProjects(projectEntries = []) {
  if (!projectEntries.length) return 0;
  let score = 4;
  if (projectEntries.length >= 2) score += 3;
  if (projectEntries.length >= 3) score += 3;
  return Math.min(score, 10);
}

function scoreCertifications(certEntries = []) {
  if (!certEntries.length) return 0;
  if (certEntries.length === 1) return 3;
  return 5;
}

function scoreSummary(summaryText = '') {
  if (!summaryText || summaryText.length < 20) return 0;
  if (summaryText.length < 80)  return 2;
  if (summaryText.length < 200) return 4;
  return 5;
}

function scoreReadability(text = '', wordCount = 0) {
  if (!text) return 0;
  let score = 0;
  if (wordCount >= 200)  score += 3;
  if (wordCount >= 400)  score += 2;
  if (wordCount >= 600)  score += 2;

  // Penalise extremely long resumes (>1200 words)
  if (wordCount > 1200) score -= 2;

  // Reward structured formatting (presence of bullet-like chars)
  if (/[•\-\*◦▸]/.test(text)) score += 2;
  if (/\n\n/.test(text))       score += 1;

  return Math.max(0, Math.min(score, 10));
}

function scoreKeywordDensity(text = '', skills = []) {
  if (!text || !skills.length) return 0;
  const lower = text.toLowerCase();
  const hits  = skills.filter(s => lower.includes(s.toLowerCase())).length;
  const ratio = hits / Math.max(skills.length, 1);

  if (ratio >= 0.7) return 5;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 1;
  return 0;
}

// ── Main scorer ───────────────────────────────────────────────────────────────

/**
 * Calculate ATS score from parsed resume data.
 *
 * @param {object} parsed - Output from the parser service
 * @param {string[]} userProfileSkills - Skills from the candidate's profile (DB)
 * @returns {{ ats_score, score_breakdown, strengths, weaknesses, suggestions }}
 */
export function calculateATSScore({
  contactInfo         = {},
  extractedSkills     = [],
  experienceEntries   = [],
  educationEntries    = [],
  projectEntries      = [],
  certificationEntries = [],
  summaryText         = '',
  parsedText          = '',
  wordCount           = 0,
  experienceYears     = 0,
  userProfileSkills   = [],
} = {}) {
  const sections = {
    contact_info:     scoreContactInfo(contactInfo),
    skills:           scoreSkills(extractedSkills, userProfileSkills),
    experience:       scoreExperience(experienceEntries, experienceYears),
    education:        scoreEducation(educationEntries),
    projects:         scoreProjects(projectEntries),
    certifications:   scoreCertifications(certificationEntries),
    summary:          scoreSummary(summaryText),
    readability:      scoreReadability(parsedText, wordCount),
    keyword_density:  scoreKeywordDensity(parsedText, extractedSkills),
  };

  // Normalize to 100 (in case weights don't sum perfectly)
  const totalWeight  = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  const rawScore     = Object.keys(sections).reduce((sum, k) => sum + (sections[k] / WEIGHTS[k]) * WEIGHTS[k], 0);
  const ats_score    = Math.round(Math.min(100, Math.max(0, rawScore)));

  // ── Qualitative analysis ──────────────────────────────────────────────────

  const strengths    = [];
  const weaknesses   = [];
  const suggestions  = [];

  // Contact
  if (sections.contact_info >= 8) {
    strengths.push('Complete contact information makes it easy for recruiters to reach you.');
  } else {
    if (!contactInfo.email)    weaknesses.push('Missing email address.');
    if (!contactInfo.phone)    weaknesses.push('Missing phone number.');
    if (!contactInfo.linkedin) suggestions.push('Add your LinkedIn profile URL to increase recruiter visibility.');
    if (!contactInfo.github)   suggestions.push('Link your GitHub profile to showcase your code.');
  }

  // Skills
  const allSkills = [...new Set([...extractedSkills, ...userProfileSkills])];
  if (allSkills.length >= 10) {
    strengths.push(`Strong skill set with ${allSkills.length} recognized technologies detected.`);
  } else if (allSkills.length < 5) {
    weaknesses.push('Very few skills detected — add a dedicated Skills section to your resume.');
    suggestions.push('List 8–12 core technical skills prominently near the top of your resume.');
  }

  // Experience
  if (sections.experience >= 15) {
    strengths.push('Well-documented work history with clear company and role details.');
  } else if (sections.experience < 8) {
    if (experienceEntries.length === 0) {
      weaknesses.push('No work experience section detected.');
      suggestions.push('Add internships, freelance projects, or part-time work to strengthen your profile.');
    } else {
      suggestions.push('Expand your experience descriptions with quantified achievements (e.g., "Improved load time by 40%").');
    }
  }

  // Education
  if (sections.education >= 10) {
    strengths.push('Education background is clearly presented.');
  } else if (sections.education === 0) {
    weaknesses.push('No education section found — add your degree or diploma details.');
  }

  // Projects
  if (sections.projects >= 7) {
    strengths.push(`${projectEntries.length} projects demonstrate practical experience.`);
  } else if (sections.projects === 0) {
    suggestions.push('Add 2–3 projects with descriptions of technologies used and impact achieved.');
  }

  // Certifications
  if (certificationEntries.length >= 2) {
    strengths.push('Certifications demonstrate commitment to continuous learning.');
  } else if (certificationEntries.length === 0) {
    suggestions.push('Add relevant certifications (AWS, Google Cloud, React, etc.) to stand out.');
  }

  // Summary
  if (sections.summary >= 4) {
    strengths.push('Professional summary gives recruiters a quick overview of your value.');
  } else {
    suggestions.push('Add a 2–3 sentence professional summary at the top of your resume.');
  }

  // Readability
  if (wordCount < 200) {
    weaknesses.push('Resume is too short. Aim for 400–800 words for optimal ATS performance.');
  } else if (wordCount > 1200) {
    suggestions.push('Your resume is quite long. Aim for 1 page (400–800 words) for best ATS results.');
  }

  return {
    ats_score,
    score_breakdown: Object.fromEntries(
      Object.keys(sections).map(k => [k, { score: sections[k], max: WEIGHTS[k] }])
    ),
    strengths,
    weaknesses,
    suggestions,
  };
}

/**
 * Return the score band label + color token for the given score.
 */
export function getScoreBand(score) {
  if (score >= 90) return { label: 'Excellent', color: 'emerald' };
  if (score >= 76) return { label: 'Great',     color: 'green'   };
  if (score >= 61) return { label: 'Good',      color: 'blue'    };
  if (score >= 41) return { label: 'Fair',      color: 'amber'   };
  return              { label: 'Needs Work', color: 'red'     };
}
