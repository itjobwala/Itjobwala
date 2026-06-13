'use client';

import type {
  FirstImpression, AuthenticityProfile, TrajectoryProfile,
  TrustBreakdown, RecommendationMode, RiskFlag, OverallRiskLevel,
  ToolchainCoherence,
} from '../../types/resume.types';

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
      {text}
    </p>
  );
}

// ── Decision badge config ─────────────────────────────────────────────────────

const DECISION_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  'Strong Shortlist':            { color: '#10b981', bg: 'rgba(16,185,129,0.10)',  icon: '✓' },
  'Shortlist with Verification': { color: '#6366f1', bg: 'rgba(99,102,241,0.10)', icon: '⊕' },
  'Junior Pool':                 { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: '↓' },
  'Needs More Content':          { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', icon: '…' },
  'Pass':                        { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   icon: '✕' },
};

// ── Severity config ───────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; ring: string }> = {
  critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.12)',  ring: 'rgba(220,38,38,0.35)' },
  high:     { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  ring: 'rgba(239,68,68,0.28)' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', ring: 'rgba(245,158,11,0.28)' },
  low:      { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', ring: 'rgba(148,163,184,0.2)' },
};

// ── Overall risk banner config ─────────────────────────────────────────────────

const RISK_BANNER: Record<OverallRiskLevel, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.3)', label: 'Critical Risk' },
  high:     { color: '#ef4444', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.25)', label: 'High Risk' },
  moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.25)', label: 'Moderate Risk' },
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.25)', label: 'Low Risk' },
};

// ── Trajectory config ─────────────────────────────────────────────────────────

const TRAJ_CONFIG: Record<string, { color: string; icon: string; bg: string }> = {
  accelerating: { color: '#10b981', icon: '↑', bg: 'rgba(16,185,129,0.08)'  },
  stable:       { color: '#6366f1', icon: '→', bg: 'rgba(99,102,241,0.08)'  },
  emerging:     { color: '#06b6d4', icon: '↗', bg: 'rgba(6,182,212,0.08)'   },
  exploratory:  { color: '#f59e0b', icon: '~', bg: 'rgba(245,158,11,0.08)'  },
  declining:    { color: '#ef4444', icon: '↓', bg: 'rgba(239,68,68,0.08)'   },
  unproven:     { color: '#94a3b8', icon: '?', bg: 'rgba(148,163,184,0.08)' },
};

const CONFIDENCE_DOT: Record<string, string> = {
  high:   '#10b981',
  medium: '#f59e0b',
  low:    '#ef4444',
};

const MODE_CONFIG: Record<RecommendationMode, { label: string; color: string; note: string }> = {
  credibility_building:    { label: 'Credibility Building',    color: '#f59e0b', note: 'Focus: add proof — project links, quantified outcomes, implementation context.' },
  capability_building:     { label: 'Capability Building',     color: '#6366f1', note: 'Focus: expand technical skills — automation, API testing, CI/CD coverage.' },
  specialization_building: { label: 'Specialization Building', color: '#10b981', note: 'Focus: deepen your QA niche — advance your specialization stack.' },
};

// ── Warning banner ────────────────────────────────────────────────────────────

function CredibilityWarningBanner() {
  return (
    <div
      className="rounded-2xl p-4 space-y-1.5"
      style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.3)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-red-500 text-base">⚠</span>
        <p className="text-[12px] font-bold text-red-400 uppercase tracking-wider">Credibility Warning</p>
      </div>
      <p className="text-[11.5px] text-red-300 leading-relaxed">
        Resume credibility is currently too weak for recruiter trust. Add projects, implementation evidence,
        measurable outcomes, and coherent specialization depth.
      </p>
    </div>
  );
}

// ── Overall risk banner ────────────────────────────────────────────────────────

