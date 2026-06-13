'use client';

import type { EvidenceProfile } from '../../types/resume.types';

interface Props {
  profile: EvidenceProfile;
}

const TRUST_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  strong:   { color: '#6ee7b7', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  label: 'Strong Evidence' },
  moderate: { color: '#93c5fd', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  label: 'Moderate Evidence' },
  basic:    { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  label: 'Basic Evidence' },
  weak:     { color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   label: 'Weak Evidence' },
};

const MATURITY_LABELS: Record<string, string> = {
  expert: 'Expert', advanced: 'Advanced', moderate: 'Moderate', basic: 'Basic', minimal: 'Minimal',
};

const RISK_CONFIG: Record<string, { color: string; label: string }> = {
  none:     { color: '#6ee7b7', label: 'None Detected' },
  low:      { color: '#93c5fd', label: 'Low Risk' },
  moderate: { color: '#fbbf24', label: 'Moderate Risk' },
  high:     { color: '#f87171', label: 'High Risk' },
};

function TrustRing({ score }: { score: number }) {
  const r = 32;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color = score >= 70 ? '#6ee7b7' : score >= 50 ? '#93c5fd' : score >= 35 ? '#fbbf24' : '#f87171';

  return (
    <svg width="84" height="84" viewBox="0 0 84 84">
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx="42" cy="42" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 42 42)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="42" y="39" textAnchor="middle" fill={color} fontSize="14" fontWeight="900">{score}</text>
      <text x="42" y="52" textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="7" fontWeight="700" letterSpacing="0.08em">TRUST</text>
    </svg>
  );
}

export default function EvidenceStrengthCard({ profile }: Props) {
  const trust = TRUST_CONFIG[profile.evidence_strength] ?? TRUST_CONFIG.basic;
  const risk  = RISK_CONFIG[profile.keyword_stuffing_risk] ?? RISK_CONFIG.low;

  const metrics = [
    { label: 'Implementation Maturity', value: MATURITY_LABELS[profile.implementation_maturity] ?? profile.implementation_maturity },
    { label: 'Experience Depth',        value: profile.experience_depth ?? profile.implementation_maturity },
    { label: 'Evidence Density',        value: `${profile.evidence_density ?? 0}%` },
    { label: 'Proven Skills',           value: `${profile.proven_skills_count ?? 0} skills` },
  ];

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-3">
        Recruiter Trust Profile
      </p>

      <div className="flex gap-4 items-start">
        <TrustRing score={profile.recruiter_trust_score} />

        <div className="flex-1 space-y-2">
          {/* Evidence strength chip */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: trust.bg, border: `1px solid ${trust.border}`, color: trust.color }}
          >
            <span>{trust.label}</span>
          </div>

          {/* Keyword inflation risk */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">Keyword Inflation:</span>
            <span className="text-[10px] font-bold" style={{ color: risk.color }}>{risk.label}</span>
          </div>

          {/* Score delta */}
          {profile.calibration_delta !== 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Evidence Adjustment:</span>
              <span
                className="text-[10px] font-black"
                style={{ color: profile.calibration_delta > 0 ? '#6ee7b7' : '#f87171' }}
              >
                {profile.calibration_delta > 0 ? '+' : ''}{profile.calibration_delta} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {metrics.map(m => (
          <div
            key={m.label}
            className="rounded-xl p-2.5"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">{m.label}</p>
            <p className="text-[12px] font-black text-slate-200">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Boolean signals */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {[
          { label: 'Quantified Impact', ok: profile.has_quantified_impact },
          { label: 'Architecture Depth', ok: profile.has_architecture_depth },
          { label: 'CI/CD Integration', ok: profile.has_cicd_integration },
        ].map(s => (
          <div
            key={s.label}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-semibold"
            style={{
              background: s.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)',
              border: `1px solid ${s.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
              color: s.ok ? '#6ee7b7' : '#f87171',
            }}
          >
            <span>{s.ok ? '✓' : '✗'}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
