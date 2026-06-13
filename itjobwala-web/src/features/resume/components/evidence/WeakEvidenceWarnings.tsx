'use client';

import type { SkillEvidenceItem } from '../../types/resume.types';

interface Props {
  skillEvidence:     SkillEvidenceItem[];
  weakEvidenceSkills: string[];
}

function buildWarnings(skillEvidence: SkillEvidenceItem[]): string[] {
  const warnings: string[] = [];

  for (const item of skillEvidence) {
    const s = item.skill;
    const cap = s.charAt(0).toUpperCase() + s.slice(1);

    if (item.proof_sources.includes('skills_section_only')) {
      warnings.push(`${cap} is listed in skills but has no usage evidence in experience or projects.`);
    } else if (item.evidence_level === 'weak' && !item.signals.project_usage && !item.signals.quantified_impact) {
      warnings.push(`${cap} detected but lacks implementation depth — no project context or measurable outcomes found.`);
    } else if (item.evidence_level === 'basic' && !item.signals.ci_cd_usage && ['jenkins', 'github actions', 'docker', 'gitlab ci'].includes(s)) {
      warnings.push(`${cap} mentioned but no pipeline integration evidence found — recruiters expect CI/CD context.`);
    } else if (item.evidence_level === 'basic' && item.signals.framework_depth === false && ['selenium', 'playwright', 'cypress'].includes(s)) {
      warnings.push(`${cap} present but no framework or architecture evidence — add depth about how you used it.`);
    }
  }

  return warnings.slice(0, 6);
}

export default function WeakEvidenceWarnings({ skillEvidence, weakEvidenceSkills }: Props) {
  const warnings = buildWarnings(skillEvidence.filter(s =>
    weakEvidenceSkills.includes(s.skill)
  ));

  if (warnings.length === 0 && weakEvidenceSkills.length === 0) {
    return (
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-2"
        style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        <span className="text-emerald-400 text-sm">✓</span>
        <p className="text-[11.5px] font-semibold text-emerald-300">
          No major evidence gaps detected. Skills appear well-supported.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-400">
          Evidence Gaps ({weakEvidenceSkills.length} skills)
        </p>
      </div>

      <div className="px-4 pb-3 space-y-2">
        {warnings.map((w, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">{w}</p>
          </div>
        ))}

        {weakEvidenceSkills.length > warnings.length && (
          <p className="text-[10px] text-slate-600 italic mt-1">
            + {weakEvidenceSkills.length - warnings.length} more skills with limited evidence.
          </p>
        )}
      </div>
    </div>
  );
}
