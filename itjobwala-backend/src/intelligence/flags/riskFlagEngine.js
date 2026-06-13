/**
 * riskFlagEngine.js — Phase 5 Fix 4
 * Returns structured risk flags with severity, impact_score, explanation,
 * and recruiter_effect. Also computes overall_risk_score and overall_risk_level.
 */

const MODERN_TOOLS = new Set([
  'playwright', 'cypress', 'k6', 'github actions', 'gitlab ci', 'docker',
  'kubernetes', 'grafana', 'pact', 'vitest', 'jest',
]);

const LEGACY_TOOLS = new Set([
  'selenium', 'qtp', 'uft', 'silktest', 'testcomplete', 'jmeter',
  'loadrunner', 'hp alm', 'quality center',
]);

// ── Flag definitions ──────────────────────────────────────────────────────────

function buildFlag(flag, severity, impact_score, explanation, recruiter_effect) {
  return { flag, severity, impact_score, explanation, recruiter_effect };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {object} parsed           - full parsed resume
 * @param {object} evidenceResult   - from analyzeEvidence()
 * @param {object} authenticityData - { score, toolchain_coherence } from computeAuthenticityProfile()
 * @returns {{ risk_flags, overall_risk_score, overall_risk_level }}
 */
export function computeRiskFlags(parsed, evidenceResult, authenticityData = null) {
  const flags = [];

  const skills      = parsed.extractedSkills || [];
  const experiences = parsed.experienceEntries || [];
  const wordCount   = parsed.word_count ?? (parsed.parsedText || '').split(/\s+/).filter(Boolean).length;
  const text        = (parsed.parsedText || '').toLowerCase();

  const se          = evidenceResult?.skill_evidence   || [];
  const inflRisk    = evidenceResult?.inflationResult?.risk ?? 'none';
  const inflFlags   = evidenceResult?.inflationResult?.flags ?? [];
  const sectionOnly = evidenceResult?.evidence_profile?.section_only_ratio ?? 0;
  const hasQuant    = evidenceResult?.evidence_profile?.has_quantified_impact ?? false;
  const hasArch     = evidenceResult?.evidence_profile?.has_architecture_depth ?? false;
  const hasCICD     = evidenceResult?.evidence_profile?.has_cicd_integration ?? false;
  const trustScore  = evidenceResult?.evidence_profile?.recruiter_trust_score ?? 50;
  const evidStr     = evidenceResult?.evidence_profile?.evidence_strength ?? 'basic';

  const coherence       = authenticityData?.toolchain_coherence ?? null;
  const coherenceLevel  = coherence?.coherence_level ?? 'moderate';
  const authScore       = authenticityData?.score ?? 50;

  const hasModern = [...MODERN_TOOLS].some(t => text.includes(t));
  const hasLegacy = [...LEGACY_TOOLS].some(t => text.includes(t));

  // ── Flag: skills without project/experience proof ──────────────────────────
  // Exclude inherited skills — their proof is the child skills that earned it.
  const prooflessCount = se.filter(s =>
    !s.proof_sources.includes('experience') &&
    !s.proof_sources.includes('project') &&
    !s.proof_sources.includes('achievement') &&
    !s.proof_sources.includes('inherited')
  ).length;
  if (prooflessCount >= 4 || (skills.length > 0 && experiences.length === 0)) {
    flags.push(buildFlag(
      'skills_without_projects',
      experiences.length === 0 ? 'high' : 'medium',
      experiences.length === 0 ? 18 : 10,
      `${prooflessCount > 0 ? prooflessCount : skills.length} skills listed with no project or experience backing.`,
      'Recruiter cannot verify claimed skills — resume reads as aspirational rather than proven.',
    ));
  }

  // ── Flag: no quantified outcomes ──────────────────────────────────────────
  if (!hasQuant && experiences.length > 0) {
    flags.push(buildFlag(
      'no_quantified_impact',
      'high',
      15,
      'No measurable outcomes found across any experience entry.',
      'Recruiters shortlist candidates who show impact (e.g. "reduced test time by 40%") — absence is a gap.',
    ));
  }

  // ── Flag: missing experience dates ────────────────────────────────────────
  const entriesWithoutDates = experiences.filter(e => !e.duration || e.duration.trim() === '').length;
  if (entriesWithoutDates >= 2 || (experiences.length > 0 && entriesWithoutDates === experiences.length)) {
    flags.push(buildFlag(
      'missing_experience_dates',
      'medium',
      8,
      `${entriesWithoutDates} experience entr${entriesWithoutDates !== 1 ? 'ies' : 'y'} missing date ranges.`,
      'Missing dates raise timeline credibility concerns — ATS systems and recruiters flag undated roles.',
    ));
  }

  // ── Flag: very short resume ────────────────────────────────────────────────
  if (wordCount < 150) {
    flags.push(buildFlag(
      'very_short_resume',
      wordCount < 80 ? 'critical' : 'high',
      wordCount < 80 ? 22 : 16,
      `Resume contains only ${wordCount} words — far below the 400-word minimum for credible evaluation.`,
      'Recruiter cannot assess capability with so little content — likely to be filtered out automatically.',
    ));
  } else if (wordCount < 250) {
    flags.push(buildFlag(
      'very_short_resume',
      'medium',
      9,
      `Resume is thin at ${wordCount} words — consider expanding with role details and outcomes.`,
      'Short resumes often fail ATS word-count gates before reaching a human reviewer.',
    ));
  }

  // ── Flag: incoherent toolchain ────────────────────────────────────────────
  if (coherenceLevel === 'low') {
    const suspiciousStr = coherence?.suspicious_combinations?.slice(0, 2).join('; ') ?? '';
    flags.push(buildFlag(
      'incoherent_toolchain',
      authScore < 20 ? 'critical' : 'high',
      authScore < 20 ? 20 : 14,
      `Toolchain spans unrelated domains without depth evidence. ${suspiciousStr ? `Detected: ${suspiciousStr}.` : ''}`,
      'Incoherent stacks are a strong signal of aspirational skill listing — senior recruiters dismiss these quickly.',
    ));
  }

  // ── Flag: no architecture depth despite seniority ─────────────────────────
  const claimsSeniority = /senior|lead|principal|architect|staff/i.test(text);
  if (claimsSeniority && !hasArch) {
    flags.push(buildFlag(
      'no_architecture_depth',
      'high',
      13,
      'Resume claims senior/lead seniority but no framework design or architectural evidence found.',
      'Recruiters expect senior engineers to describe system decisions — absence contradicts the seniority claim.',
    ));
  }

  // ── Flag: no CI/CD context ────────────────────────────────────────────────
  if (!hasCICD && experiences.length >= 2) {
    flags.push(buildFlag(
      'no_ci_cd_context',
      'medium',
      7,
      'No CI/CD pipeline integration detected across multiple experience entries.',
      '90%+ of mid-to-senior QA roles now expect CI/CD exposure — gap may block shortlisting.',
    ));
  }

  // ── Flag: shallow resume (section-only) ───────────────────────────────────
  if (sectionOnly >= 85) {
    flags.push(buildFlag(
      'shallow_resume',
      'high',
      14,
      `${sectionOnly}% of tracked skills appear only in the skills section with no contextual use.`,
      'Recruiter cannot distinguish tool familiarity from tool proficiency — weakens trust significantly.',
    ));
  }

  // ── Flag: possible keyword stuffing ──────────────────────────────────────
  if (inflRisk === 'high' || inflFlags.includes('impossible_fresher_breadth')) {
    flags.push(buildFlag(
      'possible_keyword_stuffing',
      inflRisk === 'high' ? 'critical' : 'high',
      inflRisk === 'high' ? 20 : 13,
      'Keyword density and skill breadth patterns indicate possible resume stuffing for ATS gaming.',
      'Modern ATS systems and recruiters penalise obvious keyword padding — reduces shortlist probability sharply.',
    ));
  }

  // ── Flag: outdated stack ─────────────────────────────────────────────────
  if (hasLegacy && !hasModern) {
    flags.push(buildFlag(
      'outdated_stack',
      'medium',
      8,
      'Only legacy QA tools detected — no modern automation frameworks found.',
      'Roles increasingly require Playwright/Cypress/k6 — a legacy-only stack limits role eligibility.',
    ));
  }

  // ── Flag: unclear ownership ───────────────────────────────────────────────
  const ownershipVerbs = /\b(owned|led|designed|architected|built|created|developed)\b/i;
  const genericVerbs   = /\b(assisted|supported|helped|participated|involved|contributed)\b/i;
  const genericMatches = (text.match(genericVerbs) || []).length;
  const ownerMatches   = (text.match(ownershipVerbs) || []).length;
  if (genericMatches > ownerMatches + 2 && experiences.length > 0) {
    flags.push(buildFlag(
      'unclear_ownership',
      'low',
      5,
      'Bullet points use passive/supportive language — it\'s unclear what this candidate owned directly.',
      'Ownership-focused language signals leadership readiness — its absence reduces seniority impression.',
    ));
  }

  // ── Deduplicate by flag key ────────────────────────────────────────────────
  const seen = new Set();
  const deduped = flags.filter(f => {
    if (seen.has(f.flag)) return false;
    seen.add(f.flag);
    return true;
  });

  // ── Overall risk aggregation ──────────────────────────────────────────────
  const SEVERITY_WEIGHT = { critical: 25, high: 15, medium: 8, low: 3 };
  const rawRiskScore = deduped.reduce((sum, f) => sum + (SEVERITY_WEIGHT[f.severity] ?? 0), 0);

  // Additional systemic penalties
  let systemicBonus = 0;
  if (authScore < 20) systemicBonus += 20;
  if (evidStr === 'weak') systemicBonus += 10;
  if (sectionOnly > 70) systemicBonus += 8;
  if (!hasQuant && evidStr === 'weak') systemicBonus += 8;
  if (coherenceLevel === 'low' && authScore < 20) systemicBonus += 15;

  const overall_risk_score = Math.min(100, rawRiskScore + systemicBonus);

  const overall_risk_level =
    overall_risk_score >= 70 ? 'critical' :
    overall_risk_score >= 45 ? 'high'     :
    overall_risk_score >= 20 ? 'moderate' : 'low';

  return { risk_flags: deduped, overall_risk_score, overall_risk_level };
}
