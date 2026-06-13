/**
 * skillRecencyAnalyzer.js — Phase 5 Fix 2
 * Classifies per-skill recency with confidence scoring, source attribution,
 * and explicit year detection. Stale threshold changed to 5+ years.
 */

import { EVIDENCE_FAMILIES, getEvidencePhrases } from '../evidence/evidenceSignals.js';

const CURRENT_YEAR = new Date().getFullYear();

const HIGH_RECENCY_SENSITIVITY = new Set([
  'playwright', 'cypress', 'docker', 'kubernetes', 'github actions', 'terraform',
  'k6', 'grafana', 'vitest', 'pact', 'gitlab ci', 'jest', 'detox', 'appium', 'maestro',
]);

const LOW_RECENCY_SENSITIVITY = new Set([
  'selenium', 'jira', 'regression testing', 'manual testing', 'test planning',
  'test cases', 'bug reporting', 'test documentation', 'quality assurance',
  'test management', 'agile', 'scrum',
]);

// ── Duration helpers ──────────────────────────────────────────────────────────

function parseEndYear(duration) {
  if (!duration) return null;
  const lower = duration.toLowerCase();
  if (/present|current|now/.test(lower)) return CURRENT_YEAR;
  const years = (duration.match(/\b(20\d{2}|19\d{2})\b/g) || []).map(Number);
  return years.length ? Math.max(...years) : null;
}

function parseStartYear(duration) {
  if (!duration) return null;
  const years = (duration.match(/\b(20\d{2}|19\d{2})\b/g) || []).map(Number);
  return years.length ? Math.min(...years) : null;
}

// ── Recency classification (stale = 5+ years) ─────────────────────────────────

function classifyRecency(lastUsedYear) {
  if (lastUsedYear === null) return 'unknown';
  const age = CURRENT_YEAR - lastUsedYear;
  if (age <= 2) return 'recent';
  if (age <= 4) return 'aging';
  return 'stale';  // 5+ years
}

// ── Confidence from source ────────────────────────────────────────────────────

function confidenceFromSource(source) {
  if (source === 'experience' || source === 'project' || source === 'certification') return 'high';
  if (source === 'inferred') return 'medium';
  return 'low';
}

// ── Per-skill recency resolver ─────────────────────────────────────────────────

/**
 * Returns { year, source, explicit } for the most authoritative date found.
 * Priority: explicit experience date > project date > cert date > inferred > skills fallback
 */
function resolveSkillYear(se, experienceEntries, certificationEntries, latestExpYear) {
  const skillLow = se.skill.toLowerCase();
  const phrases  = getEvidencePhrases(skillLow);

  // 1. Explicit experience date (highest priority).
  //    Use the same evidence phrases as the evidence extractor so that a skill
  //    like 'automation framework design' matches "automation framework using POM"
  //    instead of requiring the full canonical name verbatim.
  let bestYear = null;
  let bestSource = null;
  let explicitFound = false;

  for (const entry of experienceEntries) {
    const endYear   = parseEndYear(entry.duration);
    const entryText = [entry.title, entry.company, entry.description].filter(Boolean).join(' ').toLowerCase();
    if (phrases.some(p => entryText.includes(p)) && endYear !== null) {
      if (bestYear === null || endYear > bestYear) {
        bestYear = endYear;
        bestSource = 'experience';
        explicitFound = true;
      }
    }
  }
  if (bestYear !== null) return { year: bestYear, source: bestSource, explicit: explicitFound };

  // 2. Certification date
  for (const cert of certificationEntries) {
    if (typeof cert !== 'string') continue;
    const certLower = cert.toLowerCase();
    if (!certLower.includes(skillLow)) continue;
    const yearMatch = cert.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      if (bestYear === null || year > bestYear) {
        bestYear = year;
        bestSource = 'certification';
        explicitFound = true;
      }
    }
  }
  if (bestYear !== null) return { year: bestYear, source: bestSource, explicit: explicitFound };

  // 3. Infer from proof_sources: if skill is in experience section, use latest exp year
  if (se.proof_sources.includes('experience') && latestExpYear !== null) {
    return { year: latestExpYear, source: 'inferred', explicit: false };
  }

  // 4. skills_only fallback — no date inference possible
  return { year: null, source: 'skills_only', explicit: false };
}

