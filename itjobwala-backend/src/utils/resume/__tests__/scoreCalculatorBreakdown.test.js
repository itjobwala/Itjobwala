/**
 * scoreCalculatorBreakdown.test.js
 *
 * Run: node --test src/utils/resume/__tests__/scoreCalculatorBreakdown.test.js
 *
 * Covers (current session):
 *   Fix 1 — Framework concepts score from skills AND experience (deduplicated union)
 *   Fix 2 — Framework engineering outranks tool-heavy profiles
 *   Fix 3 — Resume formatting does not affect ATS capability score
 *   Fix 4 — test_design_methodology dimension added and scoring verified
 *   Fix 5 — domain_expertise bonus from experience/project evidence only
 *
 * Covers (previous session, retained):
 *   Breakdown shape — all 13 keys present
 *   Sum integrity — sum(non-informational scores) === rawTotal
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateQaResumeScore } from '../scoreCalculator.js';

// resume_quality is informational — it does not contribute to rawTotal
function sumBreakdown(breakdown) {
  return Object.entries(breakdown)
    .filter(([, d]) => !d.informational)
    .reduce((acc, [, d]) => acc + d.score, 0);
}

// ── Breakdown shape ────────────────────────────────────────────────────────────

describe('Breakdown shape — all 13 expected keys present', () => {

  test('breakdown contains all 13 expected keys', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium', 'testng', 'postman'],
      experienceYears: 3,
      parsedText:      'QA automation 3 years.',
      detectedDomain:  'qa_testing',
    });
    const EXPECTED = [
      'automation_testing', 'api_testing', 'framework_expertise', 'performance_testing',
      'test_design_methodology', 'qa_experience', 'certifications', 'bug_tracking',
      'ci_cd_readiness', 'mobile_testing', 'domain_expertise', 'resume_quality', 'penalties',
    ];
    for (const k of EXPECTED) {
      assert.ok(Object.keys(qa_score_breakdown).includes(k), `Missing key: ${k}`);
    }
    assert.equal(Object.keys(qa_score_breakdown).length, EXPECTED.length, 'Unexpected extra keys');
  });

  test('resume_quality has informational: true', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 2,
      parsedText:      'QA automation.',
      contactInfo:     { email: 'qa@x.com', phone: '123', linkedin: 'linkedin.com/in/qa' },
    });
    assert.equal(qa_score_breakdown.resume_quality.informational, true);
  });

  test('no other dimension has informational flag', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium', 'testng'],
      experienceYears: 3,
      parsedText:      'QA automation.',
    });
    const informational = Object.entries(qa_score_breakdown)
      .filter(([k, d]) => k !== 'resume_quality' && d.informational)
      .map(([k]) => k);
    assert.deepEqual(informational, [], `Unexpected informational dims: ${informational}`);
  });
});

// ── Fix 1: Framework concepts from skills AND experience ──────────────────────

describe('Fix 1 — FW concepts score from skills AND experience text (deduplicated)', () => {

  test('concept in skills only (no mention in text) receives credit', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['page object model', 'hybrid framework', 'bdd'],
      experienceYears: 2,
      parsedText:      'Worked as QA engineer.',        // no concept phrases in text
      detectedDomain:  'qa_testing',
    });
    assert.ok(qa_score_breakdown.framework_expertise.score >= 6,
      `Skills-only concepts should score on framework_expertise, got ${qa_score_breakdown.framework_expertise.score}`);
  });

  test('concept in text only (not listed in skills) receives credit', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 2,
      parsedText:      'Applied page object model, hybrid framework, and bdd approach.',
      detectedDomain:  'qa_testing',
    });
    assert.ok(qa_score_breakdown.framework_expertise.score >= 6,
      `Text-only concepts should score on framework_expertise, got ${qa_score_breakdown.framework_expertise.score}`);
  });

  test('concept in BOTH skills and text counts once, not twice', () => {
    // Profile A: "page object model" in skills only
    const skillsOnly = calculateQaResumeScore({
      extractedSkills: ['page object model'],
      experienceYears: 2,
      parsedText:      'QA engineer.',
      detectedDomain:  'qa_testing',
    });
    // Profile B: "page object model" in BOTH skills and text
    const both = calculateQaResumeScore({
      extractedSkills: ['page object model'],
      experienceYears: 2,
      parsedText:      'Applied page object model in all test projects.',
      detectedDomain:  'qa_testing',
    });
    assert.equal(
      skillsOnly.qa_score_breakdown.framework_expertise.score,
      both.qa_score_breakdown.framework_expertise.score,
      'Same concept in both skills and text must not double-count — scores must be equal'
    );
  });

  test('two unique concepts across skills+text count as 2 (not 1)', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['page object model'],       // concept 1 from skills
      experienceYears: 2,
      parsedText:      'Used hybrid framework design.',  // concept 2 from text
      detectedDomain:  'qa_testing',
    });
    assert.ok(qa_score_breakdown.framework_expertise.score >= 6,
      `Two unique concepts (1 skill, 1 text) should yield >= 6, got ${qa_score_breakdown.framework_expertise.score}`);
  });

  test('bdd in skills without being mentioned in text receives credit', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['bdd', 'cucumber'],
      experienceYears: 2,
      parsedText:      'QA automation engineer.',
      detectedDomain:  'qa_testing',
    });
    assert.ok(qa_score_breakdown.framework_expertise.score >= 3,
      `bdd+cucumber in skills should yield >= 3, got ${qa_score_breakdown.framework_expertise.score}`);
  });
});

// ── Fix 2: Framework engineering outranks tool-heavy profiles ──────────────────

describe('Fix 2 — Framework engineering outranks simple tool listing', () => {

  // Profile A: only AUTO tools (selenium, playwright, cypress)
  const profileA = calculateQaResumeScore({
    extractedSkills: ['selenium', 'playwright', 'cypress'],
    experienceYears: 3,
    parsedText:      'Used selenium playwright and cypress for automated testing.',
    detectedDomain:  'qa_testing',
  });

  // Profile B: framework engineering concepts in skills
  const profileB = calculateQaResumeScore({
    extractedSkills: ['page object model', 'hybrid framework', 'parallel execution', 'retry analyzer', 'allure report'],
    experienceYears: 3,
    parsedText:      'QA engineer with framework design experience.',
    detectedDomain:  'qa_testing',
  });

  test('Profile B (framework engineering) scores higher than Profile A (tools only)', () => {
    const scoreA = profileA.qa_score_breakdown.framework_expertise.score;
    const scoreB = profileB.qa_score_breakdown.framework_expertise.score;
    assert.ok(scoreB > scoreA,
      `Framework engineering (${scoreB}) must outrank tool-heavy (${scoreA})`);
  });

  test('Profile A (selenium+playwright+cypress only) scores 0 on framework_expertise', () => {
    assert.equal(profileA.qa_score_breakdown.framework_expertise.score, 0,
      `Pure AUTO-tool profile should score 0 on framework_expertise`);
  });

  test('Profile B with 5 engineering concepts scores >= 12', () => {
    assert.ok(profileB.qa_score_breakdown.framework_expertise.score >= 12,
      `5 framework concepts should yield >= 12, got ${profileB.qa_score_breakdown.framework_expertise.score}`);
  });

  test('Profile A still scores well on automation_testing (tools belong there)', () => {
    assert.ok(profileA.qa_score_breakdown.automation_testing.score >= 14,
      `selenium+playwright+cypress should score >= 14 on automation_testing`);
  });

  test('framework-adjacent tools add nothing beyond concept score (no cross-dimension double count)', () => {
    // testng/junit/webdriverio already score under automation_testing — framework_expertise
    // must not also credit them, or listing one skill inflates two dimensions.
    const withTools = calculateQaResumeScore({
      extractedSkills: ['page object model', 'testng', 'junit', 'webdriverio'],
      experienceYears: 3,
      parsedText:      'QA engineer.',
      detectedDomain:  'qa_testing',
    });
    const withoutTools = calculateQaResumeScore({
      extractedSkills: ['page object model'],
      experienceYears: 3,
      parsedText:      'QA engineer.',
      detectedDomain:  'qa_testing',
    });
    assert.equal(
      withTools.qa_score_breakdown.framework_expertise.score,
      withoutTools.qa_score_breakdown.framework_expertise.score,
      'framework_expertise must be concept-only — tools should not add supplementary credit'
    );
  });
});

// ── Fix 3: Resume formatting does not affect ATS capability ───────────────────

describe('Fix 3 — Resume formatting does not affect ATS capability score', () => {

  test('two candidates with identical QA skills but different formatting score identically on ATS', () => {
    const withFormatting = calculateQaResumeScore({
      extractedSkills: ['selenium', 'testng', 'postman', 'jira'],
      experienceYears: 3,
      parsedText:      '• Automated regression tests\n• API validation',
      detectedDomain:  'qa_testing',
      contactInfo:     { email: 'qa@test.com', phone: '1234567890', linkedin: 'linkedin.com/in/qa' },
    });
    const withoutFormatting = calculateQaResumeScore({
      extractedSkills: ['selenium', 'testng', 'postman', 'jira'],
      experienceYears: 3,
      parsedText:      'Automated regression tests. API validation.',
      detectedDomain:  'qa_testing',
      contactInfo:     {},
    });
    assert.equal(
      withFormatting.qa_match_score,
      withoutFormatting.qa_match_score,
      `Formatting must not affect ATS score: with=${withFormatting.qa_match_score} vs without=${withoutFormatting.qa_match_score}`
    );
  });

  test('resume_quality score captured for display even though it does not affect ATS', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 2,
      parsedText:      '• Bullet points',
      contactInfo:     { email: 'qa@x.com', phone: '123', linkedin: 'linkedin.com/in/qa' },
    });
    assert.equal(qa_score_breakdown.resume_quality.score, 3,
      'resume_quality.score should still be 3 (stored for display)');
    assert.equal(qa_score_breakdown.resume_quality.max, 3);
  });

  test('resume_quality is excluded from sum (does not count toward rawTotal)', () => {
    const result = calculateQaResumeScore({
      extractedSkills: ['selenium', 'postman'],
      experienceYears: 3,
      parsedText:      '• Bullet points',
      detectedDomain:  'qa_testing',
      contactInfo:     { email: 'qa@x.com', phone: '123', linkedin: 'linkedin.com/in/qa' },
    });
    const sum = sumBreakdown(result.qa_score_breakdown);
    const expected = Math.min(100, Math.max(0, sum));
    assert.equal(result.qa_match_score, expected,
      `sum(non-informational)=${sum} → clamp=${expected}, qa_match_score=${result.qa_match_score}`);
  });
});

// ── Fix 4: Test Design & Methodology dimension ────────────────────────────────

describe('Fix 4 — test_design_methodology dimension', () => {

  test('dimension present with max 10', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 2,
      parsedText:      'QA engineer.',
    });
    assert.equal(qa_score_breakdown.test_design_methodology.max, 10);
  });

  test('score 0 when no methodology signals', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium', 'playwright'],
      experienceYears: 3,
      parsedText:      'Automated UI tests with selenium and playwright.',
      detectedDomain:  'qa_testing',
    });
    assert.equal(qa_score_breakdown.test_design_methodology.score, 0);
  });

  test('score 2 for one technique in skills', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium', 'exploratory testing'],
      experienceYears: 2,
      parsedText:      'QA automation.',
      detectedDomain:  'qa_testing',
    });
    assert.equal(qa_score_breakdown.test_design_methodology.score, 2);
  });

  test('score 4 for two techniques (skill + text, deduplicated)', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['exploratory testing', 'boundary value analysis'],
      experienceYears: 2,
      parsedText:      'Applied exploratory testing approach.',  // duplicate — should not double count
      detectedDomain:  'qa_testing',
    });
    // Only 2 unique techniques: exploratory testing + boundary value analysis
    assert.equal(qa_score_breakdown.test_design_methodology.score, 4,
      'Two unique techniques should yield 4');
  });

  test('score 7 for 3+ techniques', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['exploratory testing', 'boundary value analysis', 'equivalence partitioning'],
      experienceYears: 3,
      parsedText:      'QA engineer.',
      detectedDomain:  'qa_testing',
    });
    assert.equal(qa_score_breakdown.test_design_methodology.score, 7);
  });

  test('score 10 for 5+ techniques', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: [
        'exploratory testing', 'boundary value analysis', 'equivalence partitioning',
        'test case design', 'root cause analysis',
      ],
      experienceYears: 3,
      parsedText:      'QA engineer.',
      detectedDomain:  'qa_testing',
    });
    assert.equal(qa_score_breakdown.test_design_methodology.score, 10);
  });

  test('techniques in text (not skills) also score', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 3,
      parsedText:      'Applied boundary value analysis and equivalence partitioning in test design. Used risk based testing.',
      detectedDomain:  'qa_testing',
    });
    assert.ok(qa_score_breakdown.test_design_methodology.score >= 7,
      `Techniques in text should yield >= 7, got ${qa_score_breakdown.test_design_methodology.score}`);
  });

  test('same technique in skills AND text counts once only', () => {
    const skillsOnly = calculateQaResumeScore({
      extractedSkills: ['exploratory testing'],
      experienceYears: 2,
      parsedText:      'QA engineer.',
    });
    const both = calculateQaResumeScore({
      extractedSkills: ['exploratory testing'],
      experienceYears: 2,
      parsedText:      'Applied exploratory testing to identify defects.',  // also in text
    });
    assert.equal(
      skillsOnly.qa_score_breakdown.test_design_methodology.score,
      both.qa_score_breakdown.test_design_methodology.score,
      'Duplicate in skills+text must count once'
    );
  });

  test('strong manual QA profile receives meaningful TDM credit', () => {
    const manualQA = calculateQaResumeScore({
      extractedSkills: [
        'exploratory testing', 'test case design', 'boundary value analysis',
        'equivalence partitioning', 'root cause analysis', 'defect reporting',
      ],
      experienceYears: 4,
      parsedText:      'Manual QA specialist with deep test design expertise.',
      detectedDomain:  'qa_testing',
    });
    assert.equal(manualQA.qa_score_breakdown.test_design_methodology.score, 10,
      'Strong manual QA profile should receive full 10 pts on test_design_methodology');
  });
});

// ── Fix 5: Domain expertise bonus ─────────────────────────────────────────────

describe('Fix 5 — domain_expertise bonus from experience/project evidence only', () => {

  test('dimension present with max 5', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 2,
      parsedText:      'QA engineer.',
    });
    assert.equal(qa_score_breakdown.domain_expertise.max, 5);
  });

  test('score 0 when no domain evidence anywhere', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium', 'testng', 'postman'],
      experienceYears: 3,
      parsedText:      'Automated regression tests for web application.',
      detectedDomain:  'qa_testing',
    });
    assert.equal(qa_score_breakdown.domain_expertise.score, 0);
  });

  test('score 0 when domain keyword appears only in skills (not experience/projects)', () => {
    // "banking" in skills only — should NOT award domain bonus
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium', 'banking'],
      experienceYears: 3,
      parsedText:      'QA automation engineer.',       // no banking in text
      detectedDomain:  'qa_testing',
      // no experienceEntries with banking in description
    });
    assert.equal(qa_score_breakdown.domain_expertise.score, 0,
      'Domain keyword in skills section only must not award domain bonus');
  });

  test('score 2 for one domain phrase in experience description', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium', 'testng'],
      experienceYears: 3,
      parsedText:      'QA automation engineer.',
      detectedDomain:  'qa_testing',
      experienceEntries: [
        { description: 'Worked on testing payment gateway flows for an e-commerce client.' },
      ],
    });
    assert.ok(qa_score_breakdown.domain_expertise.score >= 2,
      `One domain phrase in experience should yield >= 2, got ${qa_score_breakdown.domain_expertise.score}`);
  });

  test('score 3 for two domain phrases in experience', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 4,
      parsedText:      'QA engineer.',
      detectedDomain:  'qa_testing',
      experienceEntries: [
        { description: 'Worked as QA engineer testing e-commerce product catalog features.' },
        { description: 'Validated insurance claim management module workflows.' },
      ],
    });
    assert.equal(qa_score_breakdown.domain_expertise.score, 3,
      'Two domain phrases (e-commerce + insurance) should yield 3');
  });

  test('score 5 for 3+ domain phrases in experience/projects', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 5,
      parsedText:      'QA engineer.',
      detectedDomain:  'qa_testing',
      experienceEntries: [
        { description: 'Worked in banking sector testing core banking modules.' },
        { description: 'Validated payment gateway and fintech payment processing.' },
      ],
      projectEntries: [
        { name: 'Healthcare Portal', description: 'Automated healthcare patient portal testing.' },
      ],
    });
    assert.equal(qa_score_breakdown.domain_expertise.score, 5,
      '3+ domain phrases across experience+projects should yield 5');
  });

  test('domain bonus does not fire from parsedText skills section alone', () => {
    // parsedText may contain skills section — bonus must not fire without experience/project evidence
    const withSkillsInText = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 2,
      parsedText:      'Skills: banking payments fintech insurance healthcare telecom.',
      detectedDomain:  'qa_testing',
      experienceEntries: [],
      projectEntries:   [],
    });
    assert.equal(withSkillsInText.qa_score_breakdown.domain_expertise.score, 0,
      'Domain phrases in parsedText (skills section) without experience entries must not award bonus');
  });
});

// ── Sum integrity ──────────────────────────────────────────────────────────────

describe('Sum integrity — sum(non-informational scores) === rawTotal (pre-cap)', () => {

  test('typical mid-level profile: sum matches qa_match_score', () => {
    const result = calculateQaResumeScore({
      extractedSkills: ['selenium', 'testng', 'postman', 'jira', 'jenkins'],
      experienceYears: 3,
      parsedText:      'QA automation engineer. Regression testing. Functional testing.',
      detectedDomain:  'qa_testing',
      contactInfo:     {},
    });
    const sum = sumBreakdown(result.qa_score_breakdown);
    if (result.qa_match_score < 100) {
      assert.equal(sum, result.qa_match_score,
        `sum=${sum} must equal qa_match_score=${result.qa_match_score}`);
    } else {
      assert.ok(sum >= 100, 'Capped profile: sum should be >= 100');
    }
  });

  test('profile with mobile bonus: sum accounts for bonus', () => {
    const result = calculateQaResumeScore({
      extractedSkills: ['selenium', 'testng'],
      experienceYears: 2,
      parsedText:      'Android testing ios testing mobile automation real device testing.',
      detectedDomain:  'qa_testing',
      contactInfo:     {},
    });
    assert.equal(result.qa_score_breakdown.mobile_testing.score, 5, 'mobile bonus should be 5');
    const sum = sumBreakdown(result.qa_score_breakdown);
    if (result.qa_match_score < 100) {
      assert.equal(sum, result.qa_match_score, `sum=${sum} must equal qa_match_score=${result.qa_match_score}`);
    }
  });

  test('profile with domain bonus: sum accounts for bonus', () => {
    const result = calculateQaResumeScore({
      extractedSkills: ['selenium'],
      experienceYears: 4,
      parsedText:      'QA engineer.',
      detectedDomain:  'qa_testing',
      contactInfo:     {},
      experienceEntries: [
        { description: 'Worked in banking and payments domain at a major fintech firm.' },
      ],
    });
    assert.ok(result.qa_score_breakdown.domain_expertise.score >= 3, 'domain bonus should be >= 3');
    const sum = sumBreakdown(result.qa_score_breakdown);
    const expected = Math.min(100, Math.max(0, sum));
    assert.equal(result.qa_match_score, expected,
      `qa_match_score=${result.qa_match_score} must equal clamp(sum,0,100)=${expected}`);
  });

  test('format bonus stored in resume_quality but excluded from sum', () => {
    const result = calculateQaResumeScore({
      extractedSkills: ['selenium', 'postman'],
      experienceYears: 3,
      parsedText:      '• Automated tests\n• API validation',
      detectedDomain:  'qa_testing',
      contactInfo:     { email: 'qa@test.com', phone: '1234567890', linkedin: 'linkedin.com/in/qa' },
    });
    // resume_quality stores the value but is informational
    assert.equal(result.qa_score_breakdown.resume_quality.score, 3, 'resume_quality should be 3');
    const sum = sumBreakdown(result.qa_score_breakdown);       // excludes resume_quality
    const expected = Math.min(100, Math.max(0, sum));
    assert.equal(result.qa_match_score, expected,
      `qa_match_score=${result.qa_match_score} must equal clamp(sum without resume_quality,0,100)=${expected}`);
  });

  test('pure manual QA (penalty -8): sum accounts for negative penalty', () => {
    const result = calculateQaResumeScore({
      extractedSkills: ['manual testing', 'regression testing', 'test cases'],
      experienceYears: 2,
      parsedText:      'Manual QA tester. Test case writing.',
      detectedDomain:  'qa_testing',
      contactInfo:     {},
    });
    assert.equal(result.qa_score_breakdown.penalties.score, -8, 'penalty should be -8');
    const sum = sumBreakdown(result.qa_score_breakdown);
    const expected = Math.min(100, Math.max(0, sum));
    assert.equal(result.qa_match_score, expected,
      `qa_match_score=${result.qa_match_score} must equal clamp(sum,0,100)=${expected}`);
  });

  test('penalties.score = 0 (not -0) when no penalty applies', () => {
    const { qa_score_breakdown } = calculateQaResumeScore({
      extractedSkills: ['selenium', 'postman'],
      experienceYears: 2,
      parsedText:      'Automation QA with Selenium and Postman.',
      detectedDomain:  'qa_testing',
    });
    assert.equal(qa_score_breakdown.penalties.score, 0);
  });

  test('fresher profile: sum === qa_match_score', () => {
    const result = calculateQaResumeScore({
      extractedSkills: [],
      experienceYears: 0,
      parsedText:      'Fresher QA interested in software testing.',
      detectedDomain:  'qa_testing',
      contactInfo:     {},
    });
    const sum = sumBreakdown(result.qa_score_breakdown);
    assert.equal(result.qa_match_score, Math.min(100, Math.max(0, sum)));
  });
});
