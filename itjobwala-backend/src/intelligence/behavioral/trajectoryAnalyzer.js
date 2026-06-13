/**
 * trajectoryAnalyzer.js — Phase 5 Fix 1
 * Evidence-gated trajectory inference. Modern tool mentions alone do NOT imply acceleration.
 * All signals require supporting implementation proof.
 */

const MODERN_TOOLS = [
  'playwright', 'cypress', 'k6', 'github actions', 'gitlab ci', 'docker',
  'kubernetes', 'grafana', 'pact', 'vitest', 'jest', 'detox', 'maestro',
  'testcontainers', 'contract testing',
];

const LEGACY_TOOLS = [
  'selenium', 'qtp', 'uft', 'silktest', 'testcomplete', 'jmeter',
  'loadrunner', 'hp alm', 'quality center', 'soapui',
];

// ── Gate checks ───────────────────────────────────────────────────────────────

function hasImplementationDepth(se) {
  // At least one skill with applied/production/architected depth
  return se.some(s =>
    s.depth_level === 'architected' ||
    s.depth_level === 'production'  ||
    s.depth_level === 'applied'
  );
}

function hasProjectOrExperience(se) {
  return se.some(s =>
    s.proof_sources.includes('experience') ||
    s.proof_sources.includes('project')
  );
}

// ── Signal classification (evidence-gated) ────────────────────────────────────

function classifySignal({ modernPresent, legacyPresent, deepRatio, recentRatio, staleSens,
  experienceCount, hasQuant, hasArch, hasDepth, hasProof, trust, evidenceStrength,
  wordCount, projectCount }) {

  // Hard gate: unproven — no content to evaluate
  const isShallow = wordCount < 150 && experienceCount === 0 && projectCount === 0;
  if (isShallow) return 'unproven';

  // Hard gate: exploratory — all skills-section only, no ownership
  if (!hasProof && modernPresent.length > 0) return 'exploratory';
  if (!hasProof) return 'unproven';

  // accelerating — all gates must pass
  const canAccelerate =
    (evidenceStrength === 'strong' || evidenceStrength === 'moderate') &&
    hasQuant &&
    recentRatio >= 0.4 &&
    hasDepth &&
    hasProof &&
    trust >= 55;

  if (canAccelerate && modernPresent.length >= 2) return 'accelerating';

  // emerging — modern tools + some implementation evidence but still developing
  const isEmerging =
    modernPresent.length >= 1 &&
    hasDepth &&
    hasProof &&
    !hasQuant &&
    (evidenceStrength === 'moderate' || evidenceStrength === 'basic');

  if (isEmerging) return 'emerging';

  // stable — consistent evidence, recent usage, project/experience present
  const isStable =
    hasProof &&
    (evidenceStrength === 'moderate' || evidenceStrength === 'strong') &&
    (recentRatio >= 0.3 || deepRatio >= 0.3) &&
    experienceCount >= 1;

  if (isStable) return 'stable';

  // exploratory — modern tools exist, shallow implementation
  if (modernPresent.length >= 1 && !hasDepth) return 'exploratory';

  // declining — only legacy, stale, low proof
  if (legacyPresent.length > 0 && modernPresent.length === 0 && staleSens.length >= 1) return 'declining';

  // default
  return 'exploratory';
}

// ── Confidence scoring ────────────────────────────────────────────────────────

function computeConfidence({ se, experienceCount, hasQuant, evidenceStrength, wordCount }) {
  let pts = 0;
  if (experienceCount >= 2) pts += 2;
  else if (experienceCount === 1) pts += 1;
  if (hasQuant) pts += 2;
  if (evidenceStrength === 'strong') pts += 2;
  else if (evidenceStrength === 'moderate') pts += 1;
  if (se.length >= 4) pts += 1;
  if (wordCount >= 300) pts += 1;

  const trajectory_confidence = pts >= 6 ? 'high' : pts >= 3 ? 'medium' : 'low';
  const trajectory_evidence_score = Math.min(100, Math.round(pts * 12));
  return { trajectory_confidence, trajectory_evidence_score };
}

// ── Evidence-accurate explanations ────────────────────────────────────────────

