/**
 * Capability score unit tests.
 *
 * Validates formula, clamp bounds, and all spec-defined cases.
 *
 * Run: node --test src/utils/resume/__tests__/capabilityScore.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCapabilityScore } from '../capabilityScore.js';

// ── Spec-defined cases ────────────────────────────────────────────────────────

describe('Capability score — spec-defined cases', () => {
  test('Case A: ATS=80, Trust=70 → 76', () => {
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 80, recruiter_trust_score: 70 });
    assert.equal(capability_score, 76);
  });

  test('Case B: ATS=85, Trust=30 → 63', () => {
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 85, recruiter_trust_score: 30 });
    assert.equal(capability_score, 63);
  });

  test('Case C: ATS=75, Trust=85 → 79', () => {
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 75, recruiter_trust_score: 85 });
    assert.equal(capability_score, 79);
  });

  test('Case D: ATS=40, Trust=20 → 32', () => {
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 40, recruiter_trust_score: 20 });
    assert.equal(capability_score, 32);
  });

  test('Case E: ATS=90, Trust=95 → 92', () => {
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 90, recruiter_trust_score: 95 });
    assert.equal(capability_score, 92);
  });
});

// ── Clamp bounds ──────────────────────────────────────────────────────────────

describe('Capability score — clamp bounds', () => {
  test('floor: ATS=0, Trust=0 → 0 (not negative)', () => {
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 0, recruiter_trust_score: 0 });
    assert.equal(capability_score, 0);
  });

  test('ceiling: ATS=100, Trust=100 → 100 (not above 100)', () => {
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 100, recruiter_trust_score: 100 });
    assert.equal(capability_score, 100);
  });

  test('result is always an integer', () => {
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 67, recruiter_trust_score: 43 });
    assert.equal(capability_score, Math.round(capability_score));
    assert.ok(Number.isInteger(capability_score));
  });
});

// ── Formula invariants ────────────────────────────────────────────────────────

describe('Capability score — formula invariants', () => {
  test('higher ATS with same trust yields higher capability', () => {
    const low  = calculateCapabilityScore({ qa_match_score: 50, recruiter_trust_score: 60 });
    const high = calculateCapabilityScore({ qa_match_score: 80, recruiter_trust_score: 60 });
    assert.ok(high.capability_score > low.capability_score);
  });

  test('higher trust with same ATS yields higher capability', () => {
    const low  = calculateCapabilityScore({ qa_match_score: 70, recruiter_trust_score: 30 });
    const high = calculateCapabilityScore({ qa_match_score: 70, recruiter_trust_score: 80 });
    assert.ok(high.capability_score > low.capability_score);
  });

  test('ATS contributes 60% weight', () => {
    // Only ATS differs; trust=0 isolates ATS weight
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 100, recruiter_trust_score: 0 });
    assert.equal(capability_score, 60);
  });

  test('trust contributes 40% weight', () => {
    // Only trust differs; ATS=0 isolates trust weight
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 0, recruiter_trust_score: 100 });
    assert.equal(capability_score, 40);
  });

  test('capability differentiates from ATS when trust is low', () => {
    // ATS=80 but Trust=20 → capability=56, not 80
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 80, recruiter_trust_score: 20 });
    assert.equal(capability_score, 56);
    assert.notEqual(capability_score, 80);
  });

  test('capability differentiates from ATS when trust is high', () => {
    // ATS=50, Trust=90 → capability=66, not 50
    const { capability_score } = calculateCapabilityScore({ qa_match_score: 50, recruiter_trust_score: 90 });
    assert.equal(capability_score, 66);
    assert.notEqual(capability_score, 50);
  });
});
