/**
 * atsCalibration.js — Post-scoring calibration helpers for the ATS pipeline.
 *
 * Applied in intelligenceAdapter.js after base scoring AND evidence analysis.
 * All functions are pure, side-effect-free, and independently testable.
 *
 * Calibration pipeline order:
 *   Raw ATS → Career Ceiling → Evidence Multiplier → Section-Only Attenuation
 *          → Stuffing Penalty → Recency Penalty → Final ATS
 */

// ── Feature flags ─────────────────────────────────────────────────────────────

/**
 * ATS_ENABLE_SOFT_ATTENUATION
 *
 * When true, the 50–64% section-only range receives a mild ×0.93 reduction.
 * Disabled by default — set ATS_ENABLE_SOFT_ATTENUATION=true in env to enable.
 * Can also be overridden per-call via the second parameter of
 * computeSectionOnlyMultiplier(), which is useful in tests.
 */
const ATS_SOFT_ATTENUATION =
  (process.env.ATS_ENABLE_SOFT_ATTENUATION ?? 'false') === 'true';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute an evidence-quality multiplier for key automation / API skills.
 *
 * Converts proven skill usage into a score multiplier rather than an additive
 * bonus, so the reward scales proportionally with the raw score instead of
 * adding a fixed absolute boost.
 *
 * Step table (per effective strong-skill count):
 *   0 effective  → ×1.00
 *   1 effective  → ×1.02
 *   2 effective  → ×1.04
 *   3 effective  → ×1.06
 *   ≥4 effective → ×1.08  (cap)
 *
 * Effective count = strongCount + moderateCount × 0.5
 *   (two moderate-evidence skills = one effective strong-evidence skill)
 *
 * Only skills with DIRECT experience or project evidence count.
 * Purely inherited skills are excluded (their children are already counted).
 *
 * @param {object[]} skill_evidence — from extractSkillEvidence()
 * @returns {number} 1.00 | 1.02 | 1.04 | 1.06 | 1.08
 */
export function computeEvidenceMultiplier(skill_evidence) {
  if (!skill_evidence?.length) return 1.00;

  const BONUS_SKILLS = new Set([
    // Core automation tools
    'selenium', 'playwright', 'cypress', 'appium', 'webdriverio', 'katalon',
    // Test execution frameworks
    'testng', 'junit', 'cucumber', 'specflow',
    // API testing tools
    'postman', 'rest assured',
    // Framework patterns
    'page object model',
    // CI/CD + infra
    'jenkins', 'github actions', 'docker', 'k6',
  ]);

  let strongCount   = 0;
  let moderateCount = 0;

  for (const ev of skill_evidence) {
    if (!BONUS_SKILLS.has(ev.skill)) continue;

    // Exclude purely inherited skills — their child skills are already counted.
    if (ev.proof_sources.includes('inherited') &&
        !ev.proof_sources.includes('experience') &&
        !ev.proof_sources.includes('project')) continue;

    if (ev.evidence_level === 'strong')        strongCount++;
    else if (ev.evidence_level === 'moderate') moderateCount++;
  }

  const effective = strongCount + moderateCount * 0.5;
  const level     = Math.min(4, Math.floor(effective));
  return [1.00, 1.02, 1.04, 1.06, 1.08][level];
}

/**
 * Compute the section-only attenuation multiplier.
 *
 * Skills listed only in a skills section carry no proof of actual usage.
 * High section-only ratios indicate keyword-padding over demonstrated capability.
 *
 * Thresholds:
 *   ≥0.85  → 0.72   strongest penalty — near-total keyword listing
 *   ≥0.65  → 0.85   solid middle penalty
 *   ≥0.50  → 0.93   mild band — only active when softAttenuation flag is ON
 *   <0.50  → 1.00   well-evidenced resumes are unaffected
 *
 * @param {number}  sectionOnlyRatio  — 0.0–1.0
 * @param {boolean} softAttenuation   — enable the 50–64% band (default: env flag)
 * @returns {number} 0.72 | 0.85 | 0.93 | 1.00
 */
export function computeSectionOnlyMultiplier(
  sectionOnlyRatio,
  softAttenuation = ATS_SOFT_ATTENUATION,
) {
  if (sectionOnlyRatio >= 0.85) return 0.72;
  if (sectionOnlyRatio >= 0.65) return 0.85;
  if (softAttenuation && sectionOnlyRatio >= 0.50) return 0.93;
  return 1.00;
}

/**
 * Compute a recency penalty for stale high-sensitivity skills.
 *
 * Modern QA tooling (Playwright, Cypress, Docker, k6, etc.) evolves quickly.
 * A candidate whose key modern tools are 5+ years stale signals a tooling gap.
 *
 * Penalty only fires when ALL three conditions are met:
 *   1. classification === 'stale'        (5+ years since last use)
 *   2. recency_sensitive === true        (tool is in the high-sensitivity set)
 *   3. recency_source === 'experience'   (direct evidence — NOT inherited)
 *
 * Condition 3 prevents penalising a candidate for mobile testing being stale
 * merely because it was promoted via inheritance from android/ios.
 *
 * Penalty table:
 *   3+ qualifying skills → −6 pts
 *   2 qualifying         → −3 pts
 *   1 qualifying         → −1 pt
 *   0 qualifying         → 0
 *
 * @param {object} skill_recency — from analyzeSkillRecency()
 * @returns {number} integer 0–6
 */
export function computeRecencyPenalty(skill_recency) {
  if (!skill_recency) return 0;

  const count = Object.values(skill_recency).filter(r =>
    r.classification  === 'stale' &&
    r.recency_sensitive === true  &&
    r.recency_source  === 'experience'
  ).length;

  if (count >= 3) return 6;
  if (count === 2) return 3;
  if (count === 1) return 1;
  return 0;
}
