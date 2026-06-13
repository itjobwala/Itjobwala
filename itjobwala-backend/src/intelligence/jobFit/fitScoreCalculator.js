/**
 * fitScoreCalculator.js
 * Computes a contextual job fit score by comparing resume signals against
 * the specific job's requirements. Completely separate from qa_match_score.
 *
 * qa_match_score = "how good is this QA profile overall?"
 * job_fit_score  = "how well does this candidate fit THIS specific job?"
 */

// ── QA tool pool — used to measure tool overlap ───────────────────────────────

const QA_TOOLS = new Set([
  'selenium', 'playwright', 'cypress', 'appium', 'webdriverio', 'katalon',
  'testng', 'junit', 'pytest', 'mocha', 'jasmine', 'specflow', 'nunit',
  'postman', 'rest assured', 'soapui', 'karate', 'insomnia', 'newman',
  'jmeter', 'k6', 'gatling', 'locust', 'artillery',
  'jenkins', 'github actions', 'gitlab ci', 'bamboo', 'circleci', 'travis',
  'docker', 'kubernetes', 'selenium grid',
  'jira', 'testrail', 'zephyr', 'xray', 'qtest', 'azure devops',
  'cucumber', 'bdd', 'gherkin', 'allure', 'extent reports',
]);

// ── Specialization inference from job signals ─────────────────────────────────

const JOB_SPEC_SIGNALS = [
  { spec: 'sdet',           patterns: [/\bsdet\b/i, /software.{0,10}engineer.{0,10}test/i, /quality.{0,10}engineer/i, /test.{0,10}engineer/i] },
  { spec: 'mobile_testing',     patterns: [/\bmobile\b/i, /\bandroid\b/i, /\bios\b/i, /\bappium\b/i] },
  { spec: 'performance_testing',patterns: [/performance.{0,6}test/i, /load.{0,6}test/i, /\bjmeter\b/i, /\bk6\b/i, /\bgatling\b/i] },
  { spec: 'api_testing',        patterns: [/\bapi.{0,10}(qa|test|engineer)/i, /backend.{0,10}(qa|test)/i, /integration.{0,10}test/i] },
  { spec: 'automation_qa', patterns: [/automation.{0,10}(qa|test|engineer)/i, /\bselenium\b/i, /\bplaywright\b/i, /\bcypress\b/i] },
  { spec: 'manual_qa',     patterns: [/manual.{0,10}(qa|test)/i, /\bmanual\b.*\btester/i] },
];

// Seniority inference from job title/description
const SENIORITY_SIGNALS = [
  { level: 'lead',      patterns: [/\b(lead|principal|head|architect|staff)\b/i] },
  { level: 'senior',    patterns: [/\b(senior|sr\.?)\b/i] },
  { level: 'mid_level', patterns: [/\bmid[\s-]?(level|senior)?\b/i, /\b(3|4|5)\+?\s*year/i] },
  { level: 'junior',    patterns: [/\b(junior|jr\.?|fresher|entry[\s-]?level|graduate)\b/i] },
];

const SENIORITY_ORDER = { fresher: 0, junior: 1, mid_level: 2, senior: 3, lead: 4 };

export function inferJobSpecialization(jobTitle, jobSkills, requirementsText) {
  const haystack = `${jobTitle} ${(jobSkills || []).join(' ')} ${requirementsText || ''}`;
  for (const { spec, patterns } of JOB_SPEC_SIGNALS) {
    if (patterns.some(p => p.test(haystack))) return spec;
  }
  return 'automation_qa'; // default assumption for QA roles
}

export function inferJobSeniority(jobTitle, jobLevel) {
  const text = `${jobTitle} ${jobLevel || ''}`;
  for (const { level, patterns } of SENIORITY_SIGNALS) {
    if (patterns.some(p => p.test(text))) return level;
  }
  return null; // not specified
}

// ── Component scores ──────────────────────────────────────────────────────────

