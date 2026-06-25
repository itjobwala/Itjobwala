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

// Individual title patterns — any one match = confirmed QA title.
// Split into simple patterns so partial titles like "QA Automation Engineer"
// (where "Automation" sits between "QA" and "Engineer") still match.
const QA_TITLE_PATTERNS = [
  /\bquality\s+assurance\b/i,
  /\bquality\s+(?:analyst|engineer|lead|tester|specialist|control)\b/i,
  /\bqa\s+(?:engineer|lead|analyst|tester|manager|specialist|architect|automation|professional)\b/i,
  /\bqa\b.{0,30}\b(?:engineer|analyst|tester|lead)\b/i,  // "QA <words> Engineer"
  /\bsdet\b/i,
  /\bsoftware\s+development\s+engineer\s+in\s+test\b/i,
  /\btest\s+(?:engineer|lead|analyst|manager|architect)\b/i,
  /\btest\s+automation\b/i,
  /\bautomation\s+(?:engineer|tester|lead|architect|qa|specialist)\b/i,
  /\bautomation\s+test\b/i,
  /\bsoftware\s+(?:tester|quality\s+engineer)\b/i,
  /\bmanual\s+tester\b/i,
  /\bperformance\s+test(?:er|ing|s)?\b/i,
];

// QA-specific vocabulary — phrases that appear naturally in QA resumes regardless
// of job title. 3+ distinct hits → treat as QA professional.
const QA_VOCABULARY_PATTERNS = [
  /\btest\s+cases?\b/i,
  /\btest\s+plan\b/i,
  /\btest\s+strategy\b/i,
  /\bregression\s+test/i,
  /\bmanual\s+test/i,
  /\bfunctional\s+test/i,
  /\bsmoke\s+test/i,
  /\bdefect\s+(?:tracking|report|management|lifecycle)\b/i,
  /\bbug\s+(?:report|tracking|life\s*cycle)\b/i,
  /\bquality\s+assurance\b/i,
  /\bstlc\b/i,
  /\btestng\b/i,
  /\bselenium\b/i,
  /\bplaywright\b/i,
  /\bcypress\b/i,
  /\bappium\b/i,
  /\bjmeter\b/i,
  /\bapi\s+test/i,
  /\bpage\s+object\s+model\b/i,
  /\btest\s+execution\b/i,
  /\btest\s+script/i,
];

function hasQaRoleSignal(text = '') {
  // Pass 1: look for a recognised QA job title in the first 30 lines
  const headerText = text.split('\n').slice(0, 30).join('\n');
  if (QA_TITLE_PATTERNS.some(re => re.test(headerText))) return true;

  // Pass 2: vocabulary density — 3+ distinct QA phrases anywhere in the resume
  const hits = QA_VOCABULARY_PATTERNS.filter(re => re.test(text)).length;
  return hits >= 3;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Detect the dominant skill domain from an array of skills.
 *
 * @param {string[]}  skills     - Extracted or job skill strings (raw, any case)
 * @param {string}   [parsedText] - Optional raw resume text; when provided, a
 *                                  QA role title in the header forces qa_testing
 *                                  regardless of skill score distribution.
 * @returns {{ domain: string, confidence: number, label: string }}
 */
export function detectSkillDomain(skills = [], parsedText = '') {
  // Title-based shortcut: if the resume header declares a QA role, trust it.
  // This prevents misclassification when the candidate lists non-QA tech skills.
  if (parsedText && hasQaRoleSignal(parsedText)) {
    const label = getQASpecialization(skills.map(s => s.toLowerCase().trim()))
      ?? DOMAIN_LABELS.qa_testing;
    return { domain: 'qa_testing', confidence: 90, label };
  }

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

  // Guard: if the top domain is not qa_testing and every matched keyword is a
  // common word that appears in non-resume documents (train tickets, receipts,
  // etc.), return general instead of a false high-confidence domain match.
  const NON_QA_GENERIC = new Set([
    'express', 'rails', 'net', 'asp.net', '.net',
    'spring', 'rest api', 'hapi', 'orm', 'grpc',
    'android', 'ios', 'mobile development',
  ]);
  const topResult = domainScores[0];
  if (topResult.domain !== 'qa_testing' && topResult.hits > 0) {
    const hitKeywords = DOMAIN_SIGNATURES[topResult.domain].filter(kw =>
      normalized.some(s => skillMatches(s, kw))
    );
    if (hitKeywords.every(kw => NON_QA_GENERIC.has(kw))) {
      return { domain: 'general', confidence: 0, label: DOMAIN_LABELS.general };
    }
  }

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
    type:  spec.type,
    label: spec.label,
    hits:  spec.keywords.filter(kw =>
      normalizedSkills.some(s => skillMatches(s, kw))
    ).length,
  })).filter(s => s.hits > 0).sort((a, b) => {
    // Automation beats manual on equal hits — it's the higher-value signal
    if (b.hits === a.hits) {
      if (a.type === 'automation') return -1;
      if (b.type === 'automation') return  1;
    }
    return b.hits - a.hits;
  });

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
