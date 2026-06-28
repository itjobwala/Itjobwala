'use client';

import { Suspense }            from 'react';
import { ProtectedRoute }      from '@/features/auth';
import { SmartNavbar }         from '@/layout/navbar';
import ResumeInsightsDashboard from '@/src/features/resume/components/ResumeInsightsDashboard';

function ResumePageContent() {
  return <ResumeInsightsDashboard />;
}

export default function ResumePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: '#0c0e0f' }}>
        <SmartNavbar />
        <div className="max-w-[880px] mx-auto px-4 sm:px-6 py-6 pt-20">
          <Suspense fallback={
            <div className="space-y-4 animate-pulse">
              <div className="h-8 rounded w-48" style={{ background: '#202324' }} />
              <div className="h-64 rounded-2xl" style={{ background: '#181a1b', border: '1px solid #2a2e30' }} />
            </div>
          }>
            <ResumePageContent />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  );
}
