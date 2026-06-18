'use client';

import { Suspense }               from 'react';
import { ProtectedRoute }         from '@/features/auth';
import { SmartNavbar }            from '@/layout/navbar';
import {
  ATSScoreRing,
  SkillGapCard,
  ResumeScoreBreakdown,
  ResumeEmptyState,
  useResumeInsightsQuery,
  useParseResumeMutation,
} from '@/features/resume';
import { useCandidateProfileQuery } from '@/features/candidate/profile';

function ResumePageContent() {
  const { data: profile }                      = useCandidateProfileQuery();
  const { data: insights, isLoading }          = useResumeInsightsQuery();
  const parseMutation                          = useParseResumeMutation();

  const resume    = profile?.resume ?? null;
  const hasResume = !!resume;

  const handleAnalyze = async () => {
    await parseMutation.mutateAsync({ resume_url: resume?.url ?? undefined });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-extrabold text-heading" style={{ letterSpacing: '-0.5px' }}>
          My Resume
        </h1>
        <p className="text-[13px] text-muted mt-1">
          Upload your resume and see how you score for QA roles.
        </p>
      </div>

      {/* Section 1 — Resume upload status */}
      <div className="bg-white rounded-2xl border border-token p-6">
        {!hasResume ? (
          <ResumeEmptyState
            onAnalyze={handleAnalyze}
            isParsing={parseMutation.isPending}
            hasResume={false}
          />
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading truncate">{resume.file_name}</p>
                <p className="text-caption text-muted mt-0.5">
                  Uploaded {new Date(resume.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <a
              href="/candidate/profile"
              className="shrink-0 text-sm font-semibold text-primary border border-primary/30 rounded-xl px-4 py-2 hover:bg-primary/5 transition-colors"
            >
              Update Resume
            </a>
          </div>
        )}
      </div>

      {/* Section 2 — ATS Score + QA Fit */}
      {hasResume && (
        <div className="bg-white rounded-2xl border border-token p-6">
          <h2 className="text-base font-bold text-heading mb-4">ATS Score &amp; QA Fit</h2>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-44 bg-surface-alt rounded-xl" />
              <div className="h-28 bg-surface-alt rounded-xl" />
            </div>
          ) : !insights ? (
            <ResumeEmptyState
              onAnalyze={handleAnalyze}
              isParsing={parseMutation.isPending}
              hasResume={true}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <ATSScoreRing
                  score={insights.qa_match_score}
                  label={insights.band_label}
                  color={insights.band_color}
                  size={180}
                />
              </div>
              <ResumeScoreBreakdown breakdown={insights.qa_score_breakdown} />
            </div>
          )}
        </div>
      )}

      {/* Section 3 — Skill Gaps */}
      {insights && (
        <div className="bg-white rounded-2xl border border-token p-6">
          <h2 className="text-base font-bold text-heading mb-4">Skill Gaps</h2>
          <SkillGapCard
            extracted={insights.extracted_skills}
            missing={insights.missing_skills}
            suggested={insights.suggested_keywords}
          />
        </div>
      )}

    </div>
  );
}

export default function ResumePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-alt">
        <SmartNavbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pt-20">
          <Suspense fallback={
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48" />
              <div className="h-64 bg-white rounded-2xl border border-gray-100" />
            </div>
          }>
            <ResumePageContent />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  );
}
