/**
 * Canonical tech-skill list used for extraction and gap analysis.
 * Grouped by category for future AI enrichment.
 */
export const SKILL_CATEGORIES = {
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'go',
    'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'dart', 'perl',
    'haskell', 'elixir', 'clojure', 'lua', 'bash', 'shell', 'powershell',
  ],
  frontend: [
    'react', 'react.js', 'nextjs', 'next.js', 'vue', 'vue.js', 'angular', 'svelte',
    'html', 'css', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap',
    'jquery', 'redux', 'zustand', 'mobx', 'webpack', 'vite', 'rollup', 'parcel',
    'storybook', 'cypress', 'playwright', 'jest', 'react testing library', 'graphql',
    'apollo', 'remix', 'gatsby', 'expo', 'react native',
  ],
  backend: [
    'node', 'node.js', 'nodejs', 'express', 'fastify', 'koa', 'nestjs', 'hapi',
    'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails', 'laravel',
    'asp.net', '.net', 'gin', 'fiber', 'echo', 'actix', 'axum',
    'graphql', 'rest', 'restful', 'grpc', 'websocket',
  ],
  databases: [
    'postgresql', 'postgres', 'mysql', 'mariadb', 'mongodb', 'redis', 'sqlite',
    'oracle', 'sql server', 'mssql', 'cassandra', 'dynamodb', 'firestore',
    'elasticsearch', 'influxdb', 'neo4j', 'supabase', 'planetscale',
    'knex', 'objection', 'sequelize', 'typeorm', 'prisma', 'drizzle', 'mongoose',
  ],
  cloud: [
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud',
    'ec2', 's3', 'rds', 'lambda', 'ecs', 'eks', 'fargate', 'cloudfront',
    'vercel', 'netlify', 'heroku', 'digitalocean', 'linode', 'railway',
  ],
  devops: [
    'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'github actions',
    'gitlab ci', 'circleci', 'travis ci', 'helm', 'nginx', 'apache', 'prometheus',
    'grafana', 'elk', 'datadog', 'splunk', 'ci/cd', 'devops',
    'jenkins pipeline', 'azure devops', 'kibana',
  ],
  mobile: [
    'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'expo',
    'xcode', 'android studio',
  ],
  ai_ml: [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'sklearn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
    'nlp', 'computer vision', 'llm', 'openai', 'langchain', 'huggingface',
    'transformers', 'bert', 'gpt', 'data science', 'data analysis',
  ],
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'trello',
    'figma', 'sketch', 'postman', 'swagger', 'linux', 'unix', 'macos',
    'vscode', 'intellij', 'vim', 'neovim',
  ],
  qa_testing: [
    // Manual & functional testing
    'manual testing', 'functional testing', 'regression testing', 'smoke testing',
    'sanity testing', 'exploratory testing', 'uat',
    'integration testing', 'system testing', 'end-to-end testing', 'e2e testing',
    'black box testing', 'white box testing', 'grey box testing',
    'cross-browser testing', 'compatibility testing', 'usability testing',
    'api testing', 'rest api testing', 'test plan preparation',
    'test case design', 'test strategy', 'test execution', 'traceability matrix',
    'requirement analysis',

    // Automation frameworks & tools
    // 'selenium webdriver' kept so the alias can map it; 'selenium' is the canonical form
    'selenium', 'selenium webdriver', 'selenium automation',
    'testng', 'junit', 'cucumber',
    'appium', 'webdriverio', 'katalon',
    'robot framework', 'codecept', 'nightwatch',
    // Playwright variants — aliases normalise all to canonical 'playwright'
    'playwright test', 'playwright automation', 'playwright ui testing',
    'playwright testing', 'playwright framework',

    // Automation patterns & architecture
    'page object model', 'data-driven testing', 'keyword-driven testing',
    'automation strategy', 'automation architecture',
    'framework development', 'framework maintenance',
    'automation framework design',

    // Performance & security testing
    'jmeter', 'gatling', 'locust', 'k6', 'blazemeter',
    'owasp', 'burp suite', 'zap', 'security testing', 'penetration testing',
    'performance testing', 'load testing', 'stress testing',

    // BDD & test management
    'bdd', 'tdd', 'gherkin', 'specflow',
    'testrail', 'zephyr', 'qtest', 'xray', 'testlink',

    // API testing & validation (expanded ecosystem)
    'api validation', 'schema validation', 'response validation', 'contract testing',
    'openapi', 'soapui', 'api mocking', 'api automation', 'api contract testing',
    'wiremock', 'pact', 'karate',

    // Mobile testing
    'mobile testing', 'android testing', 'ios testing', 'cross-platform testing',

    // CI/CD & methodologies
    'sdlc', 'stlc', 'agile testing', 'shift-left testing', 'ci testing',

    // Defect & release management
    'defect tracking', 'bug reporting', 'root cause analysis',
    'defect lifecycle', 'defect management',
    'release testing', 'release management', 'release readiness',
    'production validation',

    // Test reporting
    'test reporting', 'test summary report',

    // Database testing
    'database testing', 'database validation', 'data integrity testing',

    // Build & IDE tools (QA-context)
    'maven', 'gradle', 'eclipse', 'intellij idea',

    // SQL
    'sql',

    // Agile practices (standalone skill entries — aliases map variants to canonical)
    'agile scrum', 'agile methodology', 'scrum',
    'sprint planning', 'daily stand-up', 'retrospective',
    'sprint grooming', 'backlog refinement', 'release planning',

    // Messaging & event testing
    'event testing', 'message queue testing',

    // Containerization (canonical inferred skill + direct extraction)
    'containerization',

    // Broader QA coverage
    'mobile testing', 'automation testing',
  ],
  messaging: [
    'kafka', 'rabbitmq',
  ],
};

