/**
 * End-to-end domain scoring trace.
 * Run: node src/utils/resume/__tests__/trace_domain_scoring.js
 *
 * Proves:
 *   - QA scorer (calculateQaResumeScore) only fires when domain = qa_testing
 *   - Generic scorer (calculateGenericScore) fires for all other domains
 *   - Backend / Frontend / DevOps resumes are never penalised by 0.28 QA multiplier
 */

import { detectSkillDomain } from '../domainDetection.js';
import { analyzeQaResume }   from '../intelligenceAdapter.js';

// ── Sample resume profiles ────────────────────────────────────────────────────

const RESUMES = [
  {
    label: '1. Backend Engineer',
    parsed: {
      extractedSkills: [
        'node.js', 'express', 'postgresql', 'mongodb', 'docker',
        'redis', 'rest api', 'typescript', 'prisma', 'jest',
        'graphql', 'nginx', 'aws',
      ],
      experienceYears: 4,
      experienceEntries: [
        {
          title:       'Backend Engineer',
          company:     'FinTech Corp',
          description: 'Built REST APIs using Node.js and Express. Designed PostgreSQL schemas, ' +
                       'integrated Redis caching, containerised services with Docker, deployed on AWS.',
        },
        {
          title:       'Junior Developer',
          company:     'Startup Inc',
          description: 'Developed microservices in Node.js; worked with MongoDB and REST APIs.',
        },
      ],
      projectEntries: [
        {
          name:        'Payment API',
          description: 'REST API for payment processing built with Node.js + PostgreSQL',
          tools:       ['node.js', 'postgresql', 'redis', 'docker'],
          metrics:     ['Reduced API latency by 40%', 'Handles 1M+ daily transactions'],
        },
        {
          name:        'User Service',
          description: 'Microservice for user management with JWT auth',
          tools:       ['node.js', 'mongodb', 'jwt'],
          metrics:     [],
        },
      ],
      educationEntries:    ['B.Tech Computer Science, VJTI Mumbai 2020'],
      certificationEntries: [],
      contactInfo:         { email: 'raj@example.com', phone: '+91 9876543210', linkedin: 'linkedin.com/in/raj' },
      parsedText:          'Backend Engineer 4 years Node.js Express PostgreSQL MongoDB Docker Redis TypeScript Prisma Jest GraphQL Nginx AWS REST API microservices.',
      summaryText:         'Backend engineer with 4 years building scalable REST APIs and microservices on Node.js and PostgreSQL.',
      globalMetrics:       ['Reduced API latency by 40%', '1M+ daily transactions'],
    },
  },

  {
    label: '2. Frontend Engineer',
    parsed: {
      extractedSkills: [
        'react', 'typescript', 'next.js', 'tailwindcss', 'redux',
        'css', 'html', 'jest', 'cypress', 'figma', 'storybook', 'webpack',
      ],
      experienceYears: 3,
      experienceEntries: [
        {
          title:       'Frontend Engineer',
          company:     'Product Co',
          description: 'Built React component library with TypeScript, delivered Next.js SSR pages, ' +
                       'wrote Jest + Cypress tests, collaborated with designers in Figma.',
        },
        {
          title:       'UI Developer',
          company:     'Agency X',
          description: 'Created responsive layouts with CSS and HTML, integrated REST APIs in React.',
        },
      ],
      projectEntries: [
        {
          name:        'Admin Dashboard',
          description: 'React + TypeScript dashboard with Redux state management',
          tools:       ['react', 'typescript', 'redux', 'tailwindcss'],
          metrics:     ['Reduced page load time by 35%'],
        },
        {
          name:        'Design System',
          description: 'Component library with Storybook documentation',
          tools:       ['react', 'typescript', 'storybook', 'jest'],
          metrics:     [],
        },
      ],
      educationEntries:    ['B.Sc Computer Science, DU 2021'],
      certificationEntries: [],
      contactInfo:         { email: 'priya@example.com', phone: '+91 9000000001', linkedin: 'linkedin.com/in/priya' },
      parsedText:          'Frontend Engineer 3 years React TypeScript Next.js TailwindCSS Redux CSS HTML Jest Cypress Figma Storybook Webpack.',
      summaryText:         'Frontend engineer with 3 years building performant React apps with TypeScript and Next.js.',
      globalMetrics:       ['Reduced page load time by 35%'],
    },
  },

  {
    label: '3. DevOps Engineer',
    parsed: {
      extractedSkills: [
        'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
        'github actions', 'aws', 'helm', 'prometheus', 'grafana',
        'nginx', 'bash', 'linux', 'ci/cd',
      ],
      experienceYears: 5,
      experienceEntries: [
        {
          title:       'DevOps Engineer',
          company:     'Cloud Systems Ltd',
          description: 'Managed Kubernetes clusters on AWS EKS, wrote Terraform modules for IaC, ' +
                       'built Jenkins pipelines, set up Prometheus + Grafana monitoring.',
        },
        {
          title:       'Site Reliability Engineer',
          company:     'Infra Co',
          description: 'Automated deployments with Ansible, maintained Nginx, improved CI/CD pipelines with GitHub Actions.',
        },
      ],
      projectEntries: [
        {
          name:        'K8s Migration',
          description: 'Migrated monolith to Kubernetes microservices on AWS EKS',
          tools:       ['kubernetes', 'docker', 'terraform', 'helm', 'aws'],
          metrics:     ['Reduced deployment time by 60%', 'Achieved 99.9% uptime'],
        },
        {
          name:        'Observability Stack',
          description: 'Set up Prometheus + Grafana + ELK alerting pipeline',
          tools:       ['prometheus', 'grafana', 'docker', 'ansible'],
          metrics:     ['Reduced MTTR by 45%'],
        },
      ],
      educationEntries:    ['B.E. Information Technology, 2019'],
      certificationEntries: ['AWS Solutions Architect Associate'],
      contactInfo:         { email: 'arjun@example.com', phone: '+91 9000000002', linkedin: 'linkedin.com/in/arjun' },
      parsedText:          'DevOps Engineer 5 years Docker Kubernetes Terraform Ansible Jenkins GitHub Actions AWS Helm Prometheus Grafana Nginx Bash Linux CI/CD.',
      summaryText:         'DevOps engineer with 5 years automating infrastructure and CI/CD pipelines on AWS.',
      globalMetrics:       ['Reduced deployment time by 60%', '99.9% uptime', 'Reduced MTTR by 45%'],
    },
  },

  {
    label: '4. QA Automation Engineer',
    parsed: {
      extractedSkills: [
        'selenium', 'cypress', 'playwright', 'testng', 'junit', 'cucumber',
        'bdd', 'postman', 'rest assured', 'jmeter', 'jira', 'testrail',
        'maven', 'git', 'docker', 'ci/cd', 'github actions', 'api testing',
        'automation testing', 'regression testing',
      ],
      experienceYears: 4,
      experienceEntries: [
        {
          title:       'QA Automation Engineer',
          company:     'FinServ Corp',
          description: 'Built Selenium + TestNG automation framework from scratch. ' +
                       'Wrote 500+ test cases, integrated with Jenkins CI/CD. ' +
                       'Reduced regression effort by 70%.',
        },
        {
          title:       'Manual QA Engineer',
          company:     'EcomCo',
          description: 'Performed functional, regression, and API testing. Used Postman for API validation, JIRA for defect tracking.',
        },
      ],
      projectEntries: [
        {
          name:        'Test Automation Framework',
          description: 'Selenium + TestNG Page Object Model framework with Allure reporting',
          tools:       ['selenium', 'testng', 'maven', 'docker', 'github actions'],
          metrics:     ['500+ test cases', '70% regression effort reduction'],
        },
        {
          name:        'API Test Suite',
          description: 'REST Assured + Cucumber BDD API test suite for 150+ endpoints',
          tools:       ['rest assured', 'cucumber', 'postman', 'jira'],
          metrics:     ['150+ endpoints covered'],
        },
      ],
      educationEntries:    ['B.Tech IT, SRM University 2020'],
      certificationEntries: ['ISTQB Foundation Level'],
      contactInfo:         { email: 'kavya@example.com', phone: '+91 9000000003', linkedin: 'linkedin.com/in/kavya' },
      parsedText:          'QA Automation Engineer 4 years Selenium Cypress Playwright TestNG JUnit Cucumber BDD Postman REST Assured JMeter JIRA TestRail Maven Git Docker CI/CD GitHub Actions automation testing regression testing API testing.',
      summaryText:         'QA Automation Engineer with 4 years building test frameworks in Selenium, Cypress, and REST Assured.',
      globalMetrics:       ['500+ test cases automated', 'Reduced regression effort by 70%'],
    },
  },
];

