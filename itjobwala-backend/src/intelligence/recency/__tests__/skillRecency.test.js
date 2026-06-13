/**
 * Recency inheritance tests.
 *
 * Verifies that category skills (mobile testing, automation testing, api testing)
 * inherit their recency classification from proven child skills when they have
 * no direct date evidence themselves.
 *
 * Run: node --test src/intelligence/recency/__tests__/skillRecency.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSkillRecency } from '../skillRecencyAnalyzer.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function se(skill, proof_sources = ['experience']) {
  return { skill, evidence_level: 'strong', evidence_score: 75, proof_sources };
}

function expEntry(description, endYear = 2024) {
  return {
    title: 'QA Engineer',
    company: 'TechCorp',
    duration: `2022–${endYear}`,
    description,
  };
}

// ── Test 3: android + ios → mobile testing recent ─────────────────────────────

describe('Recency — android + ios → mobile testing gets direct recency', () => {
  test('mobile testing gets direct experience recency via android/ios phrase match', () => {
    // With the EVIDENCE_MAP fix, the recency resolver uses evidence phrases for mobile testing.
    // 'android' and 'ios' are phrases for mobile testing, so the experience entry
    // that mentions them provides a direct date — recency_source is 'experience', not 'inherited'.
    const skill_evidence = [
      se('android'),
      se('ios'),
      se('mobile testing', ['experience']),
    ];

    const parsed = {
      experienceEntries: [
        expEntry('Led Android and iOS testing for the mobile app across 250 test cases', 2024),
      ],
      certificationEntries: [],
    };

    const result = analyzeSkillRecency(parsed, skill_evidence);

    assert.equal(result.skill_recency['android'].classification, 'recent',
      `android must be recent; got ${result.skill_recency['android'].classification}`);
    assert.equal(result.skill_recency['ios'].classification, 'recent',
      `ios must be recent; got ${result.skill_recency['ios'].classification}`);
    assert.equal(result.skill_recency['mobile testing'].classification, 'recent',
      `mobile testing must be recent; got ${result.skill_recency['mobile testing'].classification}`);
    assert.equal(result.skill_recency['mobile testing'].recency_source, 'experience',
      'recency_source must be "experience" (direct phrase match, not inherited)');
    assert.equal(result.skill_recency['mobile testing'].recency_confidence, 'high',
      'direct experience recency must have high confidence');
  });

  test('mobile testing stays unknown when all children have no experience entries', () => {
    // No experience entries → android/ios classify as unknown → no inheritance
    const skill_evidence = [
      se('android', ['skills_section_only']),
      se('ios', ['skills_section_only']),
      se('mobile testing', ['skills_section_only']),
    ];

    const parsed = {
      experienceEntries: [],
      certificationEntries: [],
    };

    const result = analyzeSkillRecency(parsed, skill_evidence);

    assert.equal(result.skill_recency['android'].classification, 'unknown');
    assert.equal(result.skill_recency['ios'].classification, 'unknown');
    assert.equal(result.skill_recency['mobile testing'].classification, 'unknown',
      'mobile testing must stay unknown when children are unknown (no inheritance)');
  });
});

// ── Test 4: selenium → automation testing recent ──────────────────────────────

describe('Recency inheritance — selenium → automation testing recent', () => {
  test('automation testing inherits recent from selenium', () => {
    // selenium appears in experience with a recent end year.
    // automation testing is only in skills section → direct recency unknown.
    // Inheritance should promote automation testing to recent.
    const skill_evidence = [
      se('selenium'),
      se('automation testing', ['skills_section_only', 'inherited']),
    ];

    const parsed = {
      experienceEntries: [
        expEntry('Developed selenium automation framework reducing test time by 40%', 2024),
      ],
      certificationEntries: [],
    };

    const result = analyzeSkillRecency(parsed, skill_evidence);

    assert.equal(result.skill_recency['selenium'].classification, 'recent',
      `selenium must be recent; got ${result.skill_recency['selenium'].classification}`);
    assert.equal(result.skill_recency['automation testing'].classification, 'recent',
      `automation testing must inherit 'recent' from selenium; got ${result.skill_recency['automation testing'].classification}`);
    assert.equal(result.skill_recency['automation testing'].recency_source, 'inherited');
  });

  test('automation testing direct recency is not overridden by inheritance', () => {
    // automation testing has its own experience entry → direct recency wins.
    // Even if child selenium is stale, automation testing should keep 'recent'.
    const skill_evidence = [
      se('selenium'),   // will have stale date (2018)
      se('automation testing'),   // will have recent date (2024)
    ];

    const parsed = {
      experienceEntries: [
        expEntry('Used selenium for automation testing at the bank', 2024),
        expEntry('Worked with legacy selenium framework', 2018),
      ],
      certificationEntries: [],
    };

    const result = analyzeSkillRecency(parsed, skill_evidence);

    // automation testing has direct experience (2024 entry mentions it) → recent
    // Inheritance must not demote it
    assert.ok(
      result.skill_recency['automation testing'].classification !== 'unknown',
      'automation testing must have a classification when direct experience entry exists',
    );
  });

  test('recency_stats are updated correctly after inheritance', () => {
    const skill_evidence = [
      se('android'),
      se('ios'),
      se('mobile testing', ['skills_section_only', 'inherited']),
    ];

    const parsed = {
      experienceEntries: [
        expEntry('Android and iOS testing', 2024),
      ],
      certificationEntries: [],
    };

    const result = analyzeSkillRecency(parsed, skill_evidence);

    assert.equal(result.recency_stats.recent_count, 3,
      'recent_count must include inherited mobile testing (all 3 skills are recent)');
    assert.equal(result.recency_stats.unknown_count, 0,
      'unknown_count must be 0 after inheritance resolves mobile testing');
  });
});

// ── Fix 5: recency uses evidence phrases, not literal skill name ──────────────

describe('Fix 5 — resolveSkillYear uses evidence phrases (one source of truth)', () => {
  test('automation framework design gets experience year via "automation framework" phrase', () => {
    // Before fix: entryText.includes('automation framework design') → false
    //             (entry says "automation framework" not "automation framework design")
    //             → falls to skills_only → 'unknown' → inherited recency
    // After fix:  phrases.some(p => entryText.includes(p)) → 'automation framework' matches
    //             → recency_source = 'experience', last_used_year = 2023
    const skill_evidence = [
      { skill: 'automation framework design',
        evidence_level: 'moderate',
        evidence_score: 50,
        proof_sources: ['experience'] },
    ];

    const parsed = {
      experienceEntries: [{
        title:       'QA Engineer',
        company:     'TechCorp',
        duration:    '2021–2023',
        description: 'Built automation framework using Selenium and TestNG with POM design pattern',
      }],
      certificationEntries: [],
    };

    const result = analyzeSkillRecency(parsed, skill_evidence);
    const rec    = result.skill_recency['automation framework design'];

    assert.ok(rec, 'recency entry must exist');
    assert.equal(rec.last_used_year, 2023,
      `last_used_year must be 2023 from matching entry; got ${rec.last_used_year}`);
    assert.equal(rec.recency_source, 'experience',
      `recency_source must be 'experience' (phrase matched), not inherited; got ${rec.recency_source}`);
    assert.equal(rec.recency_confidence, 'high',
      'direct experience match must have high confidence');
    assert.notEqual(rec.recency_source, 'inherited',
      'must NOT be inherited when a phrase-matched experience entry exists');
  });

  test('recency uses the year from the matching entry, not the latest experience year', () => {
    // Critical correctness test: if "automation framework" only appears in an older role,
    // recency should reflect that role's year — not the most recent job's year.
    // Before fix: proof_sources includes 'experience' → step 3 returns latestExpYear=CURRENT_YEAR (wrong)
    // After fix:  step 1 phrase-matches the 2022 entry → year=2022 (correct)
    const CURRENT_YEAR = new Date().getFullYear();
    const skill_evidence = [
      { skill: 'automation framework design',
        evidence_level: 'moderate',
        evidence_score: 50,
        proof_sources: ['experience'] },
    ];

    const parsed = {
      experienceEntries: [
        {
          title:       'Senior QA Engineer',
          company:     'BigCorp',
          duration:    `2023–${CURRENT_YEAR}`,
          description: 'Manual and exploratory testing for cloud platform release cycles',
        },
        {
          title:       'QA Engineer',
          company:     'TechCorp',
          duration:    '2020–2022',
          description: 'Built automation framework using Selenium and TestNG',
        },
      ],
      certificationEntries: [],
    };

    const result = analyzeSkillRecency(parsed, skill_evidence);
    const rec    = result.skill_recency['automation framework design'];

    assert.ok(rec, 'recency entry must exist');
    assert.equal(rec.last_used_year, 2022,
      `last_used_year must be 2022 (matching entry), not ${CURRENT_YEAR} (latest exp); got ${rec.last_used_year}`);
    assert.equal(rec.recency_source, 'experience');
  });

  test('mobile testing gets experience year via android/ios phrase match', () => {
    const skill_evidence = [
      { skill: 'mobile testing',
        evidence_level: 'moderate',
        evidence_score: 50,
        proof_sources: ['experience'] },
    ];

    const parsed = {
      experienceEntries: [{
        title:       'QA Engineer',
        company:     'MobileCorp',
        duration:    '2021–2024',
        description: 'Performed Android and iOS testing for the mobile banking application',
      }],
      certificationEntries: [],
    };

    const result = analyzeSkillRecency(parsed, skill_evidence);
    const rec    = result.skill_recency['mobile testing'];

    assert.ok(rec, 'recency entry must exist');
    assert.equal(rec.last_used_year, 2024,
      `last_used_year must be 2024; got ${rec.last_used_year}`);
    assert.equal(rec.recency_source, 'experience');
    assert.notEqual(rec.recency_source, 'inherited');
  });
});