// Flat list for fast lookup (deduplicated — some skills appear in multiple categories)
export const ALL_SKILLS = [...new Set(Object.values(SKILL_CATEGORIES).flat())];

// Aliases: maps alternate spellings/abbreviations to canonical form
const ALIASES = {
  'react.js':               'react',
  'node.js':                'node.js',
  'nodejs':                 'node.js',
  'vue.js':                 'vue',
  'nextjs':                 'next.js',
  'postgres':               'postgresql',
  'golang':                 'go',
  'sklearn':                'scikit-learn',
  'k8s':                    'kubernetes',
  '.net':                   'asp.net',
  'tailwind':               'tailwindcss',

  // Selenium variant deduplication — all map to canonical 'selenium'
  'selenium webdriver':     'selenium',
  'selenium automation':    'selenium',

  // Playwright variant deduplication — all map to canonical 'playwright'
  'playwright testing':     'playwright',
  'playwright framework':   'playwright',
  'playwright automation':  'playwright',

  // Agile/Scrum deduplication — all map to canonical 'agile scrum'
  'agile methodology':      'agile scrum',
  'scrum':                  'agile scrum',

  // API ecosystem normalization
  'open api':               'openapi',
  'swagger ui':             'swagger',

  // CI/CD normalization
  'github workflow':        'github actions',
  'gitlab pipeline':        'gitlab ci',

  // Database normalization
  'mssql':                  'sql server',
  'oracle sql':             'oracle',

  // QA deduplication aliases
  'pom':                    'page object model',
  'sql queries':            'sql',
  'eclipse ide':            'eclipse',
  'user acceptance testing':'uat',
  'cucumber bdd':           'cucumber',
  'robotframework':         'robot framework',
};

/**
 * Skills where the standard word-boundary regex produces false positives in
 * natural language ("go to", "r and d", "C suite"). These require explicit
 * skill-list separators (comma, semicolon, newline, pipe) on both sides.
 */
const STRICT_SKILLS = new Set(['c', 'r', 'go']);

/**
 * Separator characters that delimit entries in a skill list.
 * Used to build the strict-skill regex.
 */
