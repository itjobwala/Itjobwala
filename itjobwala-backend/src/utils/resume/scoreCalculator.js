/**
 * QA Resume Scorer — ItJobwala's QA-domain hiring intelligence engine.
 *
 * Single scoring system: calculateQaResumeScore()
 * Everything is QA-specific. Generic resume quality metrics removed.
 *
 * Score bands:
 *   0–40   Needs Work  — significant QA gaps
 *  41–60   Fair        — entry-level / manual QA profile
 *  61–75   Good        — competitive QA candidate
 *  76–89   Great       — strong QA hire
 *  90–100  Excellent   — elite QA profile
 *
 * QA dimension weights (base dimensions: 110, optional bonuses: +10, hard cap: 100):
 *   automation_testing       25
 *   api_testing              20  (+ depth bonus up to +3)
 *   framework_expertise      15  (concept-driven; tools are supplementary)
 *   test_design_methodology  10  (test techniques + manual QA methodology depth)
 *   qa_experience            15  (+ ownership/impact/complexity signals)
 *   performance_testing      10  (optional enhancement)
 *   certifications            5
 *   bug_tracking              5
 *   ci_cd_readiness           5  (+ maturity bonus up to +1)
 *   + mobile QA bonus         5  (optional, from text phrases)
 *   + domain expertise        5  (experience/project evidence only)
 *   + resume quality          3  (informational display only — not counted in ATS score)
 *   – penalties              up to -8 (pure manual QA, no tooling)
 */

import { detectCareerLevel } from './careerCalibration.js';
import { skillMatches }     from './skillMatcher.js';

const QA_WEIGHTS = {
  automation_testing:      25,
  api_testing:             20,
  framework_expertise:     15,
  test_design_methodology: 10,
  qa_experience:           15,
  performance_testing:     10,
  certifications:           5,
  bug_tracking:             5,
  ci_cd_readiness:          5,
};

function hits(skills, keywords) {
  return keywords.filter(kw => skills.some(s => skillMatches(s, kw))).length;
}

function textHits(text, phrases) {
  return phrases.filter(p => text.includes(p)).length;
}

// ── Exported intelligence helpers ─────────────────────────────────────────────


/**
 * Get recruiter-facing hiring label from QA match score.
 * Labels reflect pure technical capability — not credibility or proof quality.
 */
export function getQaHiringLabel(score) {
  if (score >= 81) return 'High-Confidence QA Match';
  if (score >= 61) return 'Strong QA Match';
  if (score >= 41) return 'Developing QA Engineer';
  if (score >= 21) return 'Entry-Level Automation QA';
  return 'Early QA Foundation';
}

// ── Main scorer ───────────────────────────────────────────────────────────────

/**
 * Calculate QA resume score — the only scoring function on this platform.
 *
 * Deep text analysis, depth bonuses, seniority detection, and hiring label
 * are all computed here. Non-QA resumes are heavily penalised.
 */
