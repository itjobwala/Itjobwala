/**
 * Domain scorer unit tests — deriveCareerLevel, calculateGenericScore, domain routing.
 * Run: node --test src/utils/resume/__tests__/domainScorer.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { deriveCareerLevel, detectCareerLevel } from '../careerCalibration.js';
import { calculateGenericScore } from '../genericScorer.js';
import { calculateQaResumeScore } from '../scoreCalculator.js';

// ── deriveCareerLevel ──────────────────────────────────────────────────────────

describe('deriveCareerLevel — exact thresholds', () => {
  test('0 years → fresher', () => {
    assert.equal(deriveCareerLevel(0), 'fresher');
  });

  test('0.5 years → fresher', () => {
    assert.equal(deriveCareerLevel(0.5), 'fresher');
  });

  test('1 year → junior', () => {
    assert.equal(deriveCareerLevel(1), 'junior');
  });

  test('2 years → junior', () => {
    assert.equal(deriveCareerLevel(2), 'junior');
  });

  test('3 years → mid_level', () => {
    assert.equal(deriveCareerLevel(3), 'mid_level');
  });

  test('5 years → mid_level', () => {
    assert.equal(deriveCareerLevel(5), 'mid_level');
  });

  test('6 years → senior', () => {
    assert.equal(deriveCareerLevel(6), 'senior');
  });

  test('9 years → senior', () => {
    assert.equal(deriveCareerLevel(9), 'senior');
  });

  test('10 years → lead', () => {
    assert.equal(deriveCareerLevel(10), 'lead');
  });

  test('15 years → lead', () => {
    assert.equal(deriveCareerLevel(15), 'lead');
  });

  test('negative years → fresher', () => {
    assert.equal(deriveCareerLevel(-1), 'fresher');
  });

  test('null/undefined → fresher', () => {
    assert.equal(deriveCareerLevel(null), 'fresher');
    assert.equal(deriveCareerLevel(undefined), 'fresher');
  });
});

describe('deriveCareerLevel — boundary edges', () => {
  test('2.9 years → junior (not mid_level)', () => {
    assert.equal(deriveCareerLevel(2.9), 'junior');
  });

  test('5.9 years → mid_level (not senior)', () => {
    assert.equal(deriveCareerLevel(5.9), 'mid_level');
  });

  test('9.9 years → senior (not lead)', () => {
    assert.equal(deriveCareerLevel(9.9), 'senior');
  });
});

// ── calculateGenericScore — output contract ────────────────────────────────────

describe('calculateGenericScore — output shape', () => {
  test('returns all required fields', () => {
    const result = calculateGenericScore({
      extractedSkills: ['react', 'typescript', 'node.js'],
      experienceYears: 3,
      detectedDomain:  'frontend',
    });
    assert.ok(typeof result.qa_match_score === 'number', 'qa_match_score must be number');
    assert.ok(result.qa_match_score >= 0 && result.qa_match_score <= 100, 'score must be 0-100');
    assert.ok(typeof result.qa_seniority === 'string', 'qa_seniority must be string');
    assert.ok(typeof result.qa_hiring_label === 'string', 'qa_hiring_label must be string');
    assert.ok(typeof result.qa_score_breakdown === 'object', 'qa_score_breakdown must be object');
    assert.ok(Array.isArray(result.strengths), 'strengths must be array');
    assert.ok(Array.isArray(result.weaknesses), 'weaknesses must be array');
    assert.ok(Array.isArray(result.suggestions), 'suggestions must be array');
  });

  test('score is integer', () => {
    const result = calculateGenericScore({
      extractedSkills: ['node.js', 'postgresql'],
      experienceYears: 2,
      detectedDomain:  'backend',
    });
    assert.equal(result.qa_match_score, Math.round(result.qa_match_score));
  });

  test('no crash with all defaults', () => {
    assert.doesNotThrow(() => calculateGenericScore());
  });

  test('no crash with empty skills', () => {
    const result = calculateGenericScore({ extractedSkills: [], experienceYears: 0, detectedDomain: 'backend' });
    assert.ok(result.qa_match_score >= 0);
  });
});

// ── calculateGenericScore — non-QA resumes score fairly ───────────────────────

describe('calculateGenericScore — no QA penalty', () => {
  test('backend dev with 8 matching skills scores > 20', () => {
    const result = calculateGenericScore({
      extractedSkills:   ['node.js', 'express', 'postgresql', 'mongodb', 'docker', 'redis', 'rest api', 'typescript'],
      experienceYears:   4,
      detectedDomain:    'backend',
      projectEntries:    [{ name: 'API Service', description: 'REST API with Node.js', tools: ['node.js', 'postgresql'] }],
    });
    assert.ok(result.qa_match_score > 20, `Expected > 20, got ${result.qa_match_score}`);
  });

  test('frontend dev with React/TS/NextJS scores > 30', () => {
    const result = calculateGenericScore({
      extractedSkills:   ['react', 'typescript', 'tailwindcss', 'next.js', 'redux', 'css', 'html'],
      experienceYears:   5,
      detectedDomain:    'frontend',
      projectEntries:    [{ name: 'Web App', description: 'React dashboard', tools: ['react', 'typescript'] }],
    });
    assert.ok(result.qa_match_score > 30, `Expected > 30, got ${result.qa_match_score}`);
  });

  test('devops engineer with docker/k8s/terraform scores > 40', () => {
    const result = calculateGenericScore({
      extractedSkills:   ['docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions', 'aws', 'helm'],
      experienceYears:   4,
      detectedDomain:    'devops',
    });
    assert.ok(result.qa_match_score > 40, `Expected > 40, got ${result.qa_match_score}`);
  });

  test('ai_ml engineer with langchain/pytorch scores > 40', () => {
    const result = calculateGenericScore({
      extractedSkills:   ['python', 'pytorch', 'langchain', 'llm', 'huggingface', 'nlp', 'machine learning', 'tensorflow'],
      experienceYears:   3,
      detectedDomain:    'ai_ml',
    });
    assert.ok(result.qa_match_score > 40, `Expected > 40, got ${result.qa_match_score}`);
  });

  test('general domain fallback works', () => {
    const result = calculateGenericScore({
      extractedSkills: ['python', 'sql'],
      experienceYears: 2,
      detectedDomain:  'general',
    });
    assert.ok(typeof result.qa_match_score === 'number');
    assert.ok(result.qa_match_score >= 0 && result.qa_match_score <= 100);
  });
});

// ── calculateGenericScore — career level via deriveCareerLevel ─────────────────

describe('calculateGenericScore — career level', () => {
  test('0 years → qa_seniority fresher', () => {
    const result = calculateGenericScore({ extractedSkills: [], experienceYears: 0, detectedDomain: 'backend' });
    assert.equal(result.qa_seniority, 'fresher');
  });

  test('1 year → qa_seniority junior', () => {
    const result = calculateGenericScore({ extractedSkills: [], experienceYears: 1, detectedDomain: 'backend' });
    assert.equal(result.qa_seniority, 'junior');
  });

  test('6 years → qa_seniority senior', () => {
    const result = calculateGenericScore({ extractedSkills: [], experienceYears: 6, detectedDomain: 'backend' });
    assert.equal(result.qa_seniority, 'senior');
  });

  test('10 years → qa_seniority lead', () => {
    const result = calculateGenericScore({ extractedSkills: [], experienceYears: 10, detectedDomain: 'backend' });
    assert.equal(result.qa_seniority, 'lead');
  });
});

// ── calculateGenericScore — project relevance boost ───────────────────────────

describe('calculateGenericScore — project relevance', () => {
  test('projects with matching domain tools raise score', () => {
    const withProjects = calculateGenericScore({
      extractedSkills: ['react', 'typescript'],
      experienceYears: 3,
      detectedDomain:  'frontend',
      projectEntries:  [
        { name: 'App 1', tools: ['react', 'typescript'] },
        { name: 'App 2', tools: ['next.js', 'tailwindcss'] },
      ],
    });
    const withoutProjects = calculateGenericScore({
      extractedSkills: ['react', 'typescript'],
      experienceYears: 3,
      detectedDomain:  'frontend',
      projectEntries:  [],
    });
    assert.ok(withProjects.qa_match_score > withoutProjects.qa_match_score,
      `with projects (${withProjects.qa_match_score}) should exceed without projects (${withoutProjects.qa_match_score})`);
  });
});

// ── Fix #2 — career_level === qa_seniority parity ─────────────────────────────

const QA_PARITY_CASES = [
  {
    label: 'Fresher manual QA — 0 years',
    input: { extractedSkills: ['manual testing', 'test cases', 'jira'], experienceYears: 0, parsedText: 'Manual QA fresher.', detectedDomain: 'qa_testing' },
    expectedLevel: 'fresher',
  },
  {
    label: 'Junior automation QA — 1 year',
    input: { extractedSkills: ['selenium', 'testng', 'java', 'jira'], experienceYears: 1, parsedText: 'Junior QA 1 year selenium.', detectedDomain: 'qa_testing' },
    expectedLevel: 'junior',
  },
  {
    label: 'Mid-level QA — 3 years',
    input: { extractedSkills: ['selenium', 'cypress', 'postman', 'rest assured', 'jira', 'ci/cd'], experienceYears: 3, parsedText: 'Automation QA 3 years.', detectedDomain: 'qa_testing' },
    expectedLevel: 'mid_level',
  },
  {
    label: 'Senior QA — 6 years',
    input: { extractedSkills: ['selenium', 'cypress', 'playwright', 'jmeter', 'postman', 'jenkins'], experienceYears: 6, parsedText: 'Senior QA engineer 6 years.', detectedDomain: 'qa_testing' },
    expectedLevel: 'senior',
  },
  {
    // P0 Fix 1: text signals no longer promote career level — 4yr = mid_level
    label: 'Mid-Level QA — 4yr (ownership phrase no longer promotes to senior)',
    input: { extractedSkills: ['selenium', 'testng', 'jenkins', 'postman'], experienceYears: 4, parsedText: 'Built automation framework from scratch using selenium and testng.', detectedDomain: 'qa_testing' },
    expectedLevel: 'mid_level',
  },
  {
    // P0 Fix 1: same change — 4yr = mid_level regardless of ownership phrase
    label: 'Mid-Level QA — 4yr ("framework from scratch" no longer promotes to senior)',
    input: { extractedSkills: ['selenium', 'testng', 'docker'], experienceYears: 4, parsedText: 'Developed framework from scratch for regression testing.', detectedDomain: 'qa_testing' },
    expectedLevel: 'mid_level',
  },
  {
    label: 'Lead QA — 10 years',
    input: { extractedSkills: ['selenium', 'cypress', 'jmeter', 'appium', 'postman'], experienceYears: 10, parsedText: 'QA professional 10 years.', detectedDomain: 'qa_testing' },
    expectedLevel: 'lead',
  },
  {
    // P0 Fix 1: "QA Lead" title no longer overrides years — 5yr < 6yr = mid_level
    label: 'Mid-Level QA — 5yr (title "QA Lead" no longer overrides year-based level)',
    input: { extractedSkills: ['selenium', 'testng', 'jira'], experienceYears: 5, parsedText: 'QA Lead at FinTech Corp led team of 6 engineers.', detectedDomain: 'qa_testing' },
    expectedLevel: 'mid_level',
  },
];

describe('Fix #2 — qa_seniority and career_level are always identical (parity regression guard)', () => {
  for (const { label, input, expectedLevel } of QA_PARITY_CASES) {
    test(label, () => {
      const qaResult    = calculateQaResumeScore(input);
      const careerLevel = detectCareerLevel({ experienceYears: input.experienceYears, parsedText: input.parsedText });

      assert.equal(
        qaResult.qa_seniority, careerLevel,
        `qa_seniority (${qaResult.qa_seniority}) !== career_level (${careerLevel}) — they must always match`,
      );
      assert.equal(
        qaResult.qa_seniority, expectedLevel,
        `Expected '${expectedLevel}', got '${qaResult.qa_seniority}'`,
      );
    });
  }
});
