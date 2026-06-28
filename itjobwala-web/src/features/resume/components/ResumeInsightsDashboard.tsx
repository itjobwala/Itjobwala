'use client';

import { useEffect, useState }                              from 'react';
import type {
  ResumeInsights, RiskFlag, RiskSeverity, OverallRiskLevel,
  ImprovementPriorities, PrioritySkill, TrustSignal,
  ImplMaturity, InflationRisk, ParseQuality,
}                                                            from '../types/resume.types';
import { buildMergedSkills, type MergedSkill }             from '../utils/buildMergedSkills';
import ResumeParsingLoader                                   from './ResumeParsingLoader';
import ResumeEmptyState                                      from './ResumeEmptyState';
import InfoButton                                            from './InfoButton';
import NonQaResumeState                                      from './NonQaResumeState';
import { useResumeInsightsQuery, useParseResumeMutation, useBenchmarkingQuery } from '../hooks';
import { isNonQaResult }                                     from '../services/resume.api';
import { useCandidateProfileQuery }                          from '@/features/candidate/profile/hooks';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:       '#0c0e0f',
  card:     '#181a1b',
  card2:    '#202324',
  border:   '#2a2e30',
  border2:  '#34393b',
  ink:      '#f3f4f5',
  muted:    '#9aa0a6',
  muted2:   '#6c7378',
  blue:     '#5b87d6',
  blueBg:   '#1c2940',
  blueBd:   '#2e4368',
  green:    '#5cb085',
  greenBg:  '#18301f',
  greenBd:  '#2c5238',
  greenInk: '#7fcca0',
  amber:    '#c79a4f',
  amberBg:  '#33290f',
  amberBd:  '#574517',
  amberInk: '#d8ad63',
  red:      '#d18a84',
  redBg:    '#361c1b',
  redBd:    '#5a2e2b',
  track:    '#26292b',
} as const;

const cardStyle: React.CSSProperties = {
  background: T.card, border: `1px solid ${T.border}`,
  borderRadius: 22, padding: '30px 32px',
};

const TIER_COLORS: Record<string, string> = {
  emerald: 'rgba(16,185,129,0.1)',
  cyan:    'rgba(6,182,212,0.1)',
  blue:    'rgba(99,102,241,0.1)',
  amber:   'rgba(245,158,11,0.1)',
  red:     'rgba(239,68,68,0.08)',
};
const TIER_BORDERS: Record<string, string> = {
  emerald: 'rgba(16,185,129,0.25)',
  cyan:    'rgba(6,182,212,0.25)',
  blue:    'rgba(99,102,241,0.25)',
  amber:   'rgba(245,158,11,0.2)',
  red:     'rgba(239,68,68,0.15)',
};
const TIER_TEXT: Record<string, string> = {
  emerald: '#6ee7b7',
  cyan:    '#67e8f9',
  blue:    '#a5b4fc',
  amber:   '#fcd34d',
  red:     '#fca5a5',
};

const sLabelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: '1.8px',
  textTransform: 'uppercase', color: T.muted2,
};

// ── Score breakdown constants ─────────────────────────────────────────────────

const SKIP_DIMS = new Set(['resume_quality', 'mobile_testing', 'domain_expertise']);

const DIM_LABELS: Record<string, string> = {
  automation_testing:      'Automation Testing',
  api_testing:             'API Testing',
  framework_expertise:     'Framework Expertise',
  performance_testing:     'Performance Testing',
  test_design_methodology: 'Test Design',
  qa_experience:           'QA Experience',
  certifications:          'Certifications',
  bug_tracking:            'Bug Tracking',
  ci_cd_readiness:         'CI/CD Readiness',
};

const DIM_HINTS: Record<string, { good: string; bad: string }> = {
  automation_testing:      { good: 'Well-evidenced — multiple automation tools',           bad: 'Add Selenium, Playwright, or Cypress to improve' },
  api_testing:             { good: 'REST API testing expertise confirmed',                  bad: 'Add Postman or REST Assured' },
  framework_expertise:     { good: 'Framework patterns confirmed',                          bad: 'Add Page Object Model or BDD patterns' },
  performance_testing:     { good: 'Performance testing expertise confirmed',               bad: 'JMeter or K6 would unlock this dimension' },
  test_design_methodology: { good: 'Test design techniques demonstrated',                   bad: 'Add test case design, BVA, or exploratory testing' },
  qa_experience:           { good: 'Strong QA tenure with methodology depth',               bad: 'Add more QA methodology keywords: STLC, defect tracking' },
  certifications:          { good: 'QA certification confirmed',                            bad: 'ISTQB Foundation would add 3-5 points here' },
  bug_tracking:            { good: 'JIRA defect lifecycle confirmed',                       bad: 'Add JIRA or TestRail experience' },
  ci_cd_readiness:         { good: 'CI/CD pipeline integration confirmed',                  bad: 'No CI/CD tools — common expectation in automation roles' },
};

const DIM_RENDER_ORDER = [
  'automation_testing', 'api_testing', 'framework_expertise', 'performance_testing',
  'test_design_methodology', 'qa_experience', 'certifications', 'bug_tracking', 'ci_cd_readiness',
];

// ── Risk flag constants ───────────────────────────────────────────────────────

