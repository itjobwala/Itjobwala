/**
 * fitGapAnalyzer.js
 * Identifies what matches and what's missing between a candidate and a specific job.
 * Produces structured fit_strengths, fit_gaps, missing_requirements, high_impact_missing_skills.
 */

// Skills with high recruiter impact that should surface prominently if missing
const HIGH_IMPACT_SKILLS = new Set([
  'playwright', 'selenium', 'cypress', 'appium',
  'github actions', 'jenkins', 'docker',
  'rest assured', 'postman',
  'k6', 'jmeter',
  'testng', 'junit', 'pytest',
  'cucumber', 'jira',
]);

function normalize(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').trim();
}

function candidateHasSkill(candidateSkills, target) {
  const t = normalize(target);
  return candidateSkills.some(s => {
    const n = normalize(s);
    return n === t || n.includes(t) || t.includes(n);
  });
}

// ── Strength signals from qa_score_breakdown ──────────────────────────────────

function buildStrengthsFromBreakdown(bd, jobSpec, jobSeniority) {
  const strengths = [];

  const autoRatio = bd.automation_testing ? bd.automation_testing.score / bd.automation_testing.max : 0;
  const apiRatio  = bd.api_testing         ? bd.api_testing.score  / bd.api_testing.max             : 0;
  const fwRatio   = bd.framework_expertise ? bd.framework_expertise.score / bd.framework_expertise.max : 0;
  const cicdRatio = bd.ci_cd_readiness     ? bd.ci_cd_readiness.score / bd.ci_cd_readiness.max       : 0;
  const expRatio  = bd.qa_experience       ? bd.qa_experience.score / bd.qa_experience.max            : 0;
  const certRatio = bd.certifications      ? bd.certifications.score / bd.certifications.max           : 0;

  if (autoRatio >= 0.75) strengths.push('Strong automation framework coverage — matches job expectations');
  else if (autoRatio >= 0.5) strengths.push('Adequate automation tooling — meets baseline requirements');

  if (apiRatio >= 0.75) strengths.push('Solid REST/API testing depth — directly relevant to this role');
  if (fwRatio  >= 0.75) strengths.push('Broad QA toolchain — framework maturity exceeds role requirements');
  if (cicdRatio >= 0.70 && (jobSpec === 'sdet' || jobSpec === 'automation_qa')) {
    strengths.push('CI/CD pipeline experience — strong fit for this automation-first role');
  }
  if (expRatio >= 0.75) strengths.push('Well-documented QA experience with measurable ownership signals');
  if (certRatio >= 0.5) strengths.push('QA certification — adds recruiter trust for enterprise roles');

  return strengths;
}

// ── Gap signals ───────────────────────────────────────────────────────────────

function buildGapsFromBreakdown(bd, jobSpec) {
  const gaps = [];

  const autoRatio = bd.automation_testing ? bd.automation_testing.score / bd.automation_testing.max : 0;
  const apiRatio  = bd.api_testing         ? bd.api_testing.score  / bd.api_testing.max             : 0;
  const cicdRatio = bd.ci_cd_readiness     ? bd.ci_cd_readiness.score / bd.ci_cd_readiness.max       : 0;
  const certRatio = bd.certifications      ? bd.certifications.score / bd.certifications.max           : 0;
  const perfRatio = bd.performance_testing ? bd.performance_testing.score / bd.performance_testing.max : 0;

  if (autoRatio < 0.35 && ['sdet', 'automation_qa', 'hybrid_qa'].includes(jobSpec)) {
    gaps.push('Automation tool coverage is below what this role requires');
  }
  if (apiRatio < 0.35 && ['api_testing', 'hybrid_qa', 'sdet'].includes(jobSpec)) {
    gaps.push('API testing depth does not fully meet the job requirements');
  }
  if (cicdRatio < 0.35 && ['sdet', 'automation_qa'].includes(jobSpec)) {
    gaps.push('CI/CD pipeline experience is expected for this automation role');
  }
  if (certRatio < 0.25 && ['sdet', 'senior', 'lead'].some(k => jobSpec?.includes(k))) {
    gaps.push('QA certification (ISTQB) is a soft filter for enterprise recruiters');
  }
  if (perfRatio < 0.25 && jobSpec === 'performance_testing') {
    gaps.push('Performance testing depth is below the role requirement');
  }

  return gaps;
}

/**
 * Main export.
 */
export function analyzeFitGap({
  resumeInsight,
  job,
  jobSkills,
  inferred_job_spec,
  inferred_job_seniority,
}) {
  const candidateSkills = resumeInsight.extracted_skills || [];
  const bd              = resumeInsight.qa_score_breakdown || {};
  const normCandidate   = candidateSkills.map(normalize);

  // ── Matched skills (from job's skill list) ───────────────────────────────
  const matched_skills = (jobSkills || []).filter(s => candidateHasSkill(candidateSkills, s));

  // ── Missing skills (from job's skill list) ───────────────────────────────
  const raw_missing    = (jobSkills || []).filter(s => !candidateHasSkill(candidateSkills, s));

  // ── High-impact missing (intersection with HIGH_IMPACT_SKILLS) ───────────
  const high_impact_missing_skills = raw_missing
    .filter(s => HIGH_IMPACT_SKILLS.has(normalize(s)))
    .slice(0, 4);

  // ── Missing requirements (top gaps from job skills) ───────────────────────
  const missing_requirements = raw_missing.slice(0, 6);

  // ── Fit strengths (from breakdown + matched skills) ───────────────────────
  const breakdown_strengths = buildStrengthsFromBreakdown(bd, inferred_job_spec, inferred_job_seniority);

  // Add matched skills signal
  if (matched_skills.length >= 5) {
    breakdown_strengths.unshift(`${matched_skills.length} of ${jobSkills.length} required skills matched`);
  } else if (matched_skills.length > 0) {
    breakdown_strengths.push(`${matched_skills.length} required skill${matched_skills.length !== 1 ? 's' : ''} matched: ${matched_skills.slice(0, 3).join(', ')}`);
  }

  const fit_strengths = breakdown_strengths.slice(0, 5);

  // ── Fit gaps (from breakdown) ─────────────────────────────────────────────
  const fit_gaps = buildGapsFromBreakdown(bd, inferred_job_spec).slice(0, 4);

  return {
    matched_skills,
    missing_requirements,
    high_impact_missing_skills,
    fit_strengths,
    fit_gaps,
  };
}
