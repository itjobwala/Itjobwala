'use client';

import { Suspense }                  from 'react';
import { ProtectedRoute }            from '@/features/auth';
import { SmartNavbar }               from '@/layout/navbar';
import { ResumeInsightsDashboard }   from '@/features/resume';
import { useCandidateProfileQuery }  from '@/features/candidate/profile';
import Skeleton                      from '@/src/components/ui/Skeleton';

function ResumePageContent() {
  const { data: profile } = useCandidateProfileQuery();
  const resumeUrl = profile?.resume?.url ?? null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
          Resume Intelligence
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          ATS scoring, skill gap analysis, and personalized improvement suggestions.
        </p>
      </div>
      <ResumeInsightsDashboard resumeUrl={resumeUrl} />
    </div>
  );
}

export default function ResumePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc]">
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
