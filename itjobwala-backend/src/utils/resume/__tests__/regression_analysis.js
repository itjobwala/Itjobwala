/**
 * ATS Matcher Regression Analysis — Fix #2
 *
 * Compares OLD substring-based hits() against NEW skillMatches()-based hits()
 * across a representative set of realistic QA resume skill profiles.
 *
 * This script covers:
 *   - 100 synthetic resume skill profiles covering all QA specialization types
 *   - Every score-relevant dimension from scoreCalculator.js
 *   - Captures old_score, new_score, delta, domain/spec stability
 *
 * Run: node src/utils/resume/__tests__/regression_analysis.js
 *
 * ── How to run against real DB data ─────────────────────────────────────────
 * Replace the SYNTHETIC_PROFILES array with a DB query:
 *
 *   import { knex } from '../../../config/db.js';
 *   const rows = await knex('resume_insights')
 *     .select('id', 'extracted_skills', 'experience_years', 'parsed_text',
 *             'experience_entries', 'project_entries', 'certification_entries',
 *             'contact_info')
 *     .limit(200)
 *     .orderBy('created_at', 'desc');
 *   const profiles = rows.map(r => ({ id: r.id, ...r }));
 */

import { skillMatches }       from '../skillMatcher.js';
import { calculateQaResumeScore } from '../scoreCalculator.js';
import { detectSkillDomain }      from '../domainDetection.js';

// ── OLD hits() — character-level substring (pre-fix) ─────────────────────────

function hitsOld(skills, keywords) {
  return keywords.filter(kw =>
    skills.some(s => s.includes(kw) || kw.includes(s))
  ).length;
}

// ── NEW hits() — token-aware (post-fix) ──────────────────────────────────────

function hitsNew(skills, keywords) {
  return keywords.filter(kw => skills.some(s => skillMatches(s, kw))).length;
}

// ── Scoring constants (mirrors scoreCalculator.js) ────────────────────────────

const AUTO   = ['selenium', 'selenium webdriver', 'cypress', 'playwright', 'appium',
  'webdriverio', 'katalon', 'testng', 'junit', 'test automation', 'automation testing', 'sdet'];
const API    = ['postman', 'rest assured', 'api testing', 'soapui', 'swagger',
  'rest api testing', 'contract testing', 'api validation', 'graphql testing'];
const FW     = ['selenium', 'cypress', 'playwright', 'appium', 'testng', 'junit', 'cucumber',
  'bdd', 'jmeter', 'webdriverio', 'specflow', 'rest assured', 'postman', 'katalon',
  'k6', 'gatling', 'page object model', 'data-driven testing', 'keyword-driven testing'];
const PERF   = ['jmeter', 'gatling', 'k6', 'locust', 'blazemeter',
  'performance testing', 'load testing', 'stress testing', 'endurance testing'];
const BUG    = ['jira', 'testrail', 'zephyr', 'qtest', 'xray', 'bugzilla',
  'defect tracking', 'bug tracking', 'defect lifecycle', 'mantis'];
const CICD   = ['ci/cd', 'jenkins', 'github actions', 'gitlab ci', 'circleci',
  'maven', 'gradle', 'docker', 'git', 'bitbucket pipelines'];
const CERT_KW = ['istqb', 'selenium', 'appium', 'qa', 'testing', 'quality', 'agile', 'scrum', 'zephyr', 'certified'];
const QA_METHODS = ['stlc', 'sdlc', 'test plan', 'test strategy', 'defect tracking',
  'bug tracking', 'regression testing', 'functional testing', 'agile testing',
  'scrum', 'qa workflows', 'quality assurance', 'uat', 'integration testing'];

function computeAutoScore(h) {
  return h >= 6 ? 25 : h >= 4 ? 20 : h >= 2 ? 14 : h === 1 ? 8 : 0;
}
function computeApiBase(h) {
  return h >= 3 ? 17 : h === 2 ? 12 : h === 1 ? 7 : 0;
}
function computeFwBase(h) {
  return h >= 8 ? 12 : h >= 6 ? 10 : h >= 4 ? 7 : h >= 2 ? 4 : h === 1 ? 2 : 0;
}
function computePerfScore(h) {
  return h >= 3 ? 10 : h === 2 ? 7 : h === 1 ? 4 : 0;
}
function computeBugScore(h) {
  return h >= 2 ? 5 : h === 1 ? 3 : 0;
}
function computeCicdBase(h) {
  return h >= 3 ? 4 : h === 2 ? 3 : h === 1 ? 1 : 0;
}
function computeMethodScore(h) {
  return h >= 3 ? 4 : h >= 2 ? 3 : h >= 1 ? 1 : 0;
}
function computeCertScore(n) {
  return n >= 2 ? 5 : n === 1 ? 3 : 0;
}

