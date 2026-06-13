/**
 * improvementPriority.js
 * Rank missing skills by hiring impact, specialization fit, and seniority relevance.
 * Produces three buckets: high / medium / low priority.
 */

// Per-skill intelligence: specialization weights (1-10) + market demand + affected dimension
const SKILL_INTEL = {
  'playwright':           { auto:10, api:7, sdet:10, hybrid:9, manual:9, perf:3, mobile:4, demand:'very_high', dimension:'automation_testing',  reason:'Most-requested modern automation tool in 2025 job postings' },
  'cypress':              { auto:9,  api:5, sdet:8,  hybrid:8, manual:8, perf:2, mobile:2, demand:'high',      dimension:'automation_testing',  reason:'Dominant JS automation framework with fast recruiter adoption' },
  'selenium':             { auto:7,  api:4, sdet:8,  hybrid:8, manual:8, perf:2, mobile:3, demand:'high',      dimension:'automation_testing',  reason:'Still the most-tested skill across enterprise QA job descriptions' },
  'jenkins':              { auto:9,  api:8, sdet:10, hybrid:9, manual:5, perf:8, mobile:7, demand:'high',      dimension:'ci_cd_readiness',     reason:'CI/CD via Jenkins is expected in 80%+ senior QA roles' },
  'github actions':       { auto:8,  api:7, sdet:9,  hybrid:8, manual:4, perf:6, mobile:6, demand:'very_high', dimension:'ci_cd_readiness',     reason:'GitHub Actions is the fastest-growing CI/CD tool in QA pipelines' },
  'docker':               { auto:7,  api:7, sdet:10, hybrid:7, manual:3, perf:7, mobile:6, demand:'high',      dimension:'ci_cd_readiness',     reason:'Dockerized test execution is an SDET-defining enterprise signal' },
  'rest assured':         { auto:7,  api:10,sdet:9,  hybrid:9, manual:5, perf:4, mobile:4, demand:'high',      dimension:'api_testing',         reason:'REST Assured is the top Java API testing library in enterprise QA' },
  'postman':              { auto:6,  api:8, sdet:7,  hybrid:8, manual:6, perf:3, mobile:4, demand:'high',      dimension:'api_testing',         reason:'Postman is the entry-level API testing tool — foundational signal' },
  'contract testing':     { auto:6,  api:9, sdet:8,  hybrid:7, manual:4, perf:3, mobile:3, demand:'medium',    dimension:'api_testing',         reason:'Contract testing signals advanced API QA thinking — rare differentiator' },
  'jmeter':               { auto:5,  api:4, sdet:6,  hybrid:5, manual:4, perf:10,mobile:3, demand:'medium',    dimension:'performance_testing', reason:'JMeter remains the standard for performance testing in enterprises' },
  'k6':                   { auto:5,  api:4, sdet:7,  hybrid:5, manual:3, perf:9, mobile:3, demand:'high',      dimension:'performance_testing', reason:'K6 is growing rapidly — modern performance engineers prefer it' },
  'appium':               { auto:8,  api:4, sdet:7,  hybrid:6, manual:5, perf:3, mobile:10,demand:'high',      dimension:'automation_testing',  reason:'Appium is the #1 mobile automation requirement in fintech/commerce roles' },
  'cucumber':             { auto:7,  api:5, sdet:7,  hybrid:7, manual:5, perf:3, mobile:4, demand:'medium',    dimension:'framework_expertise', reason:'BDD/Cucumber is the dominant collaboration pattern in Agile QA teams' },
  'testng':               { auto:7,  api:5, sdet:7,  hybrid:7, manual:4, perf:3, mobile:4, demand:'medium',    dimension:'framework_expertise', reason:'TestNG is the Java test runner expected across enterprise stacks' },
  'jira':                 { auto:5,  api:5, sdet:5,  hybrid:5, manual:7, perf:4, mobile:4, demand:'medium',    dimension:'bug_tracking',        reason:'JIRA is listed in nearly every QA job description' },
  'testrail':             { auto:6,  api:5, sdet:6,  hybrid:5, manual:7, perf:4, mobile:4, demand:'medium',    dimension:'bug_tracking',        reason:'TestRail shows structured test management experience' },
  'gatling':              { auto:4,  api:3, sdet:6,  hybrid:4, manual:2, perf:9, mobile:2, demand:'medium',    dimension:'performance_testing', reason:'Gatling adoption growing in banking and high-traffic QA teams' },
  'istqb':                { auto:4,  api:4, sdet:5,  hybrid:4, manual:6, perf:4, mobile:4, demand:'medium',    dimension:'certifications',      reason:'ISTQB certification is a recruiter trust signal that filters candidates' },
  'page object model':    { auto:8,  api:4, sdet:8,  hybrid:7, manual:3, perf:2, mobile:4, demand:'medium',    dimension:'framework_expertise', reason:'POM demonstrates automation architecture maturity' },
  'bdd':                  { auto:7,  api:5, sdet:7,  hybrid:7, manual:5, perf:2, mobile:3, demand:'medium',    dimension:'framework_expertise', reason:'BDD skills signal ability to collaborate with product teams' },
  'graphql testing':      { auto:5,  api:8, sdet:7,  hybrid:6, manual:3, perf:3, mobile:3, demand:'medium',    dimension:'api_testing',         reason:'GraphQL API testing is an emerging differentiator in modern stacks' },
  'kubernetes':           { auto:4,  api:4, sdet:8,  hybrid:5, manual:2, perf:7, mobile:5, demand:'medium',    dimension:'ci_cd_readiness',     reason:'Kubernetes knowledge signals senior SDET / DevOps QA awareness' },
};