const RISK_FLAG_LABELS: Record<string, string> = {
  no_ci_cd_context:         'No CI/CD context',
  no_cicd_mention:          'No CI/CD context',
  outdated_stack:           'Legacy-only toolstack',
  stale_skills:             'Legacy-only toolstack',
  keyword_stuffing:         'Keyword stuffing detected',
  no_projects:              'No QA projects found',
  no_project_context:       'No QA projects found',
  weak_evidence:            'Skills listed without proof',
  low_evidence_density:     'Skills listed without proof',
  no_quantified_impact:     'No Quantified Impact',
  experience_inflation:     'Experience Inflation',
  generic_descriptions:     'Generic Descriptions',
  missing_automation_tools: 'Missing Automation Tools',
  weak_toolchain_coherence: 'Weak Toolchain Coherence',
};

// Risk badge header labels for Section 1
const RISK_HEADER_LABELS: Record<string, string> = {
  no_ci_cd_context:   'CI/CD Gap',
  no_cicd_mention:    'CI/CD Gap',
  outdated_stack:     'Outdated Stack',
  stale_skills:       'Outdated Stack',
  keyword_stuffing:   'Keyword Stuffing',
  no_projects:        'No Projects',
  no_project_context: 'No Projects',
  weak_evidence:      'Weak Evidence',
  low_evidence_density: 'Weak Evidence',
};

// ── Chip kind from evidence level ─────────────────────────────────────────────

type ChipKind = 'green' | 'gray' | 'amber' | 'blue';

function evidenceToChip(level: string): ChipKind {
  if (level === 'very_strong' || level === 'strong') return 'green';
  if (level === 'moderate'    || level === 'basic')  return 'gray';
  if (level === 'weak')                              return 'amber';
  if (level === 'inferred')                          return 'blue';
  return 'gray';
}

const CHIP_CFG: Record<ChipKind, { bg: string; bd: string; color: string; dot: string }> = {
  green: { bg: '#15241a', bd: T.greenBd,  color: T.greenInk, dot: T.green  },
  gray:  { bg: '#1b1e1f', bd: T.border2,  color: '#d2d6d9',  dot: '#7b8186' },
  amber: { bg: '#271f0d', bd: T.amberBd,  color: T.amberInk, dot: T.amber  },
  blue:  { bg: '#182337', bd: T.blueBd,   color: '#9fbdf0',  dot: T.blue   },
};

// ── Bar color from pct ────────────────────────────────────────────────────────

function barColor(pct: number): string {
  if (pct >= 80) return T.green;
  if (pct >= 60) return T.blue;
  if (pct >= 30) return T.amber;
  return T.red;
}

// ── Severity colors ───────────────────────────────────────────────────────────

const SEV_CFG: Record<RiskSeverity, { bg: string; color: string; label: string }> = {
  low:      { bg: T.blueBg,   color: '#9fbdf0',  label: 'Low'      },
  medium:   { bg: '#4a2f12',  color: T.amberInk, label: 'Medium'   },
  high:     { bg: T.redBg,    color: '#e9b3ae',  label: 'High'     },
  critical: { bg: '#5a2e2b',  color: '#e9b3ae',  label: 'Critical' },
};

const LEVEL_CFG: Record<OverallRiskLevel, { label: string; bg: string; color: string }> = {
  low:      { label: 'Low risk',      bg: '#1f3b27', color: '#84d3a4' },
  moderate: { label: 'Moderate risk', bg: T.amberBg, color: T.amberInk },
  high:     { label: 'High risk',     bg: T.redBg,   color: T.red      },
  critical: { label: 'Critical risk', bg: '#5a2e2b', color: '#e9b3ae'  },
};

// ── Specialization / career labels ───────────────────────────────────────────

const SPEC_LABELS: Record<string, string> = {
  sdet: 'SDET', automation_qa: 'Automation QA', api_testing: 'API QA',
  mobile_testing: 'Mobile QA', performance_testing: 'Performance QA',
  hybrid_qa: 'Hybrid QA', manual_qa: 'Manual QA',
};

const CAREER_LABELS: Record<string, string> = {
  fresher: 'Fresher', junior: 'Junior', mid_level: 'Mid Level',
  senior: 'Senior', lead: 'Lead',
};

// ── Band color → token ────────────────────────────────────────────────────────

const BAND_COLOR: Record<string, string> = {
  emerald: T.greenInk, green: T.greenInk, blue: '#9fbdf0',
  amber: T.amberInk, orange: '#e9965f', red: T.red,
};
const BAND_BG: Record<string, string> = {
  emerald: T.greenBg, green: T.greenBg, blue: T.blueBg,
  amber: T.amberBg, orange: '#3a1f0a', red: T.redBg,
};

// ── Hiring label badge color (score-based) ────────────────────────────────────

function hiringLabelStyle(score: number): { bg: string; color: string } {
  if (score >= 76) return { bg: T.greenBg, color: T.greenInk };
  if (score >= 61) return { bg: T.blueBg,  color: '#9fbdf0'  };
  if (score >= 41) return { bg: T.amberBg, color: T.amberInk };
  return               { bg: T.redBg,   color: T.red       };
}

// ── Gauge ─────────────────────────────────────────────────────────────────────

const CIRC = 2 * Math.PI * 92;

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const offset = CIRC * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div style={{ position: 'relative', width: 220, height: 220, margin: '26px 0 4px' }}>
      <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="110" cy="110" r="92" fill="none" stroke={T.track} strokeWidth="17" />
        <circle cx="110" cy="110" r="92" fill="none" stroke={color} strokeWidth="17"
          strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1, letterSpacing: -2, color: T.ink }}>{score}</div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '1.5px', color: T.muted, marginTop: 6 }}>QA MATCH</div>
      </div>
    </div>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────────

