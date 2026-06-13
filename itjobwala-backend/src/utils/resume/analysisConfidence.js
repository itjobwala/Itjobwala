/**
 * analysisConfidence.js — P2 Fix 10
 *
 * Computes how reliable the ATS analysis conclusions are for a given resume.
 * Low confidence means the system had limited signal — recruiter should treat
 * scores as indicative only. High confidence means rich evidence was available.
 *
 * Inputs:
 *   - Resume completeness (word count, section presence)
 *   - Experience quality  (description length, date coverage)
 *   - Evidence density    (from evidenceResult.evidence_profile)
 *   - Timeline quality    (% experience entries with date ranges)
 *
 * Output: 'low' | 'medium' | 'high'
 */

/**
 * @param {{ parsed: object, evidenceResult: object }} params
 * @returns {'low' | 'medium' | 'high'}
 */
export function computeAnalysisConfidence({ parsed, evidenceResult }) {
  const parsedText   = parsed.parsedText         || '';
  const expEntries   = parsed.experienceEntries  || [];
  const evidence     = evidenceResult?.evidence_profile ?? {};

  const wordCount     = parsed.word_count ?? parsedText.split(/\s+/).filter(Boolean).length;
  const evidenceDensity = evidence.evidence_density ?? 0;

  let score = 50; // neutral baseline

  // ── Resume completeness ────────────────────────────────────────────────────
  if (wordCount >= 500)       score += 15;
  else if (wordCount >= 300)  score += 8;
  else if (wordCount >= 150)  score += 2;
  else                        score -= 20;  // too thin to analyse reliably

  // ── Experience quality ─────────────────────────────────────────────────────
  if (expEntries.length >= 3) score += 8;
  else if (expEntries.length >= 2) score += 4;
  else if (expEntries.length === 0) score -= 12;

  const avgDescLen = expEntries.length > 0
    ? expEntries.reduce((s, e) => s + (e.description || '').length, 0) / expEntries.length
    : 0;
  if (avgDescLen >= 250)     score += 10;
  else if (avgDescLen >= 120) score += 5;
  else if (avgDescLen < 50 && expEntries.length > 0) score -= 8;

  // ── Evidence density (skill proof quality) ─────────────────────────────────
  if (evidenceDensity >= 70)      score += 15;
  else if (evidenceDensity >= 40) score += 7;
  else if (evidenceDensity < 15)  score -= 10;

  // ── Timeline quality (% experience entries with date ranges) ──────────────
  if (expEntries.length > 0) {
    const withDates   = expEntries.filter(e => e.duration && e.duration.trim()).length;
    const dateRatio   = withDates / expEntries.length;
    if (dateRatio >= 0.9)      score += 8;
    else if (dateRatio >= 0.5) score += 3;
    else                       score -= 8;  // undated roles → can't verify timeline
  }

  score = Math.max(0, Math.min(100, score));

  if (score >= 70) return 'high';
  if (score >= 42) return 'medium';
  return 'low';
}
