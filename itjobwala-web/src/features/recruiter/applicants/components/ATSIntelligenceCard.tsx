'use client';

import type { ApplicantATSIntelligence, ATSPrioritySkill } from '@/features/recruiter/types';

interface Props {
  data: ApplicantATSIntelligence;
}

const SPEC_LABEL: Record<string, string> = {
  sdet:           'SDET',
  automation_qa:  'Automation QA',
  api_qa:         'API QA',
  mobile_qa:      'Mobile QA',
  performance_qa: 'Performance QA',
  hybrid_qa:      'Hybrid QA',
  manual_qa:      'Manual QA',
};

const BAND_HEX: Record<string, string> = {
  emerald: '#10b981',
  green:   '#22c55e',
  blue:    '#6366f1',
  amber:   '#f59e0b',
  orange:  '#f97316',
  red:     '#ef4444',
};

const SCORE_DIM_LABELS: Record<string, string> = {
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

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r    = 28;
  const cx   = 36;
  const cy   = 36;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize="13" fontWeight="800">{score}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="7.5" fontWeight="600">ATS</text>
    </svg>
  );
}

function ProbabilityBar({ probability, label }: { probability: number; label: string | null }) {
  const color = probability >= 70 ? '#22c55e' : probability >= 50 ? '#f59e0b' : '#ef4444';
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
      {label && <p className="text-[10px] mt-1" style={{ color }}>{label}</p>}
    </div>
  );
}