function Pill({
  children, bg, color, fw = 600, padding = '6px 13px',
}: {
  children: React.ReactNode; bg: string; color: string; fw?: number; padding?: string;
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      borderRadius: 999, padding, fontSize: 13.5, fontWeight: fw, lineHeight: 1,
      whiteSpace: 'nowrap', background: bg, color,
    }}>
      {children}
    </span>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────────

function Chip({ label, kind, tooltip }: { label: string; kind: ChipKind; tooltip?: string }) {
  const s = CHIP_CFG[kind];
  return (
    <span
      title={tooltip}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        borderRadius: 999, padding: '8px 14px', fontSize: 14.5, fontWeight: 500,
        border: `1px solid ${s.bd}`, background: s.bg, color: s.color,
        cursor: tooltip ? 'help' : 'default',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ── Dimension icon ────────────────────────────────────────────────────────────

function DimIcon({ k }: { k: string }) {
  if (k === 'api_testing') {
    return <span style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: T.muted, fontFamily: 'monospace' }}>API</span>;
  }
  const icons: Record<string, React.ReactNode> = {
    qa_experience: (
      <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="8" y="3" width="8" height="4" rx="1"/><path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 14l2 2 4-4"/>
      </svg>
    ),
    bug_tracking: (
      <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="8" y="6" width="8" height="12" rx="4"/>
        <path d="M8 10H4m4 4H4m16-4h-4m4 4h-4M9 4l2 2m4-2l-2 2M5 6l2.5 2M19 6l-2.5 2M5 18l2.5-2M19 18l-2.5-2"/>
      </svg>
    ),
    automation_testing: (
      <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M13 2L4 14h7l-1 8 9-12h-7z"/>
      </svg>
    ),
    framework_expertise: (
      <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
    certifications: (
      <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h5M7 14h3"/><circle cx="16.5" cy="12" r="2"/>
      </svg>
    ),
    ci_cd_readiness: (
      <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
      </svg>
    ),
    performance_testing: (
      <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    test_design_methodology: (
      <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  };
  return <>{icons[k] ?? <span style={{ width: 20, height: 20 }} />}</>;
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props { resumeUrl?: string | null }

export default function ResumeInsightsDashboard({ resumeUrl: resumeUrlProp }: Props) {
  const { data: profile }                      = useCandidateProfileQuery();
  const resumeUrl                              = resumeUrlProp ?? profile?.resume?.url ?? null;
  const { data: insights, isLoading, isError, refetch } = useResumeInsightsQuery();
  const parseMutation                                   = useParseResumeMutation();
  const [showLoader, setShowLoader]                     = useState(false);

  // Keep loader visible until its own animation finishes, even if parse returns fast
  useEffect(() => {
    if (parseMutation.isPending) setShowLoader(true);
  }, [parseMutation.isPending]);

  const handleAnalyze = () => parseMutation.mutate(resumeUrl ? { resume_url: resumeUrl } : {});

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[220, 160, 100].map(h => (
          <div key={h} className="animate-pulse" style={{ height: h, borderRadius: 16, background: T.card2, border: `1px solid ${T.border}` }} />
        ))}
      </div>
    );
  }
  if (parseMutation.isPending || showLoader) {
    return (
      <div style={cardStyle}>
        <ResumeParsingLoader
          done={!parseMutation.isPending}
          onComplete={() => setShowLoader(false)}
        />
      </div>
    );
  }

  if (parseMutation.data && isNonQaResult(parseMutation.data)) {
    const d = parseMutation.data;
    return <div style={cardStyle}><NonQaResumeState reason={d.reason} domainLabel={d.domain_label} domainConfidence={d.domain_confidence} message={d.message} /></div>;
  }
  if (insights?.eligible === false) {
    return <div style={cardStyle}><NonQaResumeState reason={insights.reason ?? 'non_qa_resume'} domainLabel={insights.domain_label ?? ''} domainConfidence={insights.domain_confidence} message="Resume does not appear to belong to a QA professional." /></div>;
  }
  if (isError) {
    return (
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '40px 32px', textAlign: 'center' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={T.muted2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
          <circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3v.5"/>
        </svg>
        <div style={{ fontSize: 17, fontWeight: 600, color: T.ink }}>Couldn&apos;t load your report</div>
        <div style={{ fontSize: 14, color: T.muted, maxWidth: 280 }}>There was a problem fetching your analysis. Your data is safe — tap retry to reload.</div>
        <button
          onClick={() => refetch()}
          style={{ marginTop: 4, padding: '10px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #5b87d6, #3f63a8)' }}
        >
          Retry
        </button>
      </div>
    );
  }
  if (!insights) {
    return <div style={cardStyle}><ResumeEmptyState onAnalyze={handleAnalyze} isParsing={parseMutation.isPending} hasResume={!!resumeUrl} /></div>;
  }

  return <Report insights={insights} onReanalyze={handleAnalyze} isParsing={parseMutation.isPending} />;
}

// ── Report ────────────────────────────────────────────────────────────────────

function Report({ insights, onReanalyze, isParsing }: { insights: ResumeInsights; onReanalyze: () => void; isParsing: boolean }) {
  const mergedSkills = buildMergedSkills(insights.skill_metadata, insights.skill_evidence ?? []);
  // Build lookup: skill.toLowerCase() → MergedSkill
  const mergedMap = new Map<string, MergedSkill>(mergedSkills.map(m => [m.skill.toLowerCase(), m]));

  const bd  = insights.qa_score_breakdown as unknown as Record<string, { score: number; max: number }>;
  const riskFlags = insights.risk_flags ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Parse quality banner */}
      <ParseBanner quality={insights.parse_quality} warning={insights.parse_warning} />

      {/* 1. Header */}
      <HeaderSection insights={insights} onReanalyze={onReanalyze} isParsing={isParsing} />

      {/* 2. QA Match Score */}
      <ScoreSection insights={insights} />

      {/* 3. Score Breakdown */}
      {bd && <BreakdownSection breakdown={bd} />}

      {/* 4. Skill Evidence */}
      {insights.extracted_skills.length > 0 && (
        <SkillSection insights={insights} mergedMap={mergedMap} />
      )}

      {/* 5. What To Learn Next */}
      {insights.improvement_priorities && (
        <LearnSection insights={insights} />
      )}

      {/* 6. Why Recruiters Trust */}
      {insights.trust_breakdown && (
        <TrustSection insights={insights} />
      )}

      {/* 7. Risk Flags */}
      <RiskSection flags={riskFlags} overallScore={insights.overall_risk_score} overallLevel={insights.overall_risk_level} />

      {/* 8. Skill Recency */}
      {insights.skill_recency && insights.recency_summary && (
        <RecencySection recency={insights.skill_recency} summary={insights.recency_summary} />
      )}

      {/* 9. Evidence Profile */}
      {insights.evidence_profile && (
        <EvidenceProfileSection ep={insights.evidence_profile} />
      )}

    </div>
  );
}