const LIST_SEP = String.raw`[,;:|/•·\n\r\t]`;

/**
 * Skill families — the canonical QA domain knowledge graph.
 *
 * Every skill belongs to exactly one family. Within a family, a category-level
 * skill (e.g. 'api testing') can be satisfied by any tool-level member (e.g.
 * 'swagger'), but a tool-level requirement is only satisfied by an exact match.
 *
 * To add a new skill: pick its family, add the string. FAMILY_LOOKUP and
 * SKILL_EQUIVALENTS regenerate automatically — no manual wiring needed.
 */
export const SKILL_FAMILIES = {
  automation_testing: [
    'automation testing', 'selenium', 'playwright', 'cypress',
    'appium', 'webdriverio', 'katalon',
  ],
  api_testing: [
    'api testing', 'postman', 'swagger', 'openapi', 'graphql',
    'soapui', 'rest assured', 'api validation', 'contract testing',
    'api contract testing', 'wiremock', 'pact', 'karate',
  ],
  mobile_testing: [
    'mobile testing', 'android', 'ios', 'android testing', 'ios testing',
  ],
  ci_cd_testing: [
    'ci testing', 'jenkins', 'jenkins pipeline', 'github actions',
    'gitlab ci', 'azure devops', 'circleci', 'travis ci',
  ],
  containerization: [
    'containerization', 'docker', 'kubernetes', 'helm',
  ],
  performance_testing: [
    'performance testing', 'load testing', 'stress testing',
    'jmeter', 'gatling', 'locust', 'k6', 'blazemeter',
  ],
  observability: [
    'grafana', 'prometheus', 'splunk', 'kibana', 'elasticsearch', 'elk', 'datadog',
  ],
  messaging: [
    'kafka', 'rabbitmq', 'event testing', 'message queue testing',
  ],
  database_testing: [
    'database testing', 'database validation', 'data integrity testing',
    'sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'sql server',
  ],
  agile: [
    'agile scrum', 'agile methodology', 'scrum', 'sprint planning',
    'daily stand-up', 'retrospective', 'backlog refinement',
  ],
  automation_framework: [
    'automation framework design', 'page object model', 'framework development',
    'framework maintenance', 'automation architecture',
  ],
};

/**
 * Category vs tool distinction.
 *
 * category — broad/abstract: a tool in the same family satisfies it.
 *            e.g. Job needs 'api testing' → resume has 'swagger' → satisfied.
 *
 * tool     — specific: ONLY an exact skill match satisfies it.
 *            e.g. Job needs 'swagger' → resume has 'api testing' → NOT satisfied.
 *
 * Unregistered skills default to 'tool' (conservative).
 */
