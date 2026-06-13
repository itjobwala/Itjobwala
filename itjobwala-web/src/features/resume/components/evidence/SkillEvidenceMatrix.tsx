'use client';

import { useState } from 'react';
import type { SkillEvidenceItem } from '../../types/resume.types';

interface Props {
  skillEvidence: SkillEvidenceItem[];
}

const LEVEL_CONFIG = {
  strong:   { color: '#6ee7b7', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  label: 'Strong'   },
  moderate: { color: '#93c5fd', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  label: 'Moderate' },
  basic:    { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  label: 'Basic'    },
  weak:     { color: '#f87171', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.2)',    label: 'Weak'     },
};

const PROOF_LABELS: Record<string, string> = {
  experience:        'Work Experience',
  project:           'Project',
  achievement:       'Quantified Outcome',
  certification:     'Certification',
  architecture:      'Architecture/Framework',
  skills_section_only: 'Listed Only',
};

const SIGNAL_ICONS: Record<string, { label: string; icon: string }> = {
  project_usage:         { label: 'Project',        icon: '◈' },
  quantified_impact:     { label: 'Quantified',     icon: '#' },
  framework_depth:       { label: 'Framework',      icon: '⊞' },
  ci_cd_usage:           { label: 'CI/CD',          icon: '⟳' },
  architecture_mentions: { label: 'Architecture',   icon: '⬡' },
};

export default function SkillEvidenceMatrix({ skillEvidence }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...skillEvidence].sort((a, b) => b.evidence_score - a.evidence_score);

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[12px] text-slate-500">No QA skills tracked yet. Re-analyze resume to see evidence matrix.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 px-4 pt-3 pb-2">
        Skill Evidence Matrix
      </p>

      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {sorted.map(item => {
          const cfg   = LEVEL_CONFIG[item.evidence_level] ?? LEVEL_CONFIG.weak;
          const isOpen = expanded === item.skill;
          const score  = item.evidence_score;

          return (
            <div key={item.skill}>
              <button
                className="w-full px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(isOpen ? null : item.skill)}
              >
                <div className="flex items-center gap-3">
                  {/* Skill name */}
                  <span className="text-[11.5px] font-semibold text-slate-300 flex-1 capitalize">
                    {item.skill}
                  </span>

                  {/* Evidence bar */}
                  <div className="w-14 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${score}%`, background: cfg.color }}
                    />
                  </div>

                  {/* Level chip */}
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>

                  <svg
                    className="transition-transform duration-200 shrink-0"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    width="9" height="9" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(148,163,184,0.4)" strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-3 pt-1 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {/* Proof sources */}
                  {item.proof_sources.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Proof Sources</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.proof_sources.map(src => (
                          <span
                            key={src}
                            className="text-[9.5px] font-semibold px-2 py-0.5 rounded-md"
                            style={{
                              background: src === 'skills_section_only' ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.1)',
                              color: src === 'skills_section_only' ? '#f87171' : '#a5b4fc',
                              border: `1px solid ${src === 'skills_section_only' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`,
                            }}
                          >
                            {PROOF_LABELS[src] ?? src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active signals */}
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(SIGNAL_ICONS).map(([key, cfg]) => {
                      const active = item.signals[key as keyof typeof item.signals];
                      return (
                        <span
                          key={key}
                          className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background: active ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                            color: active ? '#6ee7b7' : 'rgba(148,163,184,0.3)',
                          }}
                        >
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
