/**
 * specializationEvidenceEngine.js — Evidence-First Specialization Detection
 *
 * Phase 2 of the ATS Final Hardening.
 *
 * OLD flow: keyword → specialization → validation
 * NEW flow: evidence → specialization
 *
 * Specialization is now built DIRECTLY from evidence signals, not keyword
 * counts. This eliminates the "inflate then repair" pattern where SDET was
 * assigned from keyword scores and then downgraded by a separate gate.
 *
 * ── SDET Requirements (strictest) ───────────────────────────────────────────
 * Must satisfy minimum 3 of 5 evidence groups:
 *   1. CODING      — a programming language appears with implementation evidence
 *   2. FRAMEWORK   — framework ownership verified (arch signals or strong evidence)
 *   3. CI/CD       — CI/CD tool used in experience context
 *   4. ENGINEERING  — maturity signals: parallel execution, reporting, utilities
 *   5. IMPACT      — quantified outcomes in experience
 *
 * Coding (group 1) is REQUIRED.
 * Framework Ownership (group 2) is REQUIRED.
 * If any required group is missing: qa_specialization = automation_qa.
 *
 * ── Other Specializations ───────────────────────────────────────────────────
 * Scored by counting EVIDENCED skills (evidence_level !== 'weak') in the
 * specialization's skill cluster. Higher evidenced skill count → stronger match.
 */

// ── Skill clusters per specialization ─────────────────────────────────────────

const CLUSTERS = {
  automation: ['selenium', 'playwright', 'cypress', 'appium', 'webdriverio', 'katalon',
    'testng', 'junit', 'specflow', 'pytest', 'page object model'],
  api:        ['rest assured', 'postman', 'api testing', 'graphql testing', 'contract testing'],
  mobile:     ['appium', 'android testing', 'ios testing', 'mobile testing'],
  performance:['jmeter', 'k6', 'gatling', 'performance testing'],
  cicd:       ['jenkins', 'github actions', 'docker', 'kubernetes'],
  manual:     ['manual testing', 'regression testing', 'smoke testing', 'exploratory testing'],
};

// Programming languages — checked in extractedSkills (not in TRACKED_QA_SKILLS)
const CODING_LANGUAGES = new Set([
  'java', 'python', 'javascript', 'typescript', 'c#', 'csharp', 'kotlin',
  'scala', 'groovy', 'ruby', 'golang', 'go', 'swift', 'objc',
]);

// Engineering maturity phrases — checked in parsedText
const ENGINEERING_MATURITY = [
  'parallel execution', 'reporting layer', 'allure report', 'extent report',
  'allure reporting', 'framework module', 'test utility', 'custom utility',
  'reusable component', 'retry mechanism', 'retry logic', 'test listener',
  'base class', 'abstract test', 'factory pattern', 'singleton',
  'modular framework', 'page object', 'builder pattern', 'fluent api',
];

// Framework ownership phrases — checked in parsedText
const FRAMEWORK_OWNERSHIP = [
  'built automation framework', 'developed automation framework', 'framework from scratch',
  'designed test architecture', 'automation architecture', 'reusable framework',
  'automation infrastructure', 'test infrastructure', 'automation strategy',
  'designed the framework', 'built the framework', 'created automation framework',
  'designed automation', 'core framework', 'framework design', 'automation suite',
  'reusable test library', 'custom test framework',
];

// Quantified impact phrases — checked in parsedText
const IMPACT_PHRASES = [
  'reduced execution time', 'reduced regression time', 'improved coverage',
  'reduced defects', 'automation coverage', 'reduced manual effort',
  'defect reduction', 'release quality', 'prevented defects',
  'faster regression', 'cut execution', 'saved hours', 'improved quality',
];

// ── SDET evidence group detection ─────────────────────────────────────────────

function detectSdetEvidenceGroups({
  extractedSkills,
  parsedText,
  skill_evidence,
  evidence_profile,
  implementationDepth,
}) {
  const text   = (parsedText || '').toLowerCase();
  const skills = (extractedSkills || []).map(s => s.toLowerCase().trim());

  // Group 1 — Coding: programming language with any implementation signal
  const hasCodingLanguage  = skills.some(s => CODING_LANGUAGES.has(s));
  // Verify it appears in experience context (not just skills list)
  const codingInText       = [...CODING_LANGUAGES].some(lang => text.includes(lang));
  const coding = hasCodingLanguage && codingInText;

  // Group 2 — Framework ownership: verified architecture depth OR ownership phrase in text
  const automationSE       = (skill_evidence || []).filter(e =>
    CLUSTERS.automation.includes(e.skill) &&
    (e.evidence_level === 'strong' || e.depth_level === 'architected' || e.depth_level === 'production')
  );
  const framework_ownership =
    (evidence_profile?.has_architecture_depth ?? false) ||
    automationSE.length >= 1                            ||
    FRAMEWORK_OWNERSHIP.some(p => text.includes(p));

  // Group 3 — CI/CD: ci/cd skill with evidence OR integration flag
  const cicdSE = (skill_evidence || []).filter(e =>
    CLUSTERS.cicd.includes(e.skill) && e.evidence_level !== 'weak'
  );
  const cicd_integration =
    (evidence_profile?.has_cicd_integration ?? false) ||
    cicdSE.length >= 1                                ||
    (implementationDepth?.sdet_gate?.cicd ?? false);

  // Group 4 — Engineering maturity: advanced framework patterns in text
  const engineering_maturity = ENGINEERING_MATURITY.some(p => text.includes(p));

  // Group 5 — Quantified impact: measurable outcome mentioned
  const impact =
    (evidence_profile?.has_quantified_impact ?? false) ||
    IMPACT_PHRASES.some(p => text.includes(p));

  const groups = { coding, framework_ownership, cicd_integration, engineering_maturity, impact };
  const satisfied = Object.values(groups).filter(Boolean).length;

  return { groups, satisfied };
}