function OverallRiskBanner({ level, score }: { level: OverallRiskLevel; score: number }) {
  const cfg = RISK_BANNER[level];
  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div>
        <SectionLabel text="Overall Risk Assessment" />
        <p className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
      </div>
      <span
        className="text-2xl font-black shrink-0"
        style={{ color: cfg.color }}
      >
        {score}
      </span>
    </div>
  );
}

// ── First impression card ──────────────────────────────────────────────────────

function FirstImpressionCard({ data }: { data: FirstImpression }) {
  const cfg = DECISION_CONFIG[data.likely_interview_decision] ?? DECISION_CONFIG['Pass'];
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <SectionLabel text="Human Recruiter Simulation" />
          <p className="text-sm font-bold text-slate-800">First Impression</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
          {cfg.icon} {data.likely_interview_decision}
        </span>
      </div>
      <p className="text-[12.5px] text-slate-600 leading-relaxed italic">"{data.recruiter_reaction}"</p>
      {data.biggest_positive_signal && (
        <div className="flex items-start gap-2">
          <span className="text-emerald-500 text-sm mt-0.5">✓</span>
          <p className="text-[11.5px] text-emerald-700 font-medium leading-snug">{data.biggest_positive_signal}</p>
        </div>
      )}
      {data.biggest_red_flag && (
        <div className="flex items-start gap-2">
          <span className="text-red-500 text-sm mt-0.5">✕</span>
          <p className="text-[11.5px] text-red-600 font-medium leading-snug">{data.biggest_red_flag}</p>
        </div>
      )}
    </div>
  );
}

// ── Risk flags card (Phase 5: severity-aware) ─────────────────────────────────

