/**
 * resumeAuthenticityEngine.js — Phase 5 Fix 3
 * Authenticity score now integrates toolchain coherence (20–30% weight).
 * Incoherent stacks reduce authenticity sharply.
 */

import { computeToolchainCoherence } from './toolchainCoherenceEngine.js';

// Phrases that are hard to fabricate without real experience
const AUTHENTIC_PHRASES = [
  { pattern: /flaky\s+test/i,               points: 8,  signal: 'flaky test debugging context' },
  { pattern: /retry\s+logic/i,              points: 6,  signal: 'retry logic implementation' },
  { pattern: /parallel\s+execution/i,       points: 7,  signal: 'parallel test execution' },
  { pattern: /ci[\s/]*cd\s+troubleshoot/i,  points: 8,  signal: 'CI/CD troubleshooting experience' },
  { pattern: /production\s+incident/i,      points: 10, signal: 'production incident involvement' },
  { pattern: /framework\s+from\s+scratch/i, points: 12, signal: 'built framework from scratch' },
  { pattern: /test\s+stability/i,           points: 7,  signal: 'test stability focus' },
  { pattern: /allure\s+report/i,            points: 5,  signal: 'Allure report integration' },
  { pattern: /debug(?:ging|ged)/i,          points: 4,  signal: 'explicit debugging work' },
  { pattern: /performance\s+baseline/i,     points: 8,  signal: 'performance baseline setup' },
  { pattern: /trade[\s-]*off/i,             points: 6,  signal: 'tradeoff reasoning' },
  { pattern: /mentor(?:ed|ing)/i,           points: 7,  signal: 'mentoring others' },
  { pattern: /code\s+review/i,              points: 5,  signal: 'code review participation' },
  { pattern: /memory\s+leak/i,              points: 7,  signal: 'memory leak detection' },
  { pattern: /race\s+condition/i,           points: 8,  signal: 'race condition awareness' },
  { pattern: /cross[\s-]*browser/i,         points: 6,  signal: 'cross-browser testing depth' },
  { pattern: /page\s+object\s+model/i,      points: 6,  signal: 'POM design pattern usage' },
  { pattern: /data[\s-]*driven/i,           points: 5,  signal: 'data-driven test design' },
  { pattern: /reduced.*(?:test\s+time|execution\s+time|flak)/i, points: 9, signal: 'measurable test impact' },
  { pattern: /increased.*(?:coverage|test\s+coverage)/i,        points: 9, signal: 'coverage improvement evidence' },
];

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {object} parsed         - parsedText, extractedSkills, experienceEntries, word_count
 * @param {object} evidenceResult - from analyzeEvidence()
 * @returns {{ score, toolchain_coherence, strongest_authenticity_signal,
 *             biggest_authenticity_risk, explanation }}
 */
export function computeAuthenticityProfile(parsed, evidenceResult) {
  const text        = (parsed.parsedText || '').toLowerCase();
  const wordCount   = parsed.word_count ?? text.split(/\s+/).filter(Boolean).length;
  const skills      = parsed.extractedSkills || [];
  const experiences = parsed.experienceEntries || [];
  const inflRisk    = evidenceResult?.inflationResult?.risk ?? 'none';
  const sectionOnlyRatio = evidenceResult?.evidence_profile?.section_only_ratio ?? 0;
  const weakRatio   = (() => {
    const se = evidenceResult?.skill_evidence || [];
    if (!se.length) return 0;
    return se.filter(s => s.evidence_level === 'weak').length / se.length;
  })();

  // ── Authentic phrase signals (70% of base) ──────────────────────────────────
  let authenticScore = 0;
  let strongest_authenticity_signal = null;
  let topSignalPoints = 0;

  for (const { pattern, points, signal } of AUTHENTIC_PHRASES) {
    if (pattern.test(text)) {
      authenticScore += points;
      if (points > topSignalPoints) {
        topSignalPoints = points;
        strongest_authenticity_signal = signal;
      }
    }
  }

  // Phrase-based component (capped at 55 to prevent gaming)
  const phraseComponent = Math.min(55, authenticScore);

  // Base 40 → apply authentic phrases
  let score = 40 + phraseComponent;

  // ── Inauthenticity penalties (evidence-based) ──────────────────────────────
  const penalties = [];

  if (wordCount < 100) {
    score -= 25;
    penalties.push('extremely short resume (< 100 words)');
  } else if (wordCount < 200) {
    score -= 12;
    penalties.push('very short resume (< 200 words)');
  }

  if (skills.length > 30 && experiences.length === 0) {
    score -= 18;
    penalties.push('30+ skills with no experience entries');
  }

  if (sectionOnlyRatio >= 90) {
    score -= 14;
    penalties.push('all skills confined to skills section only');
  }

  if (inflRisk === 'high') {
    score -= 12;
    penalties.push('high keyword stuffing risk detected');
  } else if (inflRisk === 'moderate') {
    score -= 6;
    penalties.push('moderate keyword stuffing risk');
  }

  const hasQuantified = evidenceResult?.evidence_profile?.has_quantified_impact ?? false;
  if (!hasQuantified && experiences.length > 0) {
    score -= 7;
    penalties.push('no quantified outcomes despite experience entries');
  }

  if (weakRatio > 0.8) {
    score -= 10;
    penalties.push('80%+ of tracked skills have weak evidence');
  }

  // ── Toolchain coherence component (20–30% weight) ──────────────────────────
  const toolchain_coherence = computeToolchainCoherence(parsed, evidenceResult);
  const coherenceScore = toolchain_coherence.score;

  // Coherence contribution: -25 to +10 range
  if (coherenceScore < 25) {
    score -= 25;
    penalties.unshift('incoherent toolchain — implausible skill combination for resume depth');
  } else if (coherenceScore < 40) {
    score -= 15;
    penalties.push('low toolchain coherence — cross-domain tools without implementation evidence');
  } else if (coherenceScore < 55) {
    score -= 5;
  } else if (coherenceScore >= 75) {
    score += 8;
  } else if (coherenceScore >= 60) {
    score += 4;
  }

  score = Math.max(3, Math.min(100, Math.round(score)));

  const biggest_authenticity_risk = penalties.length > 0 ? penalties[0] : null;

  const explanation =
    score >= 75 ? 'Strong authentic signals — real implementation details with coherent specialization.' :
    score >= 55 ? 'Moderate authenticity — specific language present but coherence or depth needs strengthening.' :
    score >= 35 ? 'Low authenticity signals — resume reads more like a keyword list than a practitioner\'s profile.' :
    score >= 20 ? 'Very low authenticity — shallow evidence, incoherent stack, or implausible breadth detected.' :
                  'Critically low authenticity — resume content does not support the skills claimed.';

  return {
    score,
    toolchain_coherence,
    strongest_authenticity_signal,
    biggest_authenticity_risk,
    explanation,
  };
}