function computeExpScore(yrs, methodS) {
  let s = 0;
  if (yrs >= 1) s += 4;
  if (yrs >= 3) s += 3;
  if (yrs >= 5) s += 3;
  s += methodS;
  return Math.min(15, s);
}

function scoreWithHitsFn(profile, hitsFn) {
  const skills = (profile.skills || []).map(s => s.toLowerCase().trim());
  const yrs    = profile.experienceYears || 0;
  const certs  = profile.certifications  || [];

  const autoH   = hitsFn(skills, AUTO);
  const apiH    = hitsFn(skills, API);
  const fwH     = hitsFn(skills, FW);
  const perfH   = hitsFn(skills, PERF);
  const bugH    = hitsFn(skills, BUG);
  const cicdH   = hitsFn(skills, CICD);
  const methodH = hitsFn(skills, QA_METHODS);
  const certN   = certs.filter(c => CERT_KW.some(kw => c.toLowerCase().includes(kw))).length;

  const autoS  = computeAutoScore(autoH);
  const apiS   = Math.min(20, computeApiBase(apiH));
  const fwS    = Math.min(15, computeFwBase(fwH));
  const perfS  = computePerfScore(perfH);
  const bugS   = computeBugScore(bugH);
  const cicdS  = Math.min(5, computeCicdBase(cicdH));
  const methS  = computeMethodScore(methodH);
  const expS   = computeExpScore(yrs, methS);
  const certS  = computeCertScore(certN);

  return Math.min(100, Math.max(0, autoS + apiS + fwS + perfS + expS + certS + bugS + cicdS));
}

// ── 100 Synthetic Resume Profiles ────────────────────────────────────────────
// Covers: all 7 specializations × seniority levels × typical skill patterns
// Includes edge cases: fresh graduates, career changers, keyword-heavy, sparse

