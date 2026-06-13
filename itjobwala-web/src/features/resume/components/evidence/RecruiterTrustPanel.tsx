'use client';

import type { EvidenceProfile } from '../../types/resume.types';

interface Props {
  profile: EvidenceProfile;
}

const TRUST_BANDS = [
  { min: 75, label: 'High Recruiter Trust',     color: '#6ee7b7', desc: 'Implementation evidence is strong and believable. Recruiters can trust this profile.' },
  { min: 55, label: 'Moderate Recruiter Trust', color: '#93c5fd', desc: 'Evidence is present but some skills lack depth. Strengthen descriptions to build trust.' },
  { min: 35, label: 'Low Recruiter Trust',      color: '#fbbf24', desc: 'Several skills listed without supporting evidence. Recruiters may question experience depth.' },
  { min:  0, label: 'Very Low Recruiter Trust', color: '#f87171', desc: 'Most skills appear keyword-listed without implementation proof. Profile needs significant strengthening.' },
];

export default function RecruiterTrustPanel({ profile }: Props) {
  const trust  = profile.recruiter_trust_score;
  const band   = TRUST_BANDS.find(b => trust >= b.min) ?? TRUST_BANDS[TRUST_BANDS.length - 1];

  // Fake recruiter "thinking" based on trust score
  const recruiterPerspective =
    trust >= 75 ? "This resume shows real implementation work. I can validate the candidate's experience. Worth a phone screen." :
    trust >= 55 ? 'Skills look relevant but descriptions are thin. Hard to tell how hands-on the candidate actually is.' :
    trust >= 35 ? 'Too many tools listed without context. Might be a fresher who copied a template. Need more evidence before shortlisting.' :
    'Significant mismatch between listed tools and demonstrated experience. Cannot confidently shortlist.';

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Recruiter Perspective</p>
        <span className="text-[10px] font-bold" style={{ color: band.color }}>Trust Score: {trust}</span>
      </div>

      {/* Trust band indicator */}
      <div
        className="rounded-xl px-3 py-2.5"
        style={{ background: `${band.color}0d`, border: `1px solid ${band.color}25` }}
      >
        <p className="text-[11px] font-bold mb-0.5" style={{ color: band.color }}>{band.label}</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">{band.desc}</p>
      </div>

      {/* Simulated recruiter quote */}
      <div
        className="rounded-xl px-3 py-2.5"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">
          Senior QA Recruiter Would Think:
        </p>
        <p className="text-[11px] text-slate-300 leading-relaxed italic">
          &ldquo;{recruiterPerspective}&rdquo;
        </p>
      </div>

      {/* Trust score bar */}
      <div>
        <div className="flex justify-between text-[9px] text-slate-600 mb-1">
          <span>0 — No Trust</span>
          <span>100 — Full Trust</span>
        </div>
        <div className="relative h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${trust}%`, background: `linear-gradient(90deg, #f87171, #fbbf24, #6ee7b7)` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white/20"
            style={{ left: `calc(${trust}% - 6px)`, background: band.color }}
          />
        </div>
      </div>
    </div>
  );
}
