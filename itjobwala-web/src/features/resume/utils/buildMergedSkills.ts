import type { SkillMetadata, SkillEvidenceItem } from '../types/resume.types';

export interface MergedSkill {
  skill:          string;
  occurrences:    number;
  sources:        string[];
  evidence_level: string;
  evidence_score: number | null;
  proof_sources:  string[];
}

export function buildMergedSkills(
  skill_metadata: SkillMetadata[],
  skill_evidence: SkillEvidenceItem[],
): MergedSkill[] {
  const evidenceMap: Record<string, SkillEvidenceItem> = {};
  (skill_evidence ?? []).forEach(e => {
    evidenceMap[e.skill.toLowerCase()] = e;
  });

  return (skill_metadata ?? []).map(m => {
    const ev = evidenceMap[m.skill.toLowerCase()];
    return {
      skill:          m.skill,
      occurrences:    m.occurrences,
      sources:        m.sources,
      // skill_evidence is authoritative for evidence_level
      evidence_level: ev?.evidence_level ?? m.evidence_level,
      evidence_score: ev?.evidence_score ?? null,
      proof_sources:  ev?.proof_sources  ?? [],
    };
  });
}