const EXPLANATIONS = {
  accelerating: 'Strong implementation evidence, measurable outcomes, and modern tooling — career trajectory is clearly upward.',
  stable:       'Consistent implementation evidence with recent usage — career is stable with room for higher-impact ownership.',
  emerging:     'Modern tools are present with some implementation depth, but measurable outcomes and ownership signals are still developing.',
  exploratory:  'Modern QA tools are present, but implementation depth and measurable ownership are insufficient to establish clear career progression.',
  declining:    'Toolstack is legacy-heavy with stale signals and limited modern adoption — career momentum appears to have slowed.',
  unproven:     'Insufficient resume content to establish a trajectory — no experience, projects, or implementation evidence detected.',
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {object} parsed         - parsedText, experienceEntries, extractedSkills
 * @param {object} evidenceResult - from analyzeEvidence()
 * @param {object} recencyResult  - from analyzeSkillRecency()
 * @returns {{ signal, trajectory_confidence, trajectory_evidence_score, explanation,
 *             strongest_growth_signal, biggest_stagnation_risk }}
 */
export function computeTrajectory(parsed, evidenceResult, recencyResult) {
  const text        = (parsed.parsedText || '').toLowerCase();
  const experiences = parsed.experienceEntries || [];
  const projects    = parsed.projectEntries    || [];
  const wordCount   = parsed.word_count ?? text.split(/\s+/).filter(Boolean).length;

  const se              = evidenceResult?.skill_evidence   || [];
  const evidenceStrength = evidenceResult?.evidence_profile?.evidence_strength ?? 'weak';
  const hasQuant        = evidenceResult?.evidence_profile?.has_quantified_impact ?? false;
  const hasArch         = evidenceResult?.evidence_profile?.has_architecture_depth ?? false;
  const trust           = evidenceResult?.evidence_profile?.recruiter_trust_score ?? 0;

  const recencyStats = recencyResult?.recency_stats ?? {};
  const staleSens    = recencyResult?.stale_high_sensitivity ?? [];

  const modernPresent = MODERN_TOOLS.filter(t => text.includes(t));
  const legacyPresent = LEGACY_TOOLS.filter(t => text.includes(t));

  const total    = se.length || 1;
  const deepCount = se.filter(s => ['strong', 'moderate'].includes(s.evidence_level)).length;
  const deepRatio = deepCount / total;

  const dated       = (recencyStats.recent_count ?? 0) + (recencyStats.aging_count ?? 0) + (recencyStats.stale_count ?? 0);
  const recentRatio = dated > 0 ? (recencyStats.recent_count ?? 0) / dated : 0;

  const hasDepth = hasImplementationDepth(se);
  const hasProof = hasProjectOrExperience(se);

  const signal = classifySignal({
    modernPresent, legacyPresent, deepRatio, recentRatio, staleSens,
    experienceCount: experiences.length,
    hasQuant, hasArch, hasDepth, hasProof,
    trust, evidenceStrength,
    wordCount,
    projectCount: projects.length,
  });

  const { trajectory_confidence, trajectory_evidence_score } = computeConfidence({
    se, experienceCount: experiences.length, hasQuant, evidenceStrength, wordCount,
  });

  // ── Strongest growth signal (only if actually evidenced) ──────────────────
  let strongest_growth_signal = null;
  if (hasQuant && hasDepth && modernPresent.length >= 1) {
    strongest_growth_signal = `Measurable outcomes + ${modernPresent[0]} implementation — strong progression signal.`;
  } else if (hasArch && hasProof) {
    strongest_growth_signal = 'Architecture depth with project/experience evidence — ownership is clear.';
  } else if (hasDepth && modernPresent.length >= 2) {
    strongest_growth_signal = `Applied-level evidence across ${modernPresent.slice(0, 2).join(' and ')}.`;
  } else if (deepRatio >= 0.5 && experiences.length >= 2) {
    strongest_growth_signal = 'Multiple roles with strong implementation evidence.';
  }

  // ── Biggest stagnation risk ────────────────────────────────────────────────
  let biggest_stagnation_risk = null;
  if (signal === 'unproven') {
    biggest_stagnation_risk = 'No projects, experience, or implementation evidence found — no trajectory can be established.';
  } else if (signal === 'exploratory' && !hasProof) {
    biggest_stagnation_risk = 'All skills listed in skills section only — no implementation context available.';
  } else if (staleSens.length >= 2) {
    biggest_stagnation_risk = `Stale high-sensitivity tools detected: ${staleSens.slice(0, 2).join(', ')}.`;
  } else if (legacyPresent.length > 0 && modernPresent.length === 0) {
    biggest_stagnation_risk = `Legacy-only toolstack (${legacyPresent.slice(0, 2).join(', ')}) with no modern replacements.`;
  } else if (!hasQuant && experiences.length > 0) {
    biggest_stagnation_risk = 'No quantified outcomes across any experience entry.';
  } else if (deepRatio < 0.25 && total >= 4) {
    biggest_stagnation_risk = 'Breadth without depth — most tracked skills have shallow evidence.';
  }

  return {
    signal,
    trajectory_confidence,
    trajectory_evidence_score,
    explanation: EXPLANATIONS[signal],
    strongest_growth_signal,
    biggest_stagnation_risk,
  };
}
