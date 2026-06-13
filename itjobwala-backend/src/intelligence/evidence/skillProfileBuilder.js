/**
 * skillProfileBuilder.js — Shared skill profile assembler.
 *
 * Merges per-skill evidence and recency into a single unified profile so that
 * downstream engines (trust, risk, recency, insights) can consume consistent
 * data instead of re-deriving it independently.
 *
 * This is a read-only assembler — it does not modify evidence or recency data.
 * API contracts of all callers remain unchanged.
 */

import { EVIDENCE_FAMILIES } from './evidenceSignals.js';

// Reverse lookup: skill → family key
const SKILL_TO_FAMILY = {};
for (const [family, children] of Object.entries(EVIDENCE_FAMILIES)) {
  SKILL_TO_FAMILY[family] = family.replace(/\s+/g, '_');
  for (const child of children) {
    if (!SKILL_TO_FAMILY[child]) SKILL_TO_FAMILY[child] = family.replace(/\s+/g, '_');
  }
}

/**
 * Returns the list of child skills that contributed strong/moderate evidence
 * to an inherited parent skill.
 */
function resolveInheritedChildren(skill, skill_evidence) {
  const children = EVIDENCE_FAMILIES[skill];
  if (!children || !children.length) return [];
  const bySkill = new Map(skill_evidence.map(e => [e.skill, e]));
  return children.filter(c => {
    const ev = bySkill.get(c);
    return ev && (ev.evidence_level === 'strong' || ev.evidence_level === 'moderate');
  });
}

/**
 * Build a unified skill profile for a single skill.
 *
 * @param {string}   skill         - canonical skill name (lowercase)
 * @param {object[]} skill_evidence - from extractSkillEvidence()
 * @param {object}   skill_recency  - from analyzeSkillRecency() (optional)
 * @returns {object|null}
 *
 * Shape:
 * {
 *   skill:    string,
 *   family:   string,          // underscore_key matching qa_score_breakdown dims
 *   evidence: { level, score },
 *   recency:  { classification },
 *   source:   { direct, inherited, children }
 * }
 */
export function buildSkillProfile(skill, skill_evidence, skill_recency = {}) {
  const ev = skill_evidence.find(e => e.skill === skill);
  if (!ev) return null;

  const rec        = skill_recency[skill];
  const isInherited = ev.proof_sources.includes('inherited');
  const isDirect    = !isInherited && ev.evidence_level !== 'weak';

  return {
    skill,
    family:   SKILL_TO_FAMILY[skill] ?? skill.replace(/\s+/g, '_'),
    evidence: {
      level: ev.evidence_level,
      score: ev.evidence_score,
    },
    recency: {
      classification: rec?.classification ?? 'unknown',
    },
    source: {
      direct:    isDirect,
      inherited: isInherited,
      children:  isInherited ? resolveInheritedChildren(skill, skill_evidence) : [],
    },
  };
}

/**
 * Build profiles for all skills in skill_evidence.
 */
export function buildSkillProfiles(skill_evidence, skill_recency = {}) {
  return skill_evidence
    .map(ev => buildSkillProfile(ev.skill, skill_evidence, skill_recency))
    .filter(Boolean);
}