// ── Parse quality banner ──────────────────────────────────────────────────────

function ParseBanner({ quality, warning }: { quality: ParseQuality | null; warning: string | null }) {
  if (!quality || !warning) return null;
  if (quality === 'good' || quality === 'excellent') return null;

  const isRed = quality === 'failed' || quality === 'poor';
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'flex-start', borderRadius: 14, padding: '14px 18px',
      background: isRed ? T.redBg   : T.amberBg,
      border:     isRed ? `1px solid ${T.redBd}` : `1px solid ${T.amberBd}`,
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={isRed ? T.red : T.amberInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
        <path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4m0 3v.5"/>
      </svg>
      <span style={{ fontSize: 14, color: isRed ? '#e9b3ae' : '#d8c39a', lineHeight: 1.5 }}>
        {quality === 'fair'
          ? 'Resume text was partially extracted. Some skills may be missed.'
          : warning}
      </span>
    </div>
  );
}

// ── Section 1: Header ─────────────────────────────────────────────────────────

function HeaderSection({ insights, onReanalyze, isParsing }: { insights: ResumeInsights; onReanalyze: () => void; isParsing: boolean }) {
  const name    = insights.name ?? 'QA Candidate';
  const words   = name.trim().split(/\s+/);
  const initials = words.length >= 2
    ? ((words[0][0] ?? '') + (words[words.length - 1][0] ?? '')).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  const subParts = [
    insights.current_title,
    insights.current_company,
    (insights.experience_years ?? 0) > 0 ? `${insights.experience_years} year${insights.experience_years !== 1 ? 's' : ''}` : null,
  ].filter(Boolean);

  // ISTQB badge label
  let istqbLabel: string | null = null;
  if ((insights.certification_count ?? 0) > 0 && insights.certifications?.length) {
    const first = insights.certifications[0];
    const word  = first.split(/\s+/)[0] ?? 'Certified';
    istqbLabel  = `${word} Certified`;
  }

  const riskFlags = insights.risk_flags ?? [];

  return (
    <section style={{ ...cardStyle, display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
      {/* Avatar */}
      <div style={{
        width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(160deg, #5b87d6, #3f63a8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 19, letterSpacing: '.5px', color: '#fff',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18)',
      }}>{initials}</div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-.4px', color: T.ink }}>{name}</div>
        {subParts.length > 0 && (
          <div style={{ fontSize: 16, color: T.muted, marginTop: 4 }}>{subParts.join(' · ')}</div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          {/* Specialization */}
          {insights.qa_specialization && (
            <Pill bg={T.blueBg} color="#9fbdf0">
              {SPEC_LABELS[insights.qa_specialization] ?? insights.qa_specialization.toUpperCase()}
            </Pill>
          )}
          {/* Career level */}
          {insights.career_level && (
            <Pill bg={T.blueBg} color="#9fbdf0">
              {CAREER_LABELS[insights.career_level] ?? insights.career_level}
            </Pill>
          )}
          {/* ISTQB / cert badge */}
          {istqbLabel && <Pill bg={T.greenBg} color={T.greenInk}>{istqbLabel}</Pill>}
          {/* All risk flag badges */}
          {riskFlags.map((f, i) => {
            const label = RISK_HEADER_LABELS[f.flag];
            if (!label) return null;
            const isHigh = f.severity === 'high' || f.severity === 'critical';
            return <Pill key={i} bg={isHigh ? T.redBg : T.amberBg} color={isHigh ? T.red : T.amberInk}>{label}</Pill>;
          })}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
        {insights.eligible && (
          <Pill bg="#1f3b27" color="#84d3a4" fw={700} padding="8px 15px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.5 2.5 4.5-5"/>
            </svg>
            QA Eligible
          </Pill>
        )}
        <button
          onClick={onReanalyze} disabled={isParsing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12,
            fontSize: 11.5, fontWeight: 700, color: '#fff', border: 'none',
            cursor: isParsing ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #5b87d6, #3f63a8)', opacity: isParsing ? 0.5 : 1,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          {isParsing ? 'Analyzing…' : 'Re-analyze'}
        </button>
      </div>
    </section>
  );
}

// ── Section 2: QA Match Score ─────────────────────────────────────────────────

function ScoreSection({ insights }: { insights: ResumeInsights }) {
  const { data: benchmarkData } = useBenchmarkingQuery();
  const score    = insights.qa_match_score ?? 0;
  const gc       = score >= 80 ? T.green : score >= 60 ? T.blue : score >= 40 ? T.amber : T.red;
  const hlStyle  = hiringLabelStyle(score);
  const bandC    = insights.band_color ? BAND_COLOR[insights.band_color] ?? '#9fbdf0' : '#9fbdf0';
  const bandBg   = insights.band_color ? BAND_BG[insights.band_color]   ?? T.blueBg  : T.blueBg;

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={sLabelStyle}>QA Match Score</div>
        <InfoButton size="md" text="Your overall readiness for QA roles right now. 80 means you are a strong, competitive candidate — most recruiters shortlist above 70. The gap to 100 shows exactly what would make you exceptional." />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ScoreGauge score={score} color={gc} />

        {/* Tags */}
        <div style={{ display: 'flex', gap: 12, margin: '18px 0 24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {insights.qa_hiring_label && (
            <Pill bg={hlStyle.bg} color={hlStyle.color}>{insights.qa_hiring_label}</Pill>
          )}
          {insights.band_label && (
            <Pill bg={bandBg} color={bandC}>{insights.band_label}</Pill>
          )}
        </div>

        {/* Stats */}
        {(insights.capability_score != null || insights.recruiter_readiness != null) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%' }}>
            {insights.capability_score != null && (
              <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22, textAlign: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, color: T.ink }}>{insights.capability_score}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ fontSize: 15, color: T.muted }}>Capability ceiling</div>
                  <InfoButton text="The score you could reach if your listed skills were all backed by implementation evidence. It reflects your actual ability, not just what is on paper." />
                </div>
              </div>
            )}
            {insights.recruiter_readiness != null && (
              <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22, textAlign: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, color: T.ink }}>{insights.recruiter_readiness.shortlist_probability}%</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ fontSize: 15, color: T.muted }}>Shortlist probability</div>
                  <InfoButton text="How likely a recruiter reviewing your profile would add you to their shortlist. Based on your score, specialization, experience level, and evidence quality." />
                </div>
              </div>
            )}
          </div>
        )}

        {benchmarkData && (
          <div
            className="flex items-center justify-center gap-2 mt-4 px-3 py-2 rounded-xl w-full"
            style={{
              background: TIER_COLORS[benchmarkData.tier_color] ?? 'rgba(99,102,241,0.1)',
              border: `1px solid ${TIER_BORDERS[benchmarkData.tier_color] ?? 'rgba(99,102,241,0.2)'}`,
            }}
          >
            <span className="text-[11px] font-semibold" style={{ color: TIER_TEXT[benchmarkData.tier_color] ?? '#a5b4fc' }}>
              Top {100 - benchmarkData.percentile_rank + 1}% of QA candidates
            </span>
            <span className="text-[10px] opacity-60" style={{ color: TIER_TEXT[benchmarkData.tier_color] ?? '#a5b4fc' }}>
              · {benchmarkData.benchmark_tier}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Section 3: Score Breakdown ────────────────────────────────────────────────

function BreakdownSection({ breakdown }: { breakdown: Record<string, { score: number; max: number }> }) {
  type DimEntry = { key: string; score: number; max: number; pct: number };

  const dims: DimEntry[] = [];
  for (const key of DIM_RENDER_ORDER) {
    if (SKIP_DIMS.has(key)) continue;
    const dim = breakdown[key];
    if (!dim || dim.max === 0) continue;
    // Special: penalties — only show if score < 0
    if (key === 'penalties' && dim.score >= 0) continue;
    const pct = Math.round((dim.score / dim.max) * 100);
    dims.push({ key, score: dim.score, max: dim.max, pct });
  }

  // Also catch any extra keys from API not in DIM_RENDER_ORDER
  for (const [key, dim] of Object.entries(breakdown)) {
    if (SKIP_DIMS.has(key)) continue;
    if (DIM_RENDER_ORDER.includes(key)) continue;
    if (key === 'penalties' && dim.score >= 0) continue;
    if (!dim || dim.max === 0) continue;
    if (!DIM_LABELS[key]) continue; // only show labelled dims
    const pct = Math.round((dim.score / dim.max) * 100);
    dims.push({ key, score: dim.score, max: dim.max, pct });
  }

  const strong = dims.filter(d => d.pct >= 70);
  const gaps   = dims.filter(d => d.pct <  70);

  function DimRow({ d }: { d: DimEntry }) {
    const hint = DIM_HINTS[d.key];
    const hintText = hint ? (d.pct >= 70 ? hint.good : hint.bad) : '';
    const bc = barColor(d.pct);
    return (
      <div style={{ padding: '18px 0', borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <DimIcon k={d.key} />
          <span style={{ fontSize: 18, fontWeight: 600, flex: 1, color: T.ink }}>{DIM_LABELS[d.key] ?? d.key}</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>
            {d.score}<span style={{ color: T.muted2, fontWeight: 600 }}>/{d.max}</span>
          </span>
        </div>
        <div style={{ height: 7, borderRadius: 6, background: T.track, marginTop: 11, overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', borderRadius: 6, width: `${d.pct}%`, background: bc }} />
        </div>
        {hintText && <div style={{ fontSize: 14.5, color: T.muted, marginTop: 10 }}>{hintText}</div>}
      </div>
    );
  }

  if (dims.length === 0) return null;
  return (
    <section style={cardStyle}>
      <div style={sLabelStyle}>Score Breakdown</div>
      {strong.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: T.muted, margin: '20px 0 0' }}>Strong Dimensions</div>
          {strong.map(d => <DimRow key={d.key} d={d} />)}
        </>
      )}
      {gaps.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: T.muted, margin: '20px 0 0' }}>Gaps</div>
          {gaps.map(d => <DimRow key={d.key} d={d} />)}
        </>
      )}
    </section>
  );
}

