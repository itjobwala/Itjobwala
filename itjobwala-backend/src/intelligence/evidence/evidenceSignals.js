/**
 * evidenceSignals.js — Constants for evidence-based ATS intelligence.
 * All pattern arrays and signal maps used across the evidence engine.
 */

// Verbs that indicate actual implementation (not passive listing)
export const IMPL_VERBS = new Set([
  'built', 'developed', 'created', 'designed', 'implemented', 'automated',
  'engineered', 'architected', 'established', 'deployed', 'migrated',
  'refactored', 'optimized', 'integrated', 'maintained', 'wrote', 'authored',
  'configured', 'set up', 'setup', 'owned', 'led', 'managed', 'drove',
  'delivered', 'shipped', 'launched', 'introduced', 'built from scratch',
  'developed from', 'created from', 'working with', 'using', 'leveraging',
  'utilized', 'applied', 'executed', 'performed', 'ran', 'scripted',
  // QA-specific execution verbs
  'prepared', 'verified', 'validated', 'tested', 'reviewed',
  'coordinated', 'logged', 'reported', 'tracked', 'documented',
  // Impact verbs — needed for quantified-impact sentences like "Reduced effort by 60%"
  'reduced', 'improved', 'increased', 'decreased', 'enhanced', 'accelerated',
]);

// Patterns indicating framework/architecture ownership (strong evidence)
export const ARCH_PATTERNS = [
  'from scratch', 'framework design', 'framework architecture', 'designed the',
  'built the framework', 'automation framework', 'reusable framework',
  'page object model', 'pom design', 'data-driven', 'keyword-driven',
  'hybrid framework', 'test architecture', 'automation strategy',
  'scalable', 'maintainable', 'modular', 'infrastructure', 'pipeline design',
  'framework from scratch', 'designed test', 'automation infrastructure',
  'test infrastructure', 'reusable components', 'framework structure',
  'designed automation', 'automation suite', 'core framework',
];

// Quantification patterns near a skill (strong evidence of real usage)
export const QUANT_PATTERNS = [
  /\d+\s*%/,
  /\$\s*\d+/,
  /\d+\+?\s*(test cases?|tests?|scenarios?|scripts?)/i,
  /reduced\s+(by\s+)?\d+/i,
  /improved\s+(by\s+)?\d+/i,
  /increased\s+(by\s+)?\d+/i,
  /\d+x\s+(faster|improvement|reduction)/i,
  /from\s+\d+\s+to\s+\d+/i,
  /saved\s+\d+/i,
  /\d+\s+hours?/i,
  /\d+\s+(team members?|engineers?|developers?)/i,
  /coverage\s+(of\s+)?\d+/i,
  /\d+\s+releases?/i,
  /\d+\+?\s*(bugs?|defects?|issues?)/i,
  /\d+\s+(minutes?|seconds?|ms)\s+reduction/i,
  /throughput|latency|tps|rps/i,
];

// CI/CD integration evidence near a skill
export const CICD_PATTERNS = [
  'jenkins', 'github actions', 'gitlab ci', 'circleci', 'pipeline',
  'ci/cd', 'ci pipeline', 'cd pipeline', 'build pipeline', 'deployment',
  'nightly run', 'nightly build', 'scheduled run', 'automated execution',
  'regression pipeline', 'test pipeline', 'docker', 'containerized',
  'dockerized', 'bamboo', 'travis', 'github workflow', '.github/workflows',
  'azure devops', 'azure pipeline', 'build server', 'artifact',
];

