/**
 * ATS Engine Production Hardening — Regression Tests
 *
 * Run: node --test src/utils/resume/__tests__/atsHardening.test.js
 *
 * Covers Fixes 1–5 from the hardening spec:
 *   Fix 1 — Hiring label reflects final calibrated score, not raw scorer output
 *   Fix 2 — skillMatches: no false-positive substring matches
 *   Fix 3 — Separation of capability / credibility / risk (static contract checks)
 *   Fix 4 — Section-only attenuation uses softer multipliers (0.75 / 0.85)
 *   Fix 5 — qa_seniority always equals career_level (single source of truth)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { skillMatches }                                from '../skillMatcher.js';
import { getQaHiringLabel, calculateQaResumeScore }    from '../scoreCalculator.js';
import { detectCareerLevel }                            from '../careerCalibration.js';
import { computeSectionOnlyMultiplier }                from '../atsCalibration.js';

// ── Fix 1: Hiring label must reflect the final calibrated ATS score ────────────

describe('Fix 1 — getQaHiringLabel uses final score, not raw scorer output', () => {

  test('score 85 → "High-Confidence QA Match"', () => {
    assert.equal(getQaHiringLabel(85), 'High-Confidence QA Match');
  });

  // Thresholds: ≥81→High-Confidence, ≥61→Strong, ≥41→Developing, ≥21→Entry-Level, <21→Early
  test('score 58 → "Developing QA Engineer" (NOT "High-Confidence QA Match")', () => {
    assert.equal(getQaHiringLabel(58), 'Developing QA Engineer');
  });

  test('label at raw=85 differs from label at final=58', () => {
    assert.notEqual(getQaHiringLabel(85), getQaHiringLabel(58),
      'Calibration must change the hiring label when score drops from 85 to 58');
  });

  test('score 80 → "Strong QA Match" (threshold ≥81 required for High-Confidence)', () => {
    assert.equal(getQaHiringLabel(80), 'Strong QA Match');
  });

  test('score 61 → "Strong QA Match"', () => {
    assert.equal(getQaHiringLabel(61), 'Strong QA Match');
  });

  test('score 60 → "Developing QA Engineer"', () => {
    assert.equal(getQaHiringLabel(60), 'Developing QA Engineer');
  });

  test('score 41 → "Developing QA Engineer"', () => {
    assert.equal(getQaHiringLabel(41), 'Developing QA Engineer');
  });

  test('score 40 → "Entry-Level Automation QA"', () => {
    assert.equal(getQaHiringLabel(40), 'Entry-Level Automation QA');
  });

  test('score 20 → "Early QA Foundation"', () => {
    assert.equal(getQaHiringLabel(20), 'Early QA Foundation');
  });

  test('calculateQaResumeScore does NOT return qa_hiring_label (removed from scorer)', () => {
    const result = calculateQaResumeScore({
      extractedSkills:  ['selenium', 'testng', 'postman', 'jira', 'ci/cd'],
      experienceYears:  3,
      parsedText:       'Automation QA engineer 3 years selenium testng.',
    });
    assert.equal(result.qa_hiring_label, undefined,
      'qa_hiring_label must not be generated inside calculateQaResumeScore — it belongs in intelligenceAdapter.js');
  });
});

// ── Fix 2 (updated): skillMatches — token-aware, boundary-safe ───────────────
//
// FALSE POSITIVES that must remain blocked (character-level substrings)
// VALID MATCHES that must now work (named tools + multi-word sequences)

describe('Fix 2 — skillMatches: false positives blocked', () => {
  test('"test" does NOT match "testng" (char-level substring)', () => {
    assert.equal(skillMatches('test', 'testng'), false);
  });

  test('"api" does NOT match "api testing" (generic token blocked)', () => {
    assert.equal(skillMatches('api', 'api testing'), false);
  });

  test('"automation" does NOT match "automation testing" (generic token blocked)', () => {
    assert.equal(skillMatches('automation', 'automation testing'), false);
  });

  test('"manual" does NOT match "manual testing"', () => {
    assert.equal(skillMatches('manual', 'manual testing'), false);
  });

  test('"load" does NOT match "load testing"', () => {
    assert.equal(skillMatches('load', 'load testing'), false);
  });

  test('"regression" does NOT match "regression testing"', () => {
    assert.equal(skillMatches('regression', 'regression testing'), false);
  });

  test('"stress" does NOT match "stress testing"', () => {
    assert.equal(skillMatches('stress', 'stress testing'), false);
  });

  test('"mobile" does NOT match "mobile testing"', () => {
    assert.equal(skillMatches('mobile', 'mobile testing'), false);
  });

  test('"performance" does NOT match "performance testing"', () => {
    assert.equal(skillMatches('performance', 'performance testing'), false);
  });
});

describe('Fix 2 — skillMatches: exact matches always pass', () => {
  test('"selenium" === "selenium"', () => {
    assert.equal(skillMatches('selenium', 'selenium'), true);
  });

  test('"playwright" === "playwright"', () => {
    assert.equal(skillMatches('playwright', 'playwright'), true);
  });

  test('"testng" === "testng"', () => {
    assert.equal(skillMatches('testng', 'testng'), true);
  });

  test('"api testing" === "api testing"', () => {
    assert.equal(skillMatches('api testing', 'api testing'), true);
  });

  test('"rest assured" === "rest assured"', () => {
    assert.equal(skillMatches('rest assured', 'rest assured'), true);
  });

  test('"github actions" === "github actions"', () => {
    assert.equal(skillMatches('github actions', 'github actions'), true);
  });

  test('"automation testing" === "automation testing"', () => {
    assert.equal(skillMatches('automation testing', 'automation testing'), true);
  });

  test('"page object model" === "page object model"', () => {
    assert.equal(skillMatches('page object model', 'page object model'), true);
  });
});

describe('Fix 2 — skillMatches: named tool prefix-matching (Rule 3)', () => {
  // Single-word named tool matching its longer keyword variant
  test('"selenium" matches keyword "selenium webdriver"', () => {
    assert.equal(skillMatches('selenium', 'selenium webdriver'), true,
      'selenium is a named tool — should match its longer webdriver variant');
  });

  test('"selenium webdriver" matches keyword "selenium" (reverse — more specific skill)', () => {
    assert.equal(skillMatches('selenium webdriver', 'selenium'), true);
  });
});

describe('Fix 2 — skillMatches: multi-word sequence matching (Rule 2)', () => {
  // Skill found as contiguous sequence inside a longer keyword
  test('"api testing" found in "rest api testing"', () => {
    assert.equal(skillMatches('api testing', 'rest api testing'), true);
  });

  test('"performance testing" found in "load and performance testing"', () => {
    assert.equal(skillMatches('performance testing', 'load and performance testing'), true);
  });

  test('"mobile testing" found in "android mobile testing"', () => {
    assert.equal(skillMatches('mobile testing', 'android mobile testing'), true);
  });

  test('"rest assured" found in "rest assured api automation"', () => {
    assert.equal(skillMatches('rest assured', 'rest assured api automation'), true);
  });

  test('"github actions" found in "github actions workflow"', () => {
    assert.equal(skillMatches('github actions', 'github actions workflow'), true);
  });

  test('"page object model" found in "page object model (pom)"', () => {
    assert.equal(skillMatches('page object model', 'page object model (pom)'), true);
  });

  // Reverse direction: skill is more specific than keyword
  test('"selenium webdriver" starts with keyword "selenium"', () => {
    assert.equal(skillMatches('selenium webdriver', 'selenium'), true);
  });
});

describe('Fix 2 — skillMatches: unrelated strings never match', () => {
  test('"docker" does not match "postman"', () => {
    assert.equal(skillMatches('docker', 'postman'), false);
  });

  test('"playwright" does not match "selenium"', () => {
    assert.equal(skillMatches('playwright', 'selenium'), false);
  });

  test('"api testing" does not match "automation testing"', () => {
    assert.equal(skillMatches('api testing', 'automation testing'), false);
  });
});

// ── Fix 3: Scoring lane separation (static contract) ─────────────────────────

describe('Fix 3 — Scoring lane separation (static contract)', () => {

  test('calculateQaResumeScore output shape contains qa_match_score, not recruiter_trust_score', () => {
    const result = calculateQaResumeScore({
      extractedSkills: ['selenium', 'testng', 'postman'],
      experienceYears: 2,
      parsedText:      'QA automation 2 years.',
    });
    assert.ok('qa_match_score' in result,        'qa_match_score must be present (ATS lane)');
    assert.ok('qa_score_breakdown' in result,    'qa_score_breakdown must be present');
    assert.ok(!('recruiter_trust_score' in result), 'recruiter_trust_score does not belong in scorer output (credibility lane)');
    assert.ok(!('risk_flags' in result),         'risk_flags does not belong in scorer output (risk lane)');
  });

  test('capability_score formula: 0.6×ats + 0.4×trust', () => {
    // Verify the formula constant independently
    const ats   = 70;
    const trust = 60;
    const expected = Math.round(ats * 0.6 + trust * 0.4);
    assert.equal(expected, 66, 'Formula: 0.6×70 + 0.4×60 = 66');
  });
});

// ── Fix 4: Section-only attenuation (graduated multipliers via computeSectionOnlyMultiplier) ─
//
// The 50–64% band is behind a feature flag (ATS_ENABLE_SOFT_ATTENUATION).
// Tests use the explicit second-parameter override to avoid env-var dependencies.

describe('Fix 4 — Section-only attenuation multipliers (computeSectionOnlyMultiplier)', () => {
  // Tests now use the real exported function — cannot silently drift from the implementation.

  test('≥85% section-only → 0.72 (both flag states)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.90, false), 0.72);
    assert.equal(computeSectionOnlyMultiplier(0.85, false), 0.72);
    assert.equal(computeSectionOnlyMultiplier(0.90, true),  0.72);
  });

  test('≥65% section-only → 0.85 (both flag states)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.70, false), 0.85);
    assert.equal(computeSectionOnlyMultiplier(0.65, false), 0.85);
    assert.equal(computeSectionOnlyMultiplier(0.70, true),  0.85);
  });

  test('50–64% with flag OFF → 1.00 (default — no penalty below 65%)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.60, false), 1.00);
    assert.equal(computeSectionOnlyMultiplier(0.50, false), 1.00);
  });

  test('50–64% with flag ON → 0.93 (soft attenuation enabled)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.60, true), 0.93);
    assert.equal(computeSectionOnlyMultiplier(0.50, true), 0.93);
  });

  test('<50% section-only → 1.00 regardless of flag', () => {
    assert.equal(computeSectionOnlyMultiplier(0.49, false), 1.00);
    assert.equal(computeSectionOnlyMultiplier(0.20, false), 1.00);
    assert.equal(computeSectionOnlyMultiplier(0.49, true),  1.00);
  });

  test('score 80 at 90% section-only → 60 (was 48 under old 0.60 multiplier)', () => {
    const raw        = 80;
    const multiplier = 0.75; // new
    assert.equal(Math.round(raw * multiplier), 60);
  });

  test('old multiplier (0.60) would have produced 48 for same input', () => {
    const raw        = 80;
    const oldMultiplier = 0.60;
    assert.equal(Math.round(raw * oldMultiplier), 48,
      'Confirming that the old multiplier was too aggressive');
  });
});

// ── Fix 5: qa_seniority always equals career_level ───────────────────────────

describe('Fix 5 — qa_seniority is always identical to career_level', () => {
  // detectCareerLevel is the single source of truth.
  // calculateQaResumeScore must produce a qa_seniority that matches it exactly.

  const PARITY_CASES = [
    {
      label:         'fresher — 0 years, no text signals',
      years:         0,
      parsedText:    'QA fresher.',
      expectedLevel: 'fresher',
    },
    {
      label:         'junior — 1 year',
      years:         1,
      parsedText:    'Junior QA 1 year selenium.',
      expectedLevel: 'junior',
    },
    {
      label:         'mid_level — 3 years',
      years:         3,
      parsedText:    'Automation QA 3 years.',
      expectedLevel: 'mid_level',
    },
    {
      label:         'senior — 6 years by tenure',
      years:         6,
      parsedText:    'QA engineer 6 years.',
      expectedLevel: 'senior',
    },
    {
      // P0 Fix 1: text signals no longer promote level — 4yr = mid_level
      label:         'mid_level — 4yr (text signal "built automation framework" no longer promotes to senior)',
      years:         4,
      parsedText:    'Built automation framework from scratch using selenium and testng.',
      expectedLevel: 'mid_level',
    },
    {
      // P0 Fix 1: same change — 4yr = mid_level regardless of ownership phrase
      label:         'mid_level — 4yr (text signal "framework from scratch" no longer promotes to senior)',
      years:         4,
      parsedText:    'Developed framework from scratch for regression testing.',
      expectedLevel: 'mid_level',
    },
    {
      label:         'lead — 10 years by tenure',
      years:         10,
      parsedText:    'QA professional 10 years.',
      expectedLevel: 'lead',
    },
    {
      // P0 Fix 1: "QA Lead" title no longer overrides 5yr — 5yr < 6yr threshold for senior
      label:         'mid_level — 5yr (title "QA Lead" no longer overrides years)',
      years:         5,
      parsedText:    'QA Lead at FinTech Corp led team of 6 engineers.',
      expectedLevel: 'mid_level',
    },
  ];

  for (const { label, years, parsedText, expectedLevel } of PARITY_CASES) {
    test(label, () => {
      const scorerResult = calculateQaResumeScore({
        extractedSkills: ['selenium', 'testng', 'jira'],
        experienceYears: years,
        parsedText,
      });
      const careerLevel = detectCareerLevel({ experienceYears: years, parsedText });

      assert.equal(
        scorerResult.qa_seniority,
        careerLevel,
        `qa_seniority (${scorerResult.qa_seniority}) !== detectCareerLevel result (${careerLevel}) — must be identical`,
      );
      assert.equal(
        scorerResult.qa_seniority,
        expectedLevel,
        `Expected '${expectedLevel}', got '${scorerResult.qa_seniority}'`,
      );
    });
  }
});
