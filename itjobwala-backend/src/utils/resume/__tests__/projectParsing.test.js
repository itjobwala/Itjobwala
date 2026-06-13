/**
 * Project parsing unit tests.
 * Run: node --test src/utils/resume/__tests__/projectParsing.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  isTechnologyStackLine,
  splitIntoSections,
  extractProjectEntries,
  extractSummary,
} from '../resumeSections.js';

import {
  isLikelyProjectHeader,
  classifyProjectDomain,
  buildProjectStats,
  resolveProjectEntities,
  computeProjectConfidence,
  classifyBlock,
} from '../semanticNormalizer.js';

// ── isTechnologyStackLine ─────────────────────────────────────────────────────

describe('isTechnologyStackLine', () => {
  test('React | Node | MongoDB → tech stack', () => {
    assert.equal(isTechnologyStackLine('React | Node | MongoDB'), true);
  });

  test('Selenium | TestNG | Maven | Java → tech stack', () => {
    assert.equal(isTechnologyStackLine('Selenium | TestNG | Maven | Java'), true);
  });

  test('Python | LangChain | OpenAI → tech stack', () => {
    assert.equal(isTechnologyStackLine('Python | LangChain | OpenAI'), true);
  });

  test('Meta Business Suite (MBS) | Domain: Social Media | Meta → project header', () => {
    assert.equal(isTechnologyStackLine('Meta Business Suite (MBS) | Domain: Social Media | Meta'), false);
  });

  test('eBullion | FinTech | 1.5 Years → project header (duration)', () => {
    assert.equal(isTechnologyStackLine('eBullion | FinTech | 1.5 Years'), false);
  });

  test('Social Media App | React Native | MongoDB → project header (App suffix)', () => {
    assert.equal(isTechnologyStackLine('Social Media App | React Native | MongoDB'), false);
  });

  test('Quality Automation Framework | Selenium | TestNG → project header (3-word first part)', () => {
    assert.equal(isTechnologyStackLine('Quality Automation Framework | Selenium | TestNG'), false);
  });

  test('Food Tracker | Django | PostgreSQL → project header (Tracker suffix)', () => {
    assert.equal(isTechnologyStackLine('Food Tracker | Django | PostgreSQL'), false);
  });

  test('eBullion | 2022 - 2024 → project header (year)', () => {
    assert.equal(isTechnologyStackLine('eBullion | 2022 - 2024'), false);
  });

  test('non-pipe line → never tech stack', () => {
    assert.equal(isTechnologyStackLine('Selenium WebDriver'), false);
  });

  test('single-segment line → never tech stack (< 2 pipes)', () => {
    assert.equal(isTechnologyStackLine('React'), false);
  });

  test('platform noun in any part → project header', () => {
    assert.equal(isTechnologyStackLine('Meta Business Suite | React | Node'), false);
  });

  test('acronym in any part → project header', () => {
    assert.equal(isTechnologyStackLine('EBullion (EBU) | React | Node'), false);
  });

  test('OpenAI API compound → still tech stack (not a project header)', () => {
    assert.equal(isTechnologyStackLine('Python | LangChain | OpenAI API | ChromaDB | React'), true);
  });

  test('REST API compound → still tech stack', () => {
    assert.equal(isTechnologyStackLine('Java | REST API | Spring Boot | PostgreSQL'), true);
  });

  test('Web App in first part → project header', () => {
    assert.equal(isTechnologyStackLine('My Web App | React | Node'), false);
  });
});

// ── isLikelyProjectHeader (semanticNormalizer) ────────────────────────────────

describe('isLikelyProjectHeader', () => {
  test('React | Node | MongoDB → false (tech stack guard)', () => {
    assert.equal(isLikelyProjectHeader('React | Node | MongoDB'), false);
  });

  test('Meta Business Suite (MBS) | Domain: Social Media | Meta → true', () => {
    assert.equal(isLikelyProjectHeader('Meta Business Suite (MBS) | Domain: Social Media | Meta'), true);
  });

  test('eBullion – Digital Metals Investment Platform → true (em-dash)', () => {
    assert.equal(isLikelyProjectHeader('eBullion – Digital Metals Investment Platform'), true);
  });

  test('AI Powered Customer Assistant Platform → true (product noun)', () => {
    assert.equal(isLikelyProjectHeader('AI Powered Customer Assistant Platform'), true);
  });

  test('Domain: FinTech | Duration: 6 months → true (domain label)', () => {
    assert.equal(isLikelyProjectHeader('Domain: FinTech | Duration: 6 months'), true);
  });

  test('bullet line → false', () => {
    assert.equal(isLikelyProjectHeader('• Automated 500+ test cases using Selenium'), false);
  });

  test('sentence ending in period → false', () => {
    assert.equal(isLikelyProjectHeader('Implemented end-to-end regression suite.'), false);
  });
});

// ── splitIntoSections ─────────────────────────────────────────────────────────

describe('splitIntoSections', () => {
  const resumeText = [
    'John Doe',
    'john@example.com',
    '',
    'Summary',
    'Senior QA Engineer with 5 years of experience.',
    '',
    'Skills',
    'Selenium, Playwright, Postman',
    '',
    'Experience',
    'QA Engineer - Acme Corp  2020 - 2023',
    '• Automated regression suite using Selenium',
    '',
    'Projects',
    'Meta Business Suite (MBS) | Domain: Social Media',
    '• Automated 300+ test cases',
    '',
    'Education',
    'B.Tech - Computer Science - 2019',
    '',
    'Certifications',
    'ISTQB Certified Tester',
  ].join('\n');

  test('no content loss — all named sections populated', () => {
    const sections = splitIntoSections(resumeText);
    assert.ok(sections.summary.some(l => l.includes('Senior QA')),    'summary captured');
    assert.ok(sections.skills.some(l => l.includes('Selenium')),      'skills captured');
    assert.ok(sections.experience.some(l => l.includes('Acme')),      'experience captured');
    assert.ok(sections.projects.some(l => l.includes('Meta')),        'projects captured');
    assert.ok(sections.education.some(l => l.includes('B.Tech')),     'education captured');
    assert.ok(sections.certifications.some(l => l.includes('ISTQB')), 'certifications captured');
  });

  test('summary not routed to _misc', () => {
    const sections = splitIntoSections(resumeText);
    assert.ok(!sections._misc.some(l => l.includes('Senior QA')));
  });

  test('skills not lost', () => {
    const sections = splitIntoSections(resumeText);
    assert.ok(!sections.preamble.some(l => l.includes('Selenium')));
    assert.ok(sections.skills.some(l => l.includes('Selenium')));
  });

  test('repeated Experience header → appends, does not overwrite', () => {
    const text = [
      'Experience',
      'Job A - Company A  2020 - 2022',
      '',
      'Projects',
      'Some Project',
      '',
      'Experience',
      'Job B - Company B  2022 - 2024',
    ].join('\n');
    const sections = splitIntoSections(text);
    assert.ok(sections.experience.some(l => l.includes('Job A')));
    assert.ok(sections.experience.some(l => l.includes('Job B')));
  });

  test('Hobbies/References → _misc, not experience/projects', () => {
    const text = [
      'Experience',
      'QA Engineer  2021 - 2023',
      'Hobbies',
      'Chess, Reading',
    ].join('\n');
    const sections = splitIntoSections(text);
    assert.ok(sections._misc.some(l => l.includes('Chess')));
    assert.ok(!sections.experience.some(l => l.includes('Chess')));
  });

  test('Key Projects → routes to projects', () => {
    const text = [
      'Key Projects',
      'Dosto Howsit',
      '• Built social media testing framework',
    ].join('\n');
    const sections = splitIntoSections(text);
    assert.ok(sections.projects.some(l => l.includes('Dosto')));
  });

  test('Employment History → routes to experience', () => {
    const text = [
      'Employment History',
      'QA Lead - Corp  2019 - 2023',
    ].join('\n');
    const sections = splitIntoSections(text);
    assert.ok(sections.experience.some(l => l.includes('QA Lead')));
  });
});

// ── extractSummary ────────────────────────────────────────────────────────────

describe('extractSummary', () => {
  test('extracts summary from Summary section', () => {
    const text = [
      'Summary',
      '5+ years QA engineer with automation expertise.',
      '',
      'Skills',
      'Selenium',
    ].join('\n');
    const summary = extractSummary(text);
    assert.ok(summary.includes('5+ years QA'));
    assert.ok(!summary.includes('Selenium'));
  });

  test('extracts from Profile header', () => {
    const text = ['Profile', 'Experienced SDET.'].join('\n');
    assert.ok(extractSummary(text).includes('Experienced SDET'));
  });

  test('empty when no summary section', () => {
    const text = ['Experience', 'QA Engineer  2020 - 2023'].join('\n');
    assert.equal(extractSummary(text), '');
  });
});

// ── extractProjectEntries — entity_type ───────────────────────────────────────

describe('extractProjectEntries — hierarchy', () => {
  test('tech stack line not treated as project', () => {
    const text = [
      'Projects',
      'React | Node | MongoDB',
      '• Some description',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 0, 'no project created from tech stack line');
  });

  test('eBullion with subsystems counted as 1 parent project', () => {
    const text = [
      'Projects',
      'eBullion – Digital Metals Platform',
      '• Core platform for gold/silver trading',
      'Fraud Prevention Engine',
      'Physical Delivery Module',
      'Buyback Processing Engine',
    ].join('\n');
    const entries  = extractProjectEntries(text);
    const parents  = entries.filter(e => e.entity_type === 'parent_project');
    const subs     = entries.filter(e => e.entity_type === 'subsystem');
    assert.equal(parents.length, 1, 'exactly 1 parent project');
    assert.ok(subs.length >= 2, 'subsystems detected');
  });

  test('two unrelated projects both get parent_project type', () => {
    const text = [
      'Projects',
      'Meta Business Suite (MBS) | Domain: Social Media',
      '• Automated 300+ test cases using Selenium',
      '• Configured CI/CD pipeline',
      '',
      'Dosto Howsit',
      '• Built automation framework using Playwright',
      '• Integrated with GitHub Actions',
    ].join('\n');
    const entries = extractProjectEntries(text);
    const parents = entries.filter(e => e.entity_type === 'parent_project');
    assert.equal(parents.length, 2, '2 parent projects');
  });

  test('subsystem with 3+ bullets promoted to parent_project', () => {
    const text = [
      'Projects',
      'eBullion Platform',
      '• Core trading logic',
      'Notification Engine',
      '• Bullet one for engine',
      '• Bullet two for engine',
      '• Bullet three for engine',
    ].join('\n');
    const entries   = extractProjectEntries(text);
    const notifProj = entries.find(e => e.name.includes('Notification'));
    assert.equal(notifProj?.entity_type, 'parent_project', 'promoted due to 3 bullets');
  });
});

// ── classifyProjectDomain ─────────────────────────────────────────────────────

describe('classifyProjectDomain', () => {
  test('Selenium + TestNG project → qa_automation', () => {
    const result = classifyProjectDomain({
      name: 'Automation Suite',
      description: 'Built using Selenium and TestNG with page object model',
      tools: ['selenium', 'testng', 'java'],
      responsibilities: [],
    });
    assert.ok(['qa_automation', 'sdet'].includes(result.project_type));
  });

  test('Postman + REST Assured → api_testing', () => {
    const result = classifyProjectDomain({
      name: 'API Test Framework',
      description: 'API testing using Postman and REST Assured with schema validation',
      tools: ['postman', 'rest assured'],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'api_testing');
  });

  test('JMeter + Gatling → performance_testing', () => {
    const result = classifyProjectDomain({
      name: 'Load Test Suite',
      description: 'Performance testing with JMeter and Gatling for load testing',
      tools: ['jmeter', 'gatling'],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'performance_testing');
  });

  test('LangChain + OpenAI → ai_ml', () => {
    const result = classifyProjectDomain({
      name: 'AI Customer Assistant',
      description: 'Built with LangChain, OpenAI GPT-4 and vector embeddings',
      tools: ['langchain', 'openai'],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'ai_ml');
  });

  test('Spring Boot + PostgreSQL → backend', () => {
    const result = classifyProjectDomain({
      name: 'Inventory Service',
      description: 'Spring Boot microservices with PostgreSQL and Kafka',
      tools: ['spring boot', 'postgresql', 'kafka'],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'backend');
  });

  test('React + Node → frontend or fullstack', () => {
    const result = classifyProjectDomain({
      name: 'Admin Dashboard',
      description: 'React frontend with tailwind and Redux for state management',
      tools: ['react', 'tailwind', 'redux'],
      responsibilities: [],
    });
    assert.ok(['frontend', 'fullstack'].includes(result.project_type));
  });

  test('no signals → general with low confidence', () => {
    const result = classifyProjectDomain({
      name: 'My Project',
      description: '',
      tools: [],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'general');
    assert.ok(result.confidence <= 30);
  });

  test('Appium → mobile_testing', () => {
    const result = classifyProjectDomain({
      name: 'Mobile Test Suite',
      description: 'Mobile testing using Appium for Android and iOS real device testing',
      tools: ['appium'],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'mobile_testing');
  });
});

// ── buildProjectStats ─────────────────────────────────────────────────────────

describe('buildProjectStats', () => {
  test('Resume A: 2 QA projects → total_projects=2, qa_projects=2', () => {
    const projects = [
      { entity_type: 'parent_project', project_domain: 'qa_automation' },
      { entity_type: 'parent_project', project_domain: 'api_testing' },
    ];
    const stats = buildProjectStats(projects);
    assert.equal(stats.total_projects, 2);
    assert.equal(stats.qa_projects, 2);
    assert.equal(stats.non_qa_projects, 0);
  });

  test('Resume B: 3 non-QA projects → total_projects=3, qa_projects=0', () => {
    const projects = [
      { entity_type: 'parent_project', project_domain: 'backend' },
      { entity_type: 'parent_project', project_domain: 'ai_ml' },
      { entity_type: 'parent_project', project_domain: 'frontend' },
    ];
    const stats = buildProjectStats(projects);
    assert.equal(stats.total_projects, 3);
    assert.equal(stats.qa_projects, 0);
    assert.equal(stats.non_qa_projects, 3);
  });

  test('subsystems excluded from total_projects count', () => {
    const projects = [
      { entity_type: 'parent_project', project_domain: 'qa_automation' },
      { entity_type: 'subsystem',      project_domain: 'qa_automation' },
      { entity_type: 'subsystem',      project_domain: 'qa_automation' },
    ];
    const stats = buildProjectStats(projects);
    assert.equal(stats.total_projects, 1, 'only parent counted');
    assert.equal(stats.qa_projects, 1);
  });

  test('mixed QA and non-QA', () => {
    const projects = [
      { entity_type: 'parent_project', project_domain: 'qa_automation' },
      { entity_type: 'parent_project', project_domain: 'backend' },
      { entity_type: 'parent_project', project_domain: 'sdet' },
    ];
    const stats = buildProjectStats(projects);
    assert.equal(stats.total_projects, 3);
    assert.equal(stats.qa_projects, 2);
    assert.equal(stats.non_qa_projects, 1);
    assert.equal(stats.project_breakdown.qa_automation, 1);
    assert.equal(stats.project_breakdown.backend, 1);
    assert.equal(stats.project_breakdown.sdet, 1);
  });

  test('empty projects → all zeros', () => {
    const stats = buildProjectStats([]);
    assert.equal(stats.total_projects, 0);
    assert.equal(stats.qa_projects, 0);
    assert.equal(stats.non_qa_projects, 0);
    assert.deepEqual(stats.project_breakdown, {});
  });
});

// ── extractProjectEntries — description preservation (P1) ─────────────────────

describe('extractProjectEntries — description preservation', () => {
  test('P1: plain description lines not wiped by pushProject', () => {
    const text = [
      'Projects',
      'eBullion – Digital Metals Investment Platform',
      'A fintech platform for gold and silver investment',
      'Worked with microservices architecture on AWS',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(entries[0].description.includes('fintech'), 'non-bullet description must survive flush');
  });

  test('P1: bullet content does not erase preceding non-bullet description', () => {
    const text = [
      'Projects',
      'Payment Gateway Platform',
      'Core banking integration layer for real-time settlements',
      '• Integrated with 3 payment providers',
      '• Reduced transaction processing time by 40%',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(entries[0].description.includes('banking'), 'inline description preserved alongside bullets');
    assert.ok(entries[0].description.includes('payment providers'), 'bullet content also present');
  });
});

// ── extractProjectEntries — tools population (P2, P3, P6) ────────────────────

describe('extractProjectEntries — tools population', () => {
  test('P2: Tools Used: line populates tools[]', () => {
    const text = [
      'Projects',
      'eBullion – Digital Metals Investment Platform',
      '• Core trading logic',
      'Tools Used: React, Node.js, MongoDB, AWS',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(entries[0].tools.length > 0, 'tools[] must be non-empty after Tools Used: line');
  });

  test('P6: Tech Stack: line populates tools[]', () => {
    const text = [
      'Projects',
      'Payment Gateway Platform',
      '• Integrated with multiple payment providers',
      'Tech Stack: Spring Boot, PostgreSQL, Redis, Kafka',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(entries[0].tools.length > 0, 'tools[] must be non-empty after Tech Stack: line');
  });

  test('P6: Technologies: line populates tools[]', () => {
    const text = [
      'Projects',
      'AI Customer Assistant',
      '• Built NLP pipeline for query resolution',
      'Technologies: Python, FastAPI, PostgreSQL',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(entries[0].tools.length > 0, 'tools[] must be non-empty after Technologies: line');
  });

  test('P3: bullet lines with tech keywords populate tools[]', () => {
    const text = [
      'Projects',
      'Automation Framework',
      '• Built end-to-end suite using Selenium and TestNG',
      '• Integrated Cucumber for BDD scenarios',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(
      entries[0].tools.some(t => /selenium/i.test(t)),
      'selenium must be extracted from bullet into tools[]',
    );
  });
});

// ── extractProjectEntries — general metric extraction (P4) ───────────────────

describe('extractProjectEntries — general metrics', () => {
  test('P4: "reduced X by 40%" metric captured', () => {
    const text = [
      'Projects',
      'Performance Optimization Platform',
      '• Reduced page load time by 40% through Redis caching',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(entries[0].metrics.length > 0, '"reduced by 40%" must be in metrics[]');
  });

  test('P4: "1M+ transactions" metric captured', () => {
    const text = [
      'Projects',
      'Trading Engine',
      '• Processed 1M+ transactions per day with async queuing',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(entries[0].metrics.length > 0, '"1M+ transactions" must be in metrics[]');
  });

  test('P4: "$5M savings" metric captured', () => {
    const text = [
      'Projects',
      'Cost Optimization Suite',
      '• Saved $5M in annual infrastructure costs through rightsizing',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(entries[0].metrics.length > 0, '"$5M" must be in metrics[]');
  });
});

// ── classifyProjectDomain — fintech (P5) ─────────────────────────────────────

describe('classifyProjectDomain — fintech domain', () => {
  test('P5: payment/investment/wallet signals → fintech', () => {
    const result = classifyProjectDomain({
      name:            'eBullion – Digital Metals Investment Platform',
      description:     'Digital metals investment and trading platform for gold and silver',
      tools:           [],
      responsibilities: ['Integrated payment gateway', 'Built wallet management system'],
    });
    assert.equal(result.project_type, 'fintech');
  });

  test('P5: banking/transaction signals → fintech', () => {
    const result = classifyProjectDomain({
      name:            'Core Banking System',
      description:     'Banking transaction management with loan and deposit modules',
      tools:           [],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'fintech');
  });
});

// ── Phase 2: Pipe-separated tech stack inside project ─────────────────────────

describe('extractProjectEntries — pipe-separated tech stack (Phase 2)', () => {
  test('pipe-separated tech line under project header → tools populated', () => {
    const text = [
      'Projects',
      'eBullion – Digital Metals Investment Platform',
      'React | TypeScript | Node.js | PostgreSQL',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.ok(entries[0].tools.length > 0, 'tools[] must be populated from pipe-separated tech line');
  });

  test('tech-stack-only project — name extracted correctly', () => {
    const text = [
      'Projects',
      'Payment Gateway Platform',
      'Spring Boot | PostgreSQL | Redis | Kafka',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].name, 'Payment Gateway Platform');
    assert.ok(entries[0].tools.length > 0, 'tools[] populated');
  });

  test('pipe-separated tech line does not create a second project entry', () => {
    const text = [
      'Projects',
      'Inventory Management System',
      'Node.js | MongoDB | Docker | AWS',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 1, 'tech stack line must not become a separate project');
  });

  test('multiple projects each with pipe-separated tech lines', () => {
    const text = [
      'Projects',
      'Payment Gateway Platform',
      'Spring Boot | PostgreSQL | Kafka',
      '',
      'AI Customer Assistant',
      'Python | LangChain | FastAPI | ChromaDB',
    ].join('\n');
    const entries = extractProjectEntries(text);
    assert.equal(entries.length, 2, '2 projects');
    assert.ok(entries[0].tools.length > 0, 'first project has tools');
    assert.ok(entries[1].tools.length > 0, 'second project has tools');
  });
});

// ── Phase 6: tech-stack-only project confidence ───────────────────────────────

describe('computeProjectConfidence — tech-stack-only project (Phase 6)', () => {
  test('project with 3+ tools and no bullets → confidence > 60', () => {
    const project = {
      name:              'eBullion – Digital Metals Investment Platform',
      tools:             ['react', 'typescript', 'node', 'postgresql'],
      metrics:           [],
      responsibilities:  [],
      description:       '',
      detection_sources: ['projects_section'],
      merged:            false,
      entity_type:       'parent_project',
    };
    const conf = computeProjectConfidence(project);
    assert.ok(conf > 60, `expected confidence > 60, got ${conf}`);
  });

  test('project with tools + responsibilities → confidence > 70', () => {
    const project = {
      name:              'Fraud Prevention Engine',
      tools:             ['java', 'spring boot', 'kafka'],
      metrics:           [],
      responsibilities:  ['Built rule-based fraud detection', 'Integrated with payment APIs'],
      description:       'Built fraud prevention engine with real-time processing',
      detection_sources: ['projects_section'],
      merged:            false,
      entity_type:       'parent_project',
    };
    const conf = computeProjectConfidence(project);
    assert.ok(conf > 70, `expected confidence > 70, got ${conf}`);
  });
});

// ── Phase 7: domain detection expansions ─────────────────────────────────────

describe('classifyProjectDomain — ai_ml with RAG/ChromaDB (Phase 7)', () => {
  test('RAG + ChromaDB + embeddings → ai_ml', () => {
    const result = classifyProjectDomain({
      name:             'Document QA System',
      description:      'RAG pipeline using ChromaDB for vector storage and OpenAI embeddings',
      tools:            ['python', 'chromadb', 'langchain'],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'ai_ml');
  });

  test('vector db + LLM fine-tuning → ai_ml', () => {
    const result = classifyProjectDomain({
      name:             'Enterprise Search',
      description:      'LLM fine-tuning with vector database for semantic search and retrieval',
      tools:            ['python', 'pytorch'],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'ai_ml');
  });
});

describe('classifyProjectDomain — ticketing domain (Phase 7)', () => {
  test('booking/reservation/ticket → ticketing', () => {
    const result = classifyProjectDomain({
      name:             'Event Booking Platform',
      description:      'Online reservation and ticket booking system for concerts and events',
      tools:            ['react', 'node.js'],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'ticketing');
  });

  test('flight booking / travel reservation → ticketing', () => {
    const result = classifyProjectDomain({
      name:             'Flight Reservation System',
      description:      'Travel booking platform for flight and hotel reservations',
      tools:            [],
      responsibilities: [],
    });
    assert.equal(result.project_type, 'ticketing');
  });
});

// ── Phase 5: classifyBlock ────────────────────────────────────────────────────

describe('classifyBlock (Phase 5)', () => {
  test('experience block with date range → experience', () => {
    const result = classifyBlock({
      heading: 'Software Engineer',
      content: 'Neosoft Technologies\nSept 2022 – Present',
    });
    assert.equal(result.type, 'experience');
    assert.ok(result.confidence >= 50, `confidence must be >= 50, got ${result.confidence}`);
  });

  test('project block with em-dash title and tech stack → project', () => {
    const result = classifyBlock({
      heading: 'eBullion – Digital Metals Investment Platform',
      content: 'React | TypeScript | Node.js | PostgreSQL',
    });
    assert.equal(result.type, 'project');
    assert.ok(result.confidence >= 50, `confidence must be >= 50, got ${result.confidence}`);
  });

  test('education block with degree keyword → education', () => {
    const result = classifyBlock({
      heading: 'Bachelor of Engineering',
      content: 'SPPU University\n2020',
    });
    assert.equal(result.type, 'education');
    assert.ok(result.confidence >= 50, `confidence must be >= 50, got ${result.confidence}`);
  });

  test('certification block → certification', () => {
    const result = classifyBlock({
      heading: 'ISTQB Certified Tester',
      content: 'Foundation Level, 2023',
    });
    assert.equal(result.type, 'certification');
    assert.ok(result.confidence >= 50);
  });
});
