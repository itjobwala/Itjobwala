/**
 * skillWeights.js — per-domain skill importance weights.
 *
 * Used by matching.service.js to:
 *  - prioritize domain-relevant skills in match scoring
 *  - downweight irrelevant skills so they don't skew gap analysis
 *
 * Scale: 10 = critical, 1 = low relevance, 0 = irrelevant noise
 */

export const DOMAIN_SKILL_WEIGHTS = {

  qa_testing: {
    // Core automation frameworks — highest priority
    selenium:             10,
    'selenium webdriver': 10,
    cypress:              10,
    playwright:           10,
    appium:               10,
    testng:                9,
    junit:                 9,
    webdriverio:           9,
    katalon:               8,

    // Test types & methodologies
    'automation testing':    9,
    'api testing':           9,
    'regression testing':    8,
    'performance testing':   8,
    bdd:                     8,
    cucumber:                8,
    'smoke testing':         7,
    'functional testing':    7,
    'manual testing':        7,
    'end-to-end testing':    7,
    'mobile testing':        7,
    'cross-browser testing': 6,
    'exploratory testing':   6,
    uat:                     6,

    // Performance & load tools
    jmeter:   9,
    gatling:  8,
    k6:       8,
    locust:   7,

    // API & integration tools
    postman:          8,
    'rest assured':   8,
    soapui:           6,

    // Test management
    testrail: 6,
    zephyr:   6,
    qtest:    5,
    jira:     6,

    // Patterns & strategy
    'page object model': 7,
    pom:                 7,
    'data-driven testing': 6,
    'test strategy':     6,
    'test plan':         6,
    sdlc:                5,
    stlc:                5,

    // Build & CI
    maven:   6,
    gradle:  5,
    'ci/cd': 6,
    docker:  5,
    jenkins: 5,
    git:     5,
    sql:     7,
    mysql:   5,

    // Programming (QA context — lower priority than QA-specific tools)
    java:         4,
    python:       4,
    javascript:   3,
    typescript:   3,

    // Irrelevant — frontend/backend noise
    react:     1,
    'next.js': 0.5,
    angular:   0.5,
    vue:       0.5,
    redux:     0.5,
    'node.js': 1,
    express:   0.5,
    fastify:   0.5,
    mongodb:   1,
    graphql:   0.5,
  },

  frontend: {
    react:          10,
    'next.js':      10,
    typescript:      9,
    css:             8,
    'tailwindcss':   8,
    vue:             8,
    angular:         8,
    redux:           7,
    vite:            6,
    jest:            7,
    cypress:         7,
    playwright:      6,
    accessibility:   6,
    graphql:         6,
    storybook:       5,
    // De-weight backend/infra
    docker:          2,
    kubernetes:      1,
    'node.js':       3,
  },

  backend: {
    'node.js':       10,
    postgresql:      9,
    typescript:      9,
    docker:          8,
    redis:           8,
    mongodb:         7,
    graphql:         7,
    'rest api':      8,
    prisma:          7,
    kubernetes:      6,
    aws:             7,
    jest:            6,
    nginx:           5,
    // De-weight frontend
    react:           2,
    css:             1,
  },
};

/**
 * Get the weight of a skill in the context of a given domain.
 * Defaults to 5 (neutral) if the skill or domain has no explicit weight.
 *
 * @param {string} skill  - Normalized skill string
 * @param {string} domain - Detected domain (e.g. 'qa_testing')
 * @returns {number}      - Weight 0–10
 */
export function getSkillWeight(skill, domain) {
  const table = DOMAIN_SKILL_WEIGHTS[domain];
  if (!table) return 5;
  return table[skill.toLowerCase()] ?? 5;
}

/**
 * Filter a missing-skills list to only include skills relevant for the given domain.
 * Removes skills that have weight ≤ 1 (irrelevant noise for this domain).
 *
 * @param {string[]} missingSkills
 * @param {string}   domain
 * @returns {string[]}
 */
export function filterRelevantGaps(missingSkills, domain) {
  return missingSkills.filter(skill => getSkillWeight(skill, domain) > 1);
}
