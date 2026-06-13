/**
 * Risk flag engine tests — inherited evidence handling.
 *
 * Verifies that category skills promoted via evidence inheritance are NOT
 * counted as "proofless" in the skills_without_projects flag, because their
 * child skills provide the backing evidence.
 *
 * Run: node --test src/intelligence/flags/__tests__/riskFlags.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeRiskFlags } from '../riskFlagEngine.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEvidenceResult(skill_evidence, overrides = {}) {
  return {
    skill_evidence,
    inflationResult: { risk: 'none', flags: [] },
    evidence_profile: {
      section_only_ratio:      30,
      has_quantified_impact:   true,
      has_architecture_depth:  false,
      has_cicd_integration:    false,
      recruiter_trust_score:   70,
      evidence_strength:       'strong',
    },
    ...overrides,
  };
}

function makeParsed(skills, numExperience = 2) {
  return {
    extractedSkills:   skills,
    experienceEntries: Array.from({ length: numExperience }, (_, i) => ({
      title:       `QA Engineer ${i + 1}`,
      company:     `Company ${i + 1}`,
      duration:    `2022–202${3 + i}`,
      description: 'Selenium and testng automation framework development',
    })),
    parsedText:  `Skills\n${skills.join(' ')}\n\nExperience\nSelenium TestNG automation`,
    word_count:  300,
  };
}

// ── Test 5: inherited strong evidence must not trigger skills_without_projects ─

describe('Risk flags — inherited evidence excluded from skills_without_projects', () => {
  test('4+ inherited-only skills do NOT trigger skills_without_projects flag', () => {
    // Before fix: automation testing, automation framework design, api testing,
    // and mobile testing all have proof_sources=['inherited'] — no direct
    // experience/project/achievement → prooflessCount=4 → flag fires.
    // After fix: inherited skills are excluded → prooflessCount=0 → flag absent.
    const skill_evidence = [
      { skill: 'selenium',    evidence_level: 'strong', evidence_score: 75, proof_sources: ['experience', 'achievement'] },
      { skill: 'testng',      evidence_level: 'strong', evidence_score: 70, proof_sources: ['experience'] },
      { skill: 'postman',     evidence_level: 'strong', evidence_score: 70, proof_sources: ['experience'] },
      { skill: 'android',     evidence_level: 'strong', evidence_score: 70, proof_sources: ['experience'] },
      { skill: 'ios',         evidence_level: 'strong', evidence_score: 70, proof_sources: ['experience'] },
      // Category skills promoted via inheritance — no direct experience/project/achievement
      { skill: 'automation testing',           evidence_level: 'strong', evidence_score: 70, proof_sources: ['inherited'] },
      { skill: 'automation framework design',  evidence_level: 'strong', evidence_score: 70, proof_sources: ['inherited'] },
      { skill: 'api testing',                  evidence_level: 'strong', evidence_score: 70, proof_sources: ['inherited'] },
      { skill: 'mobile testing',               evidence_level: 'strong', evidence_score: 70, proof_sources: ['inherited'] },
    ];

    const parsed = makeParsed(['selenium', 'testng', 'postman', 'android', 'ios',
      'automation testing', 'automation framework design', 'api testing', 'mobile testing']);

    const result = computeRiskFlags(parsed, makeEvidenceResult(skill_evidence));
    const flag = result.risk_flags.find(f => f.flag === 'skills_without_projects');

    assert.ok(!flag,
      `skills_without_projects must NOT fire when proofless count is only inherited skills; flags: ${result.risk_flags.map(f => f.flag)}`);
  });

  test('skills with skills_section_only (no inheritance) still trigger the flag', () => {
    // 5 skills listed only in skills section with no evidence at all → flag fires.
    const skill_evidence = [
      { skill: 'selenium',     evidence_level: 'weak', evidence_score: 0, proof_sources: ['skills_section_only'] },
      { skill: 'cypress',      evidence_level: 'weak', evidence_score: 0, proof_sources: ['skills_section_only'] },
      { skill: 'playwright',   evidence_level: 'weak', evidence_score: 0, proof_sources: ['skills_section_only'] },
      { skill: 'testng',       evidence_level: 'weak', evidence_score: 0, proof_sources: ['skills_section_only'] },
      { skill: 'postman',      evidence_level: 'weak', evidence_score: 0, proof_sources: ['skills_section_only'] },
    ];

    const parsed = makeParsed(['selenium', 'cypress', 'playwright', 'testng', 'postman']);

    const result = computeRiskFlags(parsed, makeEvidenceResult(skill_evidence, {
      evidence_profile: {
        section_only_ratio:      90,
        has_quantified_impact:   false,
        has_architecture_depth:  false,
        has_cicd_integration:    false,
        recruiter_trust_score:   20,
        evidence_strength:       'weak',
      },
    }));

    const flag = result.risk_flags.find(f => f.flag === 'skills_without_projects');
    assert.ok(flag,
      'skills_without_projects must fire when 5+ skills have skills_section_only (no inheritance)');
  });

  test('mixed: 3 inherited + 3 skills_section_only — count is 3, below threshold', () => {
    // 3 inherited (excluded from count) + 3 skills_section_only (counted) = 3 < 4 → no flag
    const skill_evidence = [
      { skill: 'selenium',          evidence_level: 'strong', evidence_score: 75, proof_sources: ['experience'] },
      { skill: 'automation testing', evidence_level: 'strong', evidence_score: 70, proof_sources: ['inherited'] },
      { skill: 'api testing',        evidence_level: 'strong', evidence_score: 70, proof_sources: ['inherited'] },
      { skill: 'mobile testing',     evidence_level: 'strong', evidence_score: 70, proof_sources: ['inherited'] },
      { skill: 'cucumber',           evidence_level: 'weak',   evidence_score: 0,  proof_sources: ['skills_section_only'] },
      { skill: 'bdd',                evidence_level: 'weak',   evidence_score: 0,  proof_sources: ['skills_section_only'] },
      { skill: 'specflow',           evidence_level: 'weak',   evidence_score: 0,  proof_sources: ['skills_section_only'] },
    ];

    const parsed = makeParsed(['selenium', 'automation testing', 'api testing',
      'mobile testing', 'cucumber', 'bdd', 'specflow']);

    const result = computeRiskFlags(parsed, makeEvidenceResult(skill_evidence));
    const flag = result.risk_flags.find(f => f.flag === 'skills_without_projects');

    assert.ok(!flag,
      'skills_without_projects must not fire when only 3 skills_section_only (threshold is 4)');
  });
});