// ── Section 4: Skill Evidence ─────────────────────────────────────────────────

function SkillSection({ insights, mergedMap }: { insights: ResumeInsights; mergedMap: Map<string, MergedSkill> }) {
  const hasWeakWarning = (insights.weak_evidence_skills?.length ?? 0) > 0;
  const warningText    = insights.weaknesses?.[0] ?? null;

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={sLabelStyle}>Skill Evidence · {insights.total_skills_found} Detected</div>
        <InfoButton size="md" text="Not all skills on your resume carry the same weight. Green means a recruiter can verify you used this skill in a real project. Amber means you listed it but gave no proof — recruiters notice this." />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, margin: '18px 0 4px' }}>
        {[
          { dot: T.green,   label: 'Proven in experience' },
          { dot: '#7b8186', label: 'Mentioned in context' },
          { dot: T.amber,   label: 'Listed only — no proof' },
          { dot: T.blue,    label: 'Inferred from context' },
        ].map(({ dot, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, color: T.muted }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>

      {/* Weak evidence warning */}
      {hasWeakWarning && warningText && (
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          background: T.amberBg, border: `1px solid ${T.amberBd}`,
          borderRadius: 14, padding: '16px 18px', margin: '20px 0',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={T.amberInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flexShrink: 0, marginTop: 1 }}>
            <path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4m0 3v.5"/>
          </svg>
          <div style={{ fontSize: 15, lineHeight: 1.5, color: '#d8c39a' }}>{warningText}</div>
        </div>
      )}

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {insights.extracted_skills.map(skill => {
          const merged  = mergedMap.get(skill.toLowerCase());
          const kind    = evidenceToChip(merged?.evidence_level ?? 'moderate');
          const tooltip = merged
            ? `Found ${merged.occurrences} time${merged.occurrences !== 1 ? 's' : ''} · Sections: ${merged.sources.join(', ')}`
            : undefined;
          return <Chip key={skill} label={skill} kind={kind} tooltip={tooltip} />;
        })}
      </div>
    </section>
  );
}

