/**
 * QA eligibility gate unit tests.
 *
 * The gate is in ats.service.js → runATSAnalysis().
 * These tests exercise the domain-detection layer that drives the gate, which
 * is simpler and faster to unit-test than the full service (no DB, no file I/O).
 *
 * Run: node --test src/utils/resume/__tests__/qaEligibilityGate.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { detectSkillDomain } from '../domainDetection.js';

// ── Helper ─────────────────────────────────────────────────────────────────────

function isEligible(skills) {
  return detectSkillDomain(skills).domain === 'qa_testing';
}

// ── QA resumes must pass the gate ─────────────────────────────────────────────

describe('Gate — QA resumes are eligible', () => {
  test('automation QA engineer with Selenium/Cypress/Playwright', () => {
    assert.ok(isEligible(['selenium', 'cypress', 'playwright', 'testng', 'regression testing']));
  });

  test('manual QA with test plan / exploratory testing', () => {
    assert.ok(isEligible(['manual testing', 'exploratory testing', 'test plan', 'jira', 'uat']));
  });

  test('API tester with Postman / REST Assured', () => {
    assert.ok(isEligible(['postman', 'rest assured', 'api testing', 'soapui', 'swagger']));
  });

  test('performance engineer with JMeter / K6', () => {
    assert.ok(isEligible(['jmeter', 'k6', 'gatling', 'performance testing', 'load testing']));
  });

  test('mobile QA with Appium / real device testing', () => {
    assert.ok(isEligible(['appium', 'mobile testing', 'android testing', 'ios testing', 'xcuitest']));
  });

  test('SDET with framework architecture signals', () => {
    assert.ok(isEligible(['sdet', 'selenium', 'testng', 'ci/cd integration', 'framework architecture']));
  });

  test('QA lead with STLC / quality assurance', () => {
    assert.ok(isEligible(['quality assurance', 'stlc', 'test strategy', 'jira', 'testrail', 'regression testing']));
  });
});

// ── Non-QA resumes must be rejected ───────────────────────────────────────────

describe('Gate — non-QA resumes are ineligible', () => {
  test('backend engineer: node.js / express / postgresql', () => {
    const result = detectSkillDomain(['node.js', 'express', 'postgresql', 'mongodb', 'docker', 'redis', 'rest api', 'typescript']);
    assert.notEqual(result.domain, 'qa_testing', `Expected non-QA domain, got: ${result.domain}`);
  });

  test('frontend engineer: react / typescript / next.js', () => {
    const result = detectSkillDomain(['react', 'typescript', 'next.js', 'tailwindcss', 'redux', 'css', 'html', 'figma']);
    assert.notEqual(result.domain, 'qa_testing', `Expected non-QA domain, got: ${result.domain}`);
  });

  test('devops engineer: docker / kubernetes / terraform', () => {
    const result = detectSkillDomain(['docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions', 'aws', 'helm']);
    assert.notEqual(result.domain, 'qa_testing', `Expected non-QA domain, got: ${result.domain}`);
  });

  test('cloud engineer: aws / azure / gcp', () => {
    const result = detectSkillDomain(['aws', 'azure', 'gcp', 'terraform', 'lambda', 's3', 'cloudfront', 'serverless']);
    assert.notEqual(result.domain, 'qa_testing', `Expected non-QA domain, got: ${result.domain}`);
  });

  test('AI/ML engineer: pytorch / langchain / nlp', () => {
    const result = detectSkillDomain(['python', 'pytorch', 'langchain', 'llm', 'huggingface', 'nlp', 'machine learning', 'tensorflow']);
    assert.notEqual(result.domain, 'qa_testing', `Expected non-QA domain, got: ${result.domain}`);
  });

  test('mobile developer: flutter / react native / swift', () => {
    const result = detectSkillDomain(['flutter', 'react native', 'swift', 'kotlin', 'android studio', 'ios', 'expo']);
    assert.notEqual(result.domain, 'qa_testing', `Expected non-QA domain, got: ${result.domain}`);
  });
});

// ── Ineligible response shape ──────────────────────────────────────────────────

describe('Gate — ineligible response contract', () => {
  test('non-QA detection returns correct shape', () => {
    const result = detectSkillDomain(['node.js', 'express', 'postgresql', 'docker']);
    // Simulate gate output shape
    const gateResponse = {
      eligible:          false,
      reason:            'non_qa_resume',
      detected_domain:   result.domain,
      domain_confidence: result.confidence,
      domain_label:      result.label,
    };
    assert.equal(gateResponse.eligible, false);
    assert.equal(gateResponse.reason, 'non_qa_resume');
    assert.ok(typeof gateResponse.detected_domain === 'string');
    assert.ok(typeof gateResponse.domain_confidence === 'number');
    assert.ok(typeof gateResponse.domain_label === 'string');
  });

  test('empty skills treated as general (ineligible)', () => {
    const result = detectSkillDomain([]);
    assert.equal(result.domain, 'general');
    assert.notEqual(result.domain, 'qa_testing');
  });
});

// ── QA boost: mixed QA + backend should still resolve to QA ──────────────────

describe('Gate — QA-first bias (1.6× boost)', () => {
  test('candidate with both selenium and docker/node.js resolves to QA', () => {
    // This person writes automation tests for a Node.js backend — QA role.
    const result = detectSkillDomain([
      'selenium', 'cypress', 'testng', 'jmeter', 'api testing',
      'node.js', 'docker', 'git',
    ]);
    assert.equal(result.domain, 'qa_testing', `Expected qa_testing with QA boost, got: ${result.domain}`);
  });
});
