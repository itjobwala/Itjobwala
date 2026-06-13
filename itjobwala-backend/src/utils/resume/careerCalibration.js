/**
 * careerCalibration.js — Career Level Detection + Soft Score Ceiling
 *
 * P0 Fix 1: Career level is derived exclusively from experience years.
 * Text signals (title mentions, ownership phrases) previously promoted
 * candidates with 0–4 years to 'senior', bypassing score ceilings.
 * They now contribute only to career_level_confidence, not level itself.
 *
 * Levels and year thresholds:
 *   fresher   → 0   – <1 yr
 *   junior    → 1   – <3 yrs
 *   mid_level → 3   – <6 yrs
 *   senior    → 6   – <10 yrs
 *   lead      → 10+ yrs
 *
 * Soft ceilings (score calibration):
 *   fresher   → max ~70   (keyword-heavy fresher ≠ elite)
 *   junior    → max ~82   (1–2 yrs, limited real-world depth)
 *   mid_level → uncapped
 *   senior    → uncapped
 *   lead      → uncapped
 */

// Text signals — used ONLY for career_level_confidence, never for level promotion.
const LEAD_SIGNALS   = ['qa lead', 'test lead', 'head of qa', 'qa manager', 'lead qa',
  'qa architect', 'qa director', 'automation architect'];
const SENIOR_SIGNALS = [
  'senior qa', 'senior sdet', 'sr. qa', 'sr qa', 'principal qa',
  'staff qa', 'senior automation engineer', 'senior test engineer',
  'built automation framework', 'framework from scratch',
  'designed test architecture', 'established qa process',
];
const FRESH_SIGNALS  = ['intern', 'trainee', 'fresher', 'entry level', 'entry-level',
  'recent graduate', 'graduate trainee', 'fresher qa', 'junior intern'];

/**
 * Derive career level from experience years alone.
 * Single source of truth for year-based thresholds.
 */
export function deriveCareerLevel(years) {
  const y = Number(years) || 0;
  if (y >= 10) return 'lead';
  if (y >= 6)  return 'senior';
  if (y >= 3)  return 'mid_level';
  if (y >= 1)  return 'junior';
  return 'fresher';
}

/**
 * Detect career level from experience years only.
 *
 * P0 Fix 1: Text signals no longer promote career level.
 * Use detectCareerLevelWithConfidence() to also get career_level_confidence.
 *
 * @returns {'fresher' | 'junior' | 'mid_level' | 'senior' | 'lead'}
 */
export function detectCareerLevel({ experienceYears = 0 }) {
  // Purely year-based — text signals do not override years.
  return deriveCareerLevel(experienceYears);
}

/**
 * Detect career level AND compute a confidence rating in that level.
 *
 * Confidence reflects how well the resume evidence aligns with the
 * year-derived level. Text signals can raise or lower confidence but
 * cannot change the level itself.
 *
 * @returns {{ career_level: string, career_level_confidence: 'low'|'medium'|'high' }}
 */
export function detectCareerLevelWithConfidence({ experienceYears = 0, parsedText = '' }) {
  const career_level = deriveCareerLevel(experienceYears);
  const text         = (parsedText || '').toLowerCase();

  const hasLead   = LEAD_SIGNALS.some(s => text.includes(s));
  const hasSenior = SENIOR_SIGNALS.some(s => text.includes(s));
  const hasFresh  = FRESH_SIGNALS.some(s => text.includes(s));

  // Check whether text signals align with or contradict the year-based level.
  const signalAligns =
    (career_level === 'lead'    && hasLead)   ||
    (career_level === 'senior'  && hasSenior) ||
    (career_level === 'fresher' && hasFresh);

  // A junior/fresher claiming senior/lead via text is suspicious.
  const signalContradicts =
    (career_level === 'fresher'  && (hasLead || hasSenior)) ||
    (career_level === 'junior'   && hasLead)                ||
    (career_level === 'mid_level' && hasLead);

  let career_level_confidence;

  if (signalContradicts) {
    // Text says senior/lead but years say otherwise — low confidence.
    career_level_confidence = 'low';
  } else if (signalAligns && experienceYears >= 3) {
    // Years and text signals both point to the same level.
    career_level_confidence = 'high';
  } else if (experienceYears >= 6) {
    // Long tenure is self-evidencing.
    career_level_confidence = 'high';
  } else if (experienceYears >= 2) {
    career_level_confidence = 'medium';
  } else if (experienceYears >= 1) {
    // 1–2 years: reasonable confidence, slight uncertainty.
    career_level_confidence = hasFresh ? 'high' : 'medium';
  } else {
    // 0 years: low confidence unless clearly a fresher.
    career_level_confidence = hasFresh ? 'medium' : 'low';
  }

  return { career_level, career_level_confidence };
}

/**
 * Apply a soft ceiling to the raw QA score based on career level.
 * Scores below the ceiling pass through unchanged.
 * Scores above the ceiling have diminishing returns (×0.28 on overage).
 */
export function calibrateQaScoreByCareerLevel(rawScore, careerLevel) {
  const SOFT_CEILINGS = {
    fresher:   70,
    junior:    82,
    mid_level: 100,
    senior:    100,
    lead:      100,
  };

  const ceiling = SOFT_CEILINGS[careerLevel] ?? 100;
  if (rawScore <= ceiling) return rawScore;

  const overage = rawScore - ceiling;
  return Math.min(100, Math.round(ceiling + overage * 0.28));
}

export function getCareerLevelLabel(careerLevel) {
  const LABELS = {
    fresher:   'Fresher',
    junior:    'Junior',
    mid_level: 'Mid-Level',
    senior:    'Senior',
    lead:      'Lead',
  };
  return LABELS[careerLevel] ?? 'Professional';
}