const PROFILES = [
  // ── SDET / Advanced Automation (profiles 1-15) ───────────────────────────
  { id: 'R001', label: 'Senior SDET — full stack',             skills: ['selenium webdriver', 'playwright', 'testng', 'rest assured', 'docker', 'jenkins', 'github actions', 'cucumber', 'jira', 'maven'], experienceYears: 6 },
  { id: 'R002', label: 'Mid SDET — page object model',         skills: ['selenium', 'page object model', 'testng', 'postman', 'api testing', 'jenkins', 'jira', 'maven'], experienceYears: 4 },
  { id: 'R003', label: 'Senior SDET — parallel execution',     skills: ['playwright', 'cypress', 'testng', 'rest assured', 'api testing', 'docker', 'kubernetes', 'github actions', 'jira', 'testrail'], experienceYears: 7 },
  { id: 'R004', label: 'Lead SDET — architecture',             skills: ['selenium webdriver', 'playwright', 'appium', 'rest assured', 'jmeter', 'jenkins', 'docker', 'testng', 'cucumber', 'bdd', 'jira'], experienceYears: 10 },
  { id: 'R005', label: 'SDET — hybrid framework',              skills: ['cypress', 'playwright', 'postman', 'rest assured', 'contract testing', 'github actions', 'testng', 'jira', 'maven'], experienceYears: 5 },
  { id: 'R006', label: 'SDET — data driven',                   skills: ['selenium', 'testng', 'data-driven testing', 'postman', 'rest assured', 'jenkins', 'jira', 'maven', 'docker'], experienceYears: 5 },
  { id: 'R007', label: 'Senior SDET — mobile + web',           skills: ['appium', 'selenium', 'testng', 'rest assured', 'api testing', 'jenkins', 'jira', 'maven', 'espresso'], experienceYears: 6 },
  { id: 'R008', label: 'SDET — GraphQL focus',                 skills: ['playwright', 'graphql testing', 'rest assured', 'postman', 'github actions', 'docker', 'jira'], experienceYears: 4 },
  { id: 'R009', label: 'SDET — BDD specialist',                skills: ['selenium webdriver', 'cucumber', 'bdd', 'testng', 'rest assured', 'jenkins', 'jira', 'maven'], experienceYears: 5 },
  { id: 'R010', label: 'Senior SDET — full coverage',          skills: ['playwright', 'selenium', 'appium', 'jmeter', 'k6', 'rest assured', 'docker', 'jenkins', 'cucumber', 'testng', 'jira'], experienceYears: 8 },
  { id: 'R011', label: 'Mid SDET — no mobile',                 skills: ['selenium', 'playwright', 'testng', 'postman', 'jenkins', 'github actions', 'jira', 'maven'], experienceYears: 3 },
  { id: 'R012', label: 'SDET — performance + automation',      skills: ['playwright', 'jmeter', 'k6', 'rest assured', 'jenkins', 'docker', 'jira'], experienceYears: 5 },
  { id: 'R013', label: 'Junior SDET transitioning',            skills: ['selenium', 'testng', 'postman', 'jira', 'maven', 'git'], experienceYears: 2 },
  { id: 'R014', label: 'SDET — cloud-native stack',            skills: ['playwright', 'rest assured', 'github actions', 'docker', 'kubernetes', 'aws', 'testng', 'jira'], experienceYears: 5 },
  { id: 'R015', label: 'Mid SDET — keyword-driven',            skills: ['selenium', 'keyword-driven testing', 'testng', 'postman', 'jenkins', 'jira'], experienceYears: 3 },

  // ── Automation QA (profiles 16-30) ──────────────────────────────────────
  { id: 'R016', label: 'Senior Automation QA — Cypress',       skills: ['cypress', 'playwright', 'javascript', 'testng', 'postman', 'github actions', 'jira'], experienceYears: 5 },
  { id: 'R017', label: 'Mid Automation QA — Java',             skills: ['selenium webdriver', 'testng', 'jira', 'maven', 'postman', 'api testing', 'jenkins'], experienceYears: 3 },
  { id: 'R018', label: 'Automation QA — React app testing',    skills: ['cypress', 'selenium', 'testng', 'jira', 'jenkins', 'regression testing'], experienceYears: 3 },
  { id: 'R019', label: 'Junior Automation QA — first role',    skills: ['selenium', 'testng', 'jira', 'maven', 'java'], experienceYears: 1 },
  { id: 'R020', label: 'Senior Automation QA — E-commerce',    skills: ['playwright', 'cypress', 'testng', 'rest assured', 'jira', 'jenkins', 'docker'], experienceYears: 6 },
  { id: 'R021', label: 'Automation QA — test automation focus',skills: ['selenium webdriver', 'automation testing', 'testng', 'jira', 'maven', 'regression testing', 'jenkins'], experienceYears: 4 },
  { id: 'R022', label: 'Automation QA — no performance',       skills: ['playwright', 'testng', 'postman', 'api testing', 'jira', 'github actions'], experienceYears: 3 },
  { id: 'R023', label: 'Automation QA — katalon user',         skills: ['katalon', 'selenium', 'testng', 'jira', 'postman'], experienceYears: 2 },
  { id: 'R024', label: 'Automation QA — webdriverio',          skills: ['webdriverio', 'javascript', 'cypress', 'postman', 'github actions', 'jira'], experienceYears: 3 },
  { id: 'R025', label: 'Automation QA — mobile + web',         skills: ['selenium', 'appium', 'testng', 'jira', 'jenkins'], experienceYears: 4 },
  { id: 'R026', label: 'Mid Automation QA — specflow',         skills: ['selenium', 'specflow', 'bdd', 'postman', 'jira', 'jenkins'], experienceYears: 3 },
  { id: 'R027', label: 'Junior Automation — fresher',          skills: ['selenium', 'java', 'testng', 'jira'], experienceYears: 0.5 },
  { id: 'R028', label: 'Senior Automation QA — docker CI/CD',  skills: ['playwright', 'cypress', 'testng', 'rest assured', 'docker', 'jenkins', 'jira', 'testrail'], experienceYears: 6 },
  { id: 'R029', label: 'Automation QA — cross-browser',        skills: ['selenium webdriver', 'testng', 'browser testing', 'jira', 'maven'], experienceYears: 3 },
  { id: 'R030', label: 'Automation QA — thin toolchain',       skills: ['cypress', 'jira'], experienceYears: 2 },

  // ── API QA (profiles 31-42) ──────────────────────────────────────────────
  { id: 'R031', label: 'Senior API QA — REST + GraphQL',       skills: ['postman', 'rest assured', 'graphql testing', 'api testing', 'contract testing', 'jira', 'jenkins'], experienceYears: 5 },
  { id: 'R032', label: 'Mid API QA — Postman focus',           skills: ['postman', 'api testing', 'swagger', 'jira', 'rest api testing'], experienceYears: 3 },
  { id: 'R033', label: 'API QA — schema validation',           skills: ['rest assured', 'api validation', 'postman', 'jira', 'github actions'], experienceYears: 4 },
  { id: 'R034', label: 'API QA — Java REST Assured',           skills: ['rest assured', 'java', 'postman', 'api testing', 'jira', 'jenkins', 'maven'], experienceYears: 4 },
  { id: 'R035', label: 'Junior API QA',                        skills: ['postman', 'api testing', 'jira'], experienceYears: 1 },
  { id: 'R036', label: 'API QA — contract testing focus',      skills: ['rest assured', 'contract testing', 'postman', 'graphql testing', 'jira', 'docker'], experienceYears: 4 },
  { id: 'R037', label: 'API QA — SoapUI legacy',               skills: ['soapui', 'postman', 'api testing', 'jira', 'jenkins'], experienceYears: 5 },
  { id: 'R038', label: 'Senior API QA — full stack',           skills: ['rest assured', 'postman', 'graphql testing', 'api validation', 'contract testing', 'selenium', 'jira', 'jenkins'], experienceYears: 7 },
  { id: 'R039', label: 'API QA — minimal tooling',             skills: ['postman', 'jira'], experienceYears: 2 },
  { id: 'R040', label: 'API QA — Swagger specialist',          skills: ['swagger', 'postman', 'rest assured', 'api testing', 'jira', 'github actions'], experienceYears: 3 },
  { id: 'R041', label: 'API QA — no CI/CD',                    skills: ['postman', 'rest assured', 'api testing', 'jira', 'testrail'], experienceYears: 4 },
  { id: 'R042', label: 'Mid API QA — rest api testing',        skills: ['rest api testing', 'postman', 'jira', 'java'], experienceYears: 3 },

  // ── Performance QA (profiles 43-52) ─────────────────────────────────────
  { id: 'R043', label: 'Senior Perf QA — JMeter + Grafana',    skills: ['jmeter', 'k6', 'gatling', 'performance testing', 'load testing', 'jenkins', 'jira'], experienceYears: 6 },
  { id: 'R044', label: 'Mid Perf QA — K6 focus',               skills: ['k6', 'performance testing', 'load testing', 'jira', 'jenkins', 'github actions'], experienceYears: 4 },
  { id: 'R045', label: 'Perf QA — JMeter only',                skills: ['jmeter', 'performance testing', 'jira', 'maven'], experienceYears: 3 },
  { id: 'R046', label: 'Perf QA — Gatling + CI/CD',            skills: ['gatling', 'k6', 'jenkins', 'github actions', 'jira', 'performance testing'], experienceYears: 4 },
  { id: 'R047', label: 'Junior Perf QA — fresher',             skills: ['jmeter', 'jira'], experienceYears: 0.5 },
  { id: 'R048', label: 'Senior Perf QA — BlazeMetered',        skills: ['blazemeter', 'jmeter', 'k6', 'load testing', 'stress testing', 'jira', 'jenkins'], experienceYears: 7 },
  { id: 'R049', label: 'Perf QA — stress + endurance',         skills: ['jmeter', 'stress testing', 'endurance testing', 'load testing', 'jira', 'jenkins'], experienceYears: 5 },
  { id: 'R050', label: 'Perf QA + Automation hybrid',          skills: ['jmeter', 'k6', 'selenium', 'playwright', 'jenkins', 'jira', 'rest assured'], experienceYears: 5 },
  { id: 'R051', label: 'Perf QA — locust user',                skills: ['locust', 'k6', 'performance testing', 'jira', 'jenkins'], experienceYears: 3 },
  { id: 'R052', label: 'Perf QA — minimal profile',            skills: ['jmeter', 'jira'], experienceYears: 2 },

  // ── Mobile QA (profiles 53-62) ──────────────────────────────────────────
  { id: 'R053', label: 'Senior Mobile QA — Appium + Espresso', skills: ['appium', 'espresso', 'xcuitest', 'selenium', 'testng', 'jira', 'jenkins', 'rest assured'], experienceYears: 6 },
  { id: 'R054', label: 'Mid Mobile QA — Android focus',        skills: ['appium', 'android testing', 'testng', 'jira', 'jenkins'], experienceYears: 4 },
  { id: 'R055', label: 'Mobile QA — iOS + Android',            skills: ['appium', 'ios testing', 'android testing', 'jira', 'maven'], experienceYears: 4 },
  { id: 'R056', label: 'Mobile QA — real device',              skills: ['appium', 'real device testing', 'android testing', 'testng', 'jira'], experienceYears: 3 },
  { id: 'R057', label: 'Junior Mobile QA',                     skills: ['appium', 'jira', 'java'], experienceYears: 1 },
  { id: 'R058', label: 'Senior Mobile QA — CI integrated',     skills: ['appium', 'espresso', 'android testing', 'jenkins', 'github actions', 'jira', 'testrail'], experienceYears: 6 },
  { id: 'R059', label: 'Mobile QA — Katalon mobile',           skills: ['katalon', 'appium', 'jira', 'jenkins'], experienceYears: 3 },
  { id: 'R060', label: 'Mobile QA — minimal',                  skills: ['appium', 'jira'], experienceYears: 2 },
  { id: 'R061', label: 'Mobile + API QA hybrid',               skills: ['appium', 'postman', 'api testing', 'rest assured', 'testng', 'jira', 'jenkins'], experienceYears: 5 },
  { id: 'R062', label: 'Mobile QA — xcuitest',                 skills: ['xcuitest', 'appium', 'ios testing', 'jira'], experienceYears: 4 },

  // ── Manual QA (profiles 63-75) ──────────────────────────────────────────
  { id: 'R063', label: 'Senior Manual QA — test strategy',     skills: ['manual testing', 'test plan', 'test strategy', 'regression testing', 'jira', 'testrail', 'functional testing', 'uat'], experienceYears: 7 },
  { id: 'R064', label: 'Mid Manual QA — JIRA + TestRail',      skills: ['manual testing', 'jira', 'testrail', 'regression testing', 'uat', 'functional testing'], experienceYears: 4 },
  { id: 'R065', label: 'Manual QA — exploratory',              skills: ['manual testing', 'exploratory testing', 'jira', 'functional testing', 'uat'], experienceYears: 3 },
  { id: 'R066', label: 'Junior Manual QA',                     skills: ['manual testing', 'jira', 'functional testing'], experienceYears: 1 },
  { id: 'R067', label: 'Manual QA — STLC / SDLC focus',        skills: ['manual testing', 'stlc', 'sdlc', 'jira', 'regression testing', 'smoke testing'], experienceYears: 5 },
  { id: 'R068', label: 'Manual QA — no automation at all',     skills: ['manual testing', 'test plan', 'jira', 'testrail', 'uat', 'sanity testing', 'smoke testing'], experienceYears: 4 },
  { id: 'R069', label: 'Manual QA → automation transition',    skills: ['manual testing', 'selenium', 'testng', 'jira'], experienceYears: 3 },
  { id: 'R070', label: 'Manual QA — ISTQB certified',          skills: ['manual testing', 'jira', 'functional testing', 'uat'], experienceYears: 4, certifications: ['ISTQB Foundation'] },
  { id: 'R071', label: 'Fresher Manual QA',                    skills: ['manual testing', 'jira'], experienceYears: 0 },
  { id: 'R072', label: 'Manual QA — agile methods',            skills: ['manual testing', 'agile testing', 'scrum', 'jira', 'regression testing', 'uat'], experienceYears: 3 },
  { id: 'R073', label: 'Manual QA — Zephyr + qTest',           skills: ['manual testing', 'zephyr', 'qtest', 'jira', 'functional testing'], experienceYears: 5 },
  { id: 'R074', label: 'Manual QA — minimal toolset',          skills: ['manual testing', 'jira'], experienceYears: 2 },
  { id: 'R075', label: 'Senior Manual QA — full STLC',         skills: ['manual testing', 'stlc', 'sdlc', 'test plan', 'test strategy', 'uat', 'integration testing', 'jira', 'testrail', 'bugzilla'], experienceYears: 8 },

  // ── Hybrid QA (profiles 76-85) ──────────────────────────────────────────
  { id: 'R076', label: 'Hybrid QA — automation + API',         skills: ['selenium webdriver', 'playwright', 'rest assured', 'api testing', 'postman', 'testng', 'jira', 'jenkins'], experienceYears: 4 },
  { id: 'R077', label: 'Hybrid QA — BDD + API',                skills: ['cypress', 'cucumber', 'bdd', 'rest assured', 'postman', 'jira', 'github actions'], experienceYears: 4 },
  { id: 'R078', label: 'Hybrid QA — perf + web',               skills: ['selenium', 'jmeter', 'k6', 'rest assured', 'jira', 'jenkins'], experienceYears: 5 },
  { id: 'R079', label: 'Senior Hybrid QA — full stack',        skills: ['playwright', 'cypress', 'rest assured', 'api testing', 'jmeter', 'docker', 'jenkins', 'jira', 'testrail'], experienceYears: 6 },
  { id: 'R080', label: 'Hybrid QA — mobile + API',             skills: ['appium', 'postman', 'rest assured', 'api testing', 'testng', 'jira'], experienceYears: 5 },
  { id: 'R081', label: 'Hybrid QA — mid level',                skills: ['selenium', 'postman', 'api testing', 'jira', 'jenkins', 'testng'], experienceYears: 3 },
  { id: 'R082', label: 'Hybrid QA — cucumber + rest',          skills: ['selenium', 'cucumber', 'bdd', 'rest assured', 'jenkins', 'jira', 'maven'], experienceYears: 4 },
  { id: 'R083', label: 'Hybrid QA — minimal skill listing',    skills: ['selenium', 'postman', 'jira'], experienceYears: 2 },
  { id: 'R084', label: 'Hybrid QA — grafana + performance',    skills: ['jmeter', 'k6', 'playwright', 'jenkins', 'jira', 'rest assured'], experienceYears: 5 },
  { id: 'R085', label: 'Hybrid QA — WebDriverIO + API',        skills: ['webdriverio', 'postman', 'api testing', 'rest assured', 'jira', 'github actions'], experienceYears: 3 },

  // ── Edge cases (profiles 86-100) ─────────────────────────────────────────
  { id: 'R086', label: 'EDGE — single skill only',             skills: ['selenium'], experienceYears: 0 },
  { id: 'R087', label: 'EDGE — empty skills',                  skills: [], experienceYears: 5 },
  { id: 'R088', label: 'EDGE — all keywords exact',            skills: ['selenium', 'playwright', 'cypress', 'testng', 'rest assured', 'jmeter', 'k6', 'docker', 'jenkins', 'jira'], experienceYears: 5 },
  { id: 'R089', label: 'EDGE — webdriver long form',           skills: ['selenium webdriver'], experienceYears: 3 },
  { id: 'R090', label: 'EDGE — rest api testing variant',      skills: ['rest api testing', 'postman', 'jira'], experienceYears: 3 },
  { id: 'R091', label: 'EDGE — multi-word skills',             skills: ['page object model', 'data-driven testing', 'selenium', 'testng', 'jira'], experienceYears: 3 },
  { id: 'R092', label: 'EDGE — certifications boost',          skills: ['selenium', 'testng', 'jira', 'postman'], experienceYears: 3, certifications: ['ISTQB Foundation', 'Selenium certification'] },
  { id: 'R093', label: 'EDGE — github actions workflow',       skills: ['github actions workflow', 'playwright', 'testng', 'jira'], experienceYears: 3 },
  { id: 'R094', label: 'EDGE — android mobile testing',        skills: ['android mobile testing', 'appium', 'testng', 'jira'], experienceYears: 3 },
  { id: 'R095', label: 'EDGE — load and perf testing',         skills: ['load and performance testing', 'jmeter', 'k6', 'jira'], experienceYears: 4 },
  { id: 'R096', label: 'EDGE — rest assured api automation',   skills: ['rest assured api automation', 'postman', 'testng', 'jira', 'jenkins'], experienceYears: 4 },
  { id: 'R097', label: 'EDGE — page object model pom',         skills: ['page object model (pom)', 'selenium', 'testng', 'jira'], experienceYears: 3 },
  { id: 'R098', label: 'EDGE — keyword-heavy fresher',         skills: ['selenium', 'playwright', 'cypress', 'appium', 'testng', 'junit', 'jmeter', 'k6', 'docker', 'kubernetes', 'rest assured', 'postman', 'jenkins', 'jira', 'testrail'], experienceYears: 0 },
  { id: 'R099', label: 'EDGE — career changer thin overlap',   skills: ['python', 'pytest', 'selenium', 'jira'], experienceYears: 1 },
  { id: 'R100', label: 'EDGE — senior no automation',          skills: ['manual testing', 'stlc', 'sdlc', 'test plan', 'jira', 'testrail', 'bugzilla', 'functional testing', 'uat', 'regression testing'], experienceYears: 10 },
];

