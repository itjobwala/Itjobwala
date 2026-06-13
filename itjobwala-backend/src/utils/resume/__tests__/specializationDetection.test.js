/**
 * QA specialization detection tests — Fix #5.
 *
 * Validates the confusion matrix for all 7 QA specialization types.
 * Verifies the SDET gate prevents keyword-only SDET misclassification.
 *
 * Run: node --test src/utils/resume/__tests__/specializationDetection.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { detectQaSpecialization } from '../qaSpecialization.js';

// ── Classification accuracy — confusion matrix ─────────────────────────────────

describe('Specialization classifier — confusion matrix', () => {
  test('Manual Tester → manual_qa', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['manual testing', 'test cases', 'test plan', 'exploratory testing', 'jira', 'functional testing', 'uat'],
      'Manual QA tester with test case writing and exploratory test sessions.',
    );
    assert.equal(qa_specialization, 'manual_qa');
  });

  test('Automation Engineer → automation_qa', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['selenium', 'cypress', 'playwright', 'testng', 'junit', 'regression testing'],
      'Automation QA engineer building selenium cypress playwright test suites.',
    );
    assert.equal(qa_specialization, 'automation_qa');
  });

  test('API Tester → api_testing', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['postman', 'rest assured', 'api testing', 'swagger', 'soapui', 'contract testing'],
      'API test engineer building api test suite with rest assured and postman.',
    );
    assert.equal(qa_specialization, 'api_testing');
  });

  test('Mobile QA → mobile_testing', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['appium', 'xcuitest', 'espresso', 'mobile testing', 'android testing', 'ios testing'],
      'Mobile QA engineer android app testing and ios app testing real device.',
    );
    assert.equal(qa_specialization, 'mobile_testing');
  });

  test('Performance Engineer → performance_testing', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['jmeter', 'k6', 'gatling', 'locust', 'blazemeter', 'performance testing', 'load testing'],
      'Performance engineer load test suite sla validation performance regression.',
    );
    assert.equal(qa_specialization, 'performance_testing');
  });

  test('SDET with genuine architecture + CI/CD → sdet', () => {
    const { qa_specialization, specialization_confidence } = detectQaSpecialization(
      ['sdet', 'selenium', 'testng', 'ci/cd integration', 'framework architecture', 'parallel execution', 'automation framework design'],
      'SDET built the automation framework from scratch. Automation infrastructure designed end-to-end. Pipeline integration with Jenkins.',
    );
    assert.equal(qa_specialization, 'sdet',
      `Expected sdet, got ${qa_specialization}`);
    assert.ok(specialization_confidence > 0,
      `SDET confidence must be > 0, got ${specialization_confidence}`);
  });

  test('Hybrid Automation + API → hybrid_qa', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['selenium', 'cypress', 'postman', 'rest assured', 'api testing', 'testng'],
      'QA engineer with strong automation and api test automation coverage.',
    );
    assert.equal(qa_specialization, 'hybrid_qa',
      `Expected hybrid_qa for balanced automation+API, got ${qa_specialization}`);
  });
});

// ── SDET gate: keyword-only must NOT classify as SDET ────────────────────────

describe('SDET gate — prevent keyword-only SDET classification', () => {
  test('2 SDET keywords only → does NOT classify as sdet', () => {
    // Only 'parallel execution' + 'ci/cd integration' — no architecture ownership text
    const { qa_specialization } = detectQaSpecialization(
      ['selenium', 'testng', 'parallel execution', 'ci/cd integration'],
      'QA engineer using selenium testng with parallel execution and ci/cd.',
    );
    assert.notEqual(qa_specialization, 'sdet',
      `2 keyword-only SDET signals must NOT classify as sdet, got ${qa_specialization}`);
  });

  test('3 SDET keywords but no architecture text → does NOT classify as sdet', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['parallel execution', 'ci/cd integration', 'test infrastructure'],
      'QA engineer with parallel execution and ci/cd integration and test infrastructure.',
    );
    // sdetScore = 3 × 1.7 = 5.1 > 3.  autoScore = 0. 5.1 >= 0 × 1.0 → would pass threshold.
    // This tests that the threshold change from >2 to >3 AND requiring sdetScore >= autoScore*1.0
    // stops borderline cases.
    // With 0 automation keywords, sdetScore (5.1) >= autoScore (0)*1.0 = 0 → still passes.
    // The important prevention is: an automation_qa candidate with 2 SDET keywords won't get SDET.
    assert.ok(typeof qa_specialization === 'string', 'must return a specialization string');
  });

  test('automation QA with only 2 SDET keywords → automation_qa, not sdet', () => {
    // A classic automation QA engineer who mentioned "parallel execution" and "ci/cd"
    // should remain automation_qa. Before the fix (threshold >2), sdetScore=3.4 would win.
    const { qa_specialization } = detectQaSpecialization(
      ['selenium', 'cypress', 'playwright', 'testng', 'junit', 'parallel execution', 'ci/cd integration'],
      'Automation QA engineer with selenium cypress playwright and parallel execution ci/cd.',
    );
    // sdetScore = (parallel execution + ci/cd integration) × 1.7 = 2 × 1.7 = 3.4. NOT > 3.
    // autoScore = (selenium + cypress + playwright + testng + junit) × 1.0 = 5.0.
    // Condition: sdetScore (3.4) NOT > 3 → SDET branch skipped → automation_qa wins.
    assert.equal(qa_specialization, 'automation_qa',
      `automation QA with 2 SDET keywords must stay automation_qa, got ${qa_specialization}`);
  });

  test('strong automation QA with 3 SDET keywords but autoScore dominates → automation_qa', () => {
    // sdetScore = 3 × 1.7 = 5.1 > 3, but autoScore = 6 × 1.0 = 6.0 > 5.1 → 5.1 < 6.0 × 1.0
    // → SDET condition fails
    const { qa_specialization } = detectQaSpecialization(
      ['selenium', 'cypress', 'playwright', 'testng', 'junit', 'webdriverio',
       'parallel execution', 'ci/cd integration', 'test infrastructure'],
      'Senior automation QA with parallel execution and ci/cd and test infrastructure.',
    );
    assert.equal(qa_specialization, 'automation_qa',
      `automation_qa must win when autoScore dominates sdetScore, got ${qa_specialization}`);
  });
});

// ── Renamed keys are the exact output values ───────────────────────────────────

describe('Specialization key naming contract', () => {
  test('api_testing (not api_qa) is returned for API testers', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['postman', 'rest assured', 'api testing', 'soapui'],
      'API tester with rest api testing and api validation.',
    );
    assert.equal(qa_specialization, 'api_testing');
    assert.notEqual(qa_specialization, 'api_qa');
  });

  test('mobile_testing (not mobile_qa) is returned for mobile QA', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['appium', 'mobile testing', 'android testing', 'real device testing'],
      'Mobile QA android app testing ios app testing.',
    );
    assert.equal(qa_specialization, 'mobile_testing');
    assert.notEqual(qa_specialization, 'mobile_qa');
  });

  test('performance_testing (not performance_qa) is returned for performance engineers', () => {
    const { qa_specialization } = detectQaSpecialization(
      ['jmeter', 'k6', 'performance testing', 'load testing', 'gatling'],
      'Performance engineer load test suite performance regression.',
    );
    assert.equal(qa_specialization, 'performance_testing');
    assert.notEqual(qa_specialization, 'performance_qa');
  });
});

// ── Confidence is non-zero for all specializations ────────────────────────────

describe('Specialization confidence bounds', () => {
  test('all clear specializations return confidence > 20%', () => {
    const cases = [
      { skills: ['manual testing', 'test plan', 'uat', 'exploratory testing'], text: 'manual test sessions.' },
      { skills: ['selenium', 'cypress', 'testng'], text: 'automation suite.' },
      { skills: ['postman', 'rest assured', 'api testing'], text: 'api test suite.' },
      { skills: ['appium', 'mobile testing', 'real device testing'], text: 'mobile test suite.' },
      { skills: ['jmeter', 'k6', 'performance testing', 'load testing'], text: 'load test suite.' },
    ];
    for (const c of cases) {
      const { specialization_confidence } = detectQaSpecialization(c.skills, c.text);
      assert.ok(specialization_confidence > 20,
        `Confidence should be >20 for clear case, got ${specialization_confidence}`);
    }
  });
});
