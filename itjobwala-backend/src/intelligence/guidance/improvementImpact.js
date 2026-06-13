/**
 * improvementImpact.js
 *
 * P1 Fix 7: Replaced fabricated numeric score gains ("+9 pts") with qualitative
 * impact levels. Deterministic score predictions were invented and created false
 * expectations. The new `potential_score_impact` field uses High/Medium/Low.
 * `estimated_score_gain` is kept for backward compat but returns qualitative text.
 */

// Per-skill qualitative impact — no fabricated numbers.
const SKILL_IMPACT_DB = {
  'playwright':        { impact: 'High',   recruiter_impact: 'Very High', reasoning: 'Playwright is the fastest-growing automation tool — recruiters actively search for it' },
  'cypress':           { impact: 'High',   recruiter_impact: 'High',      reasoning: 'Cypress dominates frontend QA interviews — adds immediate screening value' },
  'selenium':          { impact: 'High',   recruiter_impact: 'High',      reasoning: 'Selenium is the most-tested automation skill — presence alone clears many ATS filters' },
  'jenkins':           { impact: 'Medium', recruiter_impact: 'High',      reasoning: 'CI/CD integration via Jenkins is explicitly required in 80%+ senior QA roles' },
  'github actions':    { impact: 'Medium', recruiter_impact: 'Very High', reasoning: 'GitHub Actions adoption is growing rapidly — modern SDET signal' },
  'docker':            { impact: 'Medium', recruiter_impact: 'High',      reasoning: 'Dockerized test execution signals enterprise-ready SDET capability' },
  'rest assured':      { impact: 'High',   recruiter_impact: 'High',      reasoning: 'REST Assured is the top Java API testing library — addresses a critical ATS gap' },
  'postman':           { impact: 'High',   recruiter_impact: 'High',      reasoning: 'Postman is the universal API testing entry point — every recruiter checks for it' },
  'contract testing':  { impact: 'Medium', recruiter_impact: 'Medium',    reasoning: 'Contract testing is a rare differentiator — signals advanced API QA thinking' },
  'jmeter':            { impact: 'Medium', recruiter_impact: 'Medium',    reasoning: 'JMeter on your profile opens performance QA roles — a niche with less competition' },
  'k6':                { impact: 'Medium', recruiter_impact: 'High',      reasoning: 'K6 is rapidly replacing JMeter in modern stacks — high-growth signal' },
  'appium':            { impact: 'High',   recruiter_impact: 'High',      reasoning: 'Appium is the dominant mobile automation requirement in fintech and commerce QA' },
  'cucumber':          { impact: 'Medium', recruiter_impact: 'Medium',    reasoning: 'BDD/Cucumber signals Agile QA collaboration — expected in product-led companies' },
  'testng':            { impact: 'Medium', recruiter_impact: 'Medium',    reasoning: 'TestNG is the standard Java test runner — foundational enterprise QA signal' },
  'jira':              { impact: 'Low',    recruiter_impact: 'Medium',    reasoning: 'JIRA is listed in nearly every QA JD — absence is a visible gap for recruiters' },
  'testrail':          { impact: 'Low',    recruiter_impact: 'Medium',    reasoning: 'TestRail demonstrates structured test management experience' },
  'gatling':           { impact: 'Medium', recruiter_impact: 'Medium',    reasoning: 'Gatling is gaining enterprise adoption in high-traffic QA teams' },
  'istqb':             { impact: 'Low',    recruiter_impact: 'Medium',    reasoning: 'ISTQB certification is a soft filter for enterprise recruiters — adds trust' },
  'page object model': { impact: 'Medium', recruiter_impact: 'Medium',    reasoning: 'POM knowledge signals automation architecture maturity for senior roles' },
  'bdd':               { impact: 'Medium', recruiter_impact: 'Medium',    reasoning: 'BDD demonstrates cross-functional collaboration — valued in Agile QA teams' },
  'graphql testing':   { impact: 'Medium', recruiter_impact: 'Medium',    reasoning: 'GraphQL API testing is an emerging differentiator in modern API-first stacks' },
  'kubernetes':        { impact: 'Low',    recruiter_impact: 'Medium',    reasoning: 'Kubernetes awareness signals senior SDET / DevOps QA alignment' },
};

/**
 * Derive qualitative impact based on the dimension gap size and skill tier.
 * Dimension gap amplifies impact: a large gap means this skill matters more here.
 */
function deriveImpactLevel(intel, qa_score_breakdown, dimension) {
  const dimData = qa_score_breakdown?.[dimension];
  const dimGap  = dimData ? (dimData.max - dimData.score) / dimData.max : 0.5;

  // Gap threshold: large gap (>70%) can promote Medium → High
  if (intel.impact === 'Medium' && dimGap > 0.7) return 'High';
  // Low with large gap can promote to Medium
  if (intel.impact === 'Low'    && dimGap > 0.8) return 'Medium';
  return intel.impact;
}

function buildImpact(skill, qa_score_breakdown, dimension) {
  const intel = SKILL_IMPACT_DB[skill.toLowerCase()];
  if (!intel) return null;

  const potential_score_impact = deriveImpactLevel(intel, qa_score_breakdown, dimension);

  return {
    skill:                skill.charAt(0).toUpperCase() + skill.slice(1),
    // P1 Fix 7: qualitative description replaces fabricated "+N pts"
    estimated_score_gain: `${potential_score_impact} Impact`,
    potential_score_impact,
    recruiter_impact:     intel.recruiter_impact,
    reasoning:            intel.reasoning,
    dimension,
  };
}

/**
 * Generate improvement impact estimates for high and medium priority skills.
 */
export function generateImprovementImpacts({ improvement_priorities = {}, qa_score_breakdown = {} }) {
  const results = [];
  const allPriority = [
    ...(improvement_priorities.high_priority   || []),
    ...(improvement_priorities.medium_priority || []).slice(0, 3),
  ];

  for (const item of allPriority) {
    const impact = buildImpact(item.skill, qa_score_breakdown, item.dimension);
    if (impact) results.push(impact);
  }

  return results;
}