const SPEC_KEY = { automation_qa:'auto', api_testing:'api', sdet:'sdet', hybrid_qa:'hybrid', manual_qa:'manual', performance_testing:'perf', mobile_testing:'mobile' };
const DEMAND_WEIGHT = { very_high: 10, high: 7, medium: 4, low: 1 };

const SENIORITY_SKIP = {
  fresher:   ['kubernetes', 'contract testing', 'gatling'],
  junior:    ['kubernetes'],
  mid_level: [],
  senior:    [],
  lead:      [],
};

/**
 * Rank missing skills into high / medium / low priority buckets.
 */
export function rankImprovementPriorities({ missingSkills = [], qa_specialization = 'manual_qa', qa_seniority = 'junior', qa_score_breakdown = {} }) {
  const specKey  = SPEC_KEY[qa_specialization] ?? 'manual';
  const skipList = SENIORITY_SKIP[qa_seniority] ?? [];

  const scored = [];

  for (const skill of missingSkills) {
    const key   = skill.toLowerCase();
    const intel = SKILL_INTEL[key];
    if (!intel) continue;

    // Skip skills inappropriate for seniority level
    if (skipList.includes(key)) continue;

    const specScore   = intel[specKey] ?? 3;
    const demandScore = DEMAND_WEIGHT[intel.demand] ?? 3;

    // Dimension gap score: how much room for improvement on this dimension
    const dim      = intel.dimension;
    const dimData  = qa_score_breakdown[dim];
    const dimGap   = dimData ? Math.round(((dimData.max - dimData.score) / dimData.max) * 10) : 5;

    const total = specScore * 0.45 + demandScore * 0.35 + dimGap * 0.2;

    scored.push({
      skill:              skill.charAt(0).toUpperCase() + skill.slice(1),
      dimension:          dim,
      priority_score:     Math.round(total * 10) / 10,
      recruiter_impact:   intel.demand === 'very_high' ? 'Very High' : intel.demand === 'high' ? 'High' : 'Medium',
      reason:             intel.reason,
    });
  }

  scored.sort((a, b) => b.priority_score - a.priority_score);

  return {
    high_priority:   scored.filter(s => s.priority_score >= 6.5).slice(0, 4),
    medium_priority: scored.filter(s => s.priority_score >= 4 && s.priority_score < 6.5).slice(0, 4),
    low_priority:    scored.filter(s => s.priority_score < 4).slice(0, 3),
  };
}
