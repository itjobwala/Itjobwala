/**
 * scoreExplanation.js
 * Explains WHY the score is what it is — strengths, score losses, recruiter concerns.
 * Gives candidates specific, honest feedback instead of generic ATS output.
 */

const DIMENSION_EXPLANATIONS = {
  automation_testing: {
    strong:  'Selenium/Cypress/Playwright automation — strongest hiring signal in QA',
    mid:     'Automation coverage is present but limited to {count} tool(s) — expand to 3+',
    weak:    'No automation tools detected — automation is the #1 QA hiring requirement in 2025',
    loss:    'Automation gap is the biggest score reducer — recruiters filter hard on this',
    concern: 'A QA profile without automation tools struggles to pass recruiter screening',
  },
  api_testing: {
    strong:  'REST/API testing depth confirmed — matches modern full-stack QA expectations',
    mid:     'Basic API testing present — add assertion depth and contract testing',
    weak:    'No API testing detected — expected in 90%+ of mid-to-senior QA roles',
    loss:    'Missing API testing is a significant gap for any non-entry-level QA role',
    concern: 'Recruiters for mid+ roles expect at minimum Postman + basic assertions',
  },
  framework_expertise: {
    strong:  'Diverse QA toolchain across 5+ frameworks — strong recruiter profile signal',
    mid:     'Framework diversity is developing — add BDD or a cloud testing tool',
    weak:    'Narrow toolchain limits role fit to entry-level or niche QA positions',
    loss:    'Limited framework breadth reduces match rate for senior QA job descriptions',
    concern: 'Senior QA roles expect comfort across multiple frameworks',
  },
  performance_testing: {
    strong:  'Performance engineering (JMeter/Gatling/K6) — differentiates at senior level',
    mid:     'Basic performance awareness present — add load test scenarios',
    weak:    'No performance testing — optional at junior level, expected at senior',
    loss:    'Performance testing absence slightly reduces score — lower priority gap',
    concern: 'Performance QA is valued but not always required — lower hiring risk',
  },
  qa_experience: {
    strong:  'Strong QA tenure with measurable depth across STLC methodology',
    mid:     'QA experience detected but descriptions lack measurable impact',
    weak:    'Experience depth insufficient — add ownership signals and measurable outcomes',
    loss:    'Shallow experience descriptions reduce recruiter confidence score',
    concern: 'Recruiter concerns: no measurable impact in descriptions (e.g. % reduction, defects caught)',
  },
  certifications: {
    strong:  'ISTQB/professional certification detected — strong recruiter trust signal',
    mid:     'Certification present — pursue ISTQB Advanced to differentiate further',
    weak:    'No QA certifications — ISTQB adds significant recruiter filtering advantage',
    loss:    'Missing certification reduces trust score with enterprise recruiting teams',
    concern: 'Many enterprise employers use ISTQB as a soft filter for shortlisting',
  },
  bug_tracking: {
    strong:  'JIRA/TestRail defect lifecycle experience — professional QA workflow confirmed',
    mid:     'Bug tracking tools mentioned — add defect lifecycle depth to descriptions',
    weak:    'No bug tracking tools — JIRA is listed in nearly every QA job description',
    loss:    'Bug tracking gap reduces professional workflow credibility for recruiters',
    concern: 'Recruiters expect JIRA or TestRail in any professional QA context',
  },
  ci_cd_readiness: {
    strong:  'CI/CD pipeline integration — automation-first SDET mindset confirmed',
    mid:     'Some CI/CD awareness present — add pipeline integration projects',
    weak:    'No CI/CD tools — enterprise automation roles expect pipeline deployment',
    loss:    'Lack of CI/CD integration significantly reduces score for automation/SDET roles',
    concern: 'Enterprise QA automation without CI/CD is increasingly seen as incomplete',
  },
};

function getLevel(pct) {
  if (pct >= 0.78) return 'strong';
  if (pct >= 0.42) return 'mid';
  return 'weak';
}

function getScoreCount(breakdown, key) {
  const d = breakdown[key];
  return d ? d.score : 0;
}

/**
 * Generate score explanation: what's boosting, what's hurting, what recruiters notice.
 */
export function generateScoreExplanation({ qa_score_breakdown = {}, qa_match_score = 0, strengths = [], weaknesses = [], weak_evidence_skills = [], evidence_profile = null }) {
  const biggest_strengths    = [];
  const biggest_score_losses = [];
  const recruiter_concerns   = [];

  const CRITICAL = ['automation_testing', 'api_testing', 'qa_experience', 'ci_cd_readiness'];

  for (const [key, val] of Object.entries(qa_score_breakdown)) {
    const pct   = val.max > 0 ? val.score / val.max : 0;
    const level = getLevel(pct);
    const meta  = DIMENSION_EXPLANATIONS[key];
    if (!meta) continue;

    const pointsLost = val.max - val.score;

    if (level === 'strong') {
      biggest_strengths.push(meta.strong);
    }

    if (level === 'weak' && pointsLost >= 8) {
      biggest_score_losses.push(meta.loss);
    } else if (level === 'mid' && pointsLost >= 6) {
      biggest_score_losses.push(`${key.replace(/_/g, ' ')} at ${Math.round(pct * 100)}% — ${Math.round(pointsLost)} pts below maximum`);
    }

    if (level === 'weak' && CRITICAL.includes(key)) {
      recruiter_concerns.push(meta.concern);
    }
  }

  // Score band explanation
  let score_summary = '';
  if (qa_match_score >= 85)      score_summary = 'Elite QA profile — strong shortlist candidate for senior automation roles';
  else if (qa_match_score >= 70) score_summary = 'Competitive QA profile with clear growth areas';
  else if (qa_match_score >= 55) score_summary = 'Developing QA profile — 2-3 targeted improvements could significantly increase recruiter visibility';
  else                           score_summary = 'Early-stage QA profile — focus on automation tooling and API testing fundamentals';

  // Evidence-aware feedback: skills that are listed but have no implementation proof
  const evidence_warnings = [];
  if (weak_evidence_skills.length > 0) {
    const named = weak_evidence_skills.slice(0, 4).map(s => s.charAt(0).toUpperCase() + s.slice(1));
    evidence_warnings.push(
      `${named.join(', ')} ${named.length === 1 ? 'is' : 'are'} listed without implementation evidence. Add project context, architecture descriptions, or measurable outcomes to each.`
    );
  }
  if (evidence_profile && !evidence_profile.has_quantified_impact) {
    evidence_warnings.push('No quantified outcomes detected. Add metrics (e.g. "reduced regression time by 40%", "automated 200+ test cases") — these are the highest-trust signals for senior recruiters.');
  }
  if (evidence_profile && !evidence_profile.has_architecture_depth && (evidence_profile.recruiter_trust_score ?? 0) < 55) {
    evidence_warnings.push('No framework architecture language detected. Mention how you designed, built, or structured your test frameworks — not just which tools you used.');
  }

  return {
    score_summary,
    biggest_strengths:    biggest_strengths.slice(0, 4),
    biggest_score_losses: biggest_score_losses.slice(0, 4),
    recruiter_concerns:   recruiter_concerns.slice(0, 3),
    evidence_warnings:    evidence_warnings.slice(0, 3),
  };
}
