/**
 * toolchainCoherenceEngine.js — Phase 5 Fix 3
 * Measures how coherent a candidate's toolstack is relative to their resume content.
 * Penalises implausible tool combinations, breadth/depth mismatches, and domain mixing.
 */

// ── Domain clusters ───────────────────────────────────────────────────────────
// Each skill belongs to one or more domains. High coherence = tools from few domains.

const DOMAIN_CLUSTERS = {
  qa_automation: [
    'playwright', 'cypress', 'selenium', 'webdriverio', 'appium', 'testng', 'junit',
    'testcafe', 'nightwatch', 'detox', 'maestro', 'robot framework', 'katalon',
  ],
  api_testing: [
    'postman', 'rest assured', 'soapui', 'insomnia', 'newman', 'pact',
    'supertest', 'karate', 'api testing',
  ],
  performance: [
    'jmeter', 'k6', 'gatling', 'locust', 'artillery', 'loadrunner',
    'neoload', 'blazemeter', 'wrk',
  ],
  ci_cd: [
    'github actions', 'gitlab ci', 'jenkins', 'circleci', 'travis ci',
    'bamboo', 'teamcity', 'azure devops', 'bitbucket pipelines',
  ],
  containerisation: [
    'docker', 'kubernetes', 'helm', 'podman', 'containerd', 'openshift',
  ],
  infrastructure: [
    'terraform', 'ansible', 'chef', 'puppet', 'cloudformation', 'pulumi',
    'aws', 'azure', 'gcp', 'cloud', 'ec2', 's3', 'lambda',
  ],
  frontend_dev: [
    'react', 'vue', 'angular', 'next.js', 'typescript', 'javascript',
    'html', 'css', 'tailwind', 'svelte',
  ],
  backend_dev: [
    'node.js', 'express', 'django', 'spring boot', 'flask', 'fastapi',
    'java', 'python', 'go', 'rust', 'php', 'ruby on rails',
  ],
  database: [
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'cassandra', 'dynamodb', 'sqlite',
  ],
  blockchain: [
    'blockchain', 'ethereum', 'solidity', 'web3', 'smart contract',
    'defi', 'nft', 'hyperledger',
  ],
  security: [
    'penetration testing', 'owasp', 'burp suite', 'nessus', 'metasploit',
    'vulnerability', 'snyk', 'sonarqube',
  ],
  management: [
    'jira', 'confluence', 'trello', 'asana', 'monday.com', 'testrail',
    'qase', 'zephyr', 'test management',
  ],
};

// Coherent QA clusters — tools that naturally appear together
const COHERENT_CLUSTERS = [
  { name: 'Modern E2E QA', tools: ['playwright', 'github actions', 'docker'], minMatch: 2 },
  { name: 'Classic Web QA', tools: ['selenium', 'testng', 'jenkins', 'jira'], minMatch: 2 },
  { name: 'API Testing', tools: ['postman', 'rest assured', 'newman', 'pact'], minMatch: 2 },
  { name: 'Performance QA', tools: ['k6', 'jmeter', 'gatling'], minMatch: 2 },
  { name: 'Mobile QA', tools: ['appium', 'detox', 'maestro'], minMatch: 2 },
  { name: 'CI/CD QA Pipeline', tools: ['github actions', 'docker', 'kubernetes'], minMatch: 2 },
  { name: 'BDD Testing', tools: ['cucumber', 'specflow', 'gherkin', 'behave'], minMatch: 2 },
];