// ── Formatting helpers ────────────────────────────────────────────────────────

const BOLD  = s => `\x1b[1m${s}\x1b[0m`;
const GREEN = s => `\x1b[32m${s}\x1b[0m`;
const CYAN  = s => `\x1b[36m${s}\x1b[0m`;
const YELL  = s => `\x1b[33m${s}\x1b[0m`;
const RED   = s => `\x1b[31m${s}\x1b[0m`;
const DIM   = s => `\x1b[2m${s}\x1b[0m`;

function bar(score, max = 100, width = 30) {
  const filled = Math.round((score / max) * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

function scorerColor(scorerUsed) {
  return scorerUsed === 'calculateQaResumeScore' ? CYAN(scorerUsed) : GREEN(scorerUsed);
}

// ── Main trace ────────────────────────────────────────────────────────────────

for (const { label, parsed } of RESUMES) {
  const domainResult = detectSkillDomain(parsed.extractedSkills);
  const result       = await analyzeQaResume(parsed, domainResult, []);

  const {
    scorer_used,
    raw_ats_score,
    qa_match_score,
    qa_score_breakdown,
    career_level,
    qa_seniority,
    qa_hiring_label,
    strengths,
    weaknesses,
  } = result;

  console.log('\n' + '═'.repeat(70));
  console.log(BOLD(label));
  console.log('═'.repeat(70));

  console.log(`  ${BOLD('Detected Domain')}   : ${YELL(domainResult.domain)}  (confidence: ${domainResult.confidence}%)`);
  console.log(`  ${BOLD('Scorer Used')}       : ${scorerColor(scorer_used)}`);
  console.log(`  ${BOLD('Career Level')}      : ${career_level}  (qa_seniority: ${qa_seniority})`);
  console.log(`  ${BOLD('Hiring Label')}      : ${qa_hiring_label}`);
  console.log(`  ${BOLD('Raw Score')}         : ${raw_ats_score}  ${DIM('(before stuffing penalty + career ceiling)')}`);
  console.log(`  ${BOLD('Final ATS Score')}   : ${qa_match_score >= 60 ? GREEN(qa_match_score) : qa_match_score >= 35 ? YELL(qa_match_score) : RED(qa_match_score)}  ${bar(qa_match_score)}`);

  console.log(`\n  ${BOLD('Score Breakdown')}:`);
  for (const [dim, { score, max, label: dimLabel }] of Object.entries(qa_score_breakdown)) {
    const pct  = max > 0 ? Math.round((score / max) * 100) : 0;
    const name = (dimLabel ?? dim).padEnd(28);
    console.log(`    ${DIM(name)} ${String(score).padStart(3)} / ${max}  ${bar(score, max, 20)}  ${pct}%`);
  }

  if (strengths.length) {
    console.log(`\n  ${BOLD('Strengths')}:`);
    for (const s of strengths) console.log(`    ${GREEN('✔')} ${s}`);
  }
  if (weaknesses.length) {
    console.log(`\n  ${BOLD('Weaknesses')}:`);
    for (const w of weaknesses) console.log(`    ${RED('✖')} ${w}`);
  }
}

console.log('\n' + '═'.repeat(70));
console.log(BOLD('VERIFICATION SUMMARY'));
console.log('═'.repeat(70));

// Re-run quick pass to build summary table
const results = [];
for (const { label, parsed } of RESUMES) {
  const domainResult = detectSkillDomain(parsed.extractedSkills);
  const result       = await analyzeQaResume(parsed, domainResult, []);
  results.push({ label, domain: domainResult.domain, scorer: result.scorer_used, raw: result.raw_ats_score, final: result.qa_match_score });
}

console.log('\n  ' + ['Resume'.padEnd(30), 'Domain'.padEnd(14), 'Scorer'.padEnd(26), 'Raw'.padEnd(6), 'Final'].join('  '));
console.log('  ' + '-'.repeat(90));
for (const r of results) {
  const isQa     = r.scorer === 'calculateQaResumeScore';
  const scorerFmt = isQa ? CYAN(r.scorer.padEnd(26)) : GREEN(r.scorer.padEnd(26));
  const finalFmt  = r.final >= 60 ? GREEN(String(r.final).padEnd(6)) : YELL(String(r.final).padEnd(6));
  console.log('  ' + [r.label.padEnd(30), r.domain.padEnd(14), scorerFmt, String(r.raw).padEnd(6), finalFmt].join('  '));
}

console.log('\n  ' + BOLD('Assertions:'));
const [backend, frontend, devops, qa] = results;
const allPassed = [];

function assert(condition, msg) {
  if (condition) {
    console.log(`  ${GREEN('✔ PASS')}  ${msg}`);
    allPassed.push(true);
  } else {
    console.log(`  ${RED('✖ FAIL')}  ${msg}`);
    allPassed.push(false);
  }
}

assert(qa.scorer     === 'calculateQaResumeScore', 'QA resume uses calculateQaResumeScore');
assert(backend.scorer === 'calculateGenericScore',  'Backend resume uses calculateGenericScore');
assert(frontend.scorer === 'calculateGenericScore', 'Frontend resume uses calculateGenericScore');
assert(devops.scorer   === 'calculateGenericScore', 'DevOps resume uses calculateGenericScore');
assert(backend.final  > 20,   `Backend ATS score ${backend.final} > 20 (no QA penalty)`);
assert(frontend.final > 20,   `Frontend ATS score ${frontend.final} > 20 (no QA penalty)`);
assert(devops.final   > 20,   `DevOps ATS score ${devops.final} > 20 (no QA penalty)`);
assert(qa.final       > 20,   `QA ATS score ${qa.final} > 20`);

// The key regression check: without the fix backend raw=22 → *0.28 = 6
// With the fix, generic scorer returns the full score
const wouldHaveBeen = Math.round(backend.raw * 0.28);
assert(backend.final > wouldHaveBeen,
  `Backend score ${backend.final} >> old penalised score ${wouldHaveBeen} (was: raw × 0.28)`);

const passing = allPassed.filter(Boolean).length;
console.log(`\n  ${passing === allPassed.length ? GREEN(`All ${passing} assertions passed`) : RED(`${passing}/${allPassed.length} passed`)}\n`);
