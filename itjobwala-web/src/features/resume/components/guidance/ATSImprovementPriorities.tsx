'use client';

import { ImprovementPriorities, PrioritySkill } from '../../types/resume.types';

interface Props {
  data: ImprovementPriorities;
}

// High/medium use intentional semantic red/amber colors; low uses neutral tokens
const BUCKET_CONFIG = [
  { key: 'high_priority'   as const, label: 'High Priority',   dot: 'bg-red-500',     text: 'text-red-700',          bg: 'bg-red-50'      },
  { key: 'medium_priority' as const, label: 'Medium Priority', dot: 'bg-amber-500',   text: 'text-amber-700',        bg: 'bg-amber-50'    },
  { key: 'low_priority'    as const, label: 'Good to Have',    dot: 'bg-surface-mid', text: 'text-body-secondary',   bg: 'bg-surface-alt' },
];

function SkillPill({ skill, cfg }: { skill: PrioritySkill; cfg: typeof BUCKET_CONFIG[0] }) {
  return (
    <div className={`rounded-xl p-3 ${cfg.bg} space-y-1`}>
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`text-sm font-semibold ${cfg.text}`}>{skill.skill}</span>
      </div>
      <p className="text-xs text-muted pl-3.5 leading-relaxed">{skill.reason}</p>
    </div>
  );
}

export default function ATSImprovementPriorities({ data }: Props) {
  const hasAny = BUCKET_CONFIG.some(b => data[b.key]?.length > 0);
  if (!hasAny) return null;

  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-5">
      <h3 className="font-semibold text-heading">Skill Gap Priority</h3>
      {BUCKET_CONFIG.map(cfg => {
        const skills = data[cfg.key] ?? [];
        if (skills.length === 0) return null;
        return (
          <div key={cfg.key} className="space-y-2">
            <p className={`text-xs font-medium uppercase tracking-wide ${cfg.text}`}>{cfg.label}</p>
            <div className="space-y-2">
              {skills.map(s => <SkillPill key={s.skill} skill={s} cfg={cfg} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
