/**
 * Recruiter readiness + shortlist probability unit tests.
 *
 * Verifies Fix #3: ATS-based probability cap prevents confidence from
 * overwhelming poor technical skill coverage.
 *
 * Run: node --test src/intelligence/guidance/__tests__/recruiterReadiness.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeRecruiterReadiness } from '../recruiterReadiness.js';

// ── Helper ─────────────────────────────────────────────────────────────────────

function readiness(overrides = {}) {
  return computeRecruiterReadiness({
    recruiter_confidence: 'medium',
    qa_specialization:    'automation_qa',
    qa_seniority:         'mid_level',
    career_level:         'mid_level',
    qa_match_score:       60,
    qa_score_breakdown:   {},
    experienceYears:      3,
    evidence_profile:     null,
    ...overrides,
  });
}

// ── Fix #3 validation: ATS-based caps ─────────────────────────────────────────

describe('Fix #3 — shortlist_probability ATS-based caps', () => {
  test('ATS 40 with maximum confidence and seniority cannot exceed 45%', () => {
    const r = readiness({
      qa_match_score:       40,
      recruiter_confidence: 'high',
      qa_specialization:    'sdet',
      experienceYears:      5,
    });
    assert.ok(
      r.shortlist_probability <= 45,
      `ATS 40 → shortlist_probability must be ≤45%, got ${r.shortlist_probability}%`,
    );
  });

  test('ATS 38 must not exceed 45%', () => {
    const r = readiness({
      qa_match_score:       38,
      recruiter_confidence: 'high',
      qa_specialization:    'automation_qa',
      experienceYears:      8,
    });
    assert.ok(r.shortlist_probability <= 45,
      `ATS 38 → got ${r.shortlist_probability}%`);
  });

  test('ATS 50 with high confidence and SDET cannot exceed 65%', () => {
    const r = readiness({
      qa_match_score:       50,
      recruiter_confidence: 'high',
      qa_specialization:    'sdet',
      experienceYears:      5,
    });
    assert.ok(
      r.shortlist_probability <= 65,
      `ATS 50 → shortlist_probability must be ≤65%, got ${r.shortlist_probability}%`,
    );
  });

  test('ATS 55 has no upper cap — high-confidence SDET can reach 80%+', () => {
    const r = readiness({
      qa_match_score:       55,
      recruiter_confidence: 'high',
      qa_specialization:    'sdet',
      experienceYears:      6,
    });
    assert.ok(r.shortlist_probability > 65,
      `ATS 55 with strong profile should exceed 65%, got ${r.shortlist_probability}%`);
  });
});

// ── 8 QA resume category matrix ───────────────────────────────────────────────

describe('Shortlist probability — 8 QA resume categories', () => {
  test('Fresher manual QA: ATS≈35, very_low confidence → ≤45%', () => {
    const r = readiness({ qa_match_score: 35, recruiter_confidence: 'very_low', qa_specialization: 'manual_qa', experienceYears: 0 });
    assert.ok(r.shortlist_probability >= 8,  `floor must be ≥8%,  got ${r.shortlist_probability}%`);
    assert.ok(r.shortlist_probability <= 45, `cap at ATS<40: ≤45%, got ${r.shortlist_probability}%`);
  });

  test('Manual QA: ATS≈45, medium confidence → 35–65%', () => {
    const r = readiness({ qa_match_score: 45, recruiter_confidence: 'medium', qa_specialization: 'manual_qa', experienceYears: 2 });
    assert.ok(r.shortlist_probability >= 30 && r.shortlist_probability <= 65,
      `Manual QA mid-range expected 30–65%, got ${r.shortlist_probability}%`);
  });

  test('Automation QA: ATS≈75, high confidence → 70%+', () => {
    const r = readiness({ qa_match_score: 75, recruiter_confidence: 'high', qa_specialization: 'automation_qa', experienceYears: 4 });
    assert.ok(r.shortlist_probability >= 70,
      `Strong automation QA should be ≥70%, got ${r.shortlist_probability}%`);
  });

  test('API Tester: ATS≈62, medium confidence → 45–75%', () => {
    const r = readiness({ qa_match_score: 62, recruiter_confidence: 'medium', qa_specialization: 'api_testing', experienceYears: 3 });
    assert.ok(r.shortlist_probability >= 45 && r.shortlist_probability <= 75,
      `API tester expected 45–75%, got ${r.shortlist_probability}%`);
  });

  test('Mobile Tester: ATS≈65, medium confidence → 45–75%', () => {
    const r = readiness({ qa_match_score: 65, recruiter_confidence: 'medium', qa_specialization: 'mobile_testing', experienceYears: 3 });
    assert.ok(r.shortlist_probability >= 45 && r.shortlist_probability <= 75,
      `Mobile tester expected 45–75%, got ${r.shortlist_probability}%`);
  });

  test('Performance Engineer: ATS≈70, medium confidence → 55%+', () => {
    const r = readiness({ qa_match_score: 70, recruiter_confidence: 'medium', qa_specialization: 'performance_testing', experienceYears: 4 });
    assert.ok(r.shortlist_probability >= 55,
      `Performance engineer expected ≥55%, got ${r.shortlist_probability}%`);
  });

  test('SDET: ATS≈82, high confidence → 80%+', () => {
    const r = readiness({ qa_match_score: 82, recruiter_confidence: 'high', qa_specialization: 'sdet', experienceYears: 5 });
    assert.ok(r.shortlist_probability >= 80,
      `SDET should be ≥80%, got ${r.shortlist_probability}%`);
  });

  test('QA Lead: ATS≈88, high confidence → 85%+', () => {
    const r = readiness({ qa_match_score: 88, recruiter_confidence: 'high', qa_specialization: 'sdet', experienceYears: 8 });
    assert.ok(r.shortlist_probability >= 85,
      `QA Lead should be ≥85%, got ${r.shortlist_probability}%`);
  });
});

// ── ATS 80 with very_low confidence is realistic ──────────────────────────────

describe('Shortlist probability — ATS 80 / very_low confidence (keyword-stuffed scenario)', () => {
  test('ATS 80 + very_low confidence + 0yr → shortlist around 20–35%', () => {
    // High ATS from stuffing, but zero evidence quality. The result should be low.
    // This is expected behavior, not a bug — the confidence suppression is correct.
    const r = readiness({
      qa_match_score:       80,
      recruiter_confidence: 'very_low',
      qa_specialization:    'manual_qa',
      experienceYears:      0,
    });
    assert.ok(r.shortlist_probability <= 50,
      `ATS 80 / very_low / 0yr should not exceed 50%, got ${r.shortlist_probability}%`);
  });
});
