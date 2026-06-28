'use client';

import type { ApplicantATSIntelligence } from '@/features/recruiter/types';

interface Props {
  data: ApplicantATSIntelligence;
}

const CONF_COLOR: Record<string, string> = {
  High:     '#22c55e',
  Moderate: '#f59e0b',
  Low:      '#ef4444',
};

const SPEC_LABEL: Record<string, string> = {
  sdet:           'SDET',
  automation_qa:  'Automation QA',
  api_qa:         'API QA',
  mobile_qa:      'Mobile QA',
  performance_qa: 'Performance QA',
  hybrid_qa:      'Hybrid QA',
  manual_qa:      'Manual QA',
};

function ScoreRing({ score }: { score: number }) {
  const r  = 28;
  const cx = 36;
  const cy = 36;
  const circumference = 2 * Math.PI * r;
  const dashoffset    = circumference * (1 - score / 100);

  const color =
    score >= 80 ? '#22c55e' :
    score >= 65 ? '#f59e0b' :
    score >= 50 ? '#f97316' :
    '#ef4444';

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize="13" fontWeight="800">{score}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="7.5" fontWeight="600">ATS</text>
    </svg>
  );
}

function ProbabilityBar({ probability, label }: { probability: number; label: string | null }) {
  const color =
    probability >= 70 ? '#22c55e' :
    probability >= 50 ? '#f59e0b' :
    '#ef4444';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-slate-400">Shortlist Probability</span>
        <span className="text-[11px] font-black" style={{ color }}>{probability}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${probability}%`, background: color }}
        />
      </div>
      {label && (
        <p className="text-[10px] mt-1" style={{ color }}>{label}</p>
      )}
    </div>
  );
}

export default function ATSIntelligenceCard({ data }: Props) {
  if (!data.has_data) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-[12px] text-slate-500">No resume analysis available yet for this candidate.</p>
      </div>
    );
  }

  const confColor = CONF_COLOR[data.recruiter_confidence ?? ''] ?? '#94a3b8';
  const specLabel = SPEC_LABEL[data.qa_specialization ?? ''] ?? (data.qa_specialization ?? '—');

  return (
    <div className="space-y-4">

      {/* Score + headline row */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))',
          border: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        {data.qa_match_score != null && <ScoreRing score={data.qa_match_score} />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-lg"
              style={{ background: `${confColor}18`, color: confColor }}
            >
              {data.recruiter_confidence ?? '—'} Confidence
            </span>
            {data.qa_hiring_label && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8' }}>
                {data.qa_hiring_label}
              </span>
            )}
          </div>
          <p className="text-[13px] font-bold text-slate-200 truncate">
            {specLabel}
            {data.qa_seniority && (
              <span className="text-slate-500 font-normal"> · {data.qa_seniority}</span>
            )}
          </p>
          {data.specialization_confidence != null && (
            <p className="text-[10px] text-slate-500 mt-0.5">
              {data.specialization_confidence}% specialization confidence
            </p>
          )}
        </div>
      </div>

      {/* Shortlist probability */}
      {data.shortlist_probability != null && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ProbabilityBar probability={data.shortlist_probability!} label={data.recruiter_visibility ?? null} />
          {data.market_readiness && (
            <p className="text-[10px] text-slate-500 mt-2">
              Market readiness: <span className="text-slate-300 font-semibold">{data.market_readiness}</span>
            </p>
          )}
        </div>
      )}

      {/* Recruiter tip */}
      {data.recruiter_tip && (
        <div
          className="rounded-2xl px-4 py-3 flex gap-2.5"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
        >
          <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[11px] text-amber-200 leading-relaxed">{data.recruiter_tip}</p>
        </div>
      )}

      {/* Best fit roles */}
      {data.best_fit_roles.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Best Fit Roles</p>
          <div className="flex flex-wrap gap-1.5">
            {data.best_fit_roles.map(role => (
              <span
                key={role}
                className="text-[10.5px] font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Concerns */}
      {data.concerns.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Concerns</p>
          <ul className="space-y-1">
            {data.concerns.map((c, i) => (
              <li key={i} className="text-[11px] text-red-300 flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0 text-red-500">·</span> {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Score breakdown bars */}
      {data.qa_score_breakdown && (() => {
        const LABELS: Record<string, string> = {
          automation_testing:      'Automation',
          api_testing:             'API Testing',
          framework_expertise:     'Framework',
          qa_experience:           'QA Experience',
          certifications:          'Certifications',
          bug_tracking:            'Bug Tracking',
          ci_cd_readiness:         'CI/CD',
          performance_testing:     'Performance',
          test_design_methodology: 'Test Design',
        };
        const dims = Object.entries(data.qa_score_breakdown)
          .filter(([key, val]) => key !== 'resume_quality' && key !== 'penalties' && val.max > 0)
          .sort(([, a], [, b]) => (b.score / b.max) - (a.score / a.max));

        if (dims.length === 0) return null;
        return (
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
              Score Breakdown
            </p>
            <div className="space-y-2">
              {dims.map(([key, val]) => {
                const pct   = Math.round((val.score / val.max) * 100);
                const color = pct >= 75 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400">{LABELS[key] ?? key}</span>
                      <span className="text-[10px] font-bold" style={{ color }}>
                        {val.score}/{val.max}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color, transition: 'width 0.4s ease' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Skill evidence */}
      {data.skill_evidence && data.skill_evidence.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Skill Evidence
          </p>

          {data.weak_evidence_skills && data.weak_evidence_skills.length > 0 && (
            <div
              className="mb-2 px-3 py-2 rounded-xl text-[10.5px]"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#fcd34d' }}
            >
              ⚠ Listed without proof: {data.weak_evidence_skills.join(', ')}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-2">
            {data.skill_evidence
              .filter(e => e.evidence_level === 'strong' || e.evidence_level === 'very_strong')
              .slice(0, 8)
              .map(e => (
                <span
                  key={e.skill}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-lg capitalize"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}
                  title={`Proof: ${e.proof_sources?.join(', ')}`}
                >
                  ✓ {e.skill}
                </span>
              ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {data.skill_evidence
              .filter(e => e.evidence_level === 'weak' && e.evidence_score === 0)
              .slice(0, 4)
              .map(e => (
                <span
                  key={e.skill}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-lg capitalize"
                  style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#fcd34d' }}
                >
                  ? {e.skill}
                </span>
              ))}
          </div>

          <p className="text-[9px] text-slate-600 mt-2">
            ✓ proven in experience descriptions · ? listed only, unverified
          </p>
        </div>
      )}

      {/* Risk flags */}
      {data.risk_flags && data.risk_flags.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Risk Flags</p>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: data.overall_risk_level === 'low' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color:      data.overall_risk_level === 'low' ? '#6ee7b7'              : '#fca5a5',
              }}
            >
              {data.overall_risk_level} risk · {data.overall_risk_score}/100
            </span>
          </div>
          <div className="space-y-2">
            {data.risk_flags.map(flag => (
              <div key={flag.flag}>
                <p className="text-[11px] font-semibold text-red-300 capitalize">
                  {flag.flag === 'no_ci_cd_context' ? 'No CI/CD integration'
                 : flag.flag === 'outdated_stack'   ? 'Legacy-only toolstack'
                 : flag.flag.replace(/_/g, ' ')}
                </p>
                <p className="text-[10px] text-red-400 opacity-70 mt-0.5">{flag.recruiter_effect}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust signals */}
      {data.trust_signals && data.trust_signals.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Why Trust This Profile
            {data.recruiter_trust_score != null && (
              <span className="ml-2 text-emerald-400 normal-case">· {data.recruiter_trust_score}% trust</span>
            )}
          </p>
          <div className="space-y-1.5">
            {data.trust_signals.slice(0, 4).map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: s.impact === 'high' ? '#10b981' : '#f59e0b', marginTop: '5px' }}
                />
                <div>
                  <span className="text-[11px] font-semibold text-slate-300">{s.signal}</span>
                  <span className="text-[10px] text-slate-500"> — {s.note}</span>
                </div>
              </div>
            ))}
          </div>
          {data.fastest_trust_gain && (
            <div
              className="mt-2.5 px-3 py-2 rounded-xl flex items-start gap-2"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}
            >
              <span className="text-amber-400 shrink-0 text-[11px]" style={{ marginTop: '1px' }}>💡</span>
              <p className="text-[10px] text-amber-300">{data.fastest_trust_gain}</p>
            </div>
          )}
        </div>
      )}

      {/* Strengths */}
      {data.strengths.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Strengths</p>
          <ul className="space-y-1">
            {data.strengths.slice(0, 4).map((s, i) => (
              <li key={i} className="text-[11px] text-emerald-200 flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0 text-emerald-400">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing skills */}
      {data.missing_skills.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Skill Gaps</p>
          <div className="flex flex-wrap gap-1.5">
            {data.missing_skills.slice(0, 8).map(skill => (
              <span
                key={skill}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5' }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
