import { skillMatches } from './skillMatcher.js';

/**
 * qaSpecialization.js — Phase 1: QA Specialization Detection
 *
 * Outputs one of:
 *   sdet | automation_qa | api_qa | mobile_qa | performance_qa | hybrid_qa | manual_qa
 *
 * SDET requires framework-architecture signals and outweighs other types.
 * hybrid_qa fires when automation + API are both meaningfully present.
 * manual_qa is the fallback — only wins when no tooling detected.
 */

const PROFILES = {
  sdet: {
    keywords: ['sdet', 'software development engineer in test', 'framework architecture',
      'reusable framework', 'automation strategy', 'parallel execution',
      'ci/cd integration', 'test infrastructure', 'automation framework design',
      'framework from scratch', 'test automation architect'],
    textPhrases: ['reusable test', 'automation infrastructure', 'test framework architecture',
      'pipeline integration', 'dockerized test', 'designed the framework',
      'built the automation framework'],
    weight: 1.7,
  },
  automation_qa: {
    keywords: ['selenium', 'cypress', 'playwright', 'testng', 'junit', 'webdriverio', 'katalon',
      'automation framework', 'regression automation', 'test automation', 'webdriver'],
    textPhrases: ['automated regression', 'automation suite', 'ui automation', 'e2e automation',
      'cross-browser automation', 'selenium grid'],
    weight: 1.0,
  },
  // Keys renamed: api_qa → api_testing, mobile_qa → mobile_testing,
  // performance_qa → performance_testing for consistency with QA domain vocabulary.
  api_testing: {
    keywords: ['postman', 'rest assured', 'api testing', 'swagger', 'contract testing',
      'api automation', 'schema validation', 'graphql testing', 'soapui'],
    textPhrases: ['api test suite', 'backend testing', 'service testing', 'api validation',
      'api test automation', 'rest api testing'],
    weight: 1.1,
  },
  mobile_testing: {
    keywords: ['appium', 'android testing', 'ios testing', 'real device testing',
      'mobile automation', 'espresso', 'xcuitest', 'mobile testing'],
    textPhrases: ['android app testing', 'ios app testing', 'mobile test suite',
      'device farm', 'real device', 'mobile regression'],
    weight: 1.4,
  },
  performance_testing: {
    keywords: ['jmeter', 'k6', 'gatling', 'locust', 'blazemeter',
      'load testing', 'stress testing', 'performance testing', 'endurance testing'],
    textPhrases: ['load test suite', 'performance benchmarks', 'throughput testing',
      'sla validation', 'performance regression'],
    weight: 1.4,
  },
  manual_qa: {
    keywords: ['manual testing', 'test cases', 'test plan', 'exploratory testing',
      'functional testing', 'uat', 'acceptance testing', 'test execution'],
    textPhrases: ['test case execution', 'manual test', 'exploratory test session',
      'wrote test cases', 'executed test cases'],
    weight: 0.55,
  },
};

function scoreProfile(skills, text, profile) {
  const skillHits = profile.keywords.filter(kw =>
    skills.some(s => skillMatches(s, kw))
  ).length;
  const textHits = profile.textPhrases.filter(p => text.includes(p)).length;
  return (skillHits + textHits * 0.6) * profile.weight;
}

/**
 * Detect the primary QA specialization from skills and resume text.
 *
 * @returns {{ qa_specialization: string, specialization_confidence: number }}
 */
export function detectQaSpecialization(extractedSkills = [], parsedText = '') {
  const skills = extractedSkills.map(s => s.toLowerCase());
  const text   = parsedText.toLowerCase();

  const scores = {};
  for (const [type, profile] of Object.entries(PROFILES)) {
    scores[type] = scoreProfile(skills, text, profile);
  }

  const sdetScore  = scores.sdet          ?? 0;
  const autoScore  = scores.automation_qa ?? 0;
  const apiScore   = scores.api_testing   ?? 0;

  // SDET requires genuine framework-ownership evidence — not just 2 keyword hits.
  //
  // Threshold: sdetScore > 4 (2 keywords × 1.7 weight = 3.4 — NOT enough).
  // A candidate needs ≥3 distinct SDET keywords OR 2 keywords + architecture text phrases
  // to cross the threshold, preventing accidental SDET from parallel_execution + ci/cd only.
  //
  // Dominance: SDET must also clearly outweigh automation_qa (≥1.0× not 0.8×) — a strong
  // automation QA who added SDET keywords stays automation_qa. The SDET gate in
  // evidenceConfidence.js provides a second evidence-based check after this.
  if (sdetScore > 4 && sdetScore >= autoScore * 1.0) {
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    return {
      qa_specialization:        'sdet',
      specialization_confidence: Math.min(95, Math.round((sdetScore / total) * 100 * 1.4)),
    };
  }

  // hybrid_qa: meaningful breadth across automation + API
  if (autoScore >= 2 && apiScore >= 1.5 && autoScore + apiScore > sdetScore * 1.2) {
    const hybridStrength = (autoScore + apiScore) / 2;
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    return {
      qa_specialization:        'hybrid_qa',
      specialization_confidence: Math.min(90, Math.round((hybridStrength / total) * 100 * 1.3)),
    };
  }

  // Highest raw score wins — but sdet is excluded here because it didn't pass the
  // evidence gate above. Without the exclusion, a candidate with 2 SDET keywords
  // (score 3.4) would win via this path even though the gate blocked the SDET branch.
  const sorted = Object.entries(scores)
    .filter(([type]) => type !== 'sdet')
    .sort(([, a], [, b]) => b - a);

  const [topType, topScore] = sorted[0] ?? ['manual_qa', 0];

  if (topScore === 0) {
    return { qa_specialization: 'manual_qa', specialization_confidence: 20 };
  }

  // Confidence = dominance over second place
  const secondScore = sorted[1]?.[1] ?? 0;
  const dominance   = topScore / (topScore + secondScore + 0.01);
  const confidence  = Math.min(92, Math.round(dominance * 88));

  return { qa_specialization: topType, specialization_confidence: confidence };
}