// SDET-specific gating signals (all required for SDET classification)
export const SDET_GATE = {
  architecture: [
    'framework', 'from scratch', 'architecture', 'designed', 'scalable',
    'reusable', 'infrastructure', 'test infrastructure', 'automation strategy',
    'framework design', 'modular', 'core framework',
  ],
  cicd: [
    'jenkins', 'pipeline', 'github actions', 'ci/cd', 'gitlab ci',
    'circleci', 'docker', 'kubernetes', 'build', 'deploy',
  ],
  coding: [
    'java', 'python', 'javascript', 'typescript', 'c#', 'kotlin',
    'coding', 'programming', 'code review', 'pull request', 'git',
    'version control', 'object oriented', 'oop', 'design pattern',
  ],
  enterprise: [
    'enterprise', 'large scale', 'microservices', 'distributed', 'parallel',
    'cross-browser', 'multi-environment', 'cloud', 'selenium grid',
    'browserstack', 'lambdatest', 'docker grid',
  ],
};

// Skills section header patterns — content here = "listed only"
export const SKILLS_SECTION_HEADERS = [
  'technical skills', 'key skills', 'skills', 'tools', 'technologies',
  'expertise', 'core competencies', 'competencies', 'tech stack',
  'skill set', 'tools & technologies', 'tools and technologies',
  'technical expertise', 'technology stack',
];

// Experience section header patterns
export const EXPERIENCE_SECTION_HEADERS = [
  'professional experience', 'work experience', 'employment history',
  'experience', 'career history', 'work history', 'professional background',
  'employment experience',
];

// Project section header patterns
export const PROJECT_SECTION_HEADERS = [
  'projects', 'personal projects', 'key projects', 'notable projects',
  'academic projects', 'project experience', 'project work',
  'professional projects', 'side projects',
];

// QA skills to track for evidence (subset of most recruiter-relevant)
// Includes category/inferred skills so evidence inheritance can promote them.
export const TRACKED_QA_SKILLS = [
  // Automation tools
  'selenium', 'playwright', 'cypress', 'appium', 'testng', 'junit',
  'webdriverio', 'katalon', 'rest assured', 'postman', 'jmeter', 'k6',
  'gatling', 'jenkins', 'github actions', 'docker', 'kubernetes',
  'cucumber', 'jira', 'testrail', 'zephyr', 'pytest', 'specflow',
  'allure', 'extent reports', 'bdd', 'page object model',
  'contract testing', 'graphql testing', 'swagger', 'data-driven testing',
  // API tools
  'api validation', 'api testing',
  // Performance & perf testing
  'performance testing',
  // Mobile platforms + testing
  'android', 'ios', 'mobile testing', 'android testing', 'ios testing',
  // Manual & regression
  'manual testing', 'regression testing', 'smoke testing', 'exploratory testing',
  // Category skills — tracked so evidence inheritance can assign them a level
  'automation testing', 'automation framework design',
  'agile scrum', 'ci testing',
];

// Signals that indicate copy-paste / keyword dump (list-like context)
export const LISTLIKE_SIGNALS = {
  highCommaDensity: 0.15,  // commas per word > this = list
  lowVerbDensity: 0.02,    // verbs per word < this = no action
  shortContext: 40,         // fewer chars around = sparse context
};

// Evidence level thresholds
export const EVIDENCE_THRESHOLDS = {
  strong:   70,
  moderate: 45,
  basic:    20,
  weak:     0,
};

// Calibration deltas by trust score band
// Reduced range: evidence calibrates scores, it does not destroy them.
// Worst-case: -12. Best-case: +10. (was -24 to +13)
export const CALIBRATION_DELTAS = {
  veryHigh:  { min: 85, delta: +5  },
  high:      { min: 70, delta: +3  },
  neutral:   { min: 55, delta:  0  },
  low:       { min: 38, delta: -4  },
  veryLow:   { min:  0, delta: -8  },
};

// Inflation risk penalties — halved to prevent recursive amplification
export const INFLATION_PENALTIES = {
  high:     -4,
  moderate: -2,
  low:      -1,
  none:      0,
};

/**
 * Evidence map for skills whose real-world usage is described via synonyms
 * rather than the skill name itself.
 *
 * `phrases`            — any of these in experience/project text confirms the skill was used
 * `achievement_phrases`— stronger proof: UAT delivery gates, defect lifecycle tools, etc.
 *                        When found in experience text they set quantified_impact = true,
 *                        which (combined with experience presence) pushes evidence → strong.
 */