// ── Recency classification rank (for promotion logic) ────────────────────────

const RECENCY_RANK = { unknown: 0, stale: 1, aging: 2, recent: 3 };

/**
 * Promote category skill recency using family-level inheritance.
 *
 * A parent skill with classification 'unknown' (no direct date evidence) can
 * inherit the best classification from its child skills.  Direct evidence
 * always wins — this function only fills in 'unknown' gaps.
 *
 * Rules: if ANY child is recent   → parent becomes recent
 *        if ANY child is aging    → parent becomes aging  (if still unknown)
 *        if ANY child is stale    → parent becomes stale  (if still unknown)
 *        no classified children   → parent stays unknown
 */
function applyRecencyInheritance(skill_recency) {
  for (const [parent, children] of Object.entries(EVIDENCE_FAMILIES)) {
    const parentEntry = skill_recency[parent];
    if (!parentEntry || parentEntry.classification !== 'unknown') continue;

    let bestClassification = 'unknown';
    let bestYear = null;

    for (const child of children) {
      const childEntry = skill_recency[child];
      if (!childEntry || childEntry.classification === 'unknown') continue;
      if ((RECENCY_RANK[childEntry.classification] ?? 0) > (RECENCY_RANK[bestClassification] ?? 0)) {
        bestClassification = childEntry.classification;
        bestYear           = childEntry.last_used_year;
      }
    }

    if (bestClassification !== 'unknown') {
      skill_recency[parent] = {
        ...parentEntry,
        classification:         bestClassification,
        recency_source:         'inherited',
        last_used_year:         bestYear,
        recency_confidence:     'medium',
        explicit_year_detected: false,
      };
    }
  }

  return skill_recency;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function analyzeSkillRecency(parsed, skill_evidence) {
  const { experienceEntries = [], certificationEntries = [] } = parsed;

  // Latest year across all experience entries (for inferred fallback)
  const allExpYears = experienceEntries
    .map(e => parseEndYear(e.duration))
    .filter(y => y !== null);
  const latestExpYear = allExpYears.length ? Math.max(...allExpYears) : null;

  const skill_recency = {};

  for (const se of skill_evidence) {
    const { year, source, explicit } = resolveSkillYear(
      se, experienceEntries, certificationEntries, latestExpYear
    );

    const classification    = classifyRecency(year);
    const recency_confidence = confidenceFromSource(source);
    const isHighSensitivity = [...HIGH_RECENCY_SENSITIVITY].some(h => se.skill.toLowerCase().includes(h));
    const isLowSensitivity  = [...LOW_RECENCY_SENSITIVITY].some(l  => se.skill.toLowerCase().includes(l));

    skill_recency[se.skill] = {
      classification,
      recency_confidence,
      recency_source:        source,
      explicit_year_detected: explicit,
      last_used_year:        year,
      recency_sensitive:     isHighSensitivity && !isLowSensitivity,
    };
  }

  applyRecencyInheritance(skill_recency);

  const values = Object.values(skill_recency);

  const recency_stats = {
    recent_count:  values.filter(v => v.classification === 'recent').length,
    aging_count:   values.filter(v => v.classification === 'aging').length,
    stale_count:   values.filter(v => v.classification === 'stale').length,
    unknown_count: values.filter(v => v.classification === 'unknown').length,
  };

  const recency_summary = {
    recent_skills:        recency_stats.recent_count,
    aging_skills:         recency_stats.aging_count,
    stale_skills:         recency_stats.stale_count,
    unknown_skills:       recency_stats.unknown_count,
    high_confidence_count: values.filter(v => v.recency_confidence === 'high').length,
  };

  const stale_high_sensitivity = Object.entries(skill_recency)
    .filter(([, v]) => v.classification === 'stale' && v.recency_sensitive)
    .map(([skill]) => skill);

  return { skill_recency, recency_stats, recency_summary, stale_high_sensitivity };
}