// ── Score a specialization by evidenced skill count ───────────────────────────

function scoreSpecialization(clusterSkills, skill_evidence) {
  return (skill_evidence || []).filter(e =>
    clusterSkills.includes(e.skill) && e.evidence_level !== 'weak'
  ).length;
}

// ── Confidence from dominance over runner-up ──────────────────────────────────

function computeConfidence(topScore, runnerScore, bonus = 0) {
  if (topScore === 0) return 20;
  const total    = topScore + runnerScore + 0.01;
  const dominance = topScore / total;
  return Math.min(92, Math.max(25, Math.round(dominance * 90 + bonus)));
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Detect QA specialization directly from evidence — not keyword counts.
 *
 * @param {string[]} extractedSkills
 * @param {string}   parsedText
 * @param {object[]} skill_evidence   — from skillEvidenceExtractor
 * @param {object}   evidence_profile — from recruiterTrustEngine
 * @param {object}   implementationDepth — from implementationDepthAnalyzer
 * @returns {{ qa_specialization, specialization_confidence, specialization_evidence }}
 */
export function detectSpecializationFromEvidence(
  extractedSkills,
  parsedText,
  skill_evidence,
  evidence_profile,
  implementationDepth,
) {
  // ── SDET check (most demanding — checked first) ───────────────────────────
  const sdetResult = detectSdetEvidenceGroups({
    extractedSkills, parsedText, skill_evidence, evidence_profile, implementationDepth,
  });

  // SDET requires: ≥3 groups AND coding AND framework_ownership
  const isSdet =
    sdetResult.satisfied >= 3 &&
    sdetResult.groups.coding              &&
    sdetResult.groups.framework_ownership;

  if (isSdet) {
    // Confidence scales with how many groups are satisfied (3=low, 5=high)
    const conf = 50 + (sdetResult.satisfied - 3) * 20; // 50, 70, 90
    return {
      qa_specialization:         'sdet',
      specialization_confidence: Math.min(90, conf),
      specialization_evidence:   sdetResult.groups,
    };
  }

  // ── Non-SDET specializations — score by evidenced skills ─────────────────
  const scores = {
    automation_qa:    scoreSpecialization(CLUSTERS.automation,   skill_evidence),
    api_testing:      scoreSpecialization(CLUSTERS.api,          skill_evidence),
    mobile_testing:   scoreSpecialization(CLUSTERS.mobile,       skill_evidence),
    performance_testing: scoreSpecialization(CLUSTERS.performance, skill_evidence),
    manual_qa:        scoreSpecialization(CLUSTERS.manual,       skill_evidence),
  };

  // hybrid_qa: meaningful automation + api evidence together
  const hybridScore = scores.automation_qa + scores.api_testing;
  if (scores.automation_qa >= 2 && scores.api_testing >= 1 && hybridScore >= 4) {
    const runnerUp = Math.max(scores.performance_testing, scores.mobile_testing);
    return {
      qa_specialization:         'hybrid_qa',
      specialization_confidence: computeConfidence(hybridScore, runnerUp, 5),
      specialization_evidence:   { hybrid_score: hybridScore },
    };
  }

  // Rank remaining specializations
  const ranked = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [topSpec, topScore] = ranked[0] ?? ['manual_qa', 0];
  const [, runnerScore]     = ranked[1] ?? ['', 0];

  if (topScore === 0) {
    // No evidenced skills in any cluster → manual_qa by default
    return {
      qa_specialization:         'manual_qa',
      specialization_confidence: 20,
      specialization_evidence:   { evidenced_skills: 0 },
    };
  }

  return {
    qa_specialization:         topSpec,
    specialization_confidence: computeConfidence(topScore, runnerScore),
    specialization_evidence:   { evidenced_skills: topScore, runner_up_score: runnerScore },
  };
}

/**
 * Validate that SDET specialization meets evidence requirements.
 * Returns diagnostic info for the scoring_trace.
 */
export function getSdetEvidenceSummary(extractedSkills, parsedText, skill_evidence, evidence_profile, implementationDepth) {
  const result = detectSdetEvidenceGroups({ extractedSkills, parsedText, skill_evidence, evidence_profile, implementationDepth });
  return {
    groups_satisfied: result.satisfied,
    groups_required:  3,
    coding_required:  true,
    framework_required: true,
    is_qualified: result.satisfied >= 3 && result.groups.coding && result.groups.framework_ownership,
    groups: result.groups,
  };
}
