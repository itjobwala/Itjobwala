/**
 * domainDetection.js — infer the dominant skill domain from a skills list.
 *
 * Used by the ATS engine and matching service to make domain-aware decisions.
 * AI-ready: replace with embedding-based classifier when available.
 */

import { skillMatches } from './skillMatcher.js';

// ── Domain keyword signatures ─────────────────────────────────────────────────

const DOMAIN_SIGNATURES = {
  qa_testing: [
    'selenium', 'selenium webdriver', 'cypress', 'playwright', 'appium', 'webdriverio',
    'katalon', 'testng', 'junit', 'cucumber', 'bdd', 'specflow', 'rest assured',
    'jmeter', 'gatling', 'k6', 'locust', 'blazemeter', 'postman', 'soapui',
    'manual testing', 'automation testing', 'functional testing', 'regression testing',
    'smoke testing', 'sanity testing', 'api testing', 'performance testing',
    'mobile testing', 'cross-browser testing', 'uat', 'exploratory testing',
    'integration testing', 'system testing', 'e2e testing', 'end-to-end testing',
    'page object model', 'pom', 'data-driven testing', 'keyword-driven testing',
    'sdlc', 'stlc', 'test plan', 'test strategy', 'defect tracking', 'bug tracking',
    'testrail', 'zephyr', 'qtest', 'xray', 'maven', 'quality assurance',
    'test automation', 'load testing', 'stress testing', 'security testing', 'sdet',
  ],
  frontend: [
    'react', 'vue', 'angular', 'svelte', 'next.js', 'remix', 'gatsby',
    'html', 'css', 'tailwindcss', 'sass', 'bootstrap', 'material ui',
    'redux', 'zustand', 'mobx', 'webpack', 'vite', 'rollup',
    'storybook', 'figma', 'responsive design', 'accessibility', 'web components',
  ],
  backend: [
    'node.js', 'express', 'fastify', 'nestjs', 'koa', 'hapi',
    'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails', 'laravel',
    'asp.net', '.net', 'grpc', 'websocket', 'microservices',
    'rest api', 'orm', 'prisma', 'typeorm', 'sequelize',
  ],
  devops: [
    'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins',
    'github actions', 'gitlab ci', 'circleci', 'helm', 'prometheus', 'grafana',
    'nginx', 'apache', 'elk', 'datadog', 'splunk', 'ci/cd', 'devops',
    'linux', 'bash', 'shell scripting', 'infrastructure as code', 'sre',
  ],
  cloud: [
    'aws', 'azure', 'gcp', 'google cloud', 'amazon web services',
    'ec2', 's3', 'lambda', 'rds', 'ecs', 'eks', 'cloudfront',
    'vercel', 'netlify', 'digitalocean', 'serverless', 'cloud architecture',
  ],
  mobile: [
    'android', 'ios', 'flutter', 'react native', 'swift', 'kotlin',
    'xcode', 'android studio', 'expo', 'mobile development', 'objective-c',
  ],
  ai_ml: [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'pandas', 'numpy', 'nlp', 'computer vision', 'llm',
    'openai', 'langchain', 'data science', 'data analysis', 'transformers',
    'bert', 'gpt', 'huggingface', 'feature engineering',
  ],
};

// QA sub-specialization clusters
const QA_SPECIALIZATIONS = [
  { type: 'automation',   label: 'QA Automation Engineer',    keywords: ['selenium', 'cypress', 'playwright', 'appium', 'webdriverio', 'testng', 'junit', 'test automation', 'sdet'] },
  { type: 'performance',  label: 'Performance Test Engineer',  keywords: ['jmeter', 'gatling', 'k6', 'locust', 'performance testing', 'load testing', 'stress testing', 'blazemeter'] },
  { type: 'mobile',       label: 'Mobile QA Engineer',         keywords: ['appium', 'mobile testing', 'android', 'ios', 'xcuitest', 'espresso'] },
  { type: 'api',          label: 'API Test Engineer',           keywords: ['api testing', 'rest assured', 'postman', 'soapui', 'rest api testing', 'contract testing'] },
  { type: 'manual',       label: 'Manual QA Analyst',          keywords: ['manual testing', 'exploratory testing', 'uat', 'functional testing', 'test case design'] },
];

