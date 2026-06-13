'use client';

import type { EvidenceProfile } from '../../types/resume.types';

interface Props {
  profile: EvidenceProfile;
}

const DEPTH_CONFIG: Record<string, { color: string; label: string; desc: string }> = {
  deep:     { color: '#6ee7b7', label: 'Deep',     desc: 'Strong ownership, quantified impact, and consistent QA roles.' },
  solid:    { color: '#93c5fd', label: 'Solid',    desc: 'Good experience depth with some measurable outcomes.' },
  moderate: { color: '#a5b4fc', label: 'Moderate', desc: 'Experience present but descriptions lack depth or metrics.' },
  shallow:  { color: '#fbbf24', label: 'Shallow',  desc: 'Limited context in experience descriptions — add more detail.' },
  minimal:  { color: '#f87171', label: 'Minimal',  desc: 'Very little experience depth detected. Strengthen descriptions.' },
};

function GaugeBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-[10px] text-slate-500">{label}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ExperienceDepthCard({ profile }: Props) {
  const depth = DEPTH_CONFIG[profile.experience_depth ?? 'minimal'] ?? DEPTH_CONFIG.minimal;

  const dimensions = [
    { label: 'Evidence Density',    value: profile.evidence_density ?? 0,    max: 100, color: '#6ee7b7' },
    { label: 'Proven Skills',       value: profile.proven_skills_count ?? 0,  max: Math.max(profile.proven_skills_count ?? 0, profile.weak_evidence_count ?? 0, 1) + 2, color: '#93c5fd' },
    { label: 'Weak Evidence Count', value: profile.weak_evidence_count ?? 0,  max: Math.max(profile.proven_skills_count ?? 0, profile.weak_evidence_count ?? 0, 1) + 2, color: '#f87171' },
  ];

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Experience Depth</p>
        <span
          className="text-[9.5px] font-black px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: depth.color }}
        >
          {depth.label}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">{depth.desc}</p>

      <div className="space-y-2.5">
        {dimensions.map(d => (
          <GaugeBar key={d.label} value={d.value} max={d.max} color={d.color} label={d.label} />
        ))}
      </div>

      {/* Actionable signals */}
      <div className="space-y-1.5 pt-1">
        {profile.has_quantified_impact && (
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-[10px]">✓</span>
            <span className="text-[11px] text-emerald-300">Quantified outcomes found — recruiter-grade evidence</span>
          </div>
        )}
        {profile.has_architecture_depth && (
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-[10px]">✓</span>
            <span className="text-[11px] text-emerald-300">Architecture/framework ownership detected</span>
          </div>
        )}
        {profile.has_cicd_integration && (
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-[10px]">✓</span>
            <span className="text-[11px] text-emerald-300">CI/CD integration evidence present</span>
          </div>
        )}
        {!profile.has_quantified_impact && (
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-[10px]">→</span>
            <span className="text-[11px] text-amber-200">Add measurable outcomes (%, reduced by, improved by) to descriptions</span>
          </div>
        )}
        {!profile.has_architecture_depth && (
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-[10px]">→</span>
            <span className="text-[11px] text-amber-200">Mention how you built or designed frameworks — not just which tools you used</span>
          </div>
        )}
      </div>
    </div>
  );
}
