/**
 * normalizeSkills.test.js
 *
 * Covers: alias deduplication, activity-phrase removal, skill inference,
 * strict single-letter matching, equivalence-aware missing-skill detection,
 * SKILL_FAMILIES architecture, categorizeSkillMatch, and QA resume scenarios.
 *
 * Run: node --test src/utils/resume/__tests__/normalizeSkills.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  extractSkillsFromText,
  extractSkillsWithConfidence,
  computeMissingSkills,
  categorizeSkillMatch,
  inferSkills,
  normalizeSkill,
  SKILL_FAMILIES,
  FAMILY_LOOKUP,
  SKILL_LEVELS,
} from '../normalizeSkills.js';

// ── Alias / deduplication ─────────────────────────────────────────────────────

describe('CASE 1 — pom + page object model: deduplicated to one entry', () => {
  test('both forms normalize to "page object model"', () => {
    const skills = extractSkillsFromText('Skills: pom, page object model, selenium');
    const pomCount = skills.filter(s => s === 'page object model').length;
    assert.equal(pomCount, 1,
      `Expected exactly 1 "page object model", got ${pomCount} in: ${skills}`);
    assert.ok(!skills.includes('pom'),
      `"pom" must not appear as a separate entry; skills: ${skills}`);
  });
});

describe('CASE 2 — sql + sql queries: deduplicated to "sql"', () => {
  test('both forms normalize to "sql"', () => {
    const skills = extractSkillsFromText('Skills: sql, sql queries, jira');
    const sqlCount = skills.filter(s => s === 'sql').length;
    assert.equal(sqlCount, 1,
      `Expected exactly 1 "sql", got ${sqlCount} in: ${skills}`);
    assert.ok(!skills.includes('sql queries'),
      `"sql queries" must not appear as a separate entry; skills: ${skills}`);
  });
});

// ── Inference rules ───────────────────────────────────────────────────────────

describe('CASE 3 — selenium + testng + pom → automation testing inferred', () => {
  test('extractSkillsFromText adds "automation testing" via inference', () => {
    const skills = extractSkillsFromText(
      'Tools: selenium, testng, page object model, java',
    );
    assert.ok(skills.includes('automation testing'),
      `Expected "automation testing" inferred; got: ${skills}`);
  });

  test('inferSkills adds "automation framework design" from selenium+testng+pom', () => {
    const base     = ['selenium', 'testng', 'page object model'];
    const inferred = inferSkills(base);
    assert.ok(inferred.includes('automation framework design'),
      `Expected "automation framework design"; got: ${inferred}`);
  });
});

describe('CASE 4 — android + ios + QA signal → mobile testing inferred', () => {
  test('extractSkillsFromText adds "mobile testing" when appium is present', () => {
    const skills = extractSkillsFromText('Mobile QA using android and ios with appium automation');
    assert.ok(skills.includes('mobile testing'),
      `Expected "mobile testing" inferred; got: ${skills}`);
  });
});

describe('CASE 5 — postman → api testing inferred', () => {
  test('extractSkillsFromText adds "api testing" via inference', () => {
    const skills = extractSkillsFromText('Used postman for endpoint validation');
    assert.ok(skills.includes('api testing'),
      `Expected "api testing" inferred; got: ${skills}`);
  });
});

describe('CASE 6 — sprint planning + retrospective → agile scrum inferred', () => {
  test('extractSkillsFromText adds "agile scrum" via inference', () => {
    const skills = extractSkillsFromText(
      'Participated in sprint planning and retrospective meetings',
    );
    assert.ok(skills.includes('agile scrum'),
      `Expected "agile scrum" inferred; got: ${skills}`);
  });
});

// ── Missing skill detection with equivalents ──────────────────────────────────

describe('CASE 7 — job requires "automation testing", resume has selenium → NOT missing', () => {
  test('computeMissingSkills does not report automation testing when selenium is present', () => {
    const missing = computeMissingSkills(
      ['selenium', 'testng', 'java'],
      ['automation testing'],
    );
    assert.ok(!missing.includes('automation testing'),
      `"automation testing" must not be missing when selenium is present; got: ${missing}`);
  });
});

describe('CASE 8 — job requires "mobile testing", resume has android + ios → NOT missing', () => {
  test('computeMissingSkills does not report mobile testing when android+ios are present', () => {
    const missing = computeMissingSkills(
      ['android', 'ios', 'appium'],
      ['mobile testing'],
    );
    assert.ok(!missing.includes('mobile testing'),
      `"mobile testing" must not be missing when android+ios are present; got: ${missing}`);
  });
});

// ── Strict single-letter matching ─────────────────────────────────────────────

describe('CASE 9 — "Content Creation": must NOT extract skill c', () => {
  test('c is not extracted from "Content Creation"', () => {
    const skills = extractSkillsFromText('Content Creation and Social Media');
    assert.ok(!skills.includes('c'),
      `"c" must not be extracted from "Content Creation"; got: ${skills}`);
  });

  test('c is not extracted from "Chrome automation"', () => {
    const skills = extractSkillsFromText('Chrome automation with Cypress');
    assert.ok(!skills.includes('c'),
      `"c" must not be extracted from "Chrome"; got: ${skills}`);
  });

  test('go is not extracted from "go to production"', () => {
    const skills = extractSkillsFromText('We will go to production next sprint');
    assert.ok(!skills.includes('go'),
      `"go" must not be extracted from "go to"; got: ${skills}`);
  });
});

describe('CASE 10 — "C, Java, SQL": must extract c', () => {
  test('c is extracted from a comma-separated skill list', () => {
    const skills = extractSkillsFromText('Languages: C, Java, SQL');
    assert.ok(skills.includes('c'),
      `"c" must be extracted from "C, Java, SQL"; got: ${skills}`);
  });

  test('c is extracted when on its own line', () => {
    const skills = extractSkillsFromText('Technical Skills\nC\nJava\nPython');
    assert.ok(skills.includes('c'),
      `"c" must be extracted when on its own line; got: ${skills}`);
  });
});

// ── Alias normalization unit tests ────────────────────────────────────────────

describe('normalizeSkill — alias resolution', () => {
  test('pom → page object model', () => {
    assert.equal(normalizeSkill('pom'), 'page object model');
  });
  test('sql queries → sql', () => {
    assert.equal(normalizeSkill('sql queries'), 'sql');
  });
  test('eclipse ide → eclipse', () => {
    assert.equal(normalizeSkill('eclipse ide'), 'eclipse');
  });
  test('user acceptance testing → uat', () => {
    assert.equal(normalizeSkill('user acceptance testing'), 'uat');
  });
  test('cucumber bdd → cucumber', () => {
    assert.equal(normalizeSkill('cucumber bdd'), 'cucumber');
  });
  test('robotframework → robot framework', () => {
    assert.equal(normalizeSkill('robotframework'), 'robot framework');
  });
});

// ── Activity phrases removed ──────────────────────────────────────────────────

describe('Removed activity phrases are no longer extracted', () => {
  test('"test case" alone is not extracted', () => {
    const skills = extractSkillsFromText('Wrote test case for login module');
    assert.ok(!skills.includes('test case'),
      `"test case" must not be extracted as a skill; got: ${skills}`);
  });

  test('"test script" alone is not extracted', () => {
    const skills = extractSkillsFromText('Created test script using selenium');
    assert.ok(!skills.includes('test script'),
      `"test script" must not be extracted as a skill; got: ${skills}`);
  });

  test('"test case design" is still extracted', () => {
    const skills = extractSkillsFromText('Expertise in test case design and test strategy');
    assert.ok(skills.includes('test case design'),
      `"test case design" must still be extracted; got: ${skills}`);
  });
});

// ── Missing skill — still reported when truly absent ─────────────────────────

describe('computeMissingSkills — reports genuinely missing skills', () => {
  test('skill with no equivalent is still reported as missing', () => {
    const missing = computeMissingSkills(
      ['selenium', 'jira'],
      ['jmeter', 'k6'],
    );
    assert.ok(missing.includes('jmeter'),
      `"jmeter" must be reported as missing; got: ${missing}`);
  });
});

// ── Inference guard: mobile testing requires QA signal ────────────────────────

describe('Mobile testing inference — requires QA signal', () => {
  test('PASS: Android + Manual Testing → mobile testing inferred', () => {
    const inferred = inferSkills(['android', 'manual testing']);
    assert.ok(inferred.includes('mobile testing'),
      `Expected "mobile testing"; got: ${inferred}`);
  });

  test('PASS: iOS + Regression Testing → mobile testing inferred', () => {
    const inferred = inferSkills(['ios', 'regression testing']);
    assert.ok(inferred.includes('mobile testing'),
      `Expected "mobile testing"; got: ${inferred}`);
  });

  test('FAIL: Android + React Native only → no mobile testing inference', () => {
    const inferred = inferSkills(['android', 'react native']);
    assert.ok(!inferred.includes('mobile testing'),
      `"mobile testing" must NOT be inferred for a developer with Android+React Native only; got: ${inferred}`);
  });

  test('FAIL: iOS + Swift only → no mobile testing inference', () => {
    const inferred = inferSkills(['ios', 'swift']);
    assert.ok(!inferred.includes('mobile testing'),
      `"mobile testing" must NOT be inferred for iOS+Swift without any QA signal; got: ${inferred}`);
  });
});

// ── Inference guard: automation testing requires QA signal ────────────────────

describe('Automation testing inference — requires QA signal', () => {
  test('PASS: Selenium + TestNG → automation testing inferred', () => {
    const inferred = inferSkills(['selenium', 'testng']);
    assert.ok(inferred.includes('automation testing'),
      `Expected "automation testing"; got: ${inferred}`);
  });

  test('PASS: Playwright + API Testing → automation testing inferred', () => {
    const inferred = inferSkills(['playwright', 'api testing']);
    assert.ok(inferred.includes('automation testing'),
      `Expected "automation testing"; got: ${inferred}`);
  });

  test('FAIL: Selenium only → no automation testing inference', () => {
    const inferred = inferSkills(['selenium']);
    assert.ok(!inferred.includes('automation testing'),
      `"automation testing" must NOT be inferred from Selenium alone (course/cert exposure); got: ${inferred}`);
  });

  test('PASS: Cypress alone → automation testing inferred (unconditional rule)', () => {
    const inferred = inferSkills(['cypress']);
    assert.ok(inferred.includes('automation testing'),
      `"automation testing" must be inferred from Cypress alone (Rule 7); got: ${inferred}`);
  });

  test('PASS: Selenium + Page Object Model → automation testing inferred', () => {
    const inferred = inferSkills(['selenium', 'page object model']);
    assert.ok(inferred.includes('automation testing'),
      `Expected "automation testing" from Selenium+POM; got: ${inferred}`);
  });

  test('PASS: Selenium + Data-Driven Testing → automation testing inferred', () => {
    const inferred = inferSkills(['selenium', 'data-driven testing']);
    assert.ok(inferred.includes('automation testing'),
      `Expected "automation testing" from Selenium+data-driven; got: ${inferred}`);
  });

  test('PASS: Selenium + POM + Data-Driven Testing → automation testing inferred', () => {
    const inferred = inferSkills(['selenium', 'page object model', 'data-driven testing']);
    assert.ok(inferred.includes('automation testing'),
      `Expected "automation testing" from Selenium+POM+data-driven; got: ${inferred}`);
  });

  test('FAIL: Selenium only → no automation testing inference', () => {
    const inferred = inferSkills(['selenium']);
    assert.ok(!inferred.includes('automation testing'),
      `"automation testing" must NOT be inferred from Selenium alone; got: ${inferred}`);
  });

  test('PASS: Playwright alone → automation testing inferred (unconditional rule)', () => {
    const inferred = inferSkills(['playwright']);
    assert.ok(inferred.includes('automation testing'),
      `"automation testing" must be inferred from Playwright alone (Rule 6); got: ${inferred}`);
  });
});

// ── Selenium variant deduplication ────────────────────────────────────────────

describe('Selenium variant deduplication', () => {
  test('"Selenium WebDriver" normalizes to "selenium"', () => {
    assert.equal(normalizeSkill('selenium webdriver'), 'selenium');
  });

  test('"Selenium Automation" normalizes to "selenium"', () => {
    assert.equal(normalizeSkill('selenium automation'), 'selenium');
  });

  test('"Selenium WebDriver, TestNG, Maven" → only one selenium entry', () => {
    const skills = extractSkillsFromText('Selenium WebDriver, TestNG, Maven');
    const count  = skills.filter(s => s === 'selenium').length;
    assert.equal(count, 1, `Expected exactly 1 "selenium", got ${count}: ${skills}`);
    assert.ok(!skills.includes('selenium webdriver'),
      `"selenium webdriver" must not appear as a separate entry: ${skills}`);
    assert.ok(skills.includes('testng'),  `"testng" must be present: ${skills}`);
    assert.ok(skills.includes('maven'),   `"maven" must be present: ${skills}`);
  });
});

// ── Agile / Scrum normalization ───────────────────────────────────────────────

describe('Agile / Scrum normalization', () => {
  test('"agile methodology" normalizes to "agile scrum"', () => {
    assert.equal(normalizeSkill('agile methodology'), 'agile scrum');
  });

  test('"scrum" normalizes to "agile scrum"', () => {
    assert.equal(normalizeSkill('scrum'), 'agile scrum');
  });

  test('"Agile methodology and Scrum environment" → only one "agile scrum" entry', () => {
    const skills = extractSkillsFromText('Worked in Agile methodology and Scrum environment');
    const count  = skills.filter(s => s === 'agile scrum').length;
    assert.equal(count, 1, `Expected exactly 1 "agile scrum", got ${count}: ${skills}`);
  });

  test('Sprint planning + retrospective → agile scrum inferred', () => {
    const skills = extractSkillsFromText('Participated in sprint planning and retrospective');
    assert.ok(skills.includes('agile scrum'), `Expected "agile scrum" inferred: ${skills}`);
  });
});

// ── extractSkillsWithConfidence — format and evidence levels ─────────────────

describe('extractSkillsWithConfidence — return format', () => {
  test('returns { extractedSkills, skillMetadata } shape', () => {
    const result = extractSkillsWithConfidence('Technical Skills\nselenium\nJIRA');
    assert.ok(Array.isArray(result.extractedSkills), 'extractedSkills must be an array');
    assert.ok(Array.isArray(result.skillMetadata),   'skillMetadata must be an array');
  });

  test('skills section only → evidence_level weak, confidence 70', () => {
    const { skillMetadata } = extractSkillsWithConfidence('Technical Skills\nselenium');
    const meta = skillMetadata.find(m => m.skill === 'selenium');
    assert.ok(meta, 'selenium must be in metadata');
    assert.equal(meta.evidence_level, 'weak',
      `Expected weak evidence, got ${meta.evidence_level}`);
    assert.equal(meta.confidence, 70,
      `Expected confidence 70 (skills section), got ${meta.confidence}`);
  });

  test('experience section with impl verb → evidence_level strong, confidence 95', () => {
    const text = 'Work Experience\nDeveloped selenium automation scripts for regression testing';
    const { skillMetadata } = extractSkillsWithConfidence(text);
    const meta = skillMetadata.find(m => m.skill === 'selenium');
    assert.ok(meta, 'selenium must be in metadata');
    assert.equal(meta.evidence_level, 'strong',
      `Expected strong evidence (exp + impl verb), got ${meta.evidence_level}`);
    assert.equal(meta.confidence, 95,
      `Expected confidence 95 (experience section), got ${meta.confidence}`);
  });

  test('experience + impl verb + metric → evidence_level very_strong', () => {
    const text = 'Work Experience\nDeveloped selenium scripts reducing regression effort by 60%';
    const { skillMetadata } = extractSkillsWithConfidence(text);
    const meta = skillMetadata.find(m => m.skill === 'selenium');
    assert.ok(meta, 'selenium must be in metadata');
    assert.equal(meta.evidence_level, 'very_strong',
      `Expected very_strong evidence (exp + verb + metric), got ${meta.evidence_level}`);
  });

  test('skill found in two sections → confidence 100', () => {
    const text = 'Technical Skills\nselenium\n\nWork Experience\nUsed selenium for automation';
    const { skillMetadata } = extractSkillsWithConfidence(text);
    const meta = skillMetadata.find(m => m.skill === 'selenium');
    assert.ok(meta, 'selenium must be in metadata');
    assert.equal(meta.confidence, 100,
      `Expected confidence 100 (multiple sections), got ${meta.confidence}`);
  });
});

// ── QA Resume Validation Dataset ─────────────────────────────────────────────

describe('QA Resume Validation Dataset', () => {
  test('Case 1 — Selenium + TestNG + POM → automation testing + framework design inferred', () => {
    const skills = extractSkillsFromText('selenium testng page object model java');
    assert.ok(skills.includes('selenium'),               `Missing: selenium. Got: ${skills}`);
    assert.ok(skills.includes('testng'),                 `Missing: testng. Got: ${skills}`);
    assert.ok(skills.includes('page object model'),      `Missing: page object model. Got: ${skills}`);
    assert.ok(skills.includes('automation testing'),     `Missing: automation testing. Got: ${skills}`);
    assert.ok(skills.includes('automation framework design'), `Missing: automation framework design. Got: ${skills}`);
  });

  test('Case 2 — Postman + API Validation → api testing inferred', () => {
    const skills = extractSkillsFromText('Skills: postman, api validation');
    assert.ok(skills.includes('postman'),       `Missing: postman. Got: ${skills}`);
    assert.ok(skills.includes('api validation'),`Missing: api validation. Got: ${skills}`);
    assert.ok(skills.includes('api testing'),   `Missing: api testing (inferred). Got: ${skills}`);
  });

  test('Case 3 — Android + iOS + Regression Testing → mobile testing inferred', () => {
    const skills = extractSkillsFromText('android ios regression testing');
    assert.ok(skills.includes('android'),           `Missing: android. Got: ${skills}`);
    assert.ok(skills.includes('ios'),               `Missing: ios. Got: ${skills}`);
    assert.ok(skills.includes('regression testing'),`Missing: regression testing. Got: ${skills}`);
    assert.ok(skills.includes('mobile testing'),    `Missing: mobile testing (inferred). Got: ${skills}`);
  });

  test('Case 4 — Agile Methodology + Scrum → single agile scrum entry', () => {
    const skills = extractSkillsFromText('Agile Methodology and Scrum');
    const count  = skills.filter(s => s === 'agile scrum').length;
    assert.equal(count, 1, `Expected exactly 1 "agile scrum", got ${count}: ${skills}`);
  });

  test('Case 5 — JIRA + Defect Tracking + UAT → defect management extracted', () => {
    const skills = extractSkillsFromText('Skills: JIRA, defect tracking, uat, defect management');
    assert.ok(skills.includes('jira'),             `Missing: jira. Got: ${skills}`);
    assert.ok(skills.includes('defect tracking'),  `Missing: defect tracking. Got: ${skills}`);
    assert.ok(skills.includes('uat'),              `Missing: uat. Got: ${skills}`);
    assert.ok(skills.includes('defect management'),`Missing: defect management. Got: ${skills}`);
  });

  test('Case 6 — Selenium WebDriver + TestNG + Maven → no duplicate selenium', () => {
    const skills = extractSkillsFromText('Selenium WebDriver, TestNG, Maven');
    const count  = skills.filter(s => s === 'selenium').length;
    assert.equal(count, 1, `Expected exactly 1 "selenium", got ${count}: ${skills}`);
    assert.ok(skills.includes('testng'), `Missing: testng. Got: ${skills}`);
    assert.ok(skills.includes('maven'),  `Missing: maven. Got: ${skills}`);
    assert.ok(!skills.includes('selenium webdriver'),
      `"selenium webdriver" must not be a separate entry: ${skills}`);
  });
});

// ── New skill ecosystem tests ─────────────────────────────────────────────────

describe('Playwright ecosystem — Rule 6 (unconditional)', () => {
  test('Playwright alone infers automation testing', () => {
    const inferred = inferSkills(['playwright']);
    assert.ok(inferred.includes('automation testing'),
      `Expected "automation testing" from Playwright alone; got: ${inferred}`);
  });

  test('extractSkillsFromText: "playwright automation framework" → playwright + automation testing', () => {
    const skills = extractSkillsFromText('Built Playwright automation framework using TypeScript');
    assert.ok(skills.includes('playwright'),         `Missing: playwright. Got: ${skills}`);
    assert.ok(skills.includes('automation testing'), `Missing: automation testing. Got: ${skills}`);
  });

  test('playwright testing alias normalizes to playwright', () => {
    assert.equal(normalizeSkill('playwright testing'), 'playwright');
  });

  test('playwright framework alias normalizes to playwright', () => {
    assert.equal(normalizeSkill('playwright framework'), 'playwright');
  });

  test('playwright automation alias normalizes to playwright', () => {
    assert.equal(normalizeSkill('playwright automation'), 'playwright');
  });

  test('"Playwright Testing" in resume → single playwright entry', () => {
    const skills = extractSkillsFromText('Playwright Testing, TypeScript, Playwright');
    const count  = skills.filter(s => s === 'playwright').length;
    assert.equal(count, 1, `Expected exactly 1 "playwright", got ${count}: ${skills}`);
  });
});

describe('Swagger / OpenAPI ecosystem — Rule 4 expanded', () => {
  test('Swagger infers api testing', () => {
    const inferred = inferSkills(['swagger']);
    assert.ok(inferred.includes('api testing'),
      `Expected "api testing" inferred from swagger; got: ${inferred}`);
  });

  test('OpenAPI infers api testing', () => {
    const inferred = inferSkills(['openapi']);
    assert.ok(inferred.includes('api testing'),
      `Expected "api testing" inferred from openapi; got: ${inferred}`);
  });

  test('"Swagger, OpenAPI, API Validation" → swagger + openapi + api validation + api testing', () => {
    const skills = extractSkillsFromText('Swagger, OpenAPI, API Validation');
    assert.ok(skills.includes('swagger'),       `Missing: swagger. Got: ${skills}`);
    assert.ok(skills.includes('openapi'),       `Missing: openapi. Got: ${skills}`);
    assert.ok(skills.includes('api validation'),`Missing: api validation. Got: ${skills}`);
    assert.ok(skills.includes('api testing'),   `Missing: api testing (inferred). Got: ${skills}`);
  });

  test('"swagger ui" alias normalizes to swagger', () => {
    assert.equal(normalizeSkill('swagger ui'), 'swagger');
  });

  test('"open api" alias normalizes to openapi', () => {
    assert.equal(normalizeSkill('open api'), 'openapi');
  });

  test('job requires "api testing", resume has swagger → not missing', () => {
    const missing = computeMissingSkills(['swagger', 'postman'], ['api testing']);
    assert.ok(!missing.includes('api testing'),
      `"api testing" must not be missing when swagger is present; got: ${missing}`);
  });
});

describe('CI/CD ecosystem — Rule 9', () => {
  test('Jenkins infers ci testing', () => {
    const inferred = inferSkills(['jenkins']);
    assert.ok(inferred.includes('ci testing'),
      `Expected "ci testing" from jenkins; got: ${inferred}`);
  });

  test('GitHub Actions infers ci testing', () => {
    const inferred = inferSkills(['github actions']);
    assert.ok(inferred.includes('ci testing'),
      `Expected "ci testing" from github actions; got: ${inferred}`);
  });

  test('"Jenkins Pipeline, GitHub Actions" → jenkins pipeline + github actions + ci testing', () => {
    const skills = extractSkillsFromText('Jenkins Pipeline, GitHub Actions');
    assert.ok(skills.includes('jenkins pipeline'), `Missing: jenkins pipeline. Got: ${skills}`);
    assert.ok(skills.includes('github actions'),   `Missing: github actions. Got: ${skills}`);
    assert.ok(skills.includes('ci testing'),       `Missing: ci testing (inferred). Got: ${skills}`);
  });

  test('"github workflow" alias normalizes to github actions', () => {
    assert.equal(normalizeSkill('github workflow'), 'github actions');
  });

  test('"gitlab pipeline" alias normalizes to gitlab ci', () => {
    assert.equal(normalizeSkill('gitlab pipeline'), 'gitlab ci');
  });

  test('job requires "ci testing", resume has github actions → not missing', () => {
    const missing = computeMissingSkills(['github actions', 'jenkins'], ['ci testing']);
    assert.ok(!missing.includes('ci testing'),
      `"ci testing" must not be missing when github actions is present; got: ${missing}`);
  });
});

describe('Containerization — Rule 10', () => {
  test('Docker + Kubernetes infers containerization', () => {
    const inferred = inferSkills(['docker', 'kubernetes']);
    assert.ok(inferred.includes('containerization'),
      `Expected "containerization" from docker+kubernetes; got: ${inferred}`);
  });

  test('Docker alone does NOT infer containerization', () => {
    const inferred = inferSkills(['docker']);
    assert.ok(!inferred.includes('containerization'),
      `"containerization" must NOT be inferred from docker alone; got: ${inferred}`);
  });

  test('"Docker and Kubernetes" → docker + kubernetes + containerization', () => {
    const skills = extractSkillsFromText('Docker and Kubernetes deployment');
    assert.ok(skills.includes('docker'),          `Missing: docker. Got: ${skills}`);
    assert.ok(skills.includes('kubernetes'),      `Missing: kubernetes. Got: ${skills}`);
    assert.ok(skills.includes('containerization'),`Missing: containerization. Got: ${skills}`);
  });
});

describe('Database alias normalization', () => {
  test('"Postgres" normalizes to "postgresql"', () => {
    assert.equal(normalizeSkill('postgres'), 'postgresql');
  });

  test('"mssql" normalizes to "sql server"', () => {
    assert.equal(normalizeSkill('mssql'), 'sql server');
  });

  test('"oracle sql" normalizes to "oracle"', () => {
    assert.equal(normalizeSkill('oracle sql'), 'oracle');
  });

  test('"Postgres, MongoDB" → postgresql + mongodb', () => {
    const skills = extractSkillsFromText('Postgres, MongoDB');
    assert.ok(skills.includes('postgresql'), `Missing: postgresql. Got: ${skills}`);
    assert.ok(skills.includes('mongodb'),    `Missing: mongodb. Got: ${skills}`);
    assert.ok(!skills.includes('postgres'),  `"postgres" must not appear (should be postgresql): ${skills}`);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SKILL FAMILIES ARCHITECTURE TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('SKILL_FAMILIES — structure integrity', () => {
  test('SKILL_FAMILIES is exported and has at least 10 families', () => {
    assert.ok(typeof SKILL_FAMILIES === 'object', 'SKILL_FAMILIES must be an object');
    assert.ok(Object.keys(SKILL_FAMILIES).length >= 10,
      `Expected ≥10 families, got ${Object.keys(SKILL_FAMILIES).length}`);
  });

  test('automation_testing family contains canonical + tools', () => {
    const fam = SKILL_FAMILIES.automation_testing;
    assert.ok(fam.includes('automation testing'), 'canonical "automation testing" must be in family');
    assert.ok(fam.includes('selenium'),   'selenium must be in automation_testing');
    assert.ok(fam.includes('playwright'), 'playwright must be in automation_testing');
    assert.ok(fam.includes('cypress'),    'cypress must be in automation_testing');
  });

  test('api_testing family contains modern tools (wiremock, pact, karate)', () => {
    const fam = SKILL_FAMILIES.api_testing;
    assert.ok(fam.includes('wiremock'), 'wiremock must be in api_testing');
    assert.ok(fam.includes('pact'),     'pact must be in api_testing');
    assert.ok(fam.includes('karate'),   'karate must be in api_testing');
  });

  test('automation_framework family uses framework indicators (not selenium/testng)', () => {
    const fam = SKILL_FAMILIES.automation_framework;
    assert.ok(fam.includes('page object model'),    'page object model must be in family');
    assert.ok(fam.includes('framework development'),'framework development must be in family');
    assert.ok(!fam.includes('selenium'), 'selenium must NOT be in automation_framework (belongs in automation_testing)');
    assert.ok(!fam.includes('testng'),   'testng must NOT be in automation_framework');
  });

  test('no skill appears in more than one family (FAMILY_LOOKUP has no conflicts)', () => {
    const seen = new Map();
    for (const [family, members] of Object.entries(SKILL_FAMILIES)) {
      for (const skill of members) {
        if (seen.has(skill)) {
          // This is acceptable per spec (last-writer wins in FAMILY_LOOKUP)
          // Just verify FAMILY_LOOKUP resolved to exactly one family
          assert.ok(typeof FAMILY_LOOKUP[skill] === 'string',
            `${skill} must resolve to exactly one family in FAMILY_LOOKUP`);
        }
        seen.set(skill, family);
      }
    }
  });
});

describe('FAMILY_LOOKUP — auto-generated reverse index', () => {
  test('FAMILY_LOOKUP is exported', () => {
    assert.ok(typeof FAMILY_LOOKUP === 'object');
  });

  test('selenium → automation_testing', () => {
    assert.equal(FAMILY_LOOKUP['selenium'], 'automation_testing');
  });

  test('playwright → automation_testing', () => {
    assert.equal(FAMILY_LOOKUP['playwright'], 'automation_testing');
  });

  test('swagger → api_testing', () => {
    assert.equal(FAMILY_LOOKUP['swagger'], 'api_testing');
  });

  test('postman → api_testing', () => {
    assert.equal(FAMILY_LOOKUP['postman'], 'api_testing');
  });

  test('docker → containerization', () => {
    assert.equal(FAMILY_LOOKUP['docker'], 'containerization');
  });

  test('github actions → ci_cd_testing', () => {
    assert.equal(FAMILY_LOOKUP['github actions'], 'ci_cd_testing');
  });

  test('jmeter → performance_testing', () => {
    assert.equal(FAMILY_LOOKUP['jmeter'], 'performance_testing');
  });
});

describe('SKILL_LEVELS — category vs tool classification', () => {
  test('"automation testing" is category level', () => {
    assert.equal(SKILL_LEVELS['automation testing'], 'category');
  });

  test('"api testing" is category level', () => {
    assert.equal(SKILL_LEVELS['api testing'], 'category');
  });

  test('"mobile testing" is category level', () => {
    assert.equal(SKILL_LEVELS['mobile testing'], 'category');
  });

  test('"performance testing" is category level', () => {
    assert.equal(SKILL_LEVELS['performance testing'], 'category');
  });

  test('"selenium" is tool level', () => {
    assert.equal(SKILL_LEVELS['selenium'], 'tool');
  });

  test('"swagger" is tool level', () => {
    assert.equal(SKILL_LEVELS['swagger'], 'tool');
  });

  test('"docker" is tool level', () => {
    assert.equal(SKILL_LEVELS['docker'], 'tool');
  });

  test('"automation framework design" is category level', () => {
    assert.equal(SKILL_LEVELS['automation framework design'], 'category');
  });
});

// ── categorizeSkillMatch — exact matches ──────────────────────────────────────

describe('categorizeSkillMatch — exact matches', () => {
  test('exact tool match goes to exactMatch bucket', () => {
    const { exactMatch, familyMatch, missing } =
      categorizeSkillMatch(['selenium'], ['selenium', 'testng']);
    assert.ok(exactMatch.includes('selenium'),  `selenium must be in exactMatch: ${exactMatch}`);
    assert.equal(familyMatch.length, 0, 'familyMatch must be empty');
    assert.equal(missing.length, 0,     'missing must be empty');
  });

  test('exact category match goes to exactMatch bucket', () => {
    const { exactMatch, missing } =
      categorizeSkillMatch(['automation testing'], ['automation testing', 'selenium']);
    assert.ok(exactMatch.includes('automation testing'), 'exact category hit');
    assert.equal(missing.length, 0);
  });

  test('multiple exact matches', () => {
    const { exactMatch } =
      categorizeSkillMatch(['selenium', 'jira', 'testng'], ['selenium', 'jira', 'testng']);
    assert.equal(exactMatch.length, 3, `Expected 3 exactMatch, got ${exactMatch.length}`);
  });

  test('empty job skills → all buckets empty', () => {
    const result = categorizeSkillMatch([], ['selenium', 'jira']);
    assert.equal(result.exactMatch.length, 0);
    assert.equal(result.familyMatch.length, 0);
    assert.equal(result.missing.length, 0);
  });

  test('empty resume skills → all job skills missing', () => {
    const { missing } = categorizeSkillMatch(['selenium', 'postman'], []);
    assert.equal(missing.length, 2, `Expected 2 missing, got ${missing}`);
  });
});

// ── categorizeSkillMatch — family matches ─────────────────────────────────────

describe('categorizeSkillMatch — family matches (category job skill)', () => {
  test('job: "api testing" (category) + resume: "swagger" (tool) → familyMatch', () => {
    const { exactMatch, familyMatch, missing } =
      categorizeSkillMatch(['api testing'], ['swagger']);
    assert.equal(exactMatch.length, 0,  'no exact match');
    assert.ok(familyMatch.includes('api testing'), `Expected familyMatch; got: ${familyMatch}`);
    assert.equal(missing.length, 0, 'not missing');
  });

  test('job: "automation testing" (category) + resume: "playwright" (tool) → familyMatch', () => {
    const { familyMatch, missing } =
      categorizeSkillMatch(['automation testing'], ['playwright']);
    assert.ok(familyMatch.includes('automation testing'), `Expected family match; got: ${familyMatch}`);
    assert.equal(missing.length, 0);
  });

  test('job: "mobile testing" (category) + resume: "android" (tool) → familyMatch', () => {
    const { familyMatch, missing } =
      categorizeSkillMatch(['mobile testing'], ['android', 'ios']);
    assert.ok(familyMatch.includes('mobile testing'), `Expected family match; got: ${familyMatch}`);
    assert.equal(missing.length, 0);
  });

  test('job: "ci testing" (category) + resume: "github actions" (tool) → familyMatch', () => {
    const { familyMatch, missing } =
      categorizeSkillMatch(['ci testing'], ['github actions']);
    assert.ok(familyMatch.includes('ci testing'), `Expected family match; got: ${familyMatch}`);
    assert.equal(missing.length, 0);
  });

  test('job: "performance testing" (category) + resume: "jmeter" (tool) → familyMatch', () => {
    const { familyMatch } =
      categorizeSkillMatch(['performance testing'], ['jmeter', 'k6']);
    assert.ok(familyMatch.includes('performance testing'), `Expected family match; got: ${familyMatch}`);
  });

  test('job: "containerization" (category) + resume: "docker + kubernetes" → familyMatch', () => {
    const { familyMatch, missing } =
      categorizeSkillMatch(['containerization'], ['docker', 'kubernetes']);
    assert.ok(familyMatch.includes('containerization'), `Expected family match; got: ${familyMatch}`);
    assert.equal(missing.length, 0);
  });

  test('mixed: one familyMatch + one missing', () => {
    const { exactMatch, familyMatch, missing } =
      categorizeSkillMatch(['api testing', 'jmeter'], ['postman']);
    assert.ok(familyMatch.includes('api testing'), `Expected family match for api testing; got: ${familyMatch}`);
    assert.ok(missing.includes('jmeter'), `Expected jmeter to be missing; got: ${missing}`);
    assert.equal(exactMatch.length, 0);
  });

  test('job: "agile scrum" (category) + resume: "sprint planning" → familyMatch', () => {
    const { familyMatch } =
      categorizeSkillMatch(['agile scrum'], ['sprint planning', 'retrospective']);
    assert.ok(familyMatch.includes('agile scrum'), `Expected family match; got: ${familyMatch}`);
  });
});

// ── categorizeSkillMatch — tool level direction rule ─────────────────────────

describe('categorizeSkillMatch — tool vs category direction rule', () => {
  test('CRITICAL: job requires "swagger" (tool) + resume has "api testing" (category) → MISSING', () => {
    const { exactMatch, familyMatch, missing } =
      categorizeSkillMatch(['swagger'], ['api testing']);
    assert.equal(exactMatch.length, 0,  'no exact match');
    assert.equal(familyMatch.length, 0, 'category in resume CANNOT satisfy tool job requirement');
    assert.ok(missing.includes('swagger'), `swagger must be missing; got: ${missing}`);
  });

  test('job requires "selenium" (tool) + resume has "automation testing" (category) → MISSING', () => {
    const { missing } = categorizeSkillMatch(['selenium'], ['automation testing']);
    assert.ok(missing.includes('selenium'),
      `"selenium" must be missing when only "automation testing" is in resume; got: ${missing}`);
  });

  test('job requires "docker" (tool) + resume has "containerization" (category) → MISSING', () => {
    const { missing } = categorizeSkillMatch(['docker'], ['containerization']);
    assert.ok(missing.includes('docker'),
      `"docker" must be missing when only category is in resume; got: ${missing}`);
  });

  test('job requires "playwright" (tool) + resume has "cypress" (tool same family) → MISSING', () => {
    const { missing } = categorizeSkillMatch(['playwright'], ['cypress']);
    assert.ok(missing.includes('playwright'),
      `"playwright" must be missing — different tool, even in same family; got: ${missing}`);
  });

  test('job requires "jmeter" (tool) + resume has "performance testing" (category) → MISSING', () => {
    const { missing } = categorizeSkillMatch(['jmeter'], ['performance testing']);
    assert.ok(missing.includes('jmeter'),
      `"jmeter" must be missing when only category present; got: ${missing}`);
  });
});

// ── computeMissingSkills backward compat ─────────────────────────────────────

describe('computeMissingSkills — backward compatibility', () => {
  test('still returns a flat array', () => {
    const result = computeMissingSkills(['selenium'], ['jmeter']);
    assert.ok(Array.isArray(result), 'must return array');
  });

  test('automation testing satisfied by selenium', () => {
    const missing = computeMissingSkills(['selenium'], ['automation testing']);
    assert.ok(!missing.includes('automation testing'),
      `"automation testing" must not be missing; got: ${missing}`);
  });

  test('ci testing satisfied by github actions', () => {
    const missing = computeMissingSkills(['github actions'], ['ci testing']);
    assert.ok(!missing.includes('ci testing'), `"ci testing" must not be missing; got: ${missing}`);
  });

  test('tool requirement (jmeter) not satisfied by performance testing category', () => {
    const missing = computeMissingSkills(['performance testing'], ['jmeter']);
    assert.ok(missing.includes('jmeter'), `jmeter must be missing; got: ${missing}`);
  });
});

// ── QA Resume Type Scenarios ──────────────────────────────────────────────────

describe('Manual QA Resume Scenario', () => {
  const MANUAL_QA_SKILLS = [
    'manual testing', 'functional testing', 'regression testing',
    'uat', 'exploratory testing', 'jira', 'testrail', 'test case design',
    'defect tracking', 'bug reporting', 'agile scrum',
  ];

  test('manual QA: job requires "manual testing" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['manual testing'], MANUAL_QA_SKILLS);
    assert.ok(exactMatch.includes('manual testing'));
  });

  test('manual QA: no automation tool → automation testing not inferred', () => {
    const inferred = inferSkills(MANUAL_QA_SKILLS);
    assert.ok(!inferred.includes('automation testing'),
      `Manual QA must not infer automation testing; got: ${inferred}`);
  });

  test('manual QA: job requires "automation testing" → missing (no tool)', () => {
    const { missing } = categorizeSkillMatch(['automation testing'], MANUAL_QA_SKILLS);
    assert.ok(missing.includes('automation testing'),
      `"automation testing" must be missing for manual QA; got: ${missing}`);
  });

  test('manual QA: job requires "regression testing" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['regression testing'], MANUAL_QA_SKILLS);
    assert.ok(exactMatch.includes('regression testing'));
  });

  test('manual QA: defect tracking present', () => {
    const skills = extractSkillsFromText(
      'Manual testing, defect tracking, test case design, JIRA, regression testing, UAT',
    );
    assert.ok(skills.includes('defect tracking'), `Missing defect tracking: ${skills}`);
    assert.ok(skills.includes('uat'),             `Missing uat: ${skills}`);
  });
});

describe('Automation QA Resume Scenario', () => {
  const AUTO_QA_SKILLS = [
    'selenium', 'testng', 'page object model', 'maven', 'java',
    'regression testing', 'smoke testing', 'jenkins', 'git',
  ];

  test('automation QA: automation testing inferred', () => {
    const inferred = inferSkills(AUTO_QA_SKILLS);
    assert.ok(inferred.includes('automation testing'), `Expected automation testing inferred; got: ${inferred}`);
  });

  test('automation QA: automation framework design inferred', () => {
    const inferred = inferSkills(AUTO_QA_SKILLS);
    assert.ok(inferred.includes('automation framework design'),
      `Expected framework design inferred; got: ${inferred}`);
  });

  test('automation QA: ci testing inferred from jenkins', () => {
    const inferred = inferSkills(AUTO_QA_SKILLS);
    assert.ok(inferred.includes('ci testing'), `Expected ci testing from jenkins; got: ${inferred}`);
  });

  test('automation QA: job requires "automation testing" → family match via selenium', () => {
    const { familyMatch } = categorizeSkillMatch(['automation testing'], AUTO_QA_SKILLS);
    assert.ok(familyMatch.includes('automation testing'));
  });

  test('automation QA: job requires "selenium" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['selenium'], AUTO_QA_SKILLS);
    assert.ok(exactMatch.includes('selenium'));
  });

  test('automation QA: job requires "playwright" → missing (only selenium present)', () => {
    const { missing } = categorizeSkillMatch(['playwright'], AUTO_QA_SKILLS);
    assert.ok(missing.includes('playwright'), `playwright must be missing; got: ${missing}`);
  });
});

describe('API QA Resume Scenario', () => {
  const API_QA_SKILLS = [
    'postman', 'swagger', 'rest assured', 'api validation',
    'api testing', 'schema validation', 'jira',
  ];

  test('API QA: job requires "api testing" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['api testing'], API_QA_SKILLS);
    assert.ok(exactMatch.includes('api testing'));
  });

  test('API QA: job requires "postman" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['postman'], API_QA_SKILLS);
    assert.ok(exactMatch.includes('postman'));
  });

  test('API QA: job requires "swagger" (tool) + resume has "api testing" (category) → missing', () => {
    // resume has api testing as exact but not swagger
    const resumeWithoutSwagger = API_QA_SKILLS.filter(s => s !== 'swagger');
    const { missing } = categorizeSkillMatch(['swagger'], resumeWithoutSwagger);
    assert.ok(missing.includes('swagger'),
      `"swagger" must be missing when not in resume even if api testing present; got: ${missing}`);
  });

  test('API QA: job requires "wiremock" + resume lacks it → missing', () => {
    const { missing } = categorizeSkillMatch(['wiremock'], API_QA_SKILLS);
    assert.ok(missing.includes('wiremock'), `wiremock must be missing; got: ${missing}`);
  });
});

describe('Mobile QA Resume Scenario', () => {
  const MOBILE_QA_SKILLS = [
    'android', 'ios', 'appium', 'regression testing',
    'mobile testing', 'android testing', 'ios testing',
  ];

  test('mobile QA: job requires "mobile testing" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['mobile testing'], MOBILE_QA_SKILLS);
    assert.ok(exactMatch.includes('mobile testing'));
  });

  test('mobile QA: job requires "android testing" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['android testing'], MOBILE_QA_SKILLS);
    assert.ok(exactMatch.includes('android testing'));
  });

  test('mobile QA: job requires "appium" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['appium'], MOBILE_QA_SKILLS);
    assert.ok(exactMatch.includes('appium'));
  });

  test('mobile QA: job requires "mobile testing" + resume has only "android" → family match', () => {
    const { familyMatch } = categorizeSkillMatch(['mobile testing'], ['android', 'regression testing']);
    assert.ok(familyMatch.includes('mobile testing'), `Expected family match; got: ${familyMatch}`);
  });
});

describe('Performance QA Resume Scenario', () => {
  const PERF_SKILLS = [
    'jmeter', 'k6', 'performance testing', 'load testing', 'gatling',
  ];

  test('performance QA: job requires "performance testing" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['performance testing'], PERF_SKILLS);
    assert.ok(exactMatch.includes('performance testing'));
  });

  test('performance QA: job requires "jmeter" → exact match', () => {
    const { exactMatch } = categorizeSkillMatch(['jmeter'], PERF_SKILLS);
    assert.ok(exactMatch.includes('jmeter'));
  });

  test('performance QA: job requires "blazemeter" → missing', () => {
    const { missing } = categorizeSkillMatch(['blazemeter'], PERF_SKILLS);
    assert.ok(missing.includes('blazemeter'));
  });

  test('performance QA without tools: job requires "performance testing" → family match via jmeter', () => {
    const { familyMatch } = categorizeSkillMatch(['performance testing'], ['jmeter']);
    assert.ok(familyMatch.includes('performance testing'));
  });
});

describe('SDET Resume Scenario', () => {
  const SDET_SKILLS = [
    'selenium', 'playwright', 'testng', 'page object model',
    'docker', 'kubernetes', 'github actions', 'java',
    'api testing', 'postman', 'regression testing',
  ];

  test('SDET: automation testing inferred (playwright unconditional)', () => {
    const inferred = inferSkills(SDET_SKILLS);
    assert.ok(inferred.includes('automation testing'));
  });

  test('SDET: containerization inferred from docker + kubernetes', () => {
    const inferred = inferSkills(SDET_SKILLS);
    assert.ok(inferred.includes('containerization'), `Expected containerization; got: ${inferred}`);
  });

  test('SDET: ci testing inferred from github actions', () => {
    const inferred = inferSkills(SDET_SKILLS);
    assert.ok(inferred.includes('ci testing'), `Expected ci testing; got: ${inferred}`);
  });

  test('SDET: automation framework design inferred (selenium+testng+pom)', () => {
    const inferred = inferSkills(SDET_SKILLS);
    assert.ok(inferred.includes('automation framework design'),
      `Expected framework design; got: ${inferred}`);
  });

  test('SDET: job requires "automation testing" → family match via playwright', () => {
    const { familyMatch } = categorizeSkillMatch(['automation testing'], SDET_SKILLS);
    assert.ok(familyMatch.includes('automation testing') || SDET_SKILLS.includes('automation testing'),
      `Expected family match; got: ${familyMatch}`);
  });

  test('SDET: job requires "containerization" + resume has docker+kubernetes → family match', () => {
    const { familyMatch } =
      categorizeSkillMatch(['containerization'], ['docker', 'kubernetes']);
    assert.ok(familyMatch.includes('containerization'));
  });

  test('SDET: full match report has exactMatch, familyMatch, empty missing', () => {
    const jobSkills    = ['selenium', 'automation testing', 'api testing'];
    const { exactMatch, familyMatch, missing } =
      categorizeSkillMatch(jobSkills, SDET_SKILLS);
    assert.ok(exactMatch.includes('selenium'),          `selenium must be exact; got: ${exactMatch}`);
    // api testing is also exact since it's in SDET_SKILLS
    assert.ok(exactMatch.includes('api testing') || familyMatch.includes('api testing'),
      `api testing must be satisfied`);
    assert.equal(missing.length, 0, `Expected no missing; got: ${missing}`);
  });
});
