'use client';

import { useState }              from 'react';
import Card                      from '@/src/components/ui/Card';
import ATSScoreRing               from './ATSScoreRing';
import type { BandColor, QaScoreBreakdown, QaSeniority, QaSpecialization, RecruiterConfidence } from '../types/resume.types';
import ResumeScoreBreakdown      from './ResumeScoreBreakdown';
import SkillGapCard              from './SkillGapCard';
import ResumeSuggestions         from './ResumeSuggestions';
import ResumeParsingLoader       from './ResumeParsingLoader';
import ResumeEmptyState          from './ResumeEmptyState';
import NonQaResumeState          from './NonQaResumeState';
import { NonQaResumeError }      from '../services/resume.api';
import { useResumeInsightsQuery, useParseResumeMutation } from '../hooks';
import type { ResumeInsights }   from '../types/resume.types';
import RecruiterReadinessCard    from './guidance/RecruiterReadinessCard';
import ATSImprovementPriorities  from './guidance/ATSImprovementPriorities';
import ImprovementImpactList     from './guidance/ImprovementImpactList';
import ScoreExplanationCard      from './guidance/ScoreExplanationCard';
import CareerRoadmapCard         from './guidance/CareerRoadmapCard';
import SpecializationUpgradeCard from './guidance/SpecializationUpgradeCard';
import RecruiterInsightsPanel    from './guidance/RecruiterInsightsPanel';
import CandidateActionPlan       from './guidance/CandidateActionPlan';
import MarketInsightsPanel       from './market/MarketInsightsPanel';
import LearningInsightsPanel     from './learning/LearningInsightsPanel';
import ResumeProgressPanel       from './progress/ResumeProgressPanel';
import BenchmarkingPanel         from './benchmarking/BenchmarkingPanel';
import WeightEnginePanel              from './weights/WeightEnginePanel';
import BehavioralHireabilityPanel    from './behavioral/BehavioralHireabilityPanel';
import EvidenceInsightsPanel         from './evidence/EvidenceInsightsPanel';
import Phase4IntelPanel              from './intelligence/Phase4IntelPanel';

type Tab = 'overview' | 'skills' | 'suggestions' | 'breakdown' | 'evidence' | 'coach' | 'market' | 'learn' | 'progress' | 'bench' | 'weights' | 'hire' | 'intel';

interface Props {
  resumeUrl?: string | null;
}

// ── QA metric computation ─────────────────────────────────────────────────────

function computeQAMetrics(insights: ResumeInsights) {
  const bd = insights.qa_score_breakdown;

  // Automation Coverage — ATS dimension, not skill scanning
  const automationDim = bd?.automation_testing;
  const automationPct = automationDim
    ? Math.round((automationDim.score / automationDim.max) * 100)
    : 0;
  const autoLabel =
    automationPct >= 81 ? 'Advanced'   :
    automationPct >= 61 ? 'Strong'     :
    automationPct >= 31 ? 'Developing' : 'Beginner';
  const autoSub = automationDim
    ? `${automationDim.score}/${automationDim.max} ATS points`
    : '—';

  // Framework Maturity — ATS dimension, not tool counting
  const frameworkDim = bd?.framework_expertise;
  const frameworkPct = frameworkDim
    ? Math.round((frameworkDim.score / frameworkDim.max) * 100)
    : 0;
  const frameworkLabel =
    frameworkPct >= 81 ? 'Expert'       :
    frameworkPct >= 61 ? 'Advanced'     :
    frameworkPct >= 31 ? 'Intermediate' : 'Beginner';
  const frameworkSub = frameworkDim
    ? `${frameworkDim.score}/${frameworkDim.max} ATS points`
    : '—';

  // API Testing — ATS dimension, not skill scanning
  const apiDim    = bd?.api_testing;
  const apiPct    = apiDim
    ? Math.round((apiDim.score / apiDim.max) * 100)
    : 0;
  const apiLabel  =
    apiPct >= 81 ? 'Expert'     :
    apiPct >= 61 ? 'Strong'     :
    apiPct >= 31 ? 'Developing' : 'Beginner';
  const apiAccent =
    apiPct >= 61 ? '#10b981' :
    apiPct >= 31 ? '#f59e0b' : '#94a3b8';
  const apiSub    = apiDim
    ? `${apiDim.score}/${apiDim.max} ATS points`
    : '—';

  // QA Experience — ATS dimension, not project counting
  const expDim   = bd?.qa_experience;
  const expYears = insights.experience_years ?? 0;
  const expSub   = expDim
    ? `Experience Score: ${expDim.score}/${expDim.max}`
    : '—';

  return {
    automationPct, autoLabel,    autoSub,
    frameworkLabel, frameworkSub,
    apiLabel, apiAccent, apiSub,
    expYears, expSub,
  };
}