// ── Section 5: What To Learn Next ─────────────────────────────────────────────

function LearnSection({ insights }: { insights: ResumeInsights }) {
  const imp = insights.improvement_priorities!;
  const weaknesses  = insights.weaknesses  ?? [];
  const suggestions = insights.suggestions ?? [];

  const highPriority   = imp.high_priority   ?? [];
  const medPriority    = imp.medium_priority ?? [];
  const lowPriority    = imp.low_priority    ?? [];
  const hasPriorities  = highPriority.length > 0 || medPriority.length > 0 || lowPriority.length > 0;
  if (!hasPriorities && weaknesses.length === 0 && suggestions.length === 0) return null;

  function prioBadge(item: PrioritySkill, level: 'high' | 'medium' | 'low') {
    // Use recruiter_impact text if present, else derive from level
    const label = item.recruiter_impact
      ?? (level === 'high'   ? (item.score >= 70 ? 'Very High' : 'High')
        : level === 'medium' ? 'Medium' : 'Low');
    const bg    = label === 'Very High' ? T.greenBg
                : label === 'High'      ? T.blueBg
                : label === 'Medium'    ? T.amberBg
                : T.track;
    const color = label === 'Very High' ? T.greenInk
                : label === 'High'      ? '#9fbdf0'
                : label === 'Medium'    ? T.amberInk
                : T.muted;
    return <span style={{ fontSize: 13.5, fontWeight: 700, borderRadius: 999, padding: '6px 13px', flexShrink: 0, background: bg, color }}>{label}</span>;
  }

  function RecCard({ item, level }: { item: PrioritySkill; level: 'high' | 'medium' | 'low' }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>{item.skill}</div>
          {item.reason && <div style={{ fontSize: 14.5, color: T.muted, marginTop: 4 }}>{item.reason}</div>}
        </div>
        {prioBadge(item, level)}
      </div>
    );
  }

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={sLabelStyle}>What To Learn Next</div>
        <InfoButton size="md" text="The skills that will have the biggest impact on your hireability if you add them. Ordered by what recruiters are actually searching for right now — not a generic list." />
      </div>

      {/* Weaknesses alert */}
      {weaknesses.length > 0 && (
        <div style={{ background: T.amberBg, border: `1px solid ${T.amberBd}`, borderRadius: 13, padding: '14px 16px', margin: '18px 0 4px', fontSize: 14, color: '#d8c39a', lineHeight: 1.5 }}>
          {weaknesses[0]}
        </div>
      )}

      {highPriority.length > 0 && (
        <>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.red, margin: '22px 0 14px' }}>HIGH IMPACT — add these to stand out</div>
          {highPriority.map((item, i) => <RecCard key={i} item={item} level="high" />)}
        </>
      )}
      {medPriority.length > 0 && (
        <>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.amberInk, margin: '22px 0 14px' }}>MEDIUM — strengthens your profile</div>
          {medPriority.map((item, i) => <RecCard key={i} item={item} level="medium" />)}
        </>
      )}
      {lowPriority.length > 0 && (
        <>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.muted, margin: '22px 0 14px' }}>LOW — nice to add</div>
          {lowPriority.map((item, i) => <RecCard key={i} item={item} level="low" />)}
        </>
      )}

      {/* Suggestions list */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 18, borderTop: `1px solid ${T.border}`, paddingTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: T.muted2, marginBottom: 12 }}>Action Items</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.muted2, flexShrink: 0, marginTop: 7 }} />
                <span style={{ fontSize: 14.5, color: T.muted, lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Section 6: Why Recruiters Trust ──────────────────────────────────────────

function TrustSection({ insights }: { insights: ResumeInsights }) {
  const tb  = insights.trust_breakdown!;
  const ep  = insights.evidence_profile;
  const trustScore = ep?.recruiter_trust_score ?? null;

  function dotColor(impact: string): string {
    if (impact === 'high') return T.green;
    if (impact === 'medium') return T.amber;
    return T.muted;
  }

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={sLabelStyle}>Why Recruiters Trust This Profile</div>
        <InfoButton size="md" text="Recruiters do not just read skills — they look for proof. This section shows what in your resume makes them confident you can actually do the work, not just that you have heard of the tools." />
        {trustScore != null && (
          <Pill bg={T.greenBg} color={T.greenInk}>{trustScore}% recruiter trust score</Pill>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        {(tb.positive ?? []).map((s: TrustSignal, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor(s.impact), flexShrink: 0, marginTop: 8 }} />
            <div style={{ fontSize: 16, lineHeight: 1.55, color: T.muted }}>
              <b style={{ color: T.ink, fontWeight: 700 }}>{s.signal}</b>
              {s.note ? ` — ${s.note}` : ''}
            </div>
          </div>
        ))}

        {(tb.negative ?? []).length > 0 && (tb.negative ?? []).map((s: TrustSignal, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: T.red, flexShrink: 0, marginTop: 8 }} />
            <div style={{ fontSize: 16, lineHeight: 1.55, color: T.muted }}>
              <b style={{ color: '#e9b3ae', fontWeight: 700 }}>{s.signal}</b>
              {s.note ? ` — ${s.note}` : ''}
            </div>
          </div>
        ))}

        {tb.fastest_trust_gain && (
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', borderTop: `1px solid ${T.border}`, marginTop: 8, paddingTop: 20, fontSize: 15.5, color: '#cfd3d6' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={T.amberInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2 }}>
              <path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3z"/>
            </svg>
            <div><b style={{ color: T.ink, fontWeight: 600 }}>Fastest trust gain:</b> {tb.fastest_trust_gain}</div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Section 7: Risk Flags ─────────────────────────────────────────────────────

function RiskSection({ flags, overallScore, overallLevel }: { flags: RiskFlag[]; overallScore: number | null; overallLevel: OverallRiskLevel | null }) {
  const lvl = overallLevel ? LEVEL_CFG[overallLevel] : null;

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={sLabelStyle}>Risk Flags</div>
        <InfoButton size="md" text="Gaps that experienced recruiters will likely notice and raise in an interview — or use to pass on your profile. Fixing even one of these can meaningfully improve your shortlist rate." />
        {lvl && overallScore != null && (
          <>
            <Pill bg={lvl.bg} color={lvl.color} fw={700}>{lvl.label}</Pill>
            <span style={{ fontSize: 14, color: T.muted }}>
              <b style={{ color: T.ink }}>{overallScore}/100</b>
            </span>
          </>
        )}
      </div>

      {flags.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', color: T.greenInk, fontSize: 15, fontWeight: 600 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
            <circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.5 2.5 4.5-5"/>
          </svg>
          No risk flags detected — strong profile
        </div>
      ) : (
        flags.map((flag, i) => {
          const sev   = SEV_CFG[flag.severity];
          const label = RISK_FLAG_LABELS[flag.flag] ?? flag.flag.replace(/_/g, ' ');
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: T.redBg, border: `1px solid ${T.redBd}`, borderRadius: 14, padding: '18px 20px', marginBottom: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19, flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3v.5"/>
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#e9b3ae' }}>{label}</div>
                {flag.explanation && (
                  <div style={{ fontSize: 14.5, color: '#c39c98', marginTop: 4, lineHeight: 1.5 }}>{flag.explanation}</div>
                )}
                {flag.recruiter_effect && (
                  <div style={{ fontSize: 13, color: '#a08080', marginTop: 4, fontStyle: 'italic', lineHeight: 1.5 }}>{flag.recruiter_effect}</div>
                )}
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700, borderRadius: 999, padding: '6px 13px', flexShrink: 0, background: sev.bg, color: sev.color }}>{sev.label}</span>
            </div>
          );
        })
      )}
    </section>
  );
}

