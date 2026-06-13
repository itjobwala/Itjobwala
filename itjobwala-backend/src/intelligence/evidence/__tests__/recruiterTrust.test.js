/**
 * Recruiter trust score unit tests — Fix #4 validation.
 *
 * Verifies the four canonical trust scenarios and confirms there is no
 * score inflation or suppression in the evidence pipeline.
 *
 * Run: node --test src/intelligence/evidence/__tests__/recruiterTrust.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeRecruiterTrust } from '../recruiterTrustEngine.js';

// ── Trust scenario builder ─────────────────────────────────────────────────────

function buildSkillEvidence(overrides = {}) {
  const defaults = {
    skill: 'selenium',
    evidence_score: 0,
    evidence_level: 'weak',
    depth_level: 'mentioned',
    proof_sources: ['skills_section_only'],
    signals: {
      project_usage:         false,
      quantified_impact:     false,
      framework_depth:       false,
      ci_cd_usage:           false,
      architecture_mentions: false,
    },
  };
  return { ...defaults, ...overrides, signals: { ...defaults.signals, ...(overrides.signals ?? {}) } };
}

function buildExperienceDepth(score) {
  return { score, level: score >= 60 ? 'deep' : score >= 30 ? 'moderate' : 'shallow' };
}

function buildInflation(risk = 'none', flags = []) {
  return { risk, flags };
}

// ── Case A: Skills-only resume ─────────────────────────────────────────────────

describe('Case A — skills-only resume → low trust', () => {
  test('trust score is low (18–40) for skills-only resume', () => {
    const skill_evidence = [
      buildSkillEvidence({ skill: 'selenium', evidence_level: 'weak' }),
      buildSkillEvidence({ skill: 'cypress',  evidence_level: 'weak' }),
      buildSkillEvidence({ skill: 'postman',  evidence_level: 'weak' }),
    ];
    const result = computeRecruiterTrust(
      skill_evidence,
      buildExperienceDepth(10),
      buildInflation('none', ['skills_without_experience']),
    );
    assert.ok(result.recruiter_trust_score <= 40,
      `Skills-only trust must be ≤40, got ${result.recruiter_trust_score}`);
    assert.ok(['weak', 'basic'].includes(result.evidence_strength),
      `Expected weak/basic evidence_strength, got ${result.evidence_strength}`);
  });

  test('trust floor is 18 — never below', () => {
    const result = computeRecruiterTrust(
      [buildSkillEvidence({ evidence_level: 'weak' })],
      buildExperienceDepth(0),
      buildInflation('high', ['skills_without_experience', 'impossible_fresher_breadth']),
    );
    assert.ok(result.recruiter_trust_score >= 18,
      `Trust floor is 18, got ${result.recruiter_trust_score}`);
  });
});

// ── Case B: Skills + projects ─────────────────────────────────────────────────

describe('Case B — skills + projects → moderate trust', () => {
  test('trust score is moderate (40–65) with project evidence', () => {
    const skill_evidence = [
      buildSkillEvidence({
        skill: 'selenium', evidence_level: 'moderate', evidence_score: 55,
        signals: { project_usage: true, quantified_impact: false, ci_cd_usage: false, architecture_mentions: false },
      }),
      buildSkillEvidence({
        skill: 'cypress', evidence_level: 'basic', evidence_score: 25,
        signals: { project_usage: true },
      }),
      buildSkillEvidence({ skill: 'postman', evidence_level: 'weak', evidence_score: 10 }),
    ];
    const result = computeRecruiterTrust(
      skill_evidence,
      buildExperienceDepth(35),
      buildInflation('none'),
    );
    assert.ok(result.recruiter_trust_score >= 40,
      `Skills+projects trust must be ≥40, got ${result.recruiter_trust_score}`);
    assert.ok(result.recruiter_trust_score <= 70,
      `Skills+projects trust must be ≤70, got ${result.recruiter_trust_score}`);
    assert.ok(['basic', 'moderate'].includes(result.evidence_strength),
      `Expected basic/moderate strength, got ${result.evidence_strength}`);
  });
});

// ── Case C: Projects + quantified outcomes ────────────────────────────────────

describe('Case C — projects + quantified outcomes → high trust', () => {
  test('trust score is high (60–80) with quantified project evidence', () => {
    const skill_evidence = [
      buildSkillEvidence({
        skill: 'selenium', evidence_level: 'strong', evidence_score: 80,
        signals: { project_usage: true, quantified_impact: true, ci_cd_usage: false, architecture_mentions: false },
      }),
      buildSkillEvidence({
        skill: 'cypress', evidence_level: 'strong', evidence_score: 75,
        signals: { project_usage: true, quantified_impact: true },
      }),
      buildSkillEvidence({
        skill: 'postman', evidence_level: 'moderate', evidence_score: 50,
        signals: { project_usage: true },
      }),
    ];
    const result = computeRecruiterTrust(
      skill_evidence,
      buildExperienceDepth(60),
      buildInflation('none'),
    );
    assert.ok(result.recruiter_trust_score >= 60,
      `Quantified outcomes trust must be ≥60, got ${result.recruiter_trust_score}`);
    assert.ok(['moderate', 'strong'].includes(result.evidence_strength),
      `Expected moderate/strong strength, got ${result.evidence_strength}`);
    assert.ok(result.has_quantified_impact === true, 'has_quantified_impact must be true');
  });
});

// ── Case D: Framework architect + measurable impact ───────────────────────────

describe('Case D — framework architect + measurable impact → very high trust', () => {
  test('trust score is very high (75–95) for architect with impact', () => {
    const skill_evidence = [
      buildSkillEvidence({
        skill: 'selenium', evidence_level: 'strong', evidence_score: 90,
        signals: {
          project_usage: true, quantified_impact: true,
          ci_cd_usage: true, architecture_mentions: true, framework_depth: true,
        },
      }),
      buildSkillEvidence({
        skill: 'testng', evidence_level: 'strong', evidence_score: 85,
        signals: { project_usage: true, architecture_mentions: true },
      }),
      buildSkillEvidence({
        skill: 'jenkins', evidence_level: 'strong', evidence_score: 78,
        signals: { ci_cd_usage: true, project_usage: true },
      }),
    ];
    const result = computeRecruiterTrust(
      skill_evidence,
      buildExperienceDepth(85),
      buildInflation('none'),
    );
    assert.ok(result.recruiter_trust_score >= 75,
      `Architect+impact trust must be ≥75, got ${result.recruiter_trust_score}`);
    assert.equal(result.evidence_strength, 'strong',
      `Architect must have strong evidence_strength, got ${result.evidence_strength}`);
    assert.ok(result.has_architecture_depth === true, 'has_architecture_depth must be true');
    assert.ok(result.has_quantified_impact  === true, 'has_quantified_impact must be true');
    assert.ok(result.has_cicd_integration   === true, 'has_cicd_integration must be true');
  });

  test('trust ceiling is 95 — never above', () => {
    const all_strong = Array(6).fill(null).map((_, i) => buildSkillEvidence({
      skill: `skill_${i}`, evidence_level: 'strong', evidence_score: 100,
      signals: { project_usage: true, quantified_impact: true, ci_cd_usage: true, architecture_mentions: true },
    }));
    const result = computeRecruiterTrust(all_strong, buildExperienceDepth(100), buildInflation('none'));
    assert.ok(result.recruiter_trust_score <= 95,
      `Trust ceiling is 95, got ${result.recruiter_trust_score}`);
  });
});

// ── No inflation bias ─────────────────────────────────────────────────────────

describe('Trust score — inflation detection', () => {
  test('high inflation risk reduces trust significantly', () => {
    const skill_evidence = Array(5).fill(null).map((_, i) =>
      buildSkillEvidence({ skill: `skill_${i}`, evidence_level: 'moderate', evidence_score: 55, signals: { project_usage: true } })
    );
    const withInflation    = computeRecruiterTrust(skill_evidence, buildExperienceDepth(50), buildInflation('high'));
    const withoutInflation = computeRecruiterTrust(skill_evidence, buildExperienceDepth(50), buildInflation('none'));
    assert.ok(withInflation.recruiter_trust_score < withoutInflation.recruiter_trust_score,
      `Inflation penalty must reduce trust: ${withInflation.recruiter_trust_score} vs ${withoutInflation.recruiter_trust_score}`);
  });

  test('impossible_fresher_breadth flag lowers trust', () => {
    const skill_evidence = Array(4).fill(null).map((_, i) =>
      buildSkillEvidence({ skill: `skill_${i}`, evidence_level: 'weak' })
    );
    const withFlag    = computeRecruiterTrust(skill_evidence, buildExperienceDepth(10), buildInflation('none', ['impossible_fresher_breadth']));
    const withoutFlag = computeRecruiterTrust(skill_evidence, buildExperienceDepth(10), buildInflation('none', []));
    assert.ok(withFlag.recruiter_trust_score < withoutFlag.recruiter_trust_score,
      `impossible_fresher_breadth must reduce trust`);
  });
});
