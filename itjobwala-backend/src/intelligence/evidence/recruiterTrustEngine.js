/**
 * recruiterTrustEngine.js
 * Computes a holistic recruiter trust score and evidence summary.
 * This is the "senior QA hiring manager" perspective of the resume.
 */

// ── Trust explainability ───────────────────────────────────────────────────────

function buildTrustBreakdown(skill_evidence, experienceDepth, inflationResult, scores) {
  const positive = [];
  const negative = [];

  if (scores.hasQuantifiedSkill) {
    positive.push({ signal: 'Quantified outcomes', impact: 'high', note: 'Measurable results are rare and strongly trusted.' });
  }
  if (scores.hasArchitectureSkill) {
    positive.push({ signal: 'Architecture depth', impact: 'high', note: 'Framework design signals senior-level ownership.' });
  }
  if (scores.hasCICDSkill) {
    positive.push({ signal: 'CI/CD integration', impact: 'medium', note: 'Pipeline ownership is expected for modern QA roles.' });
  }
  if (scores.hasProjectUsage) {
    positive.push({ signal: 'Project usage context', impact: 'medium', note: 'Skills tied to projects show applied practice.' });
  }
  if (scores.provenRatio >= 0.5) {
    positive.push({ signal: 'High proven skill ratio', impact: 'medium', note: `${Math.round(scores.provenRatio * 100)}% of skills have strong or moderate evidence.` });
  }
  if (scores.strongCount >= 2) {
    positive.push({ signal: 'Multiple strongly evidenced skills', impact: 'high', note: `${scores.strongCount} skills with strong proof across multiple contexts.` });
  }

  if (inflationResult.flags.includes('skills_without_experience')) {
    negative.push({ signal: 'Skills without experience', impact: 'high', note: 'Listed skills with no job history to support them.' });
  }
  if (inflationResult.flags.includes('impossible_fresher_breadth')) {
    negative.push({ signal: 'Implausible skill breadth', impact: 'high', note: 'Too many tools for stated experience level.' });
  }
  if (inflationResult.flags.includes('architecture_claim_without_depth')) {
    negative.push({ signal: 'Architecture claims without depth', impact: 'high', note: 'Architecture keywords without implementation evidence.' });
  }
  if (scores.weakRatio > 0.6) {
    negative.push({ signal: 'Mostly weak evidence', impact: 'medium', note: `${Math.round(scores.weakRatio * 100)}% of skills show only superficial evidence.` });
  }
  if (!scores.hasQuantifiedSkill && (experienceDepth.score ?? 0) < 40) {
    negative.push({ signal: 'No quantified outcomes', impact: 'medium', note: 'No measurable impact across any experience entry.' });
  }

  // Context-aware fastest trust gain
  let fastest_trust_gain;
  if (!scores.hasQuantifiedSkill) {
    fastest_trust_gain = 'Add a quantified result to at least one experience entry (e.g. "reduced test time by 40%").';
  } else if (!scores.hasArchitectureSkill) {
    fastest_trust_gain = 'Mention a framework design decision or testing architecture you owned.';
  } else if (!scores.hasCICDSkill) {
    fastest_trust_gain = 'Reference a CI/CD pipeline you integrated or maintained.';
  } else if (scores.weakRatio > 0.4) {
    fastest_trust_gain = 'Move more skills from the skills list into experience bullets with context.';
  } else {
    fastest_trust_gain = 'Add a project section showing end-to-end implementation.';
  }

  return { positive, negative, fastest_trust_gain };
}

export function computeRecruiterTrust(skill_evidence, experienceDepth, inflationResult) {
  const total = skill_evidence.length || 1;

  const strongCount   = skill_evidence.filter(s => s.evidence_level === 'strong').length;
  const moderateCount = skill_evidence.filter(s => s.evidence_level === 'moderate').length;
  const basicCount    = skill_evidence.filter(s => s.evidence_level === 'basic').length;
  const weakCount     = skill_evidence.filter(s => s.evidence_level === 'weak').length;

  const provenCount   = strongCount + moderateCount;
  const provenRatio   = provenCount / total;
  const weakRatio     = weakCount   / total;

  const hasQuantifiedSkill   = skill_evidence.some(s => s.signals.quantified_impact);
  const hasArchitectureSkill = skill_evidence.some(s => s.signals.architecture_mentions);
  const hasCICDSkill         = skill_evidence.some(s => s.signals.ci_cd_usage);
  const hasProjectUsage      = skill_evidence.some(s => s.signals.project_usage);
  const scores = { strongCount, provenRatio, weakRatio, hasQuantifiedSkill, hasArchitectureSkill, hasCICDSkill, hasProjectUsage };

  // Base = 40 (neutral position)
  let score = 40;

  // Evidence density bonus (up to +25)
  score += Math.round(provenRatio * 25);

  // Experience depth bonus (up to +20)
  score += Math.round((experienceDepth.score / 100) * 20);

  // Quality signals (up to +18)
  if (hasQuantifiedSkill)   score += 6;
  if (hasArchitectureSkill) score += 7;
  if (hasCICDSkill)         score += 5;
  if (hasProjectUsage)      score += 4;

  // Inflation penalties (up to -25)
  const INFL_PENALTIES = { high: -20, moderate: -12, low: -5, none: 0 };
  score += INFL_PENALTIES[inflationResult.risk] ?? 0;

  // Weak evidence penalty — softened for graduated skepticism, not binary collapse
  score -= Math.round(weakRatio * 8);

  // Skills-without-experience flag
  if (inflationResult.flags.includes('skills_without_experience')) score -= 12;
  if (inflationResult.flags.includes('impossible_fresher_breadth')) score -= 8;
  if (inflationResult.flags.includes('architecture_claim_without_depth')) score -= 6;

  score = Math.max(18, Math.min(95, Math.round(score)));

  const evidence_strength =
    score >= 75 ? 'strong'   :
    score >= 55 ? 'moderate' :
    score >= 35 ? 'basic'    : 'weak';

  // Weak evidence skill names for UI warnings
  const weak_evidence_skills = skill_evidence
    .filter(s => s.evidence_level === 'weak' || s.evidence_level === 'basic')
    .map(s => s.skill);

  // Proven skills
  const proven_skills = skill_evidence
    .filter(s => s.evidence_level === 'strong' || s.evidence_level === 'moderate')
    .map(s => s.skill);

  const trust_breakdown = buildTrustBreakdown(skill_evidence, experienceDepth, inflationResult, scores);

  return {
    recruiter_trust_score: score,
    evidence_strength,
    weak_evidence_skills,
    proven_skills,
    proven_skills_count:     provenCount,
    weak_evidence_count:     weakCount,
    evidence_density:        Math.round(provenRatio * 100),
    has_quantified_impact:   hasQuantifiedSkill,
    has_architecture_depth:  hasArchitectureSkill,
    has_cicd_integration:    hasCICDSkill,
    trust_breakdown,
  };
}