// ── Section 8: Skill Recency ──────────────────────────────────────────────────

function RecencySection({ recency, summary }: { recency: Record<string, { classification: string; last_used_year: number | null; explicit_year_detected: boolean; recency_confidence: string }>; summary: { recent_skills: number; aging_skills: number; stale_skills: number; unknown_skills: number } }) {
  const recencyDot: Record<string, string> = {
    recent: T.green, aging: T.amber, stale: T.red, unknown: T.muted,
  };

  const entries = Object.entries(recency).sort((a, b) => {
    const order: Record<string, number> = { recent: 0, aging: 1, stale: 2, unknown: 3 };
    return (order[a[1].classification] ?? 3) - (order[b[1].classification] ?? 3);
  });

  return (
    <section style={cardStyle}>
      <div style={sLabelStyle}>Skill Recency</div>

      {/* Summary row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, margin: '16px 0 20px' }}>
        {[
          { label: 'Recent',  count: summary.recent_skills,  color: T.green },
          { label: 'Aging',   count: summary.aging_skills,   color: T.amber },
          { label: 'Stale',   count: summary.stale_skills,   color: T.red   },
          { label: 'Unknown', count: summary.unknown_skills, color: T.muted },
        ].map(({ label, count, color }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, color: T.muted }}>
            <span style={{ fontSize: 18, fontWeight: 700, color }}>{count}</span> {label}
          </span>
        ))}
      </div>

      {/* Per-skill rows */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {entries.map(([skill, data]) => {
          const dot = recencyDot[data.classification] ?? T.muted;
          const year = data.explicit_year_detected && data.recency_confidence === 'high' && data.last_used_year
            ? ` (${data.last_used_year})`
            : '';
          return (
            <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: T.card2, border: `1px solid ${T.border}`, borderRadius: 999, padding: '6px 12px', fontSize: 13.5, color: T.muted }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
              {skill}{year}
            </span>
          );
        })}
      </div>
    </section>
  );
}