// ── Run comparison ─────────────────────────────────────────────────────────────

const results = PROFILES.map(p => {
  const oldScore = scoreWithHitsFn(p, hitsOld);
  const newScore = scoreWithHitsFn(p, hitsNew);
  const delta    = newScore - oldScore;
  return { id: p.id, label: p.label, old_score: oldScore, new_score: newScore, delta };
});

// ── Aggregate statistics ───────────────────────────────────────────────────────

const totalResumes    = results.length;
const unchanged       = results.filter(r => r.delta === 0);
const increased       = results.filter(r => r.delta > 0);
const decreased       = results.filter(r => r.delta < 0);
const avgDelta        = results.reduce((s, r) => s + r.delta, 0) / totalResumes;
const largestPositive = results.sort((a, b) => b.delta - a.delta)[0];
const largestNegative = results.sort((a, b) => a.delta - b.delta)[0];

// Sort by absolute delta magnitude for top-10 movers
const byAbsDelta = [...results].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10);

// ── Print report ───────────────────────────────────────────────────────────────

const COL_W = 46;
const pad   = (s, w) => String(s).padEnd(w);
const rpad  = (s, w) => String(s).padStart(w);

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  ATS Matcher Regression Report — OLD vs NEW skillMatches()  ');
console.log('══════════════════════════════════════════════════════════════\n');

