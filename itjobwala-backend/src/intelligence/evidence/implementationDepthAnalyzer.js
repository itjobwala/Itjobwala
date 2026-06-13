/**
 * implementationDepthAnalyzer.js
 * Determines HOW DEEPLY tools were used — not just whether they were listed.
 * Output: implementation_maturity level + SDET gate signals.
 */

import { SDET_GATE, ARCH_PATTERNS, CICD_PATTERNS } from './evidenceSignals.js';

export function analyzeImplementationDepth(parsed, skill_evidence) {
  const text    = (parsed.parsedText || '').toLowerCase();
  const expText = (parsed.experienceEntries || []).map(e => (e.description || '')).join(' ').toLowerCase();
  const combined = text + ' ' + expText;

  // Architecture ownership signals
  const archHits = ARCH_PATTERNS.filter(p => combined.includes(p)).length;

  // CI/CD integration signals
  const cicdHits = CICD_PATTERNS.filter(p => combined.includes(p)).length;

  // Coding evidence (actual code ownership)
  const codingHits = SDET_GATE.coding.filter(p => combined.includes(p)).length;

  // Enterprise-scale signals
  const enterpriseHits = SDET_GATE.enterprise.filter(p => combined.includes(p)).length;

  // Strong evidence skills (ones with architecture/project proof)
  const strongSkills   = skill_evidence.filter(s => s.evidence_level === 'strong').length;
  const moderateSkills = skill_evidence.filter(s => s.evidence_level === 'moderate').length;
  const totalTracked   = skill_evidence.length || 1;
  const evidenceRatio  = (strongSkills + moderateSkills * 0.5) / totalTracked;

  // CI/CD evidence in skill signals
  const hasCICDSkill    = skill_evidence.some(s => s.signals.ci_cd_usage);
  const hasArchSkill    = skill_evidence.some(s => s.signals.architecture_mentions);
  const hasQuantified   = skill_evidence.some(s => s.signals.quantified_impact);

  // SDET gate: all three required
  const sdet_architecture_gate = archHits >= 2 || hasArchSkill;
  const sdet_cicd_gate         = cicdHits >= 2 || hasCICDSkill;
  const sdet_coding_gate       = codingHits >= 2;

  // Maturity score (0-100)
  let maturityScore = 0;
  maturityScore += Math.min(archHits * 8,  30);
  maturityScore += Math.min(cicdHits * 5,  20);
  maturityScore += Math.min(codingHits * 4, 15);
  maturityScore += Math.min(enterpriseHits * 4, 12);
  maturityScore += Math.round(evidenceRatio * 20);
  if (hasQuantified) maturityScore += 8;

  maturityScore = Math.min(100, maturityScore);

  const maturity =
    maturityScore >= 75 ? 'expert'    :
    maturityScore >= 55 ? 'advanced'  :
    maturityScore >= 35 ? 'moderate'  :
    maturityScore >= 15 ? 'basic'     : 'minimal';

  return {
    maturity,
    maturity_score: maturityScore,
    arch_hits:       archHits,
    cicd_hits:       cicdHits,
    coding_hits:     codingHits,
    enterprise_hits: enterpriseHits,
    evidence_ratio:  Math.round(evidenceRatio * 100),
    sdet_gate: {
      architecture: sdet_architecture_gate,
      cicd:         sdet_cicd_gate,
      coding:       sdet_coding_gate,
      passes:       sdet_architecture_gate && sdet_cicd_gate,
    },
  };
}