// ── Section 9: Evidence Profile ───────────────────────────────────────────────

function EvidenceProfileSection({ ep }: { ep: NonNullable<ResumeInsights['evidence_profile']> }) {
  const maturityBadge = (m: ImplMaturity): { bg: string; color: string; label: string } => {
    if (m === 'expert' || m === 'advanced') return { bg: T.greenBg, color: T.greenInk, label: m === 'expert' ? 'Expert' : 'Advanced' };
    if (m === 'moderate')                   return { bg: T.blueBg,  color: '#9fbdf0',  label: 'Moderate' };
    return                                         { bg: T.amberBg, color: T.amberInk, label: m === 'basic' ? 'Basic' : 'Minimal' };
  };
  const maturity = maturityBadge(ep.implementation_maturity);

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={sLabelStyle}>Evidence Profile</div>
        <InfoButton size="md" text="A recruiter reading your resume in 30 seconds is asking one question: does this person prove they can do the work, or are they just listing tools? Evidence density answers that question." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
        <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.muted2 }}>Evidence Density</div>
            <InfoButton text="What percentage of your skills appear in actual job descriptions and project outcomes — not just the Skills section. A high percentage means almost all your skills have real context behind them." />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.ink, marginTop: 4 }}>{ep.evidence_density}%</div>
        </div>
        <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.muted2 }}>Recruiter Trust</div>
            <InfoButton text="How much a recruiter can trust that your listed skills are real. High trust comes from quantified outcomes, architecture ownership, and skills appearing across multiple sections." />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.ink, marginTop: 4 }}>{ep.recruiter_trust_score}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
        {ep.has_quantified_impact && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Pill bg={T.greenBg} color={T.greenInk}>✓ Measurable outcomes</Pill>
            <InfoButton text="Your resume includes specific numbers — test cases written, defects found, time saved. Recruiters treat this as the strongest possible signal that your claims are real." />
          </span>
        )}
        {ep.has_architecture_depth && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Pill bg={T.greenBg} color={T.greenInk}>✓ Framework ownership</Pill>
            <InfoButton text="Your resume shows you designed or built an automation framework, not just used one. This separates mid-level from senior candidates in recruiter evaluations." />
          </span>
        )}
        {!ep.has_cicd_integration && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Pill bg={T.amberBg} color={T.amberInk}>✗ No CI/CD</Pill>
            <InfoButton text="Your automation currently runs locally or manually triggered. Most mid-to-senior QA roles now expect tests to run automatically in a pipeline. This is the most impactful gap to fix." />
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Pill bg={maturity.bg} color={maturity.color}>{maturity.label} maturity</Pill>
          <InfoButton text="Based on the complexity of what your resume describes — framework design, parallel execution, cross-platform testing — this reflects how advanced your implementation capability appears to recruiters." />
        </span>
        {ep.keyword_stuffing_risk !== 'none' && (
          <Pill bg={T.redBg} color={T.red}>Keyword stuffing risk: {ep.keyword_stuffing_risk}</Pill>
        )}
      </div>
    </section>
  );
}
