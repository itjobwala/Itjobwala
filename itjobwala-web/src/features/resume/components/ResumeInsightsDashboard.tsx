'use client';

import { useState } from 'react';
import Card          from '@/src/components/ui/Card';
import ATSScoreRing          from './ATSScoreRing';
import ResumeScoreBreakdown  from './ResumeScoreBreakdown';
import SkillGapCard          from './SkillGapCard';
import ResumeSuggestions     from './ResumeSuggestions';
import ResumeParsingLoader   from './ResumeParsingLoader';
import ResumeEmptyState      from './ResumeEmptyState';
import { useResumeInsightsQuery, useParseResumeMutation } from '../hooks';
import type { ResumeInsights } from '../types/resume.types';

type Tab = 'overview' | 'skills' | 'suggestions' | 'breakdown';

interface Props {
  resumeUrl?: string | null;
}

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
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded" />
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

  return (
    <div className="space-y-4">
      {/* Header row: ATS ring + meta stats */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <ATSScoreRing
            score={insights.ats_score}
            label={insights.band_label}
            color={insights.band_color}
            size={140}
          />
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">ATS Analysis</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Last analyzed {formatRelative(insights.last_parsed_at)}
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={parseMutation.isPending}
                className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Re-analyze ↺
              </button>
            </div>
            <StatsGrid insights={insights} />
          </div>
        </div>
      </Card>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {(['overview', 'skills', 'suggestions', 'breakdown'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[13px] font-semibold rounded-lg transition-all capitalize ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'breakdown' ? 'Score' : t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Card padding="lg">
        {tab === 'overview' && <OverviewTab insights={insights} />}
        {tab === 'skills' && (
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
        {tab === 'breakdown' && (
          <ResumeScoreBreakdown breakdown={insights.score_breakdown} />
        )}
      </Card>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatsGrid({ insights }: { insights: ResumeInsights }) {
  const stats = [
    { label: 'Skills Found',   value: insights.total_skills_found,       suffix: '' },
    { label: 'Experience',     value: `${insights.experience_years} yr${insights.experience_years !== 1 ? 's' : ''}`, suffix: '' },
    { label: 'Profile Score',  value: insights.profile_completion_score, suffix: '%' },
    { label: 'Word Count',     value: insights.word_count,               suffix: '' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-gray-50 rounded-xl p-3">
          <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
          <p className="text-[18px] font-bold text-gray-900 mt-0.5">
            {s.value}{s.suffix}
          </p>
        </div>
      ))}
    </div>
  );
}

function OverviewTab({ insights }: { insights: ResumeInsights }) {
  return (
    <div className="space-y-4">
      {/* Experience entries */}
      {insights.experience_entries.length > 0 && (
        <Section title="Work Experience">
          {insights.experience_entries.map((e, i) => (
            <div key={i} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">{e.title || e.company}</p>
                {e.title && e.company && <p className="text-[12px] text-gray-500">{e.company}</p>}
                {e.duration && <p className="text-[11px] text-gray-400 mt-0.5">{e.duration}</p>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {insights.education_entries.length > 0 && (
        <Section title="Education">
          {insights.education_entries.map((e, i) => (
            <div key={i} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">{e.degree}</p>
                {e.institution && <p className="text-[12px] text-gray-500">{e.institution}</p>}
                {e.year && <p className="text-[11px] text-gray-400 mt-0.5">{e.year}</p>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {insights.certification_entries.length > 0 && (
        <Section title="Certifications">
          <div className="space-y-1.5">
            {insights.certification_entries.map((c, i) => (
              <div key={i} className="flex gap-2 text-[13px] text-gray-700">
                <span className="text-amber-500 shrink-0">★</span>
                {c}
              </div>
            ))}
          </div>
        </Section>
      )}

      {insights.experience_entries.length === 0 && insights.education_entries.length === 0 && (
        <p className="text-[13px] text-gray-400 text-center py-4">
          No structured data extracted. Ensure your resume has clear section headers.
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
