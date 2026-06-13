/**
 * Evidence attribution tests for skillEvidenceExtractor.
 *
 * Verifies that evidence is derived from experience/project text rather than
 * relying solely on skills-section matches. Covers the three testing types
 * most commonly mis-attributed: regression, smoke, and manual testing.
 *
 * Run: node --test src/intelligence/evidence/__tests__/skillEvidenceExtractor.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { extractSkillEvidence } from '../skillEvidenceExtractor.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function evidenceFor(result, skill) {
  return result.skill_evidence.find(e => e.skill === skill.toLowerCase());
}

function makeParsed({ skill, experienceDescriptions = [], projectDescriptions = [], parsedText }) {
  return {
    parsedText: parsedText ?? `Technical Skills\n${skill}`,
    extractedSkills:      [skill],
    experienceEntries:    experienceDescriptions.map((description, i) => ({
      title: `QA Engineer ${i + 1}`,
      company: `Company ${i + 1}`,
      duration: '1 year',
      description,
    })),
    projectEntries:       projectDescriptions.map((description, i) => ({
      name: `Project ${i + 1}`,
      description,
    })),
    certificationEntries: [],
  };
}

// Multi-skill helper for inheritance tests
function makeMultiParsed({ skills, experienceDescriptions = [], projectDescriptions = [], parsedText }) {
  return {
    parsedText: parsedText ?? `Technical Skills\n${skills.join('\n')}`,
    extractedSkills:   skills,
    experienceEntries: experienceDescriptions.map((description, i) => ({
      title: `QA Engineer ${i + 1}`,
      company: `Company ${i + 1}`,
      duration: '2 years',
      description,
    })),
    projectEntries:    projectDescriptions.map((description, i) => ({
      name: `Project ${i + 1}`,
      description,
    })),
    certificationEntries: [],
  };
}

// ── CASE 1: Skill listed in skills section only ───────────────────────────────

describe('CASE 1 — skill only in skills section', () => {
  test('regression testing with no experience → weak / skills_section_only', () => {
    const parsed = makeParsed({ skill: 'regression testing' });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'regression testing');
    assert.ok(ev, 'Evidence entry must exist for regression testing');
    assert.equal(ev.evidence_level, 'weak',
      `Expected weak, got ${ev.evidence_level} (score: ${ev.evidence_score})`);
    assert.ok(
      ev.proof_sources.includes('skills_section_only'),
      `Expected skills_section_only in proof_sources, got: ${ev.proof_sources}`,
    );
  });
});

// ── CASE 2: Single experience mention ─────────────────────────────────────────

describe('CASE 2 — executed regression testing in experience', () => {
  test('regression testing: impl verb in experience → moderate', () => {
    const parsed = makeParsed({
      skill: 'regression testing',
      experienceDescriptions: ['Executed regression testing for all sprint releases'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'regression testing');
    assert.ok(ev, 'Evidence entry must exist');
    assert.equal(ev.evidence_level, 'moderate',
      `Expected moderate, got ${ev.evidence_level} (score: ${ev.evidence_score})`);
    assert.ok(ev.proof_sources.includes('experience'),
      `Expected experience in proof_sources, got: ${ev.proof_sources}`);
    assert.ok(!ev.proof_sources.includes('skills_section_only'),
      'skills_section_only must not appear when experience evidence exists');
  });
});

// ── CASE 3: Quantified regression suite ──────────────────────────────────────

describe('CASE 3 — maintained regression suite with quantified scope', () => {
  test('regression testing: experience + quantified count → strong', () => {
    const parsed = makeParsed({
      skill: 'regression testing',
      experienceDescriptions: ['Maintained regression suite of 400+ test cases across 3 modules'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'regression testing');
    assert.ok(ev, 'Evidence entry must exist');
    assert.equal(ev.evidence_level, 'strong',
      `Expected strong, got ${ev.evidence_level} (score: ${ev.evidence_score})`);
    assert.ok(ev.proof_sources.includes('experience'),
      `Expected experience in proof_sources, got: ${ev.proof_sources}`);
    assert.ok(ev.proof_sources.includes('achievement'),
      `Expected achievement in proof_sources (quantified scope), got: ${ev.proof_sources}`);
  });
});

// ── CASE 4: Smoke testing execution ──────────────────────────────────────────

describe('CASE 4 — executed smoke testing', () => {
  test('smoke testing: impl verb in experience → moderate', () => {
    const parsed = makeParsed({
      skill: 'smoke testing',
      experienceDescriptions: ['Executed smoke testing prior to each production deployment'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'smoke testing');
    assert.ok(ev, 'Evidence entry must exist');
    assert.equal(ev.evidence_level, 'moderate',
      `Expected moderate, got ${ev.evidence_level} (score: ${ev.evidence_score})`);
    assert.ok(ev.proof_sources.includes('experience'),
      `Expected experience in proof_sources, got: ${ev.proof_sources}`);
    assert.ok(!ev.proof_sources.includes('skills_section_only'),
      'skills_section_only must not appear when experience evidence exists');
  });
});

// ── CASE 5: Manual testing via synonym phrases ────────────────────────────────

describe('CASE 5 — manual testing via synonym phrases', () => {
  test('manual testing: "test cases" + "test scenarios" in experience → moderate', () => {
    const parsed = makeParsed({
      skill: 'manual testing',
      experienceDescriptions: ['Prepared test cases and test scenarios for functional validation'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'manual testing');
    assert.ok(ev, 'Evidence entry must exist');
    assert.equal(ev.evidence_level, 'moderate',
      `Expected moderate, got ${ev.evidence_level} (score: ${ev.evidence_score})`);
    assert.ok(ev.proof_sources.includes('experience'),
      `Expected experience in proof_sources, got: ${ev.proof_sources}`);
    assert.ok(!ev.proof_sources.includes('skills_section_only'),
      'skills_section_only must not appear when experience evidence exists');
  });
});

// ── CASE 6: Manual testing via defect tracking + UAT ─────────────────────────
// JIRA + UAT = delivery evidence (real QA work), NOT quantified impact (no metric)

describe('CASE 6 — defect tracking + UAT execution', () => {
  test('manual testing: JIRA + UAT → delivery_evidence (not quantified_impact) → moderate', () => {
    const parsed = makeParsed({
      skill: 'manual testing',
      experienceDescriptions: ['Logged defects in JIRA and executed UAT for the release cycle'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'manual testing');
    assert.ok(ev, 'Evidence entry must exist');
    assert.equal(ev.evidence_level, 'moderate',
      `Expected moderate (JIRA+UAT = delivery, not metric), got ${ev.evidence_level} (score: ${ev.evidence_score})`);
    assert.ok(ev.proof_sources.includes('experience'),
      `Expected experience in proof_sources, got: ${ev.proof_sources}`);
    assert.ok(ev.proof_sources.includes('delivery'),
      `Expected delivery in proof_sources, got: ${ev.proof_sources}`);
    assert.ok(!ev.proof_sources.includes('achievement'),
      `achievement must not appear without a measurable metric, got: ${ev.proof_sources}`);
    assert.equal(ev.signals.delivery_evidence, true,
      'delivery_evidence signal must be true');
    assert.equal(ev.signals.quantified_impact, false,
      'quantified_impact must be false (no numeric metric present)');
  });
});

// ── Delivery evidence vs quantified impact separation ─────────────────────────

describe('Delivery evidence ≠ quantified impact — signal separation', () => {
  test('CASE A — "Logged defects in JIRA": delivery_evidence true, quantified_impact false', () => {
    const parsed = makeParsed({
      skill: 'manual testing',
      experienceDescriptions: ['Logged defects in JIRA'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'manual testing');
    assert.ok(ev, 'Evidence entry must exist');
    assert.equal(ev.signals.delivery_evidence, true,
      'JIRA = delivery evidence: real QA tool usage');
    assert.equal(ev.signals.quantified_impact, false,
      'No numeric metric → quantified_impact must be false');
    assert.equal(ev.evidence_level, 'moderate',
      `Expected moderate, got ${ev.evidence_level} (score: ${ev.evidence_score})`);
  });

  test('CASE B — "Executed UAT": delivery_evidence true, quantified_impact false', () => {
    const parsed = makeParsed({
      skill: 'manual testing',
      experienceDescriptions: ['Executed UAT for the product release'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'manual testing');
    assert.ok(ev, 'Evidence entry must exist');
    assert.equal(ev.signals.delivery_evidence, true,
      'UAT = delivery evidence: acceptance testing gate');
    assert.equal(ev.signals.quantified_impact, false,
      'No numeric metric → quantified_impact must be false');
    assert.equal(ev.evidence_level, 'moderate',
      `Expected moderate, got ${ev.evidence_level} (score: ${ev.evidence_score})`);
  });

  test('CASE C — "Logged 150+ defects in JIRA": delivery_evidence true, quantified_impact true → strong', () => {
    const parsed = makeParsed({
      skill: 'manual testing',
      experienceDescriptions: ['Logged 150+ defects in JIRA across multiple sprint cycles'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'manual testing');
    assert.ok(ev, 'Evidence entry must exist');
    assert.equal(ev.signals.delivery_evidence, true,
      'JIRA = delivery evidence');
    assert.equal(ev.signals.quantified_impact, true,
      '150+ defects = measurable metric → quantified_impact must be true');
    assert.equal(ev.evidence_level, 'strong',
      `Expected strong (delivery + metric), got ${ev.evidence_level} (score: ${ev.evidence_score})`);
  });

  test('CASE D — "Reduced regression effort by 60%": delivery_evidence false, quantified_impact true → strong', () => {
    const parsed = makeParsed({
      skill: 'regression testing',
      experienceDescriptions: ['Reduced regression effort by 60% through test prioritisation'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'regression testing');
    assert.ok(ev, 'Evidence entry must exist');
    assert.equal(ev.signals.delivery_evidence, false,
      'No delivery phrase (JIRA/UAT) present → delivery_evidence must be false');
    assert.equal(ev.signals.quantified_impact, true,
      '60% = measurable metric → quantified_impact must be true');
    assert.equal(ev.evidence_level, 'strong',
      `Expected strong (measurable metric), got ${ev.evidence_level} (score: ${ev.evidence_score})`);
  });
});

// ── Evidence inheritance ──────────────────────────────────────────────────────

describe('Inheritance — Selenium + TestNG + POM → automation testing strong', () => {
  test('2 strong children (selenium, testng) promote automation testing to strong', () => {
    // selenium + testng + POM each get strong direct evidence (exp + verb + quant)
    // "automation testing" appears only in skills section → starts weak
    // inheritance: selenium(strong) + testng(strong) → ≥2 strong → promote to strong
    const parsed = makeMultiParsed({
      skills: ['selenium', 'testng', 'page object model', 'automation testing'],
      experienceDescriptions: [
        'Developed selenium automation framework with TestNG and page object model reducing test execution time by 70%',
      ],
    });

    const result = extractSkillEvidence(parsed);

    const selenium = evidenceFor(result, 'selenium');
    const testng   = evidenceFor(result, 'testng');
    const auto     = evidenceFor(result, 'automation testing');

    assert.ok(selenium, 'selenium evidence must exist');
    assert.ok(testng,   'testng evidence must exist');
    assert.ok(auto,     'automation testing evidence must exist');

    assert.equal(selenium.evidence_level, 'strong',
      `selenium must be strong; got ${selenium.evidence_level} (score: ${selenium.evidence_score})`);
    assert.equal(testng.evidence_level, 'strong',
      `testng must be strong; got ${testng.evidence_level} (score: ${testng.evidence_score})`);
    assert.equal(auto.evidence_level, 'strong',
      `automation testing must inherit strong from selenium+testng; got ${auto.evidence_level}`);
    assert.ok(auto.proof_sources.includes('inherited'),
      `"inherited" must be in proof_sources: ${auto.proof_sources}`);
  });

  test('automation framework design also inherits strong from selenium+testng+POM', () => {
    const parsed = makeMultiParsed({
      skills: ['selenium', 'testng', 'page object model', 'automation framework design'],
      experienceDescriptions: [
        'Built selenium automation framework with TestNG and page object model reducing test time by 60%',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(afd, 'automation framework design evidence must exist');
    assert.equal(afd.evidence_level, 'strong',
      `Expected strong inheritance; got ${afd.evidence_level}`);
  });
});

describe('Inheritance — Postman + API Validation → api testing strong', () => {
  test('2 strong children promote api testing to strong', () => {
    // postman + api validation each get strong direct evidence
    // "api testing" appears only in skills section → starts weak
    // inheritance: postman(strong) + api validation(strong) → ≥2 strong → promote to strong
    const parsed = makeMultiParsed({
      skills: ['postman', 'api validation', 'api testing'],
      experienceDescriptions: [
        'Developed Postman collections for API validation reducing test setup time by 50%',
      ],
    });

    const result      = extractSkillEvidence(parsed);
    const postman     = evidenceFor(result, 'postman');
    const apiValid    = evidenceFor(result, 'api validation');
    const apiTesting  = evidenceFor(result, 'api testing');

    assert.ok(postman,    'postman evidence must exist');
    assert.ok(apiValid,   'api validation evidence must exist');
    assert.ok(apiTesting, 'api testing evidence must exist');

    assert.equal(postman.evidence_level, 'strong',
      `postman must be strong; got ${postman.evidence_level} (score: ${postman.evidence_score})`);
    assert.equal(apiValid.evidence_level, 'strong',
      `api validation must be strong; got ${apiValid.evidence_level}`);
    assert.equal(apiTesting.evidence_level, 'strong',
      `api testing must inherit strong from postman+api validation; got ${apiTesting.evidence_level}`);
    assert.ok(apiTesting.proof_sources.includes('inherited'),
      `"inherited" must be in proof_sources: ${apiTesting.proof_sources}`);
  });
});

describe('Mobile testing — direct evidence via android/ios phrase matching', () => {
  test('android+ios in experience → mobile testing gets direct experience evidence (not only inherited)', () => {
    // With the EVIDENCE_MAP fix, 'android' and 'ios' are evidence phrases for mobile testing.
    // searchEntriesForPhrases finds them in the experience entry, giving mobile testing
    // direct experience evidence — proof_sources includes 'experience', not just 'inherited'.
    const parsed = makeMultiParsed({
      skills: ['android', 'ios', 'mobile testing'],
      experienceDescriptions: [
        'Led Android and iOS testing for mobile app with regression coverage of 250+ test cases',
      ],
    });

    const result  = extractSkillEvidence(parsed);
    const android = evidenceFor(result, 'android');
    const ios     = evidenceFor(result, 'ios');
    const mobile  = evidenceFor(result, 'mobile testing');

    assert.ok(android, 'android evidence must exist');
    assert.ok(ios,     'ios evidence must exist');
    assert.ok(mobile,  'mobile testing evidence must exist');

    assert.equal(android.evidence_level, 'strong',
      `android must be strong; got ${android.evidence_level} (score: ${android.evidence_score})`);
    assert.equal(ios.evidence_level, 'strong',
      `ios must be strong; got ${ios.evidence_level} (score: ${ios.evidence_score})`);
    assert.equal(mobile.evidence_level, 'strong',
      `mobile testing must be strong; got ${mobile.evidence_level}`);
    assert.ok(mobile.proof_sources.includes('experience'),
      `"experience" must be in proof_sources (direct match via android/ios phrases): ${mobile.proof_sources}`);
    assert.ok(!mobile.proof_sources.includes('skills_section_only'),
      `"skills_section_only" must not appear when direct experience evidence exists: ${mobile.proof_sources}`);
  });
});

describe('Safety guard — smoke testing in experience section → never weak', () => {
  test('smoke testing inside experience description → evidence_level is at least basic', () => {
    const parsed = makeParsed({
      skill: 'smoke testing',
      experienceDescriptions: ['Executed functional, regression, smoke testing for each sprint release'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'smoke testing');
    assert.ok(ev, 'Evidence entry must exist');
    const WEAK = 'weak';
    assert.notEqual(ev.evidence_level, WEAK,
      `smoke testing in experience must not be weak; got ${ev.evidence_level} (score: ${ev.evidence_score})`);
    assert.ok(['basic', 'moderate', 'strong'].includes(ev.evidence_level),
      `Expected basic/moderate/strong, got ${ev.evidence_level}`);
    assert.ok(ev.proof_sources.includes('experience'),
      `"experience" must be in proof_sources: ${ev.proof_sources}`);
  });
});

// ── Shorthand phrase detection ────────────────────────────────────────────────

describe('Shorthand — smoke in experience list → smoke testing evidence', () => {
  test('experience text "regression, smoke, and compatibility testing" → smoke testing gets evidence', () => {
    // The skill name "smoke testing" does not appear verbatim, but "smoke" does.
    // The EVIDENCE_MAP phrase "smoke" should match and award experience evidence.
    const parsed = makeParsed({
      skill: 'smoke testing',
      experienceDescriptions: [
        'Executed end-to-end functional, regression, smoke, and compatibility testing',
      ],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'smoke testing');
    assert.ok(ev, 'smoke testing evidence must exist');
    assert.notEqual(ev.evidence_level, 'weak',
      `smoke testing shorthand must not be weak; got ${ev.evidence_level} (score: ${ev.evidence_score})`);
    assert.ok(ev.proof_sources.includes('experience'),
      `"experience" must be in proof_sources: ${ev.proof_sources}`);
  });

  test('experience text with only "sanity" shorthand → smoke testing evidence', () => {
    const parsed = makeParsed({
      skill: 'smoke testing',
      experienceDescriptions: ['Performed sanity check after each build deployment'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'smoke testing');
    assert.ok(ev, 'smoke testing evidence must exist');
    assert.notEqual(ev.evidence_level, 'weak',
      `sanity shorthand must not be weak; got ${ev.evidence_level}`);
  });
});

describe('Shorthand — data-driven strategies → data-driven testing evidence', () => {
  test('"data-driven strategies" in experience → data-driven testing gets moderate/strong evidence', () => {
    // The canonical skill is "data-driven testing" but the resume says "data-driven strategies".
    // The EVIDENCE_MAP phrase "data-driven strategies" must match.
    const parsed = makeParsed({
      skill: 'data-driven testing',
      experienceDescriptions: [
        'Built Selenium + Java + TestNG automation framework using POM and data-driven strategies',
      ],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'data-driven testing');
    assert.ok(ev, 'data-driven testing evidence must exist');
    assert.notEqual(ev.evidence_level, 'weak',
      `data-driven strategies must not be weak; got ${ev.evidence_level} (score: ${ev.evidence_score})`);
    assert.ok(ev.proof_sources.includes('experience'),
      `"experience" must be in proof_sources: ${ev.proof_sources}`);
    assert.ok(['moderate', 'strong'].includes(ev.evidence_level),
      `Expected moderate or strong (built + data-driven = impl_verb + evidence phrase), got ${ev.evidence_level}`);
  });

  test('"data driven" (no hyphen) in project → data-driven testing evidence', () => {
    const parsed = makeParsed({
      skill: 'data-driven testing',
      projectDescriptions: ['Designed data driven test framework for the backend service'],
    });
    const ev = evidenceFor(extractSkillEvidence(parsed), 'data-driven testing');
    assert.ok(ev, 'data-driven testing evidence must exist');
    assert.notEqual(ev.evidence_level, 'weak',
      `data driven (no hyphen) must not be weak; got ${ev.evidence_level}`);
    assert.ok(ev.proof_sources.includes('project'),
      `"project" must be in proof_sources: ${ev.proof_sources}`);
  });
});

describe('Inheritance — no evidence children → parent stays weak', () => {
  test('category skill stays weak when all children have no evidence (skills section only)', () => {
    // Only skills section — no experience entries → children are weak → no inheritance
    const parsed = makeMultiParsed({
      skills: ['selenium', 'automation testing'],
      // no experienceDescriptions → selenium starts weak, automation testing starts weak
    });

    const result = extractSkillEvidence(parsed);
    const auto   = evidenceFor(result, 'automation testing');
    const sel    = evidenceFor(result, 'selenium');

    assert.ok(sel,  'selenium evidence must exist');
    assert.ok(auto, 'automation testing evidence must exist');

    assert.equal(sel.evidence_level, 'weak',
      `selenium must be weak (skills section only); got ${sel.evidence_level}`);
    assert.equal(auto.evidence_level, 'weak',
      `automation testing must remain weak when all children are weak; got ${auto.evidence_level}`);
    assert.ok(!auto.proof_sources.includes('inherited'),
      '"inherited" must NOT be in proof_sources when no children have evidence');
  });

// ── Issue 1: section detection fix ───────────────────────────────────────────

describe('Fix 1 — "experience" in a sentence must NOT become a section boundary', () => {
  test('skill appearing after "experience" inside skills section stays skills_section_only', () => {
    // The phrase "3 years of experience in test automation" appears inside the skills
    // section paragraph.  Before the fix the word "experience" (preceded by a space)
    // was detected as a section-header, reclassifying Cucumber and BDD as 'experience'.
    // After the fix, only line-initial occurrences are treated as headers.
    const parsedText = [
      'Technical Skills',
      'Selenium TestNG',
      '3 years of experience in test automation',
      'Cucumber BDD',
      '',
      'Work Experience',
      'QA Engineer at TechCorp 2022-2024',
      'Built regression suite for release validation',
    ].join('\n');

    const parsed = {
      parsedText,
      extractedSkills:   ['cucumber', 'bdd'],
      experienceEntries: [{
        title:       'QA Engineer',
        company:     'TechCorp',
        duration:    '2022-2024',
        description: 'Built regression suite for release validation',
      }],
      projectEntries:       [],
      certificationEntries: [],
    };

    const result   = extractSkillEvidence(parsed);
    const cucumber = evidenceFor(result, 'cucumber');
    const bdd      = evidenceFor(result, 'bdd');

    assert.ok(cucumber, 'cucumber evidence must exist');
    assert.ok(!cucumber.proof_sources.includes('experience'),
      `cucumber must NOT have false experience evidence; got ${cucumber.proof_sources}`);
    assert.ok(cucumber.proof_sources.includes('skills_section_only'),
      `cucumber must be skills_section_only; got ${cucumber.proof_sources}`);

    assert.ok(bdd, 'bdd evidence must exist');
    assert.ok(!bdd.proof_sources.includes('experience'),
      `bdd must NOT have false experience evidence; got ${bdd.proof_sources}`);
  });
});

// ── Issue 2: automation framework design direct evidence ──────────────────────

describe('Fix 2 — "automation framework" phrase gives direct experience evidence', () => {
  test('"Built Selenium automation framework using POM" → automation framework design has experience', () => {
    const parsed = makeMultiParsed({
      skills: ['selenium', 'testng', 'page object model', 'automation framework design'],
      experienceDescriptions: [
        'Built Selenium automation framework using POM with TestNG reducing test time by 60%',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(afd, 'evidence must exist');
    assert.ok(afd.proof_sources.includes('experience'),
      `experience must be in proof_sources; got ${afd.proof_sources}`);
    assert.ok(!afd.proof_sources.includes('skills_section_only'),
      `skills_section_only must not appear when experience evidence exists; got ${afd.proof_sources}`);
    assert.ok(['moderate', 'strong'].includes(afd.evidence_level),
      `Expected moderate or strong; got ${afd.evidence_level}`);
  });

  test('"test automation framework" phrase also triggers evidence', () => {
    const parsed = makeMultiParsed({
      skills: ['automation framework design'],
      experienceDescriptions: ['Designed test automation framework from scratch for the QA team'],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(afd.proof_sources.includes('experience'),
      `experience must be in proof_sources; got ${afd.proof_sources}`);
  });
});

// ── Issue 3: mobile testing direct evidence ───────────────────────────────────

describe('Fix 3 — "android"/"ios" phrases give mobile testing direct experience evidence', () => {
  test('"Android and iOS testing" → mobile testing has experience in proof_sources', () => {
    const parsed = makeMultiParsed({
      skills: ['android', 'ios', 'mobile testing'],
      experienceDescriptions: [
        'Led Android and iOS testing for the mobile banking app',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const mobile = evidenceFor(result, 'mobile testing');

    assert.ok(mobile, 'mobile testing evidence must exist');
    assert.ok(mobile.proof_sources.includes('experience'),
      `mobile testing must have direct experience evidence; got ${mobile.proof_sources}`);
    assert.ok(!mobile.proof_sources.includes('skills_section_only'),
      `skills_section_only must not appear when direct evidence exists; got ${mobile.proof_sources}`);
  });
});

// ── Issue 4: direct evidence is never hidden by inheritance ───────────────────

describe('Fix 4 — direct experience evidence coexists with inheritance, never replaced', () => {
  test('automation framework design: ["experience","inherited"] when direct evidence is moderate', () => {
    // Scenario: experience mentions "automation framework" (moderate direct evidence)
    // while selenium + testng children are strong → inheritance also promotes.
    // Result must include 'experience' AND 'inherited', never just 'inherited'.
    const parsed = makeMultiParsed({
      skills: ['selenium', 'testng', 'automation framework design'],
      experienceDescriptions: [
        // 'automation framework' phrase → direct evidence; no quant → moderate (score 50)
        'Developed automation framework using Selenium and TestNG for the project',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(afd.proof_sources.includes('experience'),
      `experience must be in proof_sources; got ${afd.proof_sources}`);
    assert.ok(!afd.proof_sources.includes('skills_section_only'),
      `skills_section_only must NOT appear when direct experience exists; got ${afd.proof_sources}`);
  });

  test('without phrase match, skills_section_only + inherited is still correct', () => {
    // Description does NOT contain any evidence phrase for automation framework design
    // (only mentions "automation scripts", not "automation framework").
    // Skills section does have "automation framework design" → skills_section_only.
    // Children selenium+testng are strong → inheritance promotes and appends inherited.
    const parsed = makeMultiParsed({
      skills: ['selenium', 'testng', 'automation framework design'],
      experienceDescriptions: [
        'Developed automation scripts using Selenium and TestNG reducing coverage by 70%',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(afd.proof_sources.includes('inherited'),
      `inherited must be present when children are strong; got ${afd.proof_sources}`);
    assert.ok(!afd.proof_sources.includes('experience'),
      `experience must NOT appear when no phrase matched in entries; got ${afd.proof_sources}`);
  });
});
});

// ─────────────────────────────────────────────────────────────────────────────
// Second-pass audit fixes
// ─────────────────────────────────────────────────────────────────────────────

import { getEvidencePhrases } from '../evidenceSignals.js';

// ── Audit Fix 1 — mobile testing false-positive prevention ───────────────────

describe('Audit Fix 1A — Android developer role must NOT generate mobile testing evidence', () => {
  test('"Senior Android Developer — Built Android app using Kotlin" → mobile testing has no experience', () => {
    const parsed = makeMultiParsed({
      skills: ['android', 'mobile testing'],
      experienceDescriptions: [
        'Senior Android Developer: built Android applications using Kotlin and Jetpack Compose for fintech',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const mobile = evidenceFor(result, 'mobile testing');

    assert.ok(mobile, 'mobile testing evidence entry must exist');
    // Core assertion: no direct experience evidence from a developer-only role.
    // (Inheritance may still give basic/moderate from android's evidence — that is correct.)
    assert.ok(!mobile.proof_sources.includes('experience'),
      `mobile testing must NOT have direct experience evidence from a developer role; got ${mobile.proof_sources}`);
  });

  test('bare "iOS" in job description does not trigger mobile testing evidence', () => {
    const parsed = makeMultiParsed({
      skills: ['ios', 'mobile testing'],
      experienceDescriptions: [
        'Developed iOS features for the banking app using Swift and UIKit',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const mobile = evidenceFor(result, 'mobile testing');

    assert.ok(!mobile.proof_sources.includes('experience'),
      `bare ios in dev experience must not give mobile testing evidence; got ${mobile.proof_sources}`);
  });
});

describe('Audit Fix 1B — Explicit testing phrases still generate direct evidence', () => {
  test('"Led Android and iOS testing for banking application" → mobile testing gets experience', () => {
    const parsed = makeMultiParsed({
      skills: ['android', 'ios', 'mobile testing'],
      experienceDescriptions: [
        'Led Android and iOS testing for the banking application with 200+ test cases',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const mobile = evidenceFor(result, 'mobile testing');

    assert.ok(mobile, 'mobile testing evidence must exist');
    assert.ok(mobile.proof_sources.includes('experience'),
      `"ios testing" phrase in description must give direct evidence; got ${mobile.proof_sources}`);
    assert.ok(['moderate', 'strong'].includes(mobile.evidence_level),
      `expected moderate or strong; got ${mobile.evidence_level}`);
  });

  test('"android and ios testing" compound phrase gives direct evidence', () => {
    const parsed = makeMultiParsed({
      skills: ['mobile testing'],
      experienceDescriptions: [
        'Executed android and ios testing for cross-platform mobile product',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const mobile = evidenceFor(result, 'mobile testing');

    assert.ok(mobile.proof_sources.includes('experience'),
      `"android and ios testing" must match mobile testing phrase; got ${mobile.proof_sources}`);
  });
});

describe('Audit Fix 1C — Inheritance still promotes mobile testing when android+ios are strong', () => {
  test('android+ios in non-testing experience → mobile testing still strong via inheritance', () => {
    // Experience mentions android and ios but NOT any testing phrase — no direct evidence
    // for mobile testing.  But android and ios themselves are strong, so inheritance fires.
    const parsed = makeMultiParsed({
      skills: ['android', 'ios', 'mobile testing'],
      experienceDescriptions: [
        'Led Android and iOS development for fintech platform reducing crashes by 50%',
      ],
    });

    const result  = extractSkillEvidence(parsed);
    const android = evidenceFor(result, 'android');
    const ios     = evidenceFor(result, 'ios');
    const mobile  = evidenceFor(result, 'mobile testing');

    assert.ok(['strong', 'moderate'].includes(android.evidence_level),
      `android must have at least moderate evidence; got ${android.evidence_level}`);
    assert.ok(['strong', 'moderate'].includes(ios.evidence_level),
      `ios must have at least moderate evidence; got ${ios.evidence_level}`);

    assert.ok(mobile.proof_sources.includes('inherited'),
      `mobile testing must be promoted via inheritance; got ${mobile.proof_sources}`);
    assert.ok(!mobile.proof_sources.includes('experience'),
      `no direct testing phrase → must not have direct experience; got ${mobile.proof_sources}`);
  });
});

// ── Audit Fix 2 — automation framework false-positive prevention ──────────────

describe('Audit Fix 2A — Generic framework phrases must NOT match automation framework design', () => {
  test('"API framework design" does NOT give automation framework design evidence', () => {
    const parsed = makeMultiParsed({
      skills: ['automation framework design'],
      experienceDescriptions: [
        'Responsible for API framework design and REST service architecture at FinCorp',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(afd, 'evidence entry must exist');
    assert.ok(!afd.proof_sources.includes('experience'),
      `"API framework design" must NOT match automation framework design; got ${afd.proof_sources}`);
  });

  test('"ETL framework development" does NOT give automation framework design evidence', () => {
    const parsed = makeMultiParsed({
      skills: ['automation framework design'],
      experienceDescriptions: [
        'Owned ETL framework development for the data ingestion pipeline',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(!afd.proof_sources.includes('experience'),
      `"ETL framework development" must NOT match automation framework design; got ${afd.proof_sources}`);
  });

  test('"React framework implementation" does NOT give automation framework design evidence', () => {
    const parsed = makeMultiParsed({
      skills: ['automation framework design'],
      experienceDescriptions: [
        'Led React framework implementation and component library rollout',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(!afd.proof_sources.includes('experience'),
      `"React framework implementation" must NOT match; got ${afd.proof_sources}`);
  });
});

describe('Audit Fix 2B — QA-specific phrases still generate direct evidence', () => {
  test('"Built Selenium automation framework using POM" → automation framework design evidence', () => {
    const parsed = makeMultiParsed({
      skills: ['automation framework design'],
      experienceDescriptions: [
        'Built Selenium automation framework using POM with TestNG reducing test time by 60%',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(afd.proof_sources.includes('experience'),
      `"automation framework" phrase must match; got ${afd.proof_sources}`);
    assert.ok(['moderate', 'strong'].includes(afd.evidence_level),
      `expected moderate or strong; got ${afd.evidence_level}`);
  });

  test('"Designed test automation framework for regression suite" → evidence', () => {
    const parsed = makeMultiParsed({
      skills: ['automation framework design'],
      experienceDescriptions: [
        'Designed test automation framework for the regression suite from scratch',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(afd.proof_sources.includes('experience'),
      `"test automation framework" phrase must match; got ${afd.proof_sources}`);
  });

  test('"framework architecture" phrase (QA-anchored) gives evidence', () => {
    const parsed = makeMultiParsed({
      skills: ['automation framework design'],
      experienceDescriptions: [
        'Defined framework architecture for Selenium-based automation suite',
      ],
    });

    const result = extractSkillEvidence(parsed);
    const afd    = evidenceFor(result, 'automation framework design');

    assert.ok(afd.proof_sources.includes('experience'),
      `"framework architecture" must match; got ${afd.proof_sources}`);
  });
});

// ── Audit Fix 3 — centralized getEvidencePhrases ─────────────────────────────

describe('Audit Fix 3 — getEvidencePhrases is centralized in evidenceSignals.js', () => {
  test('automation framework design: no broad generic phrases', () => {
    const phrases = getEvidencePhrases('automation framework design');

    assert.ok(phrases.includes('automation framework'),
      'must include automation framework');
    assert.ok(phrases.includes('test automation framework'),
      'must include test automation framework');
    assert.ok(!phrases.includes('framework design'),
      'framework design must be removed (too generic)');
    assert.ok(!phrases.includes('framework development'),
      'framework development must be removed (too generic)');
    assert.ok(!phrases.includes('framework implementation'),
      'framework implementation must be removed (too generic)');
  });

  test('mobile testing: no bare android/ios tokens', () => {
    const phrases = getEvidencePhrases('mobile testing');

    assert.ok(phrases.includes('android testing'),   'android testing must be present');
    assert.ok(phrases.includes('ios testing'),        'ios testing must be present');
    assert.ok(phrases.includes('android and ios testing'), 'compound phrase must be present');
    assert.ok(!phrases.some(p => p === 'android'),    'bare "android" must be removed');
    assert.ok(!phrases.some(p => p === 'ios'),        'bare "ios" must be removed');
  });

  test('unknown skill falls back to [skill] — no crash', () => {
    const phrases = getEvidencePhrases('some obscure skill xyz');
    assert.deepEqual(phrases, ['some obscure skill xyz'],
      'fallback must return the skill name itself');
  });

  test('evidence and recency produce consistent results for automation framework design', () => {
    // Both engines must recognize the same experience text as evidence.
    // If phrases were duplicated and drifted, one would see evidence and the other would not.
    const expDescription = 'Built automation framework using Selenium and TestNG with POM';

    // Evidence extractor path: check via extractSkillEvidence
    const evParsed = makeMultiParsed({
      skills: ['automation framework design'],
      experienceDescriptions: [expDescription],
    });
    const evResult = extractSkillEvidence(evParsed);
    const afdEv    = evidenceFor(evResult, 'automation framework design');

    assert.ok(afdEv.proof_sources.includes('experience'),
      `evidence extractor must find experience for "${expDescription}"`);

    // Recency path: getEvidencePhrases('automation framework design') must include
    // 'automation framework' so resolveSkillYear also matches the same entry.
    const phrases = getEvidencePhrases('automation framework design');
    assert.ok(phrases.some(p => expDescription.toLowerCase().includes(p)),
      `at least one evidence phrase must match the experience description "${expDescription}"`);
  });
});

// ── Optional Fix 4 — line-based section detection ────────────────────────────

describe('Optional Fix 4 — line-based section header detection', () => {
  test('space-indented "   Work Experience" header is correctly recognized', () => {
    // With the char-based heuristic, "   WORK EXPERIENCE" had charBefore=' ', which
    // did not match [\n\r\t] → section was NOT detected (false negative).
    // Line-based detection trims the line → "work experience" → match.
    // A skill appearing only in the experience text (not in experienceEntries) should
    // now be classified as experience-section rather than unknown/skills.
    const parsedText = [
      'Technical Skills',
      'Selenium Cucumber',
      '',
      '   Work Experience',          // ← space-indented header
      '2022-2024 QA Engineer',
      'Executed regression testing and smoke testing for release cycles',
    ].join('\n');

    const parsed = {
      parsedText,
      extractedSkills:   ['regression testing', 'smoke testing'],
      experienceEntries: [],          // ← no structured entries; forces parsedText-only scan
      projectEntries:    [],
      certificationEntries: [],
    };

    const result = extractSkillEvidence(parsed);
    const reg    = evidenceFor(result, 'regression testing');

    assert.ok(reg, 'regression testing evidence must exist');
    assert.ok(reg.proof_sources.includes('experience'),
      `regression testing must be in experience section via space-indented header; got ${reg.proof_sources}`);
  });

  test('"3 years of experience in Selenium" still does not create a section (comprehensive)', () => {
    // Regression check: the section boundary improvement must not re-introduce
    // the in-sentence false positive that the previous fix addressed.
    const parsedText = [
      'Technical Skills',
      'Selenium TestNG',
      '3 years of experience in Selenium test automation',
      'Cucumber BDD',
      '',
      'Work Experience',
      'QA Engineer at TechCorp 2022–2024',
      'Built Selenium framework with TestNG',
    ].join('\n');

    const parsed = {
      parsedText,
      extractedSkills:   ['cucumber', 'bdd'],
      experienceEntries: [],
      projectEntries:    [],
      certificationEntries: [],
    };

    const result   = extractSkillEvidence(parsed);
    const cucumber = evidenceFor(result, 'cucumber');

    assert.ok(cucumber, 'cucumber must exist');
    assert.ok(!cucumber.proof_sources.includes('experience'),
      `cucumber after "experience" sentence must stay in skills section; got ${cucumber.proof_sources}`);
  });

  test('"Experience:" with trailing colon is recognized as a section header', () => {
    const parsedText = [
      'Skills',
      'Selenium TestNG',
      '',
      'Experience:',
      'QA role 2022–2024',
      'Executed regression testing',
    ].join('\n');

    const parsed = {
      parsedText,
      extractedSkills:   ['regression testing'],
      experienceEntries: [],
      projectEntries:    [],
      certificationEntries: [],
    };

    const result = extractSkillEvidence(parsed);
    const reg    = evidenceFor(result, 'regression testing');

    assert.ok(reg, 'regression testing must exist');
    assert.ok(reg.proof_sources.includes('experience'),
      `"Experience:" with colon must be recognized as section header; got ${reg.proof_sources}`);
  });
});