export function calculateQaResumeScore({
  extractedSkills      = [],
  experienceEntries    = [],
  experienceYears      = 0,
  projectEntries       = [],
  certificationEntries = [],
  detectedDomain       = 'general',
  contactInfo          = {},
  parsedText           = '',
} = {}) {
  const skills = extractedSkills.map(s => s.toLowerCase().trim());
  // Full text corpus: resume text + all experience descriptions
  const text = (parsedText + ' ' + (experienceEntries || []).map(e => e.description || '').join(' ')).toLowerCase();

  // ── 1. Automation Testing (max 25) ────────────────────────────────────────────
  const AUTO = ['selenium', 'selenium webdriver', 'cypress', 'playwright', 'appium',
    'webdriverio', 'katalon', 'testng', 'junit', 'test automation', 'automation testing', 'sdet'];
  const autoH = hits(skills, AUTO);
  const autoS = autoH >= 6 ? 25 : autoH >= 4 ? 20 : autoH >= 2 ? 14 : autoH === 1 ? 8 : 0;

  // ── 2. API Testing (max 20) with depth bonus ──────────────────────────────────
  const API = ['postman', 'rest assured', 'api testing', 'soapui', 'swagger',
    'rest api testing', 'contract testing', 'api validation', 'graphql testing'];
  const apiH    = hits(skills, API);
  const apiBase = apiH >= 3 ? 17 : apiH === 2 ? 12 : apiH === 1 ? 7 : 0;

  const API_DEPTH = ['schema validation', 'response assertion', 'status code validation',
    'authentication testing', 'contract testing', 'mock api', 'api mocking', 'wiremock',
    'payload verification', 'payload validation', 'oauth testing', 'jwt token'];
  const apiDepthBonus = Math.min(3, textHits(text, API_DEPTH));
  const apiS = Math.min(20, apiBase + apiDepthBonus);

  // ── 3. Framework Expertise (max 15) ──────────────────────────────────────────
  // Concept-driven: framework engineering patterns are the primary signal.
  // Selenium/Cypress/Playwright/Appium excluded here — they're already in AUTO.
  const FW_CONCEPTS = [
    'page object model', 'page object pattern', 'hybrid framework',
    'data-driven framework', 'keyword-driven testing', 'bdd', 'cucumber',
    'specflow', 'reusable components', 'test listener', 'retry analyzer',
    'parallel execution', 'allure report', 'extent report',
  ];
  // Framework-adjacent tools (not in AUTO) — minor supplementary credit
  const FW_TOOLS = [
    'testng', 'junit', 'webdriverio', 'katalon',
    'jmeter', 'k6', 'gatling', 'rest assured', 'postman',
  ];
  // Each concept counts once whether found in skills OR text (deduplicated union).
  const fwConceptH = FW_CONCEPTS.filter(c =>
    text.includes(c) || skills.some(s => skillMatches(s, c))
  ).length;
  const fwToolH    = hits(skills, FW_TOOLS);

  // Concept base (max 12): engineering patterns drive the score
  const fwConceptBase = fwConceptH >= 5 ? 12
                      : fwConceptH >= 3 ? 9
                      : fwConceptH >= 2 ? 6
                      : fwConceptH === 1 ? 3
                      : 0;
  // Tool supplement (max 3): minor credit for framework-adjacent tools
  const fwToolSupplement = fwToolH >= 3 ? 3 : fwToolH >= 2 ? 2 : fwToolH >= 1 ? 1 : 0;
  const fwS = Math.min(15, fwConceptBase + fwToolSupplement);

  // ── 4. Performance Testing — optional enhancement (max 10) ───────────────────
  const PERF = ['jmeter', 'gatling', 'k6', 'locust', 'blazemeter',
    'performance testing', 'load testing', 'stress testing', 'endurance testing'];
  const perfH = hits(skills, PERF);
  const perfS = perfH >= 3 ? 10 : perfH === 2 ? 7 : perfH === 1 ? 4 : 0;

  // ── 5. Test Design & QA Methodology (max 10) ─────────────────────────────────
  // Rewards core QA methodology depth. Each technique counts once (skills OR text, dedup).
  const TDM_KW = [
    'test case design', 'test scenario creation', 'exploratory testing',
    'requirement analysis', 'defect reporting', 'root cause analysis',
    'boundary value analysis', 'equivalence partitioning', 'decision table testing',
    'state transition testing', 'risk based testing',
  ];
  const tdmH = TDM_KW.filter(kw =>
    text.includes(kw) || skills.some(s => skillMatches(s, kw))
  ).length;
  const tdmS = tdmH >= 5 ? 10
             : tdmH >= 3 ? 7
             : tdmH >= 2 ? 4
             : tdmH === 1 ? 2
             : 0;

  // ── 6. QA Experience (max 15) with ownership/impact/complexity intelligence ───
  let expS = 0;
  if (experienceYears >= 1) expS += 4;
  if (experienceYears >= 3) expS += 3;
  if (experienceYears >= 5) expS += 3;

  const QA_METHODS = ['stlc', 'sdlc', 'test plan', 'test strategy', 'defect tracking',
    'bug tracking', 'regression testing', 'functional testing', 'agile testing',
    'scrum', 'qa workflows', 'quality assurance', 'uat', 'integration testing'];
  const methodH = hits(skills, QA_METHODS);
  expS += methodH >= 3 ? 4 : methodH >= 2 ? 3 : methodH >= 1 ? 1 : 0;

  const QA_PROJECT_DOMAINS = new Set(['qa_automation', 'manual_qa', 'api_testing', 'performance_testing', 'mobile_testing', 'sdet']);
  const QA_PROJECT_KW      = ['selenium', 'playwright', 'cypress', 'testng', 'junit', 'cucumber', 'appium',
    'jmeter', 'k6', 'gatling', 'rest assured', 'postman', 'qa automation', 'test automation',
    'regression testing', 'bdd', 'stlc', 'uat', 'api testing'];
  const qaProjectCount = (projectEntries || []).filter(p => {
    if (p.entity_type === 'subsystem') return false; // subsystems never count as standalone QA projects
    if (p.project_domain)             return QA_PROJECT_DOMAINS.has(p.project_domain);
    const txt = ((p.name || '') + ' ' + (p.description || '')).toLowerCase();
    return QA_PROJECT_KW.some(kw => txt.includes(kw));
  }).length;
  if (qaProjectCount >= 1) expS += 1;

  // Experience intelligence from full text
  const OWNERSHIP = ['built automation framework', 'developed automation framework',
    'framework from scratch', 'designed test architecture', 'automation architecture',
    'led qa', 'owned qa', 'established qa', 'implemented automation strategy'];
  const IMPACT = ['reduced regression', 'regression effort by', '% reduction',
    'defects found', 'release readiness', 'improved quality', 'prevented'];
  const COMPLEXITY = ['parallel execution', 'cross-browser', 'multi-environment',
    'cross-platform', 'distributed testing', 'microservices'];

  const ownershipBonus  = Math.min(2, textHits(text, OWNERSHIP));
  const impactBonus     = Math.min(2, textHits(text, IMPACT));
  const complexityBonus = Math.min(1, textHits(text, COMPLEXITY));
  expS = Math.min(15, expS + ownershipBonus + impactBonus + complexityBonus);

  // ── 7. QA Certifications (max 5) ─────────────────────────────────────────────
  const CERT_KW = ['istqb', 'selenium', 'appium', 'qa', 'testing', 'quality', 'agile', 'scrum', 'zephyr', 'certified'];
  const qaCerts = (certificationEntries || []).filter(c =>
    CERT_KW.some(kw => (c || '').toLowerCase().includes(kw))
  ).length;
  const certS = qaCerts >= 2 ? 5 : qaCerts === 1 ? 3 : 0;

  // ── 8. Bug Tracking (max 5) ───────────────────────────────────────────────────
  const BUG = ['jira', 'testrail', 'zephyr', 'qtest', 'xray', 'bugzilla',
    'defect tracking', 'bug tracking', 'defect lifecycle', 'mantis'];
  const bugH = hits(skills, BUG);
  const bugS = bugH >= 2 ? 5 : bugH === 1 ? 3 : 0;

  // ── 9. CI/CD Readiness (max 5) with pipeline maturity bonus ──────────────────
  const CICD = ['ci/cd', 'jenkins', 'github actions', 'gitlab ci', 'circleci',
    'maven', 'gradle', 'docker', 'git', 'bitbucket pipelines'];
  const cicdH    = hits(skills, CICD);
  const cicdBase = cicdH >= 3 ? 4 : cicdH === 2 ? 3 : cicdH === 1 ? 1 : 0;

  const CICD_MATURITY = ['jenkins pipeline', 'jenkins job', 'github actions workflow',
    '.github/workflows', 'regression pipeline', 'automated test execution',
    'nightly execution', 'nightly run', 'dockerized test'];
  const cicdMaturityBonus = Math.min(1, textHits(text, CICD_MATURITY));
  const cicdS = Math.min(5, cicdBase + cicdMaturityBonus);

  // ── Mobile QA bonus — optional dimension (max +5) ────────────────────────────
  const MOBILE = ['android testing', 'ios testing', 'mobile automation',
    'real device testing', 'emulator testing', 'simulator testing', 'mobile testing'];
  const mobileH     = textHits(text, MOBILE);
  const mobileBonus = mobileH >= 3 ? 5 : mobileH === 2 ? 3 : mobileH === 1 ? 2 : 0;

  // ── Domain Expertise bonus (max +5) ──────────────────────────────────────────
  // Only from experience/project descriptions — skills-section listing does not qualify.
  const DOMAIN_KW = [
    'banking', 'payment gateway', 'payments', 'fintech', 'financial technology',
    'insurance', 'healthcare', 'health care', 'telecom', 'telecommunications',
    'e-commerce', 'ecommerce', 'online retail', 'financial services',
  ];
  const domainEvidenceText = [
    ...(experienceEntries || []).map(e => e.description || ''),
    ...(projectEntries   || []).map(p => `${p.name || ''} ${p.description || ''}`),
  ].join(' ').toLowerCase();
  const domainEvidenceH = textHits(domainEvidenceText, DOMAIN_KW);
  const domainBonus = domainEvidenceH >= 3 ? 5 : domainEvidenceH >= 2 ? 3 : domainEvidenceH >= 1 ? 2 : 0;

  // ── Resume formatting (informational only — not counted in ATS score) ─────────
  let formatBonus = 0;
  if (contactInfo.email && contactInfo.phone) formatBonus += 1;
  if (contactInfo.linkedin)                   formatBonus += 1;
  if (/[•\-\*◦▸]/.test(parsedText))          formatBonus += 1;

  // ── Negative signals ──────────────────────────────────────────────────────────
  let penalty = 0;
  if (detectedDomain === 'qa_testing') {
    // Pure manual QA: no automation AND no API testing tools
    if (autoS === 0 && apiH === 0) penalty += 8;
    else if (autoS === 0)          penalty += 4;
  }

  // ── Total ─────────────────────────────────────────────────────────────────────
  // formatBonus excluded: presentation quality is not a QA capability signal.
  let rawTotal = autoS + apiS + fwS + perfS + tdmS + expS + certS + bugS + cicdS
               + mobileBonus + domainBonus - penalty;

  const qa_match_score = Math.min(100, Math.max(0, rawTotal));

  // ── Build breakdown ───────────────────────────────────────────────────────────
  // sum(non-informational .score values) === rawTotal (pre-cap).
  // resume_quality is informational only — it does not contribute to ATS score.
  const qa_score_breakdown = {
    automation_testing:      { score: autoS,       max: QA_WEIGHTS.automation_testing      },
    api_testing:             { score: apiS,        max: QA_WEIGHTS.api_testing             },
    framework_expertise:     { score: fwS,         max: QA_WEIGHTS.framework_expertise     },
    performance_testing:     { score: perfS,       max: QA_WEIGHTS.performance_testing     },
    test_design_methodology: { score: tdmS,        max: QA_WEIGHTS.test_design_methodology },
    qa_experience:           { score: expS,        max: QA_WEIGHTS.qa_experience           },
    certifications:          { score: certS,       max: QA_WEIGHTS.certifications          },
    bug_tracking:            { score: bugS,        max: QA_WEIGHTS.bug_tracking            },
    ci_cd_readiness:         { score: cicdS,       max: QA_WEIGHTS.ci_cd_readiness         },
    mobile_testing:          { score: mobileBonus, max: 5                                  },
    domain_expertise:        { score: domainBonus, max: 5                                  },
    resume_quality:          { score: formatBonus, max: 3, informational: true             },
    penalties:               { score: penalty > 0 ? -penalty : 0, max: 0                  },
  };

  // ── Seniority ─────────────────────────────────────────────────────────────────
  // qa_seniority is the raw-score-time career level. intelligenceAdapter.js
  // overrides it with career_level (computed after all calibrations) so both
  // fields are always identical in the final API response.
  // qa_hiring_label is NOT generated here — it must reflect the final calibrated
  // ATS score and is therefore computed in intelligenceAdapter.js after the
  // stuffing penalty, section-only attenuation, and career ceiling are applied.
  // P0 Fix 1: career level is year-only; parsedText no longer promotes level.
  const qa_seniority = detectCareerLevel({ experienceYears });

  // ── Recruiter-facing feedback ─────────────────────────────────────────────────
  const strengths   = [];
  const weaknesses  = [];
  const suggestions = [];

  if (autoS >= 20) {
    const autoTools = ['selenium', 'cypress', 'playwright', 'appium', 'webdriverio']
      .filter(t => skills.includes(t))
      .map(t => t.charAt(0).toUpperCase() + t.slice(1));
    const toolStr = autoTools.length
      ? autoTools.join('/') + ' automation coverage'
      : 'Automation testing depth confirmed';
    strengths.push(toolStr);
  } else if (autoS >= 14) {
    strengths.push('Solid automation foundation — room to expand');
  }

  if (apiS >= 15) {
    const apiTools = ['postman', 'rest assured', 'soapui']
      .filter(t => skills.some(s => s.includes(t)));
    const toolStr = apiTools.length
      ? apiTools.map(t => t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join('/')
      : 'API testing';
    strengths.push(`${toolStr} proficiency confirmed`);
  } else if (apiS >= 8) {
    strengths.push('API testing awareness detected');
  }

  if (fwS >= 12)         strengths.push('Framework engineering depth — POM/BDD/parallel patterns demonstrated');
  else if (fwS >= 6)    strengths.push('Framework engineering awareness — some patterns applied');
  if (perfS >= 7)        strengths.push('Performance engineering (JMeter/Gatling/K6)');
  if (expS >= 12)        strengths.push(`${experienceYears}+ years QA tenure with strong methodology depth`);
  if (certS >= 3)        strengths.push('QA certification (ISTQB) — strong recruiter trust signal');
  if (bugH >= 2)         strengths.push('JIRA/TestRail defect lifecycle proficiency');
  if (cicdS >= 4)        strengths.push('CI/CD pipeline integration — automation-first mindset');
  if (mobileBonus >= 3)  strengths.push('Mobile QA expertise (Appium/real device testing)');
  if (tdmS >= 7)         strengths.push('Strong QA methodology — test design techniques (BVA, EP, exploratory) demonstrated');
  else if (tdmS >= 4)    strengths.push('QA methodology awareness — test case design and exploratory testing');
  if (domainBonus >= 3)  strengths.push('Domain expertise verified in experience — strong specialist signal');

  if (autoS === 0)
    weaknesses.push('No automation frameworks — add Selenium or Cypress to stand out');
  if (apiH === 0 && detectedDomain === 'qa_testing')
    weaknesses.push('No API testing — Postman or REST Assured is expected in most QA roles');
  if (bugH === 0)
    weaknesses.push('No bug tracking tools mentioned — add JIRA or TestRail experience');
  if (experienceYears === 0)
    weaknesses.push('QA experience years undetected — ensure resume dates are clear');

  if (autoS > 0 && autoS < 14)
    suggestions.push('Expand automation — add Playwright or Cypress alongside your current tools');
  if (apiH <= 1)
    suggestions.push('Add Postman + REST Assured — standard API testing stack for QA engineers');
  if (perfS === 0)
    suggestions.push('JMeter or K6 experience boosts profile for mid-to-senior QA roles');
  if (certS === 0)
    suggestions.push('ISTQB certification adds strong recruiter credibility — consider certifying');
  if (cicdH <= 1)
    suggestions.push('Add GitHub Actions or Jenkins experience — CI/CD is expected in automation roles');
  if (fwS < 6)
    suggestions.push('Add framework engineering concepts — page object model, BDD/Cucumber, or parallel execution patterns');
  if (tdmS === 0)
    suggestions.push('Add test design techniques — equivalence partitioning, boundary value analysis, or exploratory testing');

  return {
    qa_match_score,
    qa_seniority,
    qa_score_breakdown,
    strengths,
    weaknesses,
    suggestions,
  };
}

// Legacy alias — keeps existing callers working
export const calculateQaMatchScore = calculateQaResumeScore;

/**
 * Return the score band label + color token for a QA match score.
 * Bands reflect pure capability — not credibility or proof quality.
 */
export function getScoreBand(score) {
  if (score >= 86) return { label: 'Elite / Highly Competitive', color: 'emerald' };
  if (score >= 71) return { label: 'Advanced QA Engineer',        color: 'green'   };
  if (score >= 51) return { label: 'Strong QA Match',             color: 'blue'    };
  if (score >= 31) return { label: 'Developing Automation QA',    color: 'amber'   };
  if (score >= 16) return { label: 'Foundational QA',             color: 'orange'  };
  return              { label: 'Very Early Stage',                 color: 'red'     };
}