function toolOverlapScore(candidateSkills, jobSkills) {
  if (!jobSkills.length) return 60;
  const candidateNorm = new Set(candidateSkills.map(s => s.toLowerCase().trim()));
  const jobQaTools    = jobSkills.filter(s => QA_TOOLS.has(s.toLowerCase().trim()));
  if (!jobQaTools.length) return 60;
  const matched = jobQaTools.filter(s => candidateNorm.has(s.toLowerCase().trim()));
  return Math.round((matched.length / jobQaTools.length) * 100);
}

function specializationAlignmentScore(candidateSpec, jobSpec) {
  if (!candidateSpec || !jobSpec) return 55;
  if (candidateSpec === jobSpec)              return 100;

  // Compatible pairs (partial alignment)
  const COMPAT = {
    sdet:           ['automation_qa', 'hybrid_qa'],
    automation_qa:  ['sdet', 'hybrid_qa'],
    hybrid_qa:      ['sdet', 'automation_qa', 'api_testing'],
    api_testing:         ['hybrid_qa', 'sdet'],
    performance_testing: ['sdet'],
    mobile_testing:      ['sdet'],
    manual_qa:      [],
  };
  if ((COMPAT[candidateSpec] || []).includes(jobSpec)) return 65;
  if (candidateSpec === 'manual_qa')   return 25;
  return 40;
}

function seniorityFitScore(candidateSeniority, jobSeniority) {
  if (!jobSeniority || !candidateSeniority) return 70;
  const cLevel = SENIORITY_ORDER[candidateSeniority] ?? 1;
  const jLevel = SENIORITY_ORDER[jobSeniority]       ?? 1;
  const diff   = cLevel - jLevel;

  if (diff === 0)  return 100; // exact match
  if (diff === 1)  return 85;  // slightly overqualified — still a good fit
  if (diff === -1) return 65;  // slightly underqualified — borderline
  if (diff >= 2)   return 90;  // significantly overqualified — still likely to pass
  return 30;                   // significantly underqualified
}

function experienceFitScore(candidateYears, jobExpMin) {
  if (!jobExpMin || jobExpMin === 0) return 80;
  const ratio = (candidateYears ?? 0) / jobExpMin;
  if (ratio >= 1.5) return 100;
  if (ratio >= 1.0) return 90;
  if (ratio >= 0.7) return 65;
  if (ratio >= 0.5) return 45;
  return 20;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {object} resumeInsight - DB row from resume_insights
 * @param {object} job           - DB row from jobs
 * @returns {{ job_fit_score, tool_overlap_pct, inferred_job_spec, inferred_job_seniority }}
 */
export function calculateJobFitScore(resumeInsight, job) {
  const candidateSkills  = resumeInsight.extracted_skills   || [];
  const jobSkills        = job.skills                       || [];
  const reqText          = (job.requirements || []).join(' ');
  const candidateSpec    = resumeInsight.qa_specialization;
  const candidateSen     = resumeInsight.qa_seniority;
  const candidateYears   = resumeInsight.experience_years   || 0;
  const qaMatchScore     = resumeInsight.qa_match_score     || 0;

  const inferred_job_spec      = inferJobSpecialization(job.title, jobSkills, reqText);
  const inferred_job_seniority = inferJobSeniority(job.title, job.job_level);

  const toolScore  = toolOverlapScore(candidateSkills, jobSkills);
  const specScore  = specializationAlignmentScore(candidateSpec, inferred_job_spec);
  const senScore   = seniorityFitScore(candidateSen, inferred_job_seniority);
  const expScore   = experienceFitScore(candidateYears, job.experience_min);
  const qaBonus    = Math.min(8, Math.round(qaMatchScore * 0.08));

  const job_fit_score = Math.min(98, Math.max(5, Math.round(
    toolScore * 0.35 +
    specScore * 0.25 +
    senScore  * 0.22 +
    expScore  * 0.15 +
    qaBonus   * 0.03,
  )));

  const tool_overlap_pct = toolScore;

  return { job_fit_score, tool_overlap_pct, inferred_job_spec, inferred_job_seniority };
}

export function getFitLevel(score) {
  if (score >= 85) return 'Excellent Fit';
  if (score >= 70) return 'Strong Fit';
  if (score >= 55) return 'Partial Fit';
  if (score >= 40) return 'Weak Fit';
  return 'Poor Fit';
}