function getBandColor(confidence: number): BandColor {
  if (confidence >= 80) return 'emerald';
  if (confidence >= 65) return 'green';
  if (confidence >= 50) return 'blue';
  if (confidence >= 30) return 'amber';
  return 'red';
}

const SENIORITY_LABEL: Record<string, string> = {
  lead:       'Lead QA Engineer',
  senior:     'Senior-Level QA',
  'mid-level': 'Mid-Level QA',
  junior:     'Junior QA',
  fresher:    'Fresher QA',
};

const SPECIALIZATION_LABEL: Record<string, string> = {
  sdet:                'SDET',
  automation_qa:       'Automation QA',
  api_testing:         'API QA',
  mobile_testing:      'Mobile QA',
  performance_testing: 'Performance QA',
  hybrid_qa:           'Hybrid QA',
  manual_qa:           'Manual QA',
};

const CAREER_LEVEL_LABEL: Record<string, string> = {
  fresher:   'Fresher',
  junior:    'Junior',
  mid_level: 'Mid-Level',
  senior:    'Senior',
  lead:      'Lead',
};

const CONFIDENCE_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  high:     { label: 'High Recruiter Confidence',   dot: '#10b981', text: 'rgba(167,243,208,0.85)' },
  medium:   { label: 'Medium Recruiter Confidence', dot: '#f59e0b', text: 'rgba(253,230,138,0.8)'  },
  low:      { label: 'Needs More Depth',             dot: '#ef4444', text: 'rgba(252,165,165,0.8)'  },
  very_low: { label: 'Insufficient Evidence',        dot: '#7f1d1d', text: 'rgba(254,202,202,0.7)'  },
};

const BD_SHORT_LABELS: Record<string, string> = {
  automation_testing:  'Automation',
  api_testing:         'API Testing',
  framework_expertise: 'Frameworks',
  performance_testing: 'Performance',
  qa_experience:       'QA Experience',
  certifications:      'Certified',
  bug_tracking:        'Bug Tracking',
  ci_cd_readiness:     'CI/CD',
};

function getTopStrengthTags(breakdown: QaScoreBreakdown): string[] {
  return (Object.entries(breakdown) as [string, { score: number; max: number }][])
    .filter(([, v]) => v.max > 0 && v.score / v.max >= 0.5)
    .sort(([, a], [, b]) => b.score / b.max - a.score / a.max)
    .slice(0, 3)
    .map(([k]) => BD_SHORT_LABELS[k] ?? k);
}

