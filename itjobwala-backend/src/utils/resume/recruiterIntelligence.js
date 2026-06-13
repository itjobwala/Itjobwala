/**
 * recruiterIntelligence.js — Phase 3 + Phase 4
 *
 * Phase 3: calculateRecruiterConfidence()
 *   Answers "How trustworthy and hire-ready is this candidate?"
 *   Positive signals: ownership, impact, measurable outcomes, architecture
 *   Negative signals: shallow descriptions, stuffing, no measurable depth
 *   Output: 'low' | 'medium' | 'high'
 *
 * Phase 4: detectKeywordStuffing()
 *   Detects tool dumping, excessive skill density, shallow descriptions.
 *   Returns a penalty to subtract from qa_match_score.
 */

// ── Phase 4: Anti Keyword-Stuffing ───────────────────────────────────────────

/**
 * Detect keyword stuffing signals.
 * @returns {{ isStuffed, stuffingScore, scorePenalty }}
 */
export function detectKeywordStuffing({ extractedSkills = [], parsedText = '', experienceEntries = [] }) {
  const wordCount  = (parsedText || '').split(/\s+/).filter(Boolean).length;
  const skillCount = extractedSkills.length;

  let stuffingScore = 0;

  // Signal 1: Excessive skill-to-word density
  const density = wordCount > 0 ? skillCount / wordCount : 0;
  if (density > 0.09)      stuffingScore += 3;
  else if (density > 0.07) stuffingScore += 1;

  // Signal 2: Many skills with no or very few experience entries (fixed off-by-one)
  // Description-length penalties removed — responsibility belongs to keywordInflationDetector
  if (skillCount >= 25 && (experienceEntries || []).length === 0) stuffingScore += 4;
  else if (skillCount >= 20 && (experienceEntries || []).length <= 1) stuffingScore += 2;

  // Signal 3: Duplicate / near-duplicate skill entries
  const normalized = extractedSkills.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const uniqueCount = new Set(normalized).size;
  const duplicates  = normalized.length - uniqueCount;
  if (duplicates > 5)      stuffingScore += 3;
  else if (duplicates > 2) stuffingScore += 1;

  const isStuffed    = stuffingScore >= 5;
  const scorePenalty = isStuffed ? Math.min(15, stuffingScore * 2) : Math.min(5, stuffingScore);

  return { isStuffed, stuffingScore, scorePenalty };
}

// ── Phase 3: Recruiter Confidence Engine ─────────────────────────────────────

const POSITIVE_SIGNALS = [
  ['built automation framework',     5],
  ['developed automation framework', 5],
  ['framework from scratch',         5],
  ['designed test architecture',     5],
  ['automation architecture',        4],
  ['qa strategy',                    4],
  ['test strategy',                  3],
  ['led qa',                         4],
  ['qa ownership',                   3],
  ['owned qa',                       3],
  ['reduced regression',             4],
  ['regression effort by',           4],
  ['% reduction',                    4],
  ['release readiness',              3],
  ['reusable',                       2],
  ['parallel execution',             2],
  ['ci/cd',                          2],
  ['defects found',                  2],
  ['sprint',                         1],
  ['defect lifecycle',               2],
  ['automation ownership',           3],
  ['enterprise qa',                  3],
];

/**
 * Calculate how much a recruiter can trust and act on this resume.
 *
 * P1 Fix 6: Removed direct experience-year weighting.
 * Experience years already contribute to qa_match_score (via the qa_experience
 * dimension in scoreCalculator). Adding them again here causes double-counting.
 * Recruiter confidence now evaluates: ownership, impact, architecture,
 * description richness, ATS coverage, and certifications — not raw years.
 *
 * @returns {'very_low' | 'low' | 'medium' | 'high'}
 */
export function calculateRecruiterConfidence({
  parsedText        = '',
  experienceEntries = [],
  extractedSkills   = [],
  qa_match_score    = 0,
  isStuffed         = false,
  // experienceYears kept in signature for backward compat but no longer used for scoring
  experienceYears   = 0,  // eslint-disable-line no-unused-vars
}) {
  // Stuffed resumes are immediately low-confidence
  if (isStuffed) return 'low';

  // Ultra-shallow resume suppressor: word count < 150, no experience entries
  const wordCount = (parsedText || '').split(/\s+/).filter(Boolean).length;
  if (wordCount < 150 && (experienceEntries || []).length === 0) return 'very_low';

  const text = (parsedText + ' ' + (experienceEntries || []).map(e => e.description || '').join(' ')).toLowerCase();

  let score = 38; // neutral start

  // Positive: ownership, impact, architecture signals
  for (const [phrase, pts] of POSITIVE_SIGNALS) {
    if (text.includes(phrase)) score += pts;
  }

  // ATS score as a proxy for skill coverage quality
  if (qa_match_score >= 80)      score += 14;
  else if (qa_match_score >= 65) score += 8;
  else if (qa_match_score >= 50) score += 4;
  else if (qa_match_score < 30)  score -= 10;

  // Description richness (quality of descriptions, not years count)
  const descs = (experienceEntries || []).map(e => (e.description || '').trim()).filter(Boolean);
  if (descs.length > 0) {
    const avgLen = descs.reduce((a, d) => a + d.length, 0) / descs.length;
    if (avgLen > 280)      score += 10;
    else if (avgLen > 140) score += 5;
    else if (avgLen < 50)  score -= 12;
  }

  // Phase 1 audit fix: cert mention removed from recruiter confidence.
  // Certifications contribute to qa_match_score via the certifications dimension (max 5 pts).
  // Adding them here a second time conflated capability (ATS) with credibility (trust).
  // Certifications belong in ATS capability lane — they prove domain knowledge, not depth.

  score = Math.max(0, Math.min(100, score));

  if (score >= 66) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 18) return 'low';
  return 'very_low';
}
