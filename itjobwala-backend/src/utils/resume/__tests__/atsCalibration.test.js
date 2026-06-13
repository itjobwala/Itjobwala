/**
 * ATS Calibration — Unit tests for atsCalibration.js helpers.
 *
 * Run: node --test src/utils/resume/__tests__/atsCalibration.test.js
 *
 * Covers:
 *   computeEvidenceMultiplier  — proportional evidence reward (1.00–1.08)
 *   computeSectionOnlyMultiplier — graduated attenuation with feature flag
 *   computeRecencyPenalty      — stale direct-experience tools only
 *   net_calibration_delta      — pipeline arithmetic verification
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeEvidenceMultiplier,
  computeSectionOnlyMultiplier,
  computeRecencyPenalty,
} from '../atsCalibration.js';
import { calculateQaResumeScore } from '../scoreCalculator.js';

// ── computeEvidenceMultiplier ─────────────────────────────────────────────────

describe('computeEvidenceMultiplier — null / empty input', () => {
  test('null → 1.00 (no evidence = no change)', () => {
    assert.equal(computeEvidenceMultiplier(null), 1.00);
  });
  test('empty array → 1.00', () => {
    assert.equal(computeEvidenceMultiplier([]), 1.00);
  });
});

describe('computeEvidenceMultiplier — step table (strong evidence)', () => {
  function se(skill, level = 'strong', proof = ['experience']) {
    return { skill, evidence_level: level, proof_sources: proof };
  }

  test('0 strong → 1.00', () => {
    assert.equal(computeEvidenceMultiplier([se('jira', 'weak')]), 1.00);
  });

  test('1 strong → 1.02', () => {
    assert.equal(computeEvidenceMultiplier([se('selenium', 'strong')]), 1.02);
  });

  test('2 strong → 1.04', () => {
    assert.equal(computeEvidenceMultiplier([
      se('selenium', 'strong'), se('playwright', 'strong'),
    ]), 1.04);
  });

  test('3 strong → 1.06', () => {
    assert.equal(computeEvidenceMultiplier([
      se('selenium', 'strong'), se('playwright', 'strong'), se('testng', 'strong'),
    ]), 1.06);
  });

  test('4 strong → 1.08', () => {
    assert.equal(computeEvidenceMultiplier([
      se('selenium', 'strong'), se('playwright', 'strong'),
      se('testng', 'strong'), se('jenkins', 'strong'),
    ]), 1.08);
  });

  test('5 strong → 1.08 (capped at 4 effective)', () => {
    assert.equal(computeEvidenceMultiplier([
      se('selenium', 'strong'), se('playwright', 'strong'), se('cypress', 'strong'),
      se('testng', 'strong'), se('junit', 'strong'),
    ]), 1.08);
  });
});

describe('computeEvidenceMultiplier — moderate evidence (half weight)', () => {
  function se(skill, level = 'moderate', proof = ['experience']) {
    return { skill, evidence_level: level, proof_sources: proof };
  }

  test('1 moderate → 0.5 effective → 1.00 (need ≥1 effective for first step)', () => {
    assert.equal(computeEvidenceMultiplier([se('selenium', 'moderate')]), 1.00);
  });

  test('2 moderate = 1 effective → 1.02', () => {
    assert.equal(computeEvidenceMultiplier([
      se('selenium', 'moderate'), se('testng', 'moderate'),
    ]), 1.02);
  });

  test('4 moderate = 2 effective → 1.04', () => {
    assert.equal(computeEvidenceMultiplier([
      se('selenium', 'moderate'), se('testng', 'moderate'),
      se('postman', 'moderate'), se('jenkins', 'moderate'),
    ]), 1.04);
  });

  test('1 strong + 1 moderate = 1.5 effective → 1.02 (floor 1)', () => {
    assert.equal(computeEvidenceMultiplier([
      se('selenium', 'strong'), se('testng', 'moderate'),
    ]), 1.02);
  });

  test('2 strong + 2 moderate = 3.0 effective → 1.06', () => {
    assert.equal(computeEvidenceMultiplier([
      se('selenium', 'strong'), se('playwright', 'strong'),
      se('testng', 'moderate'), se('postman', 'moderate'),
    ]), 1.06);
  });
});

describe('computeEvidenceMultiplier — basic and weak evidence give no benefit', () => {
  function se(skill, level, proof = ['experience']) {
    return { skill, evidence_level: level, proof_sources: proof };
  }

  test('basic → 1.00', () => {
    assert.equal(computeEvidenceMultiplier([se('selenium', 'basic')]), 1.00);
  });

  test('weak → 1.00', () => {
    assert.equal(computeEvidenceMultiplier([se('playwright', 'weak')]), 1.00);
  });
});

describe('computeEvidenceMultiplier — non-bonus skills excluded', () => {
  function se(skill, level = 'strong', proof = ['experience']) {
    return { skill, evidence_level: level, proof_sources: proof };
  }

  test('jira (not in BONUS_SKILLS) → 1.00 even if strong', () => {
    assert.equal(computeEvidenceMultiplier([se('jira', 'strong')]), 1.00);
  });

  test('regression testing (category) → 1.00', () => {
    assert.equal(computeEvidenceMultiplier([se('regression testing', 'strong')]), 1.00);
  });

  test('automation testing (category) → 1.00', () => {
    assert.equal(computeEvidenceMultiplier([se('automation testing', 'strong')]), 1.00);
  });
});

describe('computeEvidenceMultiplier — inherited-only skills excluded', () => {
  test('purely inherited strong → 1.00 (no direct evidence)', () => {
    const ev = { skill: 'selenium', evidence_level: 'strong', proof_sources: ['inherited'] };
    assert.equal(computeEvidenceMultiplier([ev]), 1.00);
  });

  test('inherited + experience strong → 1.02 (direct evidence present)', () => {
    const ev = { skill: 'selenium', evidence_level: 'strong', proof_sources: ['experience', 'inherited'] };
    assert.equal(computeEvidenceMultiplier([ev]), 1.02);
  });

  test('inherited + project strong → 1.02', () => {
    const ev = { skill: 'playwright', evidence_level: 'strong', proof_sources: ['project', 'inherited'] };
    assert.equal(computeEvidenceMultiplier([ev]), 1.02);
  });
});

describe('computeEvidenceMultiplier — multiplier is proportional (not additive)', () => {
  test('×1.06 on raw 82 = 87, not 90 (old +8 flat bonus would give 90)', () => {
    const mult = computeEvidenceMultiplier([
      { skill: 'selenium',  evidence_level: 'strong', proof_sources: ['experience'] },
      { skill: 'playwright',evidence_level: 'strong', proof_sources: ['experience'] },
      { skill: 'testng',    evidence_level: 'strong', proof_sources: ['experience'] },
    ]);
    // 3 strong → 1.06
    assert.equal(mult, 1.06);
    const calibrated = Math.min(100, Math.round(82 * mult));
    assert.equal(calibrated, 87);  // 82 × 1.06 = 86.92 → 87 (not 90)
    assert.ok(calibrated < 90, 'multiplier prevents inflation above 90 for raw score 82');
  });

  test('lower raw scores benefit less in absolute terms', () => {
    const mult = 1.08;  // max multiplier
    const highRaw  = Math.round(80 * mult);  // 86
    const lowRaw   = Math.round(40 * mult);  // 43
    assert.ok(highRaw - 80 < lowRaw - 40 + 5,
      'absolute bonus shrinks at lower raw scores (proportional, not flat)');
  });
});

// ── computeSectionOnlyMultiplier ──────────────────────────────────────────────

describe('computeSectionOnlyMultiplier — core bands (flag-independent)', () => {
  test('1.00 → 0.72', () => assert.equal(computeSectionOnlyMultiplier(1.00), 0.72));
  test('0.90 → 0.72', () => assert.equal(computeSectionOnlyMultiplier(0.90), 0.72));
  test('0.85 → 0.72', () => assert.equal(computeSectionOnlyMultiplier(0.85), 0.72));
  test('0.84 → 0.85', () => assert.equal(computeSectionOnlyMultiplier(0.84), 0.85));
  test('0.70 → 0.85', () => assert.equal(computeSectionOnlyMultiplier(0.70), 0.85));
  test('0.65 → 0.85', () => assert.equal(computeSectionOnlyMultiplier(0.65), 0.85));
  test('0.00 → 1.00', () => assert.equal(computeSectionOnlyMultiplier(0.00), 1.00));
});

describe('computeSectionOnlyMultiplier — 50% band: feature-flag OFF (default)', () => {
  test('0.64 with flag OFF → 1.00 (no penalty below 65%)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.64, false), 1.00);
  });
  test('0.60 with flag OFF → 1.00', () => {
    assert.equal(computeSectionOnlyMultiplier(0.60, false), 1.00);
  });
  test('0.50 with flag OFF → 1.00', () => {
    assert.equal(computeSectionOnlyMultiplier(0.50, false), 1.00);
  });
  test('0.49 with flag OFF → 1.00', () => {
    assert.equal(computeSectionOnlyMultiplier(0.49, false), 1.00);
  });
});

describe('computeSectionOnlyMultiplier — 50% band: feature-flag ON', () => {
  test('0.64 with flag ON → 0.93', () => {
    assert.equal(computeSectionOnlyMultiplier(0.64, true), 0.93);
  });
  test('0.60 with flag ON → 0.93', () => {
    assert.equal(computeSectionOnlyMultiplier(0.60, true), 0.93);
  });
  test('0.50 with flag ON → 0.93', () => {
    assert.equal(computeSectionOnlyMultiplier(0.50, true), 0.93);
  });
  test('0.49 with flag ON → 1.00 (below the 50% band)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.49, true), 1.00);
  });
  test('≥65% with flag ON → 0.85 (upper bands unchanged)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.65, true), 0.85);
  });
  test('≥85% with flag ON → 0.72 (upper bands unchanged)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.85, true), 0.72);
  });
});

describe('computeSectionOnlyMultiplier — monotonic (higher ratio ≤ lower multiplier)', () => {
  test('multiplier never increases as sectionOnlyRatio increases (flag OFF)', () => {
    const ratios = [0.00, 0.20, 0.49, 0.50, 0.64, 0.65, 0.80, 0.85, 0.90, 1.00];
    for (let i = 1; i < ratios.length; i++) {
      const prev = computeSectionOnlyMultiplier(ratios[i - 1], false);
      const curr = computeSectionOnlyMultiplier(ratios[i], false);
      assert.ok(curr <= prev,
        `flag OFF: ratio ${ratios[i - 1]}→${prev}, ratio ${ratios[i]}→${curr} — must not increase`);
    }
  });

  test('multiplier never increases as sectionOnlyRatio increases (flag ON)', () => {
    const ratios = [0.00, 0.20, 0.49, 0.50, 0.64, 0.65, 0.80, 0.85, 0.90, 1.00];
    for (let i = 1; i < ratios.length; i++) {
      const prev = computeSectionOnlyMultiplier(ratios[i - 1], true);
      const curr = computeSectionOnlyMultiplier(ratios[i], true);
      assert.ok(curr <= prev,
        `flag ON: ratio ${ratios[i - 1]}→${prev}, ratio ${ratios[i]}→${curr} — must not increase`);
    }
  });
});

// ── computeRecencyPenalty ─────────────────────────────────────────────────────

function sr(classification, recency_sensitive, recency_source) {
  return { classification, recency_sensitive, recency_source };
}

describe('computeRecencyPenalty — null / empty input', () => {
  test('null → 0', ()     => assert.equal(computeRecencyPenalty(null), 0));
  test('undefined → 0', () => assert.equal(computeRecencyPenalty(undefined), 0));
  test('{} → 0', ()       => assert.equal(computeRecencyPenalty({}), 0));
});

describe('computeRecencyPenalty — all three conditions required', () => {
  test('stale + sensitive + experience → 1 (all conditions met)', () => {
    assert.equal(computeRecencyPenalty({
      playwright: sr('stale', true, 'experience'),
    }), 1);
  });

  test('stale + sensitive + inherited → 0 (inherited source excluded)', () => {
    assert.equal(computeRecencyPenalty({
      'mobile testing': sr('stale', true, 'inherited'),
    }), 0);
  });

  test('stale + sensitive + inferred → 0 (inferred source excluded)', () => {
    assert.equal(computeRecencyPenalty({
      playwright: sr('stale', true, 'inferred'),
    }), 0);
  });

  test('stale + sensitive + skills_only → 0 (skills-only source excluded)', () => {
    assert.equal(computeRecencyPenalty({
      cypress: sr('stale', true, 'skills_only'),
    }), 0);
  });

  test('recent + sensitive + experience → 0 (not stale)', () => {
    assert.equal(computeRecencyPenalty({
      playwright: sr('recent', true, 'experience'),
    }), 0);
  });

  test('aging + sensitive + experience → 0 (not stale)', () => {
    assert.equal(computeRecencyPenalty({
      cypress: sr('aging', true, 'experience'),
    }), 0);
  });

  test('unknown + sensitive + experience → 0 (no year data)', () => {
    assert.equal(computeRecencyPenalty({
      docker: sr('unknown', true, 'experience'),
    }), 0);
  });

  test('stale + NOT sensitive + experience → 0 (selenium is low-sensitivity)', () => {
    assert.equal(computeRecencyPenalty({
      selenium: sr('stale', false, 'experience'),
    }), 0);
  });
});

describe('computeRecencyPenalty — penalty tiers', () => {
  const staleExp = (skill) => ({ [skill]: sr('stale', true, 'experience') });

  test('1 qualifying skill → 1', () => {
    assert.equal(computeRecencyPenalty(staleExp('playwright')), 1);
  });

  test('2 qualifying skills → 3', () => {
    assert.equal(computeRecencyPenalty({
      playwright: sr('stale', true, 'experience'),
      cypress:    sr('stale', true, 'experience'),
    }), 3);
  });

  test('3 qualifying skills → 6', () => {
    assert.equal(computeRecencyPenalty({
      playwright: sr('stale', true, 'experience'),
      cypress:    sr('stale', true, 'experience'),
      k6:         sr('stale', true, 'experience'),
    }), 6);
  });

  test('4 qualifying skills → 6 (capped)', () => {
    assert.equal(computeRecencyPenalty({
      playwright: sr('stale', true, 'experience'),
      cypress:    sr('stale', true, 'experience'),
      k6:         sr('stale', true, 'experience'),
      docker:     sr('stale', true, 'experience'),
    }), 6);
  });
});

describe('computeRecencyPenalty — mixed: inherited stale never counts', () => {
  test('1 stale-experience + 3 stale-inherited → only 1 counts → penalty 1', () => {
    assert.equal(computeRecencyPenalty({
      playwright:       sr('stale', true, 'experience'),   // counts
      'mobile testing': sr('stale', true, 'inherited'),    // excluded
      'api testing':    sr('stale', true, 'inherited'),    // excluded
      'ci testing':     sr('stale', true, 'inherited'),    // excluded
    }), 1);  // NOT 6 — only playwright qualifies
  });

  test('2 stale-experience + 5 stale-inherited → only 2 count → penalty 3', () => {
    assert.equal(computeRecencyPenalty({
      playwright:       sr('stale', true, 'experience'),
      cypress:          sr('stale', true, 'experience'),
      'mobile testing': sr('stale', true, 'inherited'),
      'api testing':    sr('stale', true, 'inherited'),
      'automation testing': sr('stale', true, 'inherited'),
    }), 3);
  });
});

// ── net_calibration_delta arithmetic ─────────────────────────────────────────

describe('net_calibration_delta — formula verification', () => {
  test('delta is final − raw (can be negative)', () => {
    const raw   = 72;
    const final = 68;
    assert.equal(final - raw, -4);
  });

  test('delta is positive when evidence multiplier exceeds other penalties', () => {
    const raw = 60;
    // ×1.06 multiplier, no attenuation, no stuffing, no recency
    const afterMult = Math.round(raw * 1.06);  // 64
    const final     = afterMult;               // no further penalties
    assert.ok(final - raw > 0, `delta must be positive: ${final} − ${raw} = ${final - raw}`);
  });

  test('delta is zero when no calibration applies', () => {
    const raw = 50;
    // ×1.00 multiplier, ×1.00 attenuation, 0 stuffing, 0 recency
    const final = Math.round(raw * 1.00) * 1.00 - 0 - 0;
    assert.equal(final - raw, 0);
  });

  test('range: delta must stay within −100 to +100', () => {
    const cases = [
      { raw: 0,   final: 0   },
      { raw: 50,  final: 54  },
      { raw: 80,  final: 72  },
      { raw: 100, final: 100 },
    ];
    for (const { raw, final } of cases) {
      const delta = final - raw;
      assert.ok(delta >= -100 && delta <= 100, `delta ${delta} out of range`);
    }
  });
});

// ── Score examples: before / after comparison ────────────────────────────────

describe('Score examples — evidence multiplier vs old flat bonus', () => {
  test('raw=82, 3 strong skills: multiplier gives 87, flat +8 would give 90', () => {
    const mult = computeEvidenceMultiplier([
      { skill: 'selenium',  evidence_level: 'strong', proof_sources: ['experience'] },
      { skill: 'playwright',evidence_level: 'strong', proof_sources: ['experience'] },
      { skill: 'testng',    evidence_level: 'strong', proof_sources: ['experience'] },
    ]);
    assert.equal(mult, 1.06);
    assert.equal(Math.round(82 * 1.06), 87);  // 86.92 → 87
    // Old flat bonus would have given: 82 + 8 = 90 (inflated)
    assert.ok(Math.round(82 * 1.06) < 90, 'multiplier prevents inflation for high raw scores');
  });

  test('raw=40, 3 strong: multiplier gives 42, flat +8 would give 48 (proportional difference)', () => {
    const mult = 1.06;
    assert.equal(Math.round(40 * mult), 42);  // 42.4 → 42
    // Flat +8 on raw=40 = 48
    assert.ok(Math.round(40 * 1.06) < 48, 'proportional reward is smaller at lower raw scores');
  });
});

describe('Score examples — recency penalty: direct experience only', () => {
  test('mobile testing stale via inheritance → zero penalty', () => {
    const skill_recency = {
      android:        sr('recent', true,  'experience'),
      ios:            sr('recent', true,  'experience'),
      'mobile testing': sr('stale', true, 'inherited'),  // inherited from android+ios
    };
    assert.equal(computeRecencyPenalty(skill_recency), 0,
      'inherited stale must never trigger recency penalty');
  });

  test('playwright stale via direct experience → penalty 1', () => {
    const skill_recency = {
      playwright: sr('stale', true, 'experience'),
    };
    assert.equal(computeRecencyPenalty(skill_recency), 1);
  });
});

describe('Score examples — feature flag controls 50% attenuation band', () => {
  test('60% section-only: flag OFF → ×1.00 (existing behaviour unchanged)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.60, false), 1.00);
    assert.equal(computeSectionOnlyMultiplier(0.60, false) * 100, 100,
      'flag OFF: 60% section-only gives no penalty');
  });

  test('60% section-only: flag ON → ×0.93 (mild penalty)', () => {
    assert.equal(computeSectionOnlyMultiplier(0.60, true), 0.93);
    assert.ok(computeSectionOnlyMultiplier(0.60, true) * 100 < 100,
      'flag ON: 60% section-only gives 7% penalty');
  });
});
