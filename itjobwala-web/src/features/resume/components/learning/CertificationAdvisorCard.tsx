'use client';

import type { CertificationAdvice, CertItem } from '../../types/resume.types';

interface Props {
  data: CertificationAdvice;
}

function CertRow({
  cert,
  badge,
  badgeBg,
  badgeColor,
  badgeBorder,
}: {
  cert:         CertItem;
  badge:        string;
  badgeBg:      string;
  badgeColor:   string;
  badgeBorder:  string;
}) {
  return (
    <div
      className="rounded-2xl p-3.5 space-y-2"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-bold text-slate-100 leading-snug">{cert.name}</p>
        <span
          className="text-[9.5px] font-black px-2 py-0.5 rounded-full shrink-0"
          style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeColor }}
        >
          {badge}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span>{cert.cost}</span>
        <span className="text-slate-600">·</span>
        <span>{cert.timeline}</span>
      </div>
      <p className="text-[11.5px] text-slate-400 leading-relaxed">{cert.why}</p>
    </div>
  );
}

export default function CertificationAdvisorCard({ data }: Props) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-black text-amber-300">Certification Advisor</p>
          <p className="text-[10px] text-slate-500">Personalized cert path for your specialization</p>
        </div>
      </div>

      {/* Advice text */}
      <div
        className="mx-4 mb-3 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
      >
        <p className="text-[11.5px] text-amber-200 leading-relaxed">{data.advice}</p>
      </div>

      {/* Cert rows */}
      <div className="px-4 pb-4 space-y-2">
        <CertRow
          cert={data.recommended_first}
          badge="Start Here"
          badgeBg="rgba(16,185,129,0.12)"
          badgeBorder="rgba(16,185,129,0.25)"
          badgeColor="#6ee7b7"
        />
        <CertRow
          cert={data.recommended_next}
          badge="Up Next"
          badgeBg="rgba(99,102,241,0.12)"
          badgeBorder="rgba(99,102,241,0.25)"
          badgeColor="#a5b4fc"
        />
        {data.free_option.name !== data.recommended_first.name && (
          <CertRow
            cert={data.free_option}
            badge="Free Option"
            badgeBg="rgba(6,182,212,0.1)"
            badgeBorder="rgba(6,182,212,0.2)"
            badgeColor="#67e8f9"
          />
        )}
      </div>
    </div>
  );
}
