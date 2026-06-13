/**
 * Section-Only Attenuation Analysis — Fix #4 Justification
 *
 * Documents the evidence for choosing 0.75 / 0.85 over the old 0.60 / 0.75,
 * with concrete score examples across the full attenuation range.
 *
 * Run: node src/utils/resume/__tests__/attenuation_analysis.js
 */

// ── Attenuation multipliers ────────────────────────────────────────────────────

const OLD = {
  high:   0.60,   // ≥85% section-only
  medium: 0.75,   // ≥65% section-only
  none:   1.00,
};

const NEW = {
  high:   0.75,   // ≥85% section-only
  medium: 0.85,   // ≥65% section-only
  none:   1.00,
};

// Representative raw ATS scores seen in practice
const SAMPLE_SCORES = [20, 30, 40, 50, 60, 70, 80, 90, 100];

// Band thresholds
function getBand(score) {
  if (score >= 86) return 'Elite / Highly Competitive';
  if (score >= 71) return 'Advanced QA Engineer';
  if (score >= 51) return 'Strong QA Match';
  if (score >= 31) return 'Developing Automation QA';
  if (score >= 16) return 'Foundational QA';
  return 'Very Early Stage';
}

function apply(score, multiplier) {
  return Math.min(100, Math.max(0, Math.round(score * multiplier)));
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  Section-Only Attenuation Analysis — OLD vs NEW Multipliers  ');
console.log('══════════════════════════════════════════════════════════════\n');

// ── Tier 1: ≥85% section-only (most aggressive) ──────────────────────────────

console.log('── Tier 1: ≥85% section-only skills ────────────────────────────');
console.log('   Multiplier: OLD = 0.60  →  NEW = 0.75  (25pp softer)\n');
console.log('   Raw  │  OLD score │ OLD band                    │  NEW score │ NEW band');
console.log('   ─────┼────────────┼─────────────────────────────┼────────────┼──────────────────────────');
for (const raw of SAMPLE_SCORES) {
  const oldS   = apply(raw, OLD.high);
  const newS   = apply(raw, NEW.high);
  const oldB   = getBand(oldS).padEnd(28);
  const newB   = getBand(newS);
  const change = newS > oldS ? ` +${newS - oldS}` : newS < oldS ? ` ${newS - oldS}` : '   0';
  console.log(`   ${String(raw).padStart(3)}  │     ${String(oldS).padStart(3)}     │ ${oldB} │     ${String(newS).padStart(3)}     │ ${newB}${change}`);
}

// ── Tier 2: 65–84% section-only ───────────────────────────────────────────────

console.log('\n── Tier 2: 65–84% section-only skills ──────────────────────────');
console.log('   Multiplier: OLD = 0.75  →  NEW = 0.85  (10pp softer)\n');
console.log('   Raw  │  OLD score │ OLD band                    │  NEW score │ NEW band');
console.log('   ─────┼────────────┼─────────────────────────────┼────────────┼──────────────────────────');
for (const raw of SAMPLE_SCORES) {
  const oldS   = apply(raw, OLD.medium);
  const newS   = apply(raw, NEW.medium);
  const oldB   = getBand(oldS).padEnd(28);
  const newB   = getBand(newS);
  const change = newS > oldS ? ` +${newS - oldS}` : '   0';
  console.log(`   ${String(raw).padStart(3)}  │     ${String(oldS).padStart(3)}     │ ${oldB} │     ${String(newS).padStart(3)}     │ ${newB}${change}`);
}

// ── Key example: ATS 80 at 90% section-only ──────────────────────────────────

console.log('\n── Key Example: raw ATS = 80, section-only = 90% ───────────────\n');
const raw = 80;
console.log(`   Raw ATS score         : ${raw}`);
console.log(`   Old final score       : ${apply(raw, OLD.high)} pts (80 × 0.60) → band: ${getBand(apply(raw, OLD.high))}`);
console.log(`   New final score       : ${apply(raw, NEW.high)} pts (80 × 0.75) → band: ${getBand(apply(raw, NEW.high))}`);
console.log(`   Delta                 : +${apply(raw, NEW.high) - apply(raw, OLD.high)} pts`);
console.log('');
console.log('   Interpretation:');
console.log('   A candidate who scored 80 on ATS keywords (they HAVE the tools)');
console.log('   but listed them only in the Skills section dropped from 48 to 60.');
console.log('   Old: 48 → "Developing Automation QA" (incorrectly low for a skilled candidate)');
console.log('   New: 60 → "Strong QA Match" (accurate — they have the skills, need evidence)');

// ── Rationale ─────────────────────────────────────────────────────────────────

console.log('\n── Why 0.75 / 0.85 — Rationale ──────────────────────────────────\n');
console.log('1. DOUBLE-PENALTY PROBLEM (Fix #3 principle)');
console.log('   The recruiter_trust_score (credibility lane) is ALREADY reduced');
console.log('   by section-only skills via evidence_density penalty in recruiterTrustEngine.');
console.log('   The old multipliers (0.60/0.75) were penalizing the ATS score AGAIN');
console.log('   for the same issue, violating the capability/credibility separation.');
console.log('   New multipliers reduce ATS-lane over-penalization while trust-lane');
console.log('   still carries the full credibility signal.\n');

console.log('2. WHAT ABUSE CASES REMAIN PREVENTED');
console.log('   0.75 at ≥85% section-only: A raw 100 → 75. A raw 80 → 60.');
console.log('   Candidates who list ALL skills in a skills section with ZERO');
console.log('   project or experience evidence still take a meaningful 25% hit.');
console.log('   A score of 75 is 11 points below "Elite" — shortlist probability');
console.log('   is still materially reduced. The abuse case is NOT rewarded.\n');

console.log('3. CANDIDATE PROFILES THAT BENEFIT');
console.log('   - Resumes parsed from PDFs where the text extractor fails to');
console.log('     correctly identify section boundaries (common with 2-column formats)');
console.log('   - Genuinely skilled candidates whose parsers classify experience');
console.log('     bullets as "skills section" due to formatting');
console.log('   - Candidates on old resume templates with inline skill tables\n');

console.log('4. DATA-DRIVEN ALTERNATIVE (proposed for v2)');
console.log('   When DB volume reaches 1000+ resumes with recruiter outcomes:');
console.log('   - Correlate shortlist_outcome → section_only_ratio');
console.log('   - Fit a sigmoid: P(shortlist | ratio) → derive multiplier from that curve');
console.log('   - Example: if P(shortlist | ratio=0.85) = 0.72 vs P(shortlist | ratio=0) = 0.96,');
console.log('     the multiplier should be 0.72/0.96 = 0.75 (matches current choice)');
console.log('   Current choice of 0.75/0.85 is a conservative heuristic that aligns');
console.log('   with the expected outcome curve shape based on QA hiring market knowledge.\n');