function getTopGapTags(breakdown: QaScoreBreakdown): string[] {
  return (Object.entries(breakdown) as [string, { score: number; max: number }][])
    .filter(([, v]) => v.max > 0 && v.score / v.max < 0.35)
    .sort(([, a], [, b]) => a.score / a.max - b.score / b.max)
    .slice(0, 2)
    .map(([k]) => BD_SHORT_LABELS[k] ?? k);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResumeInsightsDashboard({ resumeUrl }: Props) {
  const [tab, setTab] = useState<Tab>('overview');

  const { data: insights, isLoading, isError } = useResumeInsightsQuery();
  const parseMutation = useParseResumeMutation();

  const handleAnalyze = () => {
    parseMutation.mutate(resumeUrl ? { resume_url: resumeUrl } : {});
  };

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-surface-hover rounded w-1/2" />
          <div className="h-48 bg-surface-hover rounded-2xl" />
          <div className="h-4 bg-surface-hover rounded w-2/3" />
        </div>
      </Card>
    );
  }

  if (parseMutation.isPending) {
    return (
      <Card padding="lg">
        <ResumeParsingLoader />
      </Card>
    );
  }

  if (parseMutation.isError && parseMutation.error instanceof NonQaResumeError) {
    const err = parseMutation.error;
    return (
      <Card padding="lg">
        <NonQaResumeState
          domainLabel={err.domain_label}
          domainConfidence={err.domain_confidence}
          message={err.message}
        />
      </Card>
    );
  }

  if (!insights || isError) {
    return (
      <Card padding="lg">
        <ResumeEmptyState
          onAnalyze={handleAnalyze}
          isParsing={parseMutation.isPending}
          hasResume={!!resumeUrl}
        />
      </Card>
    );
  }

  const qa              = computeQAMetrics(insights);
  const atsScore        = insights.qa_match_score ?? 0;
  const trustScore      = insights.recruiter_trust_score;
  const capabilityScore = insights.capability_score;

  return (
    <div className="space-y-3">

      {/* ── QA metric cards (always shown) ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <QAMetricCard icon={<BoltIcon />}   label="Automation Coverage" value={`${qa.automationPct}%`}                              sub={qa.autoSub}      accent="#6366f1"      />
        <QAMetricCard icon={<LayersIcon />} label="Framework Maturity"  value={qa.frameworkLabel}                                    sub={qa.frameworkSub} accent="#06b6d4"      />
        <QAMetricCard icon={<ApiIcon />}    label="API Testing"         value={qa.apiLabel}                                         sub={qa.apiSub}       accent={qa.apiAccent} />
        <QAMetricCard icon={<ClockIcon />}  label="QA Experience"       value={`${qa.expYears} Yr${qa.expYears !== 1 ? 's' : ''}`} sub={qa.expSub}       accent="#8b5cf6"      />
      </div>

      {/* ── Four recruiter-facing signal cards ────────────────────────────── */}
      {trustScore != null && capabilityScore != null && (
        <div className="grid grid-cols-2 gap-2">
          <CredibilitySignalCard
            label="ATS Score"
            sublabel="QA profile match score"
            value={`${atsScore}`}
            suffix="/100"
            color={
              atsScore >= 70 ? '#10b981' :
              atsScore >= 50 ? '#6366f1' :
              atsScore >= 35 ? '#f59e0b' : '#ef4444'
            }
          />
          <CredibilitySignalCard
            label="Capability"
            sublabel="Ability to execute QA responsibilities"
            value={`${capabilityScore}`}
            suffix="/100"
            color={
              capabilityScore >= 70 ? '#10b981' :
              capabilityScore >= 50 ? '#6366f1' :
              capabilityScore >= 35 ? '#f59e0b' : '#ef4444'
            }
          />
          <CredibilitySignalCard
            label="Credibility"
            sublabel="Evidence-backed trust score"
            value={`${trustScore}`}
            suffix="/100"
            color={
              trustScore >= 70 ? '#10b981' :
              trustScore >= 50 ? '#6366f1' :
              trustScore >= 35 ? '#f59e0b' : '#ef4444'
            }
          />
          {insights.recruiter_readiness && (
            <CredibilitySignalCard
              label="Recruiter Readiness"
              sublabel="Estimated shortlist probability"
              value={`${insights.recruiter_readiness.shortlist_probability}`}
              suffix="%"
              color={
                insights.recruiter_readiness.shortlist_probability >= 72 ? '#10b981' :
                insights.recruiter_readiness.shortlist_probability >= 52 ? '#6366f1' :
                insights.recruiter_readiness.shortlist_probability >= 38 ? '#f59e0b' : '#ef4444'
              }
            />
          )}
        </div>
      )}

      {/* ── Re-analyze action bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-micro text-subtle">
          {insights.qa_match_score != null ? `ATS Score: ${insights.qa_match_score}` : 'Run analysis to get your score'}
        </p>
        <button
          onClick={handleAnalyze}
          disabled={parseMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          {parseMutation.isPending ? 'Analyzing…' : 'Re-analyze'}
        </button>
      </div>

      {/* ── Tab navigation ────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface-hover p-1 rounded-2xl overflow-x-auto">
        {(['overview', 'skills', 'breakdown', 'evidence', 'coach', 'market', 'learn', 'progress', 'bench', 'weights', 'hire', 'intel'] as Tab[]).map(t => {
          const LABELS: Record<Tab, string> = {
            overview:    'Overview',
            skills:      'Skills',
            suggestions: 'Insights',
            breakdown:   'Score',
            evidence:    'Evidence',
            coach:       'Coach',
            market:      'Market',
            learn:       'Learn',
            progress:    'Progress',
            bench:       'Bench',
            weights:     'Weights',
            hire:        'Hire IQ',
            intel:       'Intel',
          };
          const ACTIVE_CLASS: Record<string, string> = {
            evidence: 'bg-violet-700 text-white shadow-sm',
            coach:    'bg-indigo-600 text-white shadow-sm',
            market:   'bg-slate-900 text-white shadow-sm',
            learn:    'bg-emerald-600 text-white shadow-sm',
            progress: 'bg-violet-600 text-white shadow-sm',
            bench:    'bg-cyan-700 text-white shadow-sm',
            weights:  'bg-orange-600 text-white shadow-sm',
            hire:     'bg-rose-600 text-white shadow-sm',
            intel:    'bg-purple-700 text-white shadow-sm',
          };
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-[12px] font-semibold rounded-xl transition-all whitespace-nowrap ${
                tab === t
                  ? (ACTIVE_CLASS[t] ?? 'bg-surface text-heading shadow-sm')
                  : 'text-muted hover:text-body'
              }`}
            >
              {LABELS[t]}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      {tab === 'evidence' ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(160deg, #0d0a1e 0%, #160d2e 60%, #0d0a1e 100%)',
            border: '1px solid rgba(109,40,217,0.18)',
          }}
        >
          <EvidenceInsightsPanel insights={insights} />
        </div>
      ) : tab === 'coach' ? (
        <CoachTab insights={insights} onReanalyze={handleAnalyze} />
      ) : tab === 'market' ? (
        <MarketInsightsPanel candidateSpec={insights.qa_specialization} />
      ) : tab === 'learn' ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(160deg, #080d1c 0%, #0d1a2e 60%, #080d1c 100%)',
            border: '1px solid rgba(16,185,129,0.15)',
          }}
        >
          <LearningInsightsPanel />
        </div>
      ) : tab === 'progress' ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(160deg, #0a0714 0%, #120d28 60%, #0a0714 100%)',
            border: '1px solid rgba(139,92,246,0.15)',
          }}
        >
          <ResumeProgressPanel />
        </div>
      ) : tab === 'bench' ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(160deg, #020f18 0%, #051824 60%, #020f18 100%)',
            border: '1px solid rgba(6,182,212,0.15)',
          }}
        >
          <BenchmarkingPanel />
        </div>
      ) : tab === 'weights' ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(160deg, #130a00 0%, #1f1000 60%, #130a00 100%)',
            border: '1px solid rgba(234,88,12,0.15)',
          }}
        >
          <WeightEnginePanel />
        </div>
      ) : tab === 'hire' ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(160deg, #140008 0%, #200010 60%, #140008 100%)',
            border: '1px solid rgba(225,29,72,0.15)',
          }}
        >
          <BehavioralHireabilityPanel />
        </div>
      ) : tab === 'intel' ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(160deg, #0d0820 0%, #160d30 60%, #0d0820 100%)',
            border: '1px solid rgba(126,34,206,0.18)',
          }}
        >
          <Phase4IntelPanel
            firstImpression={insights.first_impression ?? null}
            authenticityProfile={insights.authenticity_profile ?? null}
            trajectoryProfile={insights.trajectory_profile ?? null}
            trustBreakdown={insights.trust_breakdown ?? null}
            riskFlags={insights.risk_flags ?? null}
            overallRiskScore={insights.overall_risk_score ?? null}
            overallRiskLevel={insights.overall_risk_level ?? null}
            recommendationMode={insights.recommendation_mode ?? null}
          />
        </div>
      ) : (
        <Card padding="lg">
          {tab === 'overview'    && <OverviewTab insights={insights} />}
          {tab === 'skills'      && (
            <SkillGapCard
              extracted={insights.extracted_skills}
              missing={insights.missing_skills}
              suggested={insights.suggested_keywords}
            />
          )}
          {tab === 'suggestions' && (
            <ResumeSuggestions
              strengths={insights.strengths}
              weaknesses={insights.weaknesses}
              suggestions={insights.suggestions}
            />
          )}
          {tab === 'breakdown'   && insights.qa_score_breakdown && (
            <ResumeScoreBreakdown breakdown={insights.qa_score_breakdown} />
          )}
          {tab === 'breakdown'   && !insights.qa_score_breakdown && (
            <p className="text-sm text-subtle text-center py-8">
              Re-analyze your resume to see the QA breakdown.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

// ── Coach Tab ─────────────────────────────────────────────────────────────────

function CoachTab({ insights, onReanalyze }: { insights: ResumeInsights; onReanalyze: () => void }) {
  const hasGuidance = !!(insights.score_explanations || insights.improvement_priorities || insights.recruiter_insights);

  if (!hasGuidance) {
    return (
      <div className="bg-surface rounded-2xl border border-token p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-body mb-1">Coaching data not yet generated</p>
          <p className="text-xs text-subtle leading-relaxed">
            Your resume was parsed before the coaching engine was enabled.<br />Re-analyze to generate your personalized career guidance.
          </p>
        </div>
        <button
          onClick={onReanalyze}
          className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Re-analyze Resume
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.recruiter_readiness && (
        <RecruiterReadinessCard data={insights.recruiter_readiness} />
      )}
      {insights.score_explanations && (
        <ScoreExplanationCard data={insights.score_explanations} qaMatchScore={insights.qa_match_score} />
      )}
      {insights.improvement_priorities && (
        <ATSImprovementPriorities data={insights.improvement_priorities} />
      )}
      {insights.improvement_impacts && insights.improvement_impacts.length > 0 && (
        <ImprovementImpactList data={insights.improvement_impacts} />
      )}
      {insights.specialization_guidance && (
        <SpecializationUpgradeCard data={insights.specialization_guidance} />
      )}
      {insights.career_roadmap && (
        <CareerRoadmapCard data={insights.career_roadmap} />
      )}
      {insights.recruiter_insights && (
        <RecruiterInsightsPanel data={insights.recruiter_insights} />
      )}
      {insights.action_plan && (
        <CandidateActionPlan data={insights.action_plan} />
      )}
    </div>
  );
}

// ── QA Metric Card ────────────────────────────────────────────────────────────

interface MetricProps {
  icon:   React.ReactNode;
  label:  string;
  value:  string;
  sub:    string;
  accent: string;
}

function QAMetricCard({ icon, label, value, sub, accent }: MetricProps) {
  return (
    <div
      className="rounded-2xl p-3 space-y-2"
      style={{
        background: `${accent}0d`,
        border: `1px solid ${accent}22`,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: `${accent}20`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-subtle">{label}</p>
        <p className="text-[18px] font-black text-heading leading-tight mt-0.5">{value}</p>
        <p className="text-[10px] font-medium mt-0.5" style={{ color: accent }}>{sub}</p>
      </div>
    </div>
  );
}

// SVG icons (14×14)
const BoltIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const LayersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const ApiIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
const ClockIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

// ── Certification normalizer (deduplicates + canonicalizes known cert names) ──

const CERT_CANONICAL: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /istqb/i,                            canonical: 'ISTQB Certified Tester'               },
  { pattern: /selenium/i,                         canonical: 'Selenium WebDriver Certification'     },
  { pattern: /appium/i,                           canonical: 'Appium Mobile Testing Certification'  },
  { pattern: /aws/i,                              canonical: 'AWS Certification'                    },
  { pattern: /azure/i,                            canonical: 'Microsoft Azure Certification'        },
  { pattern: /scrum|agile/i,                      canonical: 'Agile / Scrum Certification'          },
  { pattern: /jira|atlassian/i,                   canonical: 'Jira / Atlassian Certification'       },
  { pattern: /jmeter|gatling|k6|performance/i,    canonical: 'Performance Testing Certification'    },
  { pattern: /cypress/i,                          canonical: 'Cypress Automation Certification'     },
  { pattern: /playwright/i,                       canonical: 'Playwright Certification'             },
];

function normalizeCertifications(certs: string[]): string[] {
  const seen   = new Set<string>();
  const result: string[] = [];
  for (const cert of certs) {
    let canonical: string | null = null;
    for (const { pattern, canonical: c } of CERT_CANONICAL) {
      if (pattern.test(cert)) { canonical = c; break; }
    }
    const key = (canonical ?? cert).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(canonical ?? cert);
    }
  }
  return result;
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ insights }: { insights: ResumeInsights }) {
  const shortlistReasons = (insights.strengths || []).slice(0, 5);
  const potentialGaps    = (insights.weaknesses || []).slice(0, 4);
  const expYears         = insights.experience_years ?? 0;
  const normalizedCerts  = normalizeCertifications(insights.certification_entries ?? []);

  // Profile headline parts
  const specLabel   = insights.qa_specialization ? (SPECIALIZATION_LABEL[insights.qa_specialization] ?? null) : null;
  const levelLabel  = insights.career_level      ? (CAREER_LEVEL_LABEL[insights.career_level]        ?? null) : null;
  const yearsLabel  = expYears > 0 ? `${expYears} yr${expYears !== 1 ? 's' : ''}` : null;
  const headlineParts = [specLabel, levelLabel, yearsLabel].filter(Boolean);

  return (
    <div className="space-y-5">

      {/* Profile headline */}
      {headlineParts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {headlineParts.map((part, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300 text-[11px]">·</span>}
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: '#eef2ff', color: '#4f46e5' }}
              >
                {part}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Why recruiters will shortlist */}
      {shortlistReasons.length > 0 && (
        <div>
          <SectionHeading text="Why Recruiters Will Shortlist This" />
          <div className="space-y-1.5">
            {shortlistReasons.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-sm text-body leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Potential gaps */}
      {potentialGaps.length > 0 && (
        <div>
          <SectionHeading text="Potential Gaps" />
          <div className="space-y-1.5">
            {potentialGaps.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                </div>
                <span className="text-sm text-body-secondary leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work experience */}
      {insights.experience_entries.length > 0 && (
        <div>
          <SectionHeading
            text={expYears > 0 ? `Work Experience (${expYears} yr${expYears !== 1 ? 's' : ''})` : 'Work Experience'}
          />
          {insights.experience_entries.map((e, i) => (
            <div key={i} className="flex gap-3 py-2.5 border-b border-token last:border-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading truncate">{e.title || e.company}</p>
                {e.title && e.company && (
                  <p className="text-micro text-muted truncate">{e.company}</p>
                )}
                {e.duration && (
                  <p className="text-micro text-indigo-400 font-medium mt-0.5">{e.duration}</p>
                )}
                {e.description && (
                  <p className="text-micro text-subtle mt-1 leading-snug">
                    {e.description.length > 120 ? `${e.description.slice(0, 120)}…` : e.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {insights.education_entries.length > 0 && (
        <div>
          <SectionHeading text="Education" />
          {insights.education_entries.map((e, i) => (
            <div key={i} className="flex gap-3 py-2.5 border-b border-token last:border-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading truncate">{e.degree}</p>
                {e.institution && (
                  <p className="text-micro text-muted truncate">{e.institution}</p>
                )}
                {e.year && (
                  <p className="text-micro text-purple-400 font-medium mt-0.5">{e.year}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {normalizedCerts.length > 0 && (
        <div>
          <SectionHeading text="Certifications" />
          {normalizedCerts.map((c, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <span className="text-amber-400 text-sm shrink-0">★</span>
              <span className="text-sm text-body">{c}</span>
            </div>
          ))}
        </div>
      )}

      {insights.experience_entries.length === 0 &&
       insights.education_entries.length === 0 &&
       normalizedCerts.length === 0 && (
        <p className="text-sm text-subtle text-center py-6">
          No structured data found. Ensure your resume has clear section headers.
        </p>
      )}
    </div>
  );
}

function SectionHeading({ text }: { text: string }) {
  return (
    <h4 className="text-micro font-bold text-subtle uppercase tracking-[0.1em] mb-2.5">
      {text}
    </h4>
  );
}

// ── Capability vs Credibility Signal Card (Fix 9) ─────────────────────────────

interface CredibilitySignalProps {
  label:    string;
  sublabel: string;
  value:    string;
  suffix:   string;
  color:    string;
}

function CredibilitySignalCard({ label, sublabel, value, suffix, color }: CredibilitySignalProps) {
  return (
    <div
      className="rounded-2xl px-3 py-2.5 flex items-center gap-3"
      style={{ background: `${color}0d`, border: `1px solid ${color}22` }}
    >
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ background: color }}
      />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-subtle">{label}</p>
        <p className="text-[18px] font-black leading-tight" style={{ color }}>
          {value}<span className="text-[11px] font-semibold text-subtle">{suffix}</span>
        </p>
        <p className="text-[10px] text-subtle mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}