function RiskFlagsCard({ flags, overallLevel, overallScore }: {
  flags: RiskFlag[];
  overallLevel: OverallRiskLevel | null;
  overallScore: number | null;
}) {
  if (!flags.length) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <SectionLabel text="ATS Risk Flags" />
        <p className="text-sm font-semibold text-emerald-700">No risk flags detected</p>
        <p className="text-[11.5px] text-emerald-600 mt-1">Your resume passed all recruiter risk checks.</p>
      </div>
    );
  }

  const sorted = [...flags].sort((a, b) => b.impact_score - a.impact_score);

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel text="ATS Risk Flags" />
        {overallLevel && overallScore != null && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: RISK_BANNER[overallLevel].bg,
              color: RISK_BANNER[overallLevel].color,
              border: `1px solid ${RISK_BANNER[overallLevel].border}`,
            }}
          >
            {RISK_BANNER[overallLevel].label} · {overallScore}
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {sorted.map(f => {
          const cfg = SEVERITY_CONFIG[f.severity] ?? SEVERITY_CONFIG.medium;
          return (
            <div
              key={f.flag}
              className="rounded-xl p-3 space-y-1"
              style={{ background: cfg.bg, border: `1px solid ${cfg.ring}` }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: cfg.ring, color: cfg.color }}
                >
                  {f.severity}
                </span>
                <span className="text-[11.5px] font-semibold text-slate-200">{f.explanation}</span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-snug">{f.recruiter_effect}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Authenticity + coherence card ─────────────────────────────────────────────

function AuthenticityCard({ data }: { data: AuthenticityProfile }) {
  const color =
    data.score >= 75 ? '#10b981' :
    data.score >= 55 ? '#6366f1' :
    data.score >= 35 ? '#f59e0b' : '#ef4444';

  const coherence = data.toolchain_coherence;

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/20 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <SectionLabel text="Resume Authenticity" />
          <p className="text-sm font-bold text-slate-200">Authenticity Score</p>
        </div>
        <span className="text-2xl font-black" style={{ color }}>{data.score}</span>
      </div>

      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${data.score}%`, background: color }} />
      </div>

      <p className="text-[11.5px] text-slate-400 leading-snug">{data.explanation}</p>

      {/* Toolchain coherence sub-card */}
      {coherence && (
        <div
          className="rounded-xl p-3 space-y-2"
          style={{
            background: coherence.coherence_level === 'low' ? 'rgba(239,68,68,0.07)' :
                        coherence.coherence_level === 'moderate' ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
            border: `1px solid ${coherence.coherence_level === 'low' ? 'rgba(239,68,68,0.25)' :
                                  coherence.coherence_level === 'moderate' ? 'rgba(245,158,11,0.22)' : 'rgba(16,185,129,0.22)'}`,
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Toolchain Coherence</p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
              style={{
                color: coherence.coherence_level === 'low' ? '#ef4444' :
                       coherence.coherence_level === 'moderate' ? '#f59e0b' : '#10b981',
                background: coherence.coherence_level === 'low' ? 'rgba(239,68,68,0.12)' :
                            coherence.coherence_level === 'moderate' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
              }}
            >
              {coherence.coherence_level} · {coherence.score}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">{coherence.explanation}</p>
          {coherence.strongest_coherent_cluster.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {coherence.strongest_coherent_cluster.map(t => (
                <span key={t} className="text-[10px] bg-emerald-900/30 text-emerald-400 border border-emerald-700/40 px-1.5 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}
          {coherence.suspicious_combinations.length > 0 && (
            <p className="text-[10.5px] text-red-400 leading-snug">
              ⚠ {coherence.suspicious_combinations[0]}
            </p>
          )}
        </div>
      )}

      {data.strongest_authenticity_signal && (
        <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="text-emerald-500 text-sm mt-0.5">★</span>
          <p className="text-[11.5px] text-emerald-400 font-medium leading-snug">{data.strongest_authenticity_signal}</p>
        </div>
      )}
      {data.biggest_authenticity_risk && (
        <div className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <span className="text-amber-400 text-sm mt-0.5">!</span>
          <p className="text-[11.5px] text-amber-400 font-medium leading-snug">{data.biggest_authenticity_risk}</p>
        </div>
      )}
    </div>
  );
}

// ── Trajectory card (Phase 5: confidence badge) ───────────────────────────────

function TrajectoryCard({ data }: { data: TrajectoryProfile }) {
  const cfg = TRAJ_CONFIG[data.signal] ?? TRAJ_CONFIG.exploratory;
  const confColor = CONFIDENCE_DOT[data.trajectory_confidence ?? 'low'];

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
          style={{ background: `${cfg.color}22`, color: cfg.color }}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <SectionLabel text="Career Trajectory" />
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-200 capitalize">{data.signal}</p>
            {data.trajectory_confidence && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: confColor }} />
                {data.trajectory_confidence} confidence
              </span>
            )}
          </div>
        </div>
        {data.trajectory_evidence_score != null && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full text-slate-300"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Evidence: {data.trajectory_evidence_score}
          </span>
        )}
      </div>

      <p className="text-[11.5px] text-slate-400 leading-snug">{data.explanation}</p>

      {data.strongest_growth_signal && (
        <div className="flex items-start gap-2">
          <span className="text-emerald-500 text-sm shrink-0">↑</span>
          <p className="text-[11.5px] text-emerald-400 font-medium leading-snug">{data.strongest_growth_signal}</p>
        </div>
      )}
      {data.biggest_stagnation_risk && (
        <div className="flex items-start gap-2">
          <span className="text-amber-400 text-sm shrink-0">!</span>
          <p className="text-[11.5px] text-amber-400 font-medium leading-snug">{data.biggest_stagnation_risk}</p>
        </div>
      )}
    </div>
  );
}

// ── Trust breakdown card ───────────────────────────────────────────────────────

function TrustBreakdownCard({ data }: { data: TrustBreakdown }) {
  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/20 p-4 space-y-3">
      <SectionLabel text="Trust Breakdown" />
      {data.positive.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10.5px] font-bold text-emerald-500 uppercase tracking-widest">Positive signals</p>
          {data.positive.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded mt-0.5 shrink-0"
                style={{
                  background: s.impact === 'high' ? 'rgba(16,185,129,0.15)' : s.impact === 'medium' ? 'rgba(99,102,241,0.15)' : 'rgba(100,116,139,0.15)',
                  color:      s.impact === 'high' ? '#6ee7b7' : s.impact === 'medium' ? '#a5b4fc' : '#94a3b8',
                }}>
                {s.impact.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-semibold text-slate-300">{s.signal}</p>
                <p className="text-[10.5px] text-slate-500 leading-snug">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {data.negative.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10.5px] font-bold text-red-400 uppercase tracking-widest">Trust risks</p>
          {data.negative.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded mt-0.5 shrink-0"
                style={{
                  background: s.impact === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                  color:      s.impact === 'high' ? '#fca5a5' : '#fcd34d',
                }}>
                {s.impact.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-semibold text-slate-300">{s.signal}</p>
                <p className="text-[10.5px] text-slate-500 leading-snug">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Fastest trust gain</p>
        <p className="text-[11.5px] text-indigo-300 leading-snug font-medium">{data.fastest_trust_gain}</p>
      </div>
    </div>
  );
}

// ── Recommendation mode card ───────────────────────────────────────────────────

function RecommendationModeCard({ mode }: { mode: RecommendationMode }) {
  const cfg = MODE_CONFIG[mode];
  return (
    <div className="rounded-2xl p-4 space-y-2" style={{ background: `${cfg.color}0d`, border: `1px solid ${cfg.color}33` }}>
      <SectionLabel text="Recommended Focus Mode" />
      <p className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
      <p className="text-[11.5px] text-slate-400 leading-snug">{cfg.note}</p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props {
  firstImpression:     FirstImpression | null;
  authenticityProfile: AuthenticityProfile | null;
  trajectoryProfile:   TrajectoryProfile | null;
  trustBreakdown:      TrustBreakdown | null;
  riskFlags:           RiskFlag[] | null;
  overallRiskScore:    number | null;
  overallRiskLevel:    OverallRiskLevel | null;
  recommendationMode:  RecommendationMode | null;
}

export default function Phase4IntelPanel({
  firstImpression,
  authenticityProfile,
  trajectoryProfile,
  trustBreakdown,
  riskFlags,
  overallRiskScore,
  overallRiskLevel,
  recommendationMode,
}: Props) {
  const hasData = firstImpression || authenticityProfile || trajectoryProfile || trustBreakdown || riskFlags;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm font-semibold text-slate-400">No intelligence data yet</p>
        <p className="text-xs text-slate-500">Re-analyze your resume to generate Phase 4/5 intelligence.</p>
      </div>
    );
  }

  // Warning banner condition
  const authScore = authenticityProfile?.score ?? 100;
  const coherenceLevel = authenticityProfile?.toolchain_coherence?.coherence_level ?? 'high';
  const showWarning = authScore < 20 && coherenceLevel === 'low' &&
    (overallRiskLevel === 'high' || overallRiskLevel === 'critical');

  return (
    <div className="space-y-3">
      {showWarning && <CredibilityWarningBanner />}
      {recommendationMode && <RecommendationModeCard mode={recommendationMode} />}
      {overallRiskLevel && overallRiskScore != null && overallRiskLevel !== 'low' && (
        <OverallRiskBanner level={overallRiskLevel} score={overallRiskScore} />
      )}
      {firstImpression    && <FirstImpressionCard data={firstImpression} />}
      {riskFlags          && (
        <RiskFlagsCard
          flags={riskFlags}
          overallLevel={overallRiskLevel}
          overallScore={overallRiskScore}
        />
      )}
      {authenticityProfile && <AuthenticityCard data={authenticityProfile} />}
      {trajectoryProfile  && <TrajectoryCard   data={trajectoryProfile} />}
      {trustBreakdown     && <TrustBreakdownCard data={trustBreakdown} />}
    </div>
  );
}