export const DOMAIN_LABELS = {
  qa_testing: 'QA / Test Engineer',
  frontend:   'Frontend Developer',
  backend:    'Backend Developer',
  devops:     'DevOps Engineer',
  cloud:      'Cloud Engineer',
  mobile:     'Mobile Developer',
  ai_ml:      'AI / ML Engineer',
  general:    'Software Engineer',
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Detect the dominant skill domain from an array of skills.
 *
 * @param {string[]} skills - Extracted or job skill strings (raw, any case)
 * @returns {{ domain: string, confidence: number, label: string }}
 */
export function detectSkillDomain(skills = []) {
  if (!skills.length) {
    return { domain: 'general', confidence: 0, label: DOMAIN_LABELS.general };
  }

  const normalized = skills.map(s => s.toLowerCase().trim());

  // Count how many signature keywords each domain matches
  const domainScores = Object.entries(DOMAIN_SIGNATURES).map(([domain, keywords]) => {
    const hits = keywords.filter(kw =>
      normalized.some(s => skillMatches(s, kw))
    ).length;

    // QA gets a 1.6× boost — ItJobwala is a QA-first platform
    const boost = domain === 'qa_testing' ? 1.6 : 1.0;
    return { domain, hits, score: hits * boost };
  });

  domainScores.sort((a, b) => b.score - a.score);
  const top = domainScores[0];

  if (top.hits === 0) {
    return { domain: 'general', confidence: 0, label: DOMAIN_LABELS.general };
  }

  // Confidence: ratio of domain hits to total resume skills, scaled up
  const rawConfidence = Math.round((top.hits / normalized.length) * 250);
  // Floor: 3+ hits → 60%, 5+ hits → 75%
  const minConf = top.hits >= 5 ? 75 : top.hits >= 3 ? 60 : 45;
  const confidence = Math.min(Math.max(rawConfidence, minConf), 97);

  const label = top.domain === 'qa_testing'
    ? (getQASpecialization(normalized) ?? DOMAIN_LABELS.qa_testing)
    : (DOMAIN_LABELS[top.domain] ?? DOMAIN_LABELS.general);

  return { domain: top.domain, confidence, label };
}

/**
 * Within the QA domain, detect the most specific sub-specialization.
 */
function getQASpecialization(normalizedSkills) {
  const ranked = QA_SPECIALIZATIONS.map(spec => ({
    label: spec.label,
    hits: spec.keywords.filter(kw =>
      normalizedSkills.some(s => skillMatches(s, kw))
    ).length,
  })).filter(s => s.hits > 0).sort((a, b) => b.hits - a.hits);

  return ranked.length ? ranked[0].label : null;
}

/**
 * Return the domain-specific HIGH_VALUE skill pool for gap analysis.
 * Used by ats.service.js to compute relevant missing skills.
 */
export function getDomainSkillPool(domain) {
  const pools = {
    qa_testing: [
      'selenium', 'cypress', 'playwright', 'appium', 'testng', 'junit', 'cucumber',
      'bdd', 'jmeter', 'postman', 'rest assured', 'api testing', 'regression testing',
      'smoke testing', 'automation testing', 'selenium webdriver', 'webdriverio',
      'performance testing', 'mobile testing', 'cross-browser testing',
      'sql', 'jira', 'ci/cd', 'docker', 'git', 'maven', 'gradle',
      'testrail', 'zephyr', 'page object model', 'data-driven testing',
    ],
    frontend: [
      'react', 'next.js', 'typescript', 'tailwindcss', 'vue', 'angular',
      'redux', 'graphql', 'jest', 'cypress', 'storybook', 'figma',
      'webpack', 'vite', 'css', 'sass', 'accessibility',
    ],
    backend: [
      'node.js', 'typescript', 'postgresql', 'mongodb', 'redis', 'docker',
      'kubernetes', 'aws', 'graphql', 'rest api', 'jest', 'prisma',
      'nginx', 'elasticsearch', 'rabbitmq', 'grpc',
    ],
    devops: [
      'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions',
      'prometheus', 'grafana', 'elk', 'nginx', 'aws', 'azure', 'helm',
      'bash', 'linux', 'ci/cd', 'sre', 'datadog',
    ],
    cloud: [
      'aws', 'azure', 'gcp', 'terraform', 'docker', 'kubernetes',
      'lambda', 's3', 'rds', 'cloudfront', 'iam', 'vpc',
      'serverless', 'ci/cd', 'monitoring',
    ],
    mobile: [
      'react native', 'flutter', 'swift', 'kotlin', 'android', 'ios',
      'expo', 'xcode', 'android studio', 'firebase', 'appium',
      'push notifications', 'in-app purchases',
    ],
    ai_ml: [
      'python', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
      'nlp', 'computer vision', 'llm', 'langchain', 'huggingface',
      'sql', 'spark', 'kafka', 'aws', 'mlflow', 'airflow',
    ],
  };

  return pools[domain] ?? [
    // General fallback pool
    'react', 'node.js', 'typescript', 'python', 'postgresql', 'mongodb',
    'docker', 'kubernetes', 'aws', 'git', 'redis', 'graphql',
    'next.js', 'tailwindcss', 'github actions', 'ci/cd', 'restful',
    'jest', 'linux', 'sql', 'express', 'fastify', 'prisma',
    'terraform', 'elasticsearch', 'nginx', 'websocket',
  ];
}
