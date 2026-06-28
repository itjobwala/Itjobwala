'use client';

import { useState }                                        from 'react';
import type { RiskFlag, RiskSeverity, OverallRiskLevel }  from '../types/resume.types';

interface Props {
  riskFlags:        RiskFlag[]        | null;
  overallRiskScore: number            | null;
  overallRiskLevel: OverallRiskLevel  | null;
}

const FLAG_LABELS: Record<string, string> = {
  keyword_stuffing:          'Keyword Stuffing',
  no_quantified_impact:      'No Quantified Impact',
  low_evidence_density:      'Low Evidence Density',
  experience_inflation:      'Experience Inflation',
  generic_descriptions:      'Generic Descriptions',
  missing_automation_tools:  'Missing Automation Tools',
  weak_toolchain_coherence:  'Weak Toolchain Coherence',
  stale_skills:              'Stale Skills Detected',
  no_cicd_mention:           'No CI/CD Mention',
  no_project_context:        'No Project Context',
};

const SEV_BADGE: Record<RiskSeverity, { bg: string; color: string; label: string }> = {
  low:      { bg: '#26292b', color: '#9aa0a6', label: 'Low'      },
  medium:   { bg: '#33290f', color: '#d8ad63', label: 'Medium'   },
  high:     { bg: '#361c1b', color: '#d18a84', label: 'High'     },
  critical: { bg: '#5a2e2b', color: '#e9b3ae', label: 'Critical' },
};

const LEVEL_CFG: Record<OverallRiskLevel, { label: string; color: string; bg: string; bd: string }> = {
  low:      { label: 'Overall Risk: Low',      color: '#7fcca0', bg: '#18301f', bd: '#2c5238' },
  moderate: { label: 'Overall Risk: Moderate', color: '#d8ad63', bg: '#33290f', bd: '#574517' },
  high:     { label: 'Overall Risk: High',     color: '#d18a84', bg: '#361c1b', bd: '#5a2e2b' },
  critical: { label: 'Overall Risk: Critical', color: '#e9b3ae', bg: '#5a2e2b', bd: '#8a3030' },
};

function InfoBtn({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: 15, height: 15, borderRadius: '50%',
          border: '1px solid #34393b', color: '#6c7378', background: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
        }}
        aria-label="More info"
      >
        i
      </button>
      {open && (
        <span style={{
          position: 'absolute', left: 20, bottom: 0, zIndex: 20,
          width: 200, background: '#202324', border: '1px solid #2a2e30',
          borderRadius: 12, padding: '10px 14px',
          fontSize: 10.5, color: '#9aa0a6', lineHeight: 1.5,
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

export default function RiskFlagsCard({ riskFlags, overallRiskScore, overallRiskLevel }: Props) {
  const flags = riskFlags ?? [];
  if (flags.length === 0) return null;

  const lvl = overallRiskLevel ? LEVEL_CFG[overallRiskLevel] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#6c7378' }}>
        Risk Flags
      </p>

      {flags.map((flag, i) => {
        const sev   = SEV_BADGE[flag.severity];
        const label = FLAG_LABELS[flag.flag] ?? flag.flag.replace(/_/g, ' ');
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            background: '#361c1b', border: '1px solid #5a2e2b',
            borderRadius: 14, padding: '16px 18px',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d18a84" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3v.5"/>
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#e9b3ae' }}>{label}</span>
                <InfoBtn text={flag.explanation} />
              </div>
              {flag.recruiter_effect && (
                <p style={{ fontSize: 13.5, color: '#c39c98', marginTop: 5, lineHeight: 1.5 }}>
                  {flag.recruiter_effect}
                </p>
              )}
            </div>
            <span style={{
              background: sev.bg, color: sev.color,
              borderRadius: 999, padding: '5px 12px',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {sev.label}
            </span>
          </div>
        );
      })}

      {lvl && overallRiskScore !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: lvl.bg, border: `1px solid ${lvl.bd}`,
            borderRadius: 999, padding: '7px 14px',
            fontSize: 12.5, fontWeight: 700, color: lvl.color,
          }}>
            {lvl.label}
          </span>
          <span style={{ fontSize: 13.5, color: '#9aa0a6' }}>
            <span style={{ color: '#f3f4f5', fontWeight: 700 }}>{overallRiskScore}/100</span> — overall profile risk
          </span>
        </div>
      )}
    </div>
  );
}