export const SKILL_LEVELS = {
  // ── Category skills ──────────────────────────────────────────────────────
  'automation testing':      'category',
  'api testing':             'category',
  'mobile testing':          'category',
  'ci testing':              'category',
  'containerization':        'category',
  'performance testing':     'category',
  'load testing':            'category',
  'stress testing':          'category',
  'database testing':        'category',
  'agile scrum':             'category',
  'automation framework design': 'category',

  // ── Automation tools ─────────────────────────────────────────────────────
  'selenium': 'tool', 'playwright': 'tool', 'cypress': 'tool',
  'appium': 'tool', 'webdriverio': 'tool', 'katalon': 'tool',

  // ── API tools ────────────────────────────────────────────────────────────
  'postman': 'tool', 'swagger': 'tool', 'openapi': 'tool',
  'graphql': 'tool', 'soapui': 'tool', 'rest assured': 'tool',
  'api validation': 'tool', 'contract testing': 'tool',
  'api contract testing': 'tool', 'wiremock': 'tool', 'pact': 'tool', 'karate': 'tool',

  // ── Mobile platforms ─────────────────────────────────────────────────────
  'android': 'tool', 'ios': 'tool', 'android testing': 'tool', 'ios testing': 'tool',

  // ── CI/CD tools ──────────────────────────────────────────────────────────
  'jenkins': 'tool', 'jenkins pipeline': 'tool', 'github actions': 'tool',
  'gitlab ci': 'tool', 'azure devops': 'tool', 'circleci': 'tool', 'travis ci': 'tool',

  // ── Container tools ──────────────────────────────────────────────────────
  'docker': 'tool', 'kubernetes': 'tool', 'helm': 'tool',

  // ── Performance tools ────────────────────────────────────────────────────
  'jmeter': 'tool', 'gatling': 'tool', 'locust': 'tool', 'k6': 'tool', 'blazemeter': 'tool',

  // ── Observability tools ──────────────────────────────────────────────────
  'grafana': 'tool', 'prometheus': 'tool', 'splunk': 'tool', 'kibana': 'tool',
  'elasticsearch': 'tool', 'elk': 'tool', 'datadog': 'tool',

  // ── Messaging tools ──────────────────────────────────────────────────────
  'kafka': 'tool', 'rabbitmq': 'tool', 'event testing': 'tool', 'message queue testing': 'tool',

  // ── Database tools ───────────────────────────────────────────────────────
  'sql': 'tool', 'mysql': 'tool', 'postgresql': 'tool', 'mongodb': 'tool',
  'oracle': 'tool', 'sql server': 'tool',
  'database validation': 'tool', 'data integrity testing': 'tool',

  // ── Agile practices ──────────────────────────────────────────────────────
  'agile methodology': 'tool', 'scrum': 'tool', 'sprint planning': 'tool',
  'daily stand-up': 'tool', 'retrospective': 'tool', 'backlog refinement': 'tool',

  // ── Framework patterns ───────────────────────────────────────────────────
  'page object model': 'tool', 'framework development': 'tool',
  'framework maintenance': 'tool', 'automation architecture': 'tool',
};

/**
 * Reverse index: skill → family key. Auto-generated — do not edit manually.
 * When a skill belongs to multiple families, last-writer wins (add to the
 * most semantically primary family to control this).
 */
export const FAMILY_LOOKUP = Object.fromEntries(
  Object.entries(SKILL_FAMILIES).flatMap(([family, members]) =>
    members.map(skill => [skill, family])
  )
);

/**
 * Backward-compatible alias — generated from SKILL_FAMILIES.
 * Maps each category skill to the other members of its family.
 * Callers that imported SKILL_EQUIVALENTS continue to work unchanged.
 */