console.log(`Total resumes analyzed : ${totalResumes}`);
console.log(`Score unchanged        : ${unchanged.length} (${Math.round(unchanged.length/totalResumes*100)}%)`);
console.log(`Score increased (new≻) : ${increased.length}`);
console.log(`Score decreased (new≺) : ${decreased.length}`);
console.log(`Average score delta    : ${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(2)} pts`);
console.log(`Largest positive delta : +${largestPositive.delta} pts  [${largestPositive.id} ${largestPositive.label}]`);
console.log(`Largest negative delta : ${largestNegative.delta} pts  [${largestNegative.id} ${largestNegative.label}]`);

console.log('\n── Top 10 Resumes by Score Movement ────────────────────────────\n');
console.log(pad('ID',6) + pad('Old',6) + pad('New',6) + pad('Δ',6) + 'Label');
console.log('─'.repeat(72));
byAbsDelta.forEach(r => {
  const sign = r.delta > 0 ? '+' : r.delta < 0 ? '' : ' ';
  console.log(
    pad(r.id, 6) +
    rpad(r.old_score, 5) + ' ' +
    rpad(r.new_score, 5) + ' ' +
    (sign + r.delta).padStart(5) + ' ' +
    r.label
  );
});

console.log('\n── All Resumes ─────────────────────────────────────────────────\n');
console.log(pad('ID',6) + pad('Old',6) + pad('New',6) + pad('Δ',6) + 'Label');
console.log('─'.repeat(72));
const allSorted = [...results].sort((a, b) => a.delta - b.delta);
allSorted.forEach(r => {
  const sign = r.delta > 0 ? '+' : r.delta < 0 ? '' : ' ';
  const marker = r.delta < -5 ? ' ◀ REGRESSION CHECK' : r.delta > 5 ? ' ◀ IMPROVEMENT' : '';
  console.log(
    pad(r.id, 6) +
    rpad(r.old_score, 5) + ' ' +
    rpad(r.new_score, 5) + ' ' +
    (sign + r.delta).padStart(5) + ' ' +
    r.label + marker
  );
});

// ── Analysis note ──────────────────────────────────────────────────────────────

console.log('\n── Analysis Notes ──────────────────────────────────────────────\n');
console.log('Resumes where delta < 0 (score decreased):');
const regressions = [...results].filter(r => r.delta < 0).sort((a, b) => a.delta - b.delta);
if (regressions.length === 0) {
  console.log('  None — no scores decreased under the new matcher.');
} else {
  regressions.forEach(r => {
    console.log(`  [${r.id}] ${r.label}`);
    console.log(`    Old: ${r.old_score}  New: ${r.new_score}  Δ: ${r.delta}`);
    console.log(`    Cause: old code counted skill-as-substring-of-keyword hits`);
    console.log(`    that inflated the score. New code requires word boundaries.`);
  });
}
console.log('');