export const EVIDENCE_MAP = {
  'manual testing': {
    phrases: [
      'manual testing', 'functional testing', 'test case', 'test cases',
      'test scenario', 'test scenarios', 'test execution', 'test planning',
      'test plan', 'exploratory testing', 'manual test',
    ],
    achievement_phrases: [
      'uat', 'user acceptance testing',
      'defect tracking', 'bug tracking', 'jira',
      'defect lifecycle', 'defect reporting', 'bug reporting',
    ],
  },
  'regression testing': {
    phrases: [
      'regression testing', 'regression suite', 'regression pack',
      'regression effort', 'regression coverage', 'regression test',
      'regression automation',
    ],
    achievement_phrases: [],
  },
  'smoke testing': {
    phrases: [
      'smoke testing', 'smoke suite', 'smoke test',
      'smoke',
      'sanity testing', 'sanity test', 'sanity',
    ],
    achievement_phrases: [],
  },
  'data-driven testing': {
    phrases: [
      'data-driven testing', 'data driven testing',
      'data-driven', 'data driven',
      'data-driven strategy', 'data-driven strategies',
      'data driven framework', 'data-driven framework',
      'data driven approach', 'data-driven approach',
    ],
    achievement_phrases: [],
  },
  'exploratory testing': {
    phrases: [
      'exploratory testing', 'exploratory test',
      'ad hoc testing', 'ad-hoc testing',
    ],
    achievement_phrases: [],
  },
  'automation framework design': {
    phrases: [
      'automation framework design',
      'automation framework',
      'test automation framework',
      'framework architecture',
      'automation architecture',
      'built selenium framework',
      'developed automation framework',
    ],
    achievement_phrases: [],
  },
  'mobile testing': {
    phrases: [
      'mobile testing',
      'mobile application testing',
      'mobile app testing',
      'android testing',
      'ios testing',
      'android and ios testing',
      'cross platform testing',
      'cross-platform testing',
      'cross-platform mobile',
    ],
    achievement_phrases: [],
  },
};

/**
 * Returns the evidence phrase list for a skill.
 * Falls back to [skill] for skills without an EVIDENCE_MAP entry.
 *
 * Single source of truth: both skillEvidenceExtractor and skillRecencyAnalyzer
 * import this function so phrase sets can never drift apart.
 */
export function getEvidencePhrases(skill) {
  const entry = EVIDENCE_MAP[skill];
  return entry ? [...entry.phrases] : [skill];
}

/**
 * Evidence families for inheritance.
 *
 * Maps each category/inferred skill to the concrete child skills that prove it.
 * After per-skill evidence is scored, applyEvidenceInheritance() promotes a
 * parent's evidence level if enough children have strong evidence.
 *
 * Promotion rules:
 *   ≥2 strong children  → parent becomes strong
 *   1  strong child      → parent becomes moderate
 *   only basic/moderate  → parent becomes basic
 *   no child evidence    → parent unchanged (stays weak / skills-section-only)
 */
export const EVIDENCE_FAMILIES = {
  'automation testing': [
    'selenium', 'playwright', 'cypress', 'appium', 'webdriverio', 'katalon',
    'testng', 'junit',  // test-execution frameworks — prove automation testing capability
  ],
  'automation framework design': [
    'selenium', 'testng', 'junit', 'page object model', 'data-driven testing',
  ],
  'api testing': [
    'postman', 'rest assured', 'swagger', 'openapi', 'soapui',
    'api validation', 'contract testing',
  ],
  'mobile testing': [
    'android', 'ios', 'android testing', 'ios testing',
  ],
  'agile scrum': [
    'sprint planning', 'daily stand-up', 'retrospective',
  ],
  'ci testing': [
    'jenkins', 'jenkins pipeline', 'github actions', 'gitlab ci', 'azure devops',
  ],
};