export const SKILL_EQUIVALENTS = Object.fromEntries(
  Object.entries(SKILL_FAMILIES)
    .flatMap(([, members]) => {
      const categorySkills = members.filter(m => SKILL_LEVELS[m] === 'category');
      return categorySkills.map(cat => [cat, members.filter(m => m !== cat)]);
    })
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalize a raw skill string to its canonical form.
 */
export function normalizeSkill(raw) {
  const lower = raw.trim().toLowerCase();
  return ALIASES[lower] ?? lower;
}

/**
 * Build a skill-matching regex.
 * Standard skills: word-boundary lookaround.
 * Strict skills (c, r, go): require a list separator on at least one side to
 * prevent false positives in natural-language sentences.
 */
function buildSkillRegex(skill) {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (STRICT_SKILLS.has(skill.toLowerCase())) {
    return new RegExp(
      `(?:^|${LIST_SEP})[ \\t]*${escaped}[ \\t]*(?=${LIST_SEP}|$)`,
      'im',
    );
  }
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
}

// ── Extraction ────────────────────────────────────────────────────────────────

/**
 * Extract all recognized skills from free text.
 * Returns a deduplicated, normalized skill array (including inferred skills).
 * Use extractSkillsWithConfidence() when you need source and evidence metadata.
 */
export function extractSkillsFromText(text) {
  if (!text) return [];

  const lower  = text.toLowerCase();
  const found  = new Set();

  // Sort by length DESC so multi-word skills match before single-word subsets
  const sorted = ALL_SKILLS.slice().sort((a, b) => b.length - a.length);

  for (const skill of sorted) {
    if (buildSkillRegex(skill).test(lower)) {
      found.add(normalizeSkill(skill));
    }
  }

  for (const inferred of inferSkills([...found])) {
    found.add(inferred);
  }

  return Array.from(found);
}

// ── Inference engine ──────────────────────────────────────────────────────────

/**
 * Infer implied skills from the set of directly extracted skills.
 * Returns the list of newly inferred skill names (not already present).
 *
 * Rule 1  — Automation tool + QA signal         → automation testing
 * Rule 2  — Mobile platform + QA signal          → mobile testing
 * Rule 3  — Selenium + TestNG/JUnit + POM         → automation framework design
 * Rule 4  — API tooling present                  → api testing
 * Rule 5  — Agile ceremony / agile scrum found   → agile scrum
 * Rule 6  — Playwright (unconditional)           → automation testing
 * Rule 7  — Cypress (unconditional)              → automation testing
 * Rule 9  — CI/CD tooling present               → ci testing
 * Rule 10 — Docker + Kubernetes                  → containerization
 */
export function inferSkills(foundSkills) {
  const found    = new Set(foundSkills.map(s => s.toLowerCase()));
  const inferred = [];

  function add(skill) {
    if (!found.has(skill)) inferred.push(skill);
  }

  // Rule 6 — Playwright alone implies real automation work (unconditional)
  if (found.has('playwright')) add('automation testing');

  // Rule 7 — Cypress alone implies real automation work (unconditional)
  if (found.has('cypress')) add('automation testing');

  // Rule 1 — other automation tools require at least one QA signal to prevent
  //           false positives from developer-tool-only resumes
  const AUTOMATION_TOOLS   = ['selenium', 'appium', 'webdriverio', 'katalon'];
  const AUTOMATION_SIGNALS = ['manual testing', 'functional testing', 'regression testing',
    'smoke testing', 'api testing', 'testng', 'junit', 'cucumber',
    'page object model', 'data-driven testing'];
  if (AUTOMATION_TOOLS.some(s => found.has(s)) && AUTOMATION_SIGNALS.some(s => found.has(s))) {
    add('automation testing');
  }

  // Rule 2 — mobile platform AND at least one QA/testing signal
  const MOBILE_PLATFORMS  = ['android', 'ios'];
  const MOBILE_QA_SIGNALS = ['manual testing', 'functional testing', 'regression testing',
    'smoke testing', 'appium'];
  if (MOBILE_PLATFORMS.some(s => found.has(s)) && MOBILE_QA_SIGNALS.some(s => found.has(s))) {
    add('mobile testing');
  }

  // Rule 3 — Selenium + TestNG/JUnit + POM → framework design
  if (found.has('selenium') &&
      (found.has('testng') || found.has('junit')) &&
      found.has('page object model')) {
    add('automation framework design');
  }

  // Rule 4 — Any API tooling present → api testing
  const API_TOOLS = ['postman', 'swagger', 'openapi', 'graphql', 'soapui', 'rest assured'];
  if (API_TOOLS.some(s => found.has(s))) {
    add('api testing');
  }

  // Rule 5 — Agile ceremonies OR canonical 'agile scrum' (from alias) → agile scrum
  const AGILE_TRIGGERS = ['sprint planning', 'daily stand-up', 'retrospective', 'agile scrum'];
  if (AGILE_TRIGGERS.some(s => found.has(s))) {
    add('agile scrum');
  }

  // Rule 9 — CI/CD tooling → ci testing
  const CICD_TOOLS = ['jenkins', 'jenkins pipeline', 'github actions', 'gitlab ci',
    'azure devops', 'circleci', 'travis ci'];
  if (CICD_TOOLS.some(s => found.has(s))) {
    add('ci testing');
  }

  // Rule 10 — Docker + Kubernetes → containerization
  if (found.has('docker') && found.has('kubernetes')) {
    add('containerization');
  }

  return inferred;
}

// ── Gap analysis ──────────────────────────────────────────────────────────────

/**
 * Categorize job skills into three buckets against a resume skill set.
 *
 *   exactMatch  — skill is literally present in the resume (after normalization)
 *   familyMatch — skill is category-level and a tool from its family is in the resume
 *   missing     — not satisfied by exact or family match
 *
 * Matching rules:
 *   • Category skill (job) + any family member (resume)  → familyMatch
 *   • Tool skill (job)     + category skill (resume)     → missing   ← key asymmetry
 *   • Tool skill (job)     + same tool (resume)          → exactMatch
 *   • Tool skill (job)     + different tool same family  → missing
 *
 * @param {string[]} jobSkills    Skills required by the job posting
 * @param {string[]} resumeSkills Skills extracted from the candidate resume
 * @returns {{ exactMatch: string[], familyMatch: string[], missing: string[] }}
 */
export function categorizeSkillMatch(jobSkills = [], resumeSkills = []) {
  const resumeNorm = new Set(resumeSkills.map(normalizeSkill));
  const exactMatch  = [];
  const familyMatch = [];
  const missing     = [];
  const seen        = new Set();

  for (const raw of jobSkills) {
    const s = normalizeSkill(raw);
    if (seen.has(s)) continue;
    seen.add(s);

    // 1. Exact match (highest confidence — always preferred)
    if (resumeNorm.has(s)) {
      exactMatch.push(s);
      continue;
    }

    // 2. Family match — only when job skill is category-level.
    //    A tool requirement can ONLY be satisfied by an exact match.
    const level = SKILL_LEVELS[s] ?? 'tool';
    if (level === 'category') {
      const family  = FAMILY_LOOKUP[s];
      const members = family ? (SKILL_FAMILIES[family] ?? []) : [];
      if (members.some(m => resumeNorm.has(normalizeSkill(m)))) {
        familyMatch.push(s);
        continue;
      }
    }

    missing.push(s);
  }

  return { exactMatch, familyMatch, missing };
}

/**
 * Compute skills present in a job but missing from the candidate's resume.
 * Returns only the missing array from categorizeSkillMatch for backward compat.
 */
export function computeMissingSkills(resumeSkills = [], jobSkills = []) {
  const { missing } = categorizeSkillMatch(jobSkills, resumeSkills);
  return missing;
}

// ── Extraction with confidence ────────────────────────────────────────────────

const SKILLS_HEADERS = [
  'technical skills', 'key skills', 'skills', 'tools', 'technologies', 'tech stack',
  'core competencies', 'expertise',
];
const EXPERIENCE_HEADERS = [
  'professional experience', 'work experience', 'employment history', 'experience',
  'career history', 'employment experience',
];
const PROJECT_HEADERS = [
  'projects', 'key projects', 'project experience', 'project work',
  'notable projects', 'personal projects',
];
const CERT_HEADERS = [
  'certifications', 'certificates', 'certification', 'accreditations',
];

const CONFIDENCE_BY_SOURCE = {
  experience: 95,
  project:    85,
  skills:     70,
  cert:       60,
  inferred:   75,
  unknown:    40,
};

// Implementation verbs that signal hands-on usage rather than passive mention
const IMPL_VERBS_EVIDENCE = [
  'developed', 'implemented', 'created', 'built', 'maintained',
  'automated', 'designed', 'executed', 'validated', 'prepared',
  'tested', 'wrote', 'authored', 'led', 'established', 'architected',
];

// Quantified metric patterns that signal measurable impact
const QUANT_EVIDENCE = /\d+[+%x]|\d+\s+(?:test|script|case|defect|bug|issue)/i;

function detectSections(lower) {
  const sections = [];
  const all = [
    ...SKILLS_HEADERS.map(h => ({ type: 'skills',     pattern: h })),
    ...EXPERIENCE_HEADERS.map(h => ({ type: 'experience', pattern: h })),
    ...PROJECT_HEADERS.map(h => ({ type: 'project',    pattern: h })),
    ...CERT_HEADERS.map(h => ({ type: 'cert',       pattern: h })),
  ];
  for (const { type, pattern } of all) {
    const idx = lower.indexOf(pattern);
    if (idx !== -1) sections.push({ type, start: idx });
  }
  return sections.sort((a, b) => a.start - b.start);
}

function sectionAt(idx, sections) {
  let current = 'unknown';
  for (const s of sections) {
    if (s.start <= idx) current = s.type;
    else break;
  }
  return current;
}

function contextWindow(lower, idx, len, size = 200) {
  return lower.slice(Math.max(0, idx - size), Math.min(lower.length, idx + len + size));
}

/**
 * Extract skills with per-skill source, confidence, and evidence-level metadata.
 *
 * Returns:
 *   extractedSkills  — flat normalized skill array (same as extractSkillsFromText)
 *   skillMetadata    — [{ skill, source, confidence, evidence_level }]
 *
 * Confidence rules (section-based):
 *   experience section  = 95   project section = 85
 *   skills section      = 70   certification   = 60
 *   inferred            = 75   multiple sects  = 100
 *
 * Evidence levels (quality-based):
 *   very_strong — experience/project + impl verb + measurable metric
 *   strong      — experience/project + impl verb
 *   moderate    — experience/project mention (no impl verb)
 *   basic       — skills section + one other section
 *   weak        — skills section only
 */
export function extractSkillsWithConfidence(text) {
  if (!text) return { extractedSkills: [], skillMetadata: [] };

  const lower    = text.toLowerCase();
  const sections = detectSections(lower);

  // Exact extraction (no inference) to distinguish inferred from directly found
  const exactFound = new Set();
  const sorted     = ALL_SKILLS.slice().sort((a, b) => b.length - a.length);
  for (const skill of sorted) {
    if (buildSkillRegex(skill).test(lower)) {
      exactFound.add(normalizeSkill(skill));
    }
  }

  const inferredSet = new Set(inferSkills([...exactFound]));
  const allSkills   = new Set([...exactFound, ...inferredSet]);

  const skillMetadata = Array.from(allSkills).map(skill => {
    if (inferredSet.has(skill)) {
      return { skill, source: 'inferred', confidence: CONFIDENCE_BY_SOURCE.inferred, evidence_level: 'inferred' };
    }

    // Find all occurrences of the skill in the text
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex   = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'ig');
    const sources = new Set();
    let   hasImplVerb = false;
    let   hasQuantMetric = false;
    let   m;

    while ((m = regex.exec(lower)) !== null) {
      const src = sectionAt(m.index, sections);
      sources.add(src);

      // Check context window for implementation verbs and quantified metrics
      const ctx = contextWindow(lower, m.index, skill.length);
      if (!hasImplVerb && IMPL_VERBS_EVIDENCE.some(v => ctx.includes(v)))  hasImplVerb    = true;
      if (!hasQuantMetric && QUANT_EVIDENCE.test(ctx))                      hasQuantMetric = true;
    }

    // Section-based confidence
    const best       = [...sources].reduce((a, b) =>
      (CONFIDENCE_BY_SOURCE[a] ?? 0) >= (CONFIDENCE_BY_SOURCE[b] ?? 0) ? a : b, 'unknown');
    const confidence = sources.size >= 2 ? 100 : (CONFIDENCE_BY_SOURCE[best] ?? 40);

    // Evidence level
    const inExpOrProj = sources.has('experience') || sources.has('project');
    let evidence_level;
    if      (inExpOrProj && hasImplVerb && hasQuantMetric) evidence_level = 'very_strong';
    else if (inExpOrProj && hasImplVerb)                   evidence_level = 'strong';
    else if (inExpOrProj)                                  evidence_level = 'moderate';
    else if (sources.has('skills') && sources.size >= 2)   evidence_level = 'basic';
    else                                                   evidence_level = 'weak';

    return { skill, source: best, confidence, evidence_level };
  });

  return {
    extractedSkills: skillMetadata.map(m => m.skill),
    skillMetadata,
  };
}
