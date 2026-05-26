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
};

// Flat list for fast lookup
export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

// Aliases: maps alternate spellings to canonical form
const ALIASES = {
  'react.js':  'react',
  'node.js':   'node.js',
  'nodejs':    'node.js',
  'vue.js':    'vue',
  'nextjs':    'next.js',
  'postgres':  'postgresql',
  'golang':    'go',
  'sklearn':   'scikit-learn',
  'k8s':       'kubernetes',
  '.net':      'asp.net',
  'tailwind':  'tailwindcss',
};

/**
 * Normalize a raw skill string to its canonical form.
 */
export function normalizeSkill(raw) {
  const lower = raw.trim().toLowerCase();
  return ALIASES[lower] || lower;
}

/**
 * Extract all recognized skills from free text.
 * Returns deduplicated, normalized skill names.
 */
export function extractSkillsFromText(text) {
  if (!text) return [];

  const lower   = text.toLowerCase();
  const found   = new Set();

  // Sort by length DESC so multi-word skills match before single-word subsets
  const sorted  = ALL_SKILLS.slice().sort((a, b) => b.length - a.length);

  for (const skill of sorted) {
    // Word-boundary-aware match
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex   = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
    if (regex.test(lower)) {
      found.add(normalizeSkill(skill));
    }
  }

  return Array.from(found);
}

/**
 * Compute skills present in a job but missing from the candidate's resume.
 */
export function computeMissingSkills(resumeSkills = [], jobSkills = []) {
  const normalized = new Set(resumeSkills.map(normalizeSkill));
  const seen = new Set();
  const result = [];
  for (const s of jobSkills.map(normalizeSkill)) {
    if (!normalized.has(s) && !seen.has(s)) {
      seen.add(s);
      result.push(s);
    }
  }
  return result;
}