// Suspicious combinations: tools that shouldn't appear together without depth evidence
const SUSPICIOUS_COMBOS = [
  {
    combo: ['terraform', 'kubernetes', 'react', 'selenium'],
    reason: 'Infra orchestration + frontend dev + QA automation — unlikely without senior engineering depth',
  },
  {
    combo: ['blockchain', 'aws', 'kubernetes', 'playwright'],
    reason: 'Blockchain + cloud infra + QA — implausible breadth for a QA profile',
  },
  {
    combo: ['machine learning', 'docker', 'selenium', 'react'],
    reason: 'ML + containers + QA + frontend — four unrelated domains in one resume',
  },
  {
    combo: ['aws', 'terraform', 'ansible'],
    reason: 'Full cloud infrastructure stack — typically devops, not QA',
  },
  {
    combo: ['solidity', 'web3', 'ethereum'],
    reason: 'Blockchain development skills in a QA resume — likely listing aspirational tools',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function skillsInDomain(skills, domainTools) {
  return skills.filter(s => domainTools.some(d => s.includes(d) || d.includes(s)));
}

function detectSuspiciousCombos(skills) {
  const found = [];
  for (const { combo, reason } of SUSPICIOUS_COMBOS) {
    const hits = combo.filter(c => skills.some(s => s.includes(c) || c.includes(s)));
    if (hits.length >= Math.ceil(combo.length * 0.6)) {
      found.push(`${hits.slice(0, 3).join(' + ')}: ${reason}`);
    }
  }
  return found;
}

function findStrongestCluster(skills) {
  let best = null;
  let bestCount = 0;
  for (const { name, tools, minMatch } of COHERENT_CLUSTERS) {
    const matched = tools.filter(t => skills.some(s => s.includes(t) || t.includes(s)));
    if (matched.length >= minMatch && matched.length > bestCount) {
      bestCount = matched.length;
      best = { name, tools: matched };
    }
  }
  return best;
}

function countActiveDomains(skills) {
  let count = 0;
  for (const tools of Object.values(DOMAIN_CLUSTERS)) {
    if (skillsInDomain(skills, tools).length > 0) count++;
  }
  return count;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {object} parsed         - extractedSkills, experienceEntries, word_count
 * @param {object} evidenceResult - from analyzeEvidence()
 * @returns {{ score, coherence_level, suspicious_combinations, strongest_coherent_cluster, explanation }}
 */
export function computeToolchainCoherence(parsed, evidenceResult) {
  const skills      = (parsed.extractedSkills || []).map(s => s.toLowerCase());
  const experiences = parsed.experienceEntries || [];
  const wordCount   = parsed.word_count ?? (parsed.parsedText || '').split(/\s+/).filter(Boolean).length;

  const hasProof    = (evidenceResult?.skill_evidence || []).some(s =>
    s.proof_sources.includes('experience') || s.proof_sources.includes('project')
  );
  const hasQuant    = evidenceResult?.evidence_profile?.has_quantified_impact ?? false;
  const inflRisk    = evidenceResult?.inflationResult?.risk ?? 'none';
  const sectionOnly = evidenceResult?.evidence_profile?.section_only_ratio ?? 0;

  // Base score
  let score = 70;

  // ── Domain spread penalty ─────────────────────────────────────────────────
  const activeDomains = countActiveDomains(skills);
  if (activeDomains >= 5) score -= 20;
  else if (activeDomains >= 4) score -= 12;
  else if (activeDomains >= 3) score -= 5;

  // ── Suspicious combo penalty ─────────────────────────────────────────────
  const suspicious_combinations = detectSuspiciousCombos(skills);
  score -= suspicious_combinations.length * 12;

  // ── Breadth / resume-size mismatch ───────────────────────────────────────
  if (skills.length > 20 && wordCount < 200) score -= 18;
  else if (skills.length > 15 && wordCount < 150) score -= 25;
  else if (skills.length > 10 && wordCount < 100) score -= 30;

  // ── No proof for wide stack ───────────────────────────────────────────────
  if (!hasProof && skills.length > 8) score -= 15;
  if (sectionOnly >= 80 && skills.length > 10) score -= 10;

  // ── Inflation risk ────────────────────────────────────────────────────────
  if (inflRisk === 'high') score -= 12;
  else if (inflRisk === 'moderate') score -= 5;

  // ── Positive: coherent cluster found ─────────────────────────────────────
  const bestCluster = findStrongestCluster(skills);
  if (bestCluster) score += 8;
  if (hasQuant && hasProof) score += 7;
  if (experiences.length >= 2 && hasProof) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const coherence_level =
    score >= 65 ? 'high' :
    score >= 40 ? 'moderate' : 'low';

  const explanation =
    coherence_level === 'high'
      ? 'Toolstack is well-aligned with QA specialization — consistent and believable.'
      : coherence_level === 'moderate'
      ? 'Some toolstack coherence, but cross-domain or breadth concerns reduce specialization clarity.'
      : 'Toolstack appears implausible — too many unrelated domains or excessive breadth for resume depth.';

  return {
    score,
    coherence_level,
    suspicious_combinations,
    strongest_coherent_cluster: bestCluster ? bestCluster.tools : [],
    explanation,
  };
}