function ReadinessChip({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  const lower = value.toLowerCase();
  const color =
    lower.includes('ready') || lower.includes('high') || lower.includes('strong') || lower.includes('mature') ? '#10b981'
    : lower.includes('partial') || lower.includes('moderate') || lower.includes('medium') ? '#f59e0b'
    : '#ef4444';
  return (
    <div
      className="rounded-xl px-2.5 py-2 flex flex-col gap-0.5"
      style={{ background: `${color}0d`, border: `1px solid ${color}22` }}
    >
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.6)' }}>
        {label}
      </span>
      <span className="text-[10px] font-semibold leading-tight" style={{ color }}>{value}</span>
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

  // Non-QA gate
  if (data.eligible === false) {
    return (
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}
      >
        <span
          className="text-[10px] font-black px-2 py-0.5 rounded-lg inline-block"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}
        >
          Non-QA Resume
        </span>
        <p className="text-[12px] text-slate-300">
          This candidate&apos;s resume does not match a QA Engineering profile.
        </p>
        {data.domain_label && (
          <p className="text-[11px] text-slate-500">
            Detected domain:{' '}
            <span className="text-slate-300 font-semibold">{data.domain_label}</span>
          </p>
        )}
        <p className="text-[10.5px] text-slate-600 italic">
          No ATS score or skill intelligence available for non-QA resumes.
        </p>
      </div>
    );
  }

  const ringColor = BAND_HEX[data.band_color ?? ''] ?? '#94a3b8';
  const specLabel = SPEC_LABEL[data.qa_specialization ?? ''] ?? (data.qa_specialization ?? '—');
  const confColor =
    data.recruiter_confidence === 'High'     ? '#22c55e' :
    data.recruiter_confidence === 'Moderate' ? '#f59e0b' :
    data.recruiter_confidence === 'Low'      ? '#ef4444' : '#94a3b8';

  const skillProven = (data.skill_evidence ?? [])
    .filter(e => e.evidence_level === 'strong' || e.evidence_level === 'very_strong');
  const skillUnverified = (data.skill_evidence ?? [])
    .filter(e => e.evidence_level === 'weak' && e.evidence_score === 0);

  type TaggedGap = ATSPrioritySkill & { _level: 'HIGH' | 'MED' };
  const growthGaps: TaggedGap[] = [
    ...(data.improvement_priorities?.high_priority   ?? []).map(g => ({ ...g, _level: 'HIGH' as const })),
    ...(data.improvement_priorities?.medium_priority ?? []).map(g => ({ ...g, _level: 'MED'  as const })),
  ].slice(0, 5);

  return (
    <div className="space-y-4">

      {/* Score ring + header */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))',
          border: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        {data.qa_match_score != null && <ScoreRing score={data.qa_match_score} color={ringColor} />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {data.band_label && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                style={{ background: `${ringColor}18`, color: ringColor }}
              >
                {data.band_label}
              </span>
            )}
            {data.recruiter_confidence && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: `${confColor}18`, color: confColor }}
              >
                {data.recruiter_confidence} Confidence
              </span>
            )}
          </div>

          <p className="text-[13px] font-bold text-slate-200 truncate">
            {specLabel}
            {data.qa_seniority && (
              <span className="text-slate-500 font-normal"> · {data.qa_seniority}</span>
            )}
          </p>

          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {data.career_level && (
              <span className="text-[10px] text-slate-500 capitalize">{data.career_level}</span>
            )}
            {data.experience_years != null && (
              <span className="text-[10px] text-slate-500">{data.experience_years}y exp</span>
            )}
            {!!data.certification_count && (
              <span className="text-[10px] text-slate-500">
                {data.certification_count} cert{data.certification_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {data.qa_hiring_label && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0"
            style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8' }}
          >
            {data.qa_hiring_label}
          </span>
        )}
      </div>

      {/* Recruiter readiness */}
      {(data.shortlist_probability != null || data.automation_maturity || data.enterprise_readiness || data.market_readiness) && (
        <div
          className="rounded-2xl px-4 py-3 space-y-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recruiter Readiness</p>

          {data.shortlist_probability != null && (
            <ProbabilityBar probability={data.shortlist_probability} label={data.recruiter_visibility ?? null} />
          )}

          {(data.automation_maturity || data.enterprise_readiness || data.market_readiness) && (
            <div className="grid grid-cols-3 gap-2">
              <ReadinessChip label="Automation" value={data.automation_maturity} />
              <ReadinessChip label="Enterprise" value={data.enterprise_readiness} />
              <ReadinessChip label="Market"     value={data.market_readiness} />
            </div>
          )}
        </div>
      )}

      {/* Score breakdown */}
      {data.qa_score_breakdown && (() => {
        const dims = Object.entries(data.qa_score_breakdown)
          .filter(([key, val]) => key !== 'resume_quality' && key !== 'penalties' && val.max > 0)
          .sort(([, a], [, b]) => (b.score / b.max) - (a.score / a.max));
        if (dims.length === 0) return null;
        return (
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Score Breakdown</p>
            <div className="space-y-2">
              {dims.map(([key, val]) => {
                const pct   = Math.round((val.score / val.max) * 100);
                const color = pct >= 75 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400">{SCORE_DIM_LABELS[key] ?? key}</span>
                      <span className="text-[10px] font-bold" style={{ color }}>{val.score}/{val.max}</span>
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Skill Evidence</p>

          {data.weak_evidence_skills && data.weak_evidence_skills.length > 0 && (
            <div
              className="mb-2 px-3 py-2 rounded-xl text-[10.5px]"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#fcd34d' }}
            >
              ⚠ Listed without proof: {data.weak_evidence_skills.join(', ')}
            </div>
          )}

          {skillProven.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skillProven.slice(0, 8).map(e => (
                <span
                  key={e.skill}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-lg capitalize"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}
                  title={e.proof_sources?.join(', ')}
                >
                  ✓ {e.skill}
                </span>
              ))}
            </div>
          )}

          {skillUnverified.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skillUnverified.slice(0, 4).map(e => (
                <span
                  key={e.skill}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-lg capitalize"
                  style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#fcd34d' }}
                >
                  ? {e.skill}
                </span>
              ))}
            </div>
          )}

          <p className="text-[9px] text-slate-600 mt-2">✓ proven in experience · ? listed only, unverified</p>
        </div>
      )}

      {/* Skill gaps */}
      {data.missing_skills && data.missing_skills.length > 0 && (
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

      {/* Growth gaps */}
      {growthGaps.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Growth Gaps</p>
          <div className="space-y-2">
            {growthGaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="shrink-0 text-[8.5px] font-black px-1.5 py-0.5 rounded mt-0.5"
                  style={{
                    background: gap._level === 'HIGH' ? 'rgba(239,68,68,0.12)'   : 'rgba(245,158,11,0.1)',
                    color:      gap._level === 'HIGH' ? '#fca5a5'                 : '#fcd34d',
                  }}
                >
                  {gap._level}
                </span>
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 capitalize">{gap.skill}</span>
                  {gap.recruiter_impact && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{gap.recruiter_impact}</p>
                  )}
                </div>
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
                color:      data.overall_risk_level === 'low' ? '#6ee7b7'               : '#fca5a5',
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

    </div>
  );
}
