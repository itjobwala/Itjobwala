/**
 * ATS Final Hardening — Regression Protection Tests (Phase 7)
 *
 * Run: node --test src/utils/resume/__tests__/atsFinalHardening.test.js
 *
 * Tests proving:
 *   1. No experience double counting (years removed from shortlist_probability)
 *   2. No SDET keyword-only classification (evidence groups required)
 *   3. No trust–capability overlap (separate signal ownership)
 *   4. No career-level promotion through text wording (year-only gate)
 *   5. No specialization inflation through keyword stuffing
 *   6. No recruiter score inflation via years bonus
 *   7. Contradiction detector fires on mismatched claims
 *   8. Hiring recommendation follows the decision matrix
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { deriveCareerLevel, detectCareerLevelWithConfidence } from '../careerCalibration.js';
import { calculateQaResumeScore }                            from '../scoreCalculator.js';
import { detectCareerLevel }                                 from '../careerCalibration.js';
import { calculateRecruiterConfidence }                      from '../recruiterIntelligence.js';
import { computeRecruiterReadiness }                         from '../../../intelligence/guidance/recruiterReadiness.js';
import { detectSpecializationFromEvidence }                  from '../../../intelligence/specialization/specializationEvidenceEngine.js';
import { detectContradictions }                              from '../../../intelligence/contradictions/contradictionDetector.js';
import { computeHiringRecommendation }                       from '../../../intelligence/hiring/hiringRecommendationEngine.js';

// ── 1. No experience double counting in shortlist_probability ─────────────────

describe('Phase 1 — No experience double counting in shortlist_probability', () => {

  test('adding experienceYears to computeRecruiterReadiness does NOT change shortlist_probability', () => {
    // Both calls should produce identical shortlist_probability
    const base = computeRecruiterReadiness({
      recruiter_confidence: 'medium',
      qa_specialization:    'automation_qa',
      qa_match_score:       65,
      experienceYears:      0,   // no years
    });
    const withYears = computeRecruiterReadiness({
      recruiter_confidence: 'medium',
      qa_specialization:    'automation_qa',
      qa_match_score:       65,
      experienceYears:      8,   // 8 years
    });
    assert.equal(base.shortlist_probability, withYears.shortlist_probability,
      `shortlist_probability must not change with experienceYears. Got ${base.shortlist_probability} vs ${withYears.shortlist_probability}`);
  });

  test('ATS score increase (which reflects years) does affect shortlist_probability', () => {
    // Years flow through qa_match_score → higher ATS → higher probability
    const lowScore = computeRecruiterReadiness({ recruiter_confidence: 'medium', qa_match_score: 30, experienceYears: 0 });
    const highScore = computeRecruiterReadiness({ recruiter_confidence: 'medium', qa_match_score: 80, experienceYears: 0 });
    assert.ok(highScore.shortlist_probability > lowScore.shortlist_probability,
      'Higher ATS score should produce higher shortlist_probability');
  });
});

// ── 2. No SDET keyword-only classification ─────────────────────────────────────

describe('Phase 2 — No SDET keyword-only classification', () => {

  const emptyEvidence = [];
  const emptyProfile  = { has_architecture_depth: false, has_cicd_integration: false, has_quantified_impact: false, evidence_density: 0 };
  const emptyDepth    = { sdet_gate: { architecture: false, cicd: false, coding: false, passes: false }, maturity: 'minimal' };

  test('SDET keywords without evidence → automation_qa', () => {
    // Has sdet-related keywords in skills list but NO evidence
    const skills = ['sdet', 'framework architecture', 'parallel execution', 'ci/cd integration', 'test infrastructure'];
    const result = detectSpecializationFromEvidence(skills, 'SDET with framework architecture', emptyEvidence, emptyProfile, emptyDepth);
    assert.notEqual(result.qa_specialization, 'sdet',
      `Pure keywords without evidence must not produce sdet. Got: ${result.qa_specialization}`);
  });

  test('automation_qa candidate with "sdet" in text but no coding language → automation_qa', () => {
    // Has some arch evidence but MISSING coding language (required for SDET)
    const archProfile = { ...emptyProfile, has_architecture_depth: true, has_cicd_integration: true, has_quantified_impact: true };
    const archDepth   = { sdet_gate: { architecture: true, cicd: true, coding: false, passes: true }, maturity: 'advanced' };
    const archEvidence = [
      { skill: 'selenium', evidence_level: 'strong', depth_level: 'architected', proof_sources: ['experience', 'architecture'], signals: { architecture_mentions: true, ci_cd_usage: true } },
      { skill: 'jenkins', evidence_level: 'moderate', depth_level: 'production', proof_sources: ['experience', 'project'], signals: { ci_cd_usage: true } },
    ];
    const text = 'Built automation framework from scratch. Integrated jenkins pipeline. Reduced execution time by 40%.';
    const result = detectSpecializationFromEvidence(['selenium', 'jenkins', 'testng'], text, archEvidence, archProfile, archDepth);
    // Coding evidence is missing (no Java/Python etc. in skills)
    assert.notEqual(result.qa_specialization, 'sdet',
      'Missing coding language means SDET evidence groups < 3 required minimum (coding required)');
  });

  test('full SDET evidence (coding + framework + cicd + impact) → sdet', () => {
    const fullProfile = {
      has_architecture_depth: true,
      has_cicd_integration:   true,
      has_quantified_impact:  true,
      evidence_density:       70,
    };
    const fullDepth = {
      sdet_gate: { architecture: true, cicd: true, coding: true, passes: true },
      maturity:  'expert',
    };
    const fullEvidence = [
      { skill: 'selenium', evidence_level: 'strong', depth_level: 'architected', proof_sources: ['experience', 'architecture'], signals: { architecture_mentions: true, ci_cd_usage: true, quantified_impact: true } },
    ];
    // Skills include a coding language
    const text = 'Built automation framework from scratch using Java and Selenium. GitHub Actions pipeline. Reduced test execution time by 50%. Parallel execution across 20 nodes.';
    const result = detectSpecializationFromEvidence(['java', 'selenium', 'github actions', 'testng'], text, fullEvidence, fullProfile, fullDepth);
    assert.equal(result.qa_specialization, 'sdet',
      `Full evidence should produce sdet. Got: ${result.qa_specialization}`);
  });
});

// ── 3. Trust–capability signal ownership ─────────────────────────────────────

describe('Phase 1 — Trust and capability use separate signals', () => {

  test('calculateRecruiterConfidence does not accept experienceYears as a scoring input', () => {
    // Same profile, different years — confidence must be identical (years removed)
    const base = calculateRecruiterConfidence({
      parsedText:        'Built automation framework. Designed test architecture. Reduced regression by 40%.',
      experienceEntries: [{ description: 'Built automation framework. Designed test architecture. Reduced regression by 40%.' }],
      extractedSkills:   ['selenium', 'testng', 'jenkins'],
      qa_match_score:    65,
      isStuffed:         false,
      experienceYears:   0,
    });
    const withYears = calculateRecruiterConfidence({
      parsedText:        'Built automation framework. Designed test architecture. Reduced regression by 40%.',
      experienceEntries: [{ description: 'Built automation framework. Designed test architecture. Reduced regression by 40%.' }],
      extractedSkills:   ['selenium', 'testng', 'jenkins'],
      qa_match_score:    65,
      isStuffed:         false,
      experienceYears:   12,
    });
    assert.equal(base, withYears,
      `recruiter_confidence must not change when only experienceYears changes. Got ${base} vs ${withYears}`);
  });

  test('calculateRecruiterConfidence does not get cert mention bonus', () => {
    // ISTQB in skills should NOT boost confidence (certs are in ATS capability lane)
    const withCert = calculateRecruiterConfidence({
      parsedText:        'QA engineer.',
      experienceEntries: [{ description: 'QA engineer.' }],
      extractedSkills:   ['selenium', 'testng', 'istqb certified'],
      qa_match_score:    50,
      isStuffed:         false,
    });
    const withoutCert = calculateRecruiterConfidence({
      parsedText:        'QA engineer.',
      experienceEntries: [{ description: 'QA engineer.' }],
      extractedSkills:   ['selenium', 'testng'],
      qa_match_score:    50,
      isStuffed:         false,
    });
    // Both should return the same confidence (cert removed from confidence)
    assert.equal(withCert, withoutCert,
      `Cert mention must not affect recruiter_confidence — certs belong in ATS capability lane. Got ${withCert} vs ${withoutCert}`);
  });
});

// ── 4. No career-level promotion through text wording ─────────────────────────

describe('Phase 1 — Career level is year-only (P0 Fix 1)', () => {

  test('"built automation framework" with 4yr → mid_level (not senior)', () => {
    const { career_level } = detectCareerLevelWithConfidence({
      experienceYears: 4,
      parsedText:      'Built automation framework from scratch using selenium and testng.',
    });
    assert.equal(career_level, 'mid_level');
  });

  test('"QA Lead" title with 5yr → mid_level (not lead)', () => {
    const { career_level } = detectCareerLevelWithConfidence({
      experienceYears: 5,
      parsedText:      'QA Lead at FinTech Corp leading a team of 6 engineers.',
    });
    assert.equal(career_level, 'mid_level');
  });

  test('Text signal contradiction lowers confidence', () => {
    const { career_level_confidence } = detectCareerLevelWithConfidence({
      experienceYears: 1,
      parsedText:      'QA Lead and senior automation architect.',  // very senior claim for 1yr
    });
    assert.equal(career_level_confidence, 'low',
      'Claiming senior/lead with 1 year should produce low confidence');
  });

  test('Aligned text + years → high confidence', () => {
    const { career_level, career_level_confidence } = detectCareerLevelWithConfidence({
      experienceYears: 7,
      parsedText:      'Senior QA engineer 7 years experience.',
    });
    assert.equal(career_level, 'senior');
    assert.equal(career_level_confidence, 'high');
  });

  test('detectCareerLevel (string-return) is purely year-based', () => {
    // "qa lead" text with 4yr still returns mid_level
    const level = detectCareerLevel({ experienceYears: 4, parsedText: 'QA Lead at company.' });
    assert.equal(level, 'mid_level');
  });
});

// ── 5. No specialization inflation via keyword stuffing ────────────────────────

describe('Phase 2 — Specialization not inflated by keyword-only listing', () => {

  const noEvidenceProfile = { has_architecture_depth: false, has_cicd_integration: false, has_quantified_impact: false, evidence_density: 5 };
  const noEvidenceDepth   = { sdet_gate: { architecture: false, cicd: false, coding: false, passes: false }, maturity: 'minimal' };

  test('Listing all SDET keywords without evidence → not sdet', () => {
    const stuffedSkills = [
      'java', 'selenium', 'playwright', 'cypress', 'appium', 'testng', 'junit',
      'cucumber', 'bdd', 'rest assured', 'postman', 'jmeter', 'k6', 'docker',
      'kubernetes', 'jenkins', 'github actions', 'sdet', 'framework architecture',
      'parallel execution', 'reporting layer',
    ];
    // No skill_evidence (all skills are listed-only)
    const result = detectSpecializationFromEvidence(
      stuffedSkills, 'sdet skills listed', [], noEvidenceProfile, noEvidenceDepth
    );
    assert.notEqual(result.qa_specialization, 'sdet',
      `Keyword stuffing should not produce sdet without evidence. Got: ${result.qa_specialization}`);
  });

  test('Few but evidenced automation skills → automation_qa', () => {
    const evidenced = [
      { skill: 'selenium', evidence_level: 'strong', depth_level: 'production', proof_sources: ['experience', 'project'], signals: {} },
      { skill: 'testng',   evidence_level: 'moderate', depth_level: 'applied', proof_sources: ['experience'], signals: {} },
    ];
    const result = detectSpecializationFromEvidence(
      ['selenium', 'testng'], 'Automated UI tests with Selenium TestNG', evidenced, noEvidenceProfile, noEvidenceDepth
    );
    assert.ok(['automation_qa', 'hybrid_qa'].includes(result.qa_specialization),
      `Evidenced automation skills should produce automation_qa or hybrid. Got: ${result.qa_specialization}`);
  });
});

// ── 6. Recruiter score not inflated by years ──────────────────────────────────

describe('Phase 1 — No recruiter score inflation via years bonus', () => {

  test('shortlist_probability identical for 0yr vs 10yr with same ATS/confidence', () => {
    const r0  = computeRecruiterReadiness({ recruiter_confidence: 'high', qa_match_score: 75, experienceYears: 0  });
    const r10 = computeRecruiterReadiness({ recruiter_confidence: 'high', qa_match_score: 75, experienceYears: 10 });
    assert.equal(r0.shortlist_probability, r10.shortlist_probability);
  });
});

// ── 7. Contradiction detector ─────────────────────────────────────────────────

describe('Phase 4 — Contradiction detection', () => {

  test('Senior claim with 2yr experience → career_claim_mismatch', () => {
    const { contradictions } = detectContradictions({
      parsed:           { parsedText: 'Senior QA engineer with 2 years of experience.', extractedSkills: ['selenium'], experienceEntries: [{ description: 'QA work.' }] },
      evidenceResult:   { skill_evidence: [], inflationResult: { risk: 'none', flags: [] } },
      evidence_profile: { evidence_density: 40, has_architecture_depth: false, keyword_stuffing_risk: 'none' },
      experienceYears:  2,
      qa_specialization: 'automation_qa',
    });
    const mismatch = contradictions.find(c => c.type === 'career_claim_mismatch');
    assert.ok(mismatch, 'Should detect career_claim_mismatch for senior claim with 2yr');
    assert.equal(mismatch.severity, 'high');
  });

  test('Architecture phrase without evidence → architecture_claim_unverified', () => {
    const { contradictions } = detectContradictions({
      parsed:           { parsedText: 'Built automation framework from scratch.', extractedSkills: ['selenium'], experienceEntries: [{ description: 'QA work.' }] },
      evidenceResult:   { skill_evidence: [], inflationResult: { risk: 'none', flags: [] } },
      evidence_profile: { evidence_density: 20, has_architecture_depth: false, keyword_stuffing_risk: 'none' },
      experienceYears:  3,
      qa_specialization: 'automation_qa',
    });
    const archFlag = contradictions.find(c => c.type === 'architecture_claim_unverified');
    assert.ok(archFlag, 'Should detect architecture_claim_unverified');
  });

  test('Clean resume → no contradictions', () => {
    const { contradictions, contradiction_severity } = detectContradictions({
      parsed:           { parsedText: 'QA engineer.', extractedSkills: ['selenium', 'testng', 'jira'], experienceEntries: [{ description: 'Tested web app. Found and reported defects using JIRA.' }] },
      evidenceResult:   { skill_evidence: [], inflationResult: { risk: 'none', flags: [] } },
      evidence_profile: { evidence_density: 55, has_architecture_depth: false, keyword_stuffing_risk: 'none' },
      experienceYears:  3,
      qa_specialization: 'automation_qa',
    });
    assert.equal(contradictions.length, 0);
    assert.equal(contradiction_severity, 'none');
  });
});

// ── 8. Hiring recommendation matrix ──────────────────────────────────────────

describe('Phase 5 — Hiring recommendation decision matrix', () => {

  test('High readiness + high confidence → Priority Interview', () => {
    const { hiring_recommendation } = computeHiringRecommendation({
      candidate_readiness_score: 85,
      analysis_confidence:       'high',
      contradiction_severity:    'none',
    });
    assert.equal(hiring_recommendation, 'Priority Interview');
  });

  test('High readiness + low confidence → Interview (not Priority)', () => {
    const { hiring_recommendation } = computeHiringRecommendation({
      candidate_readiness_score: 85,
      analysis_confidence:       'low',
      contradiction_severity:    'none',
    });
    assert.equal(hiring_recommendation, 'Interview');
  });

  test('Low readiness → Reject', () => {
    const { hiring_recommendation } = computeHiringRecommendation({
      candidate_readiness_score: 20,
      analysis_confidence:       'high',
      contradiction_severity:    'none',
    });
    assert.equal(hiring_recommendation, 'Reject');
  });

  test('High contradiction severity downgrades Priority Interview to Strong Interview', () => {
    const { hiring_recommendation } = computeHiringRecommendation({
      candidate_readiness_score: 85,
      analysis_confidence:       'high',
      contradiction_severity:    'high',
    });
    assert.equal(hiring_recommendation, 'Strong Interview',
      'High severity contradiction should downgrade Priority Interview by one step');
  });

  test('Mid readiness + medium confidence → Consider', () => {
    const { hiring_recommendation } = computeHiringRecommendation({
      candidate_readiness_score: 55,
      analysis_confidence:       'medium',
      contradiction_severity:    'none',
    });
    assert.equal(hiring_recommendation, 'Consider');
  });

  test('Mid readiness + high confidence → Interview', () => {
    const { hiring_recommendation } = computeHiringRecommendation({
      candidate_readiness_score: 55,
      analysis_confidence:       'high',
      contradiction_severity:    'none',
    });
    assert.equal(hiring_recommendation, 'Interview');
  });
});
