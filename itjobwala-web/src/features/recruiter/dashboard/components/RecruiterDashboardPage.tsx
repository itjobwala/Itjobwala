'use client';

import Link from 'next/link';
import { RecruiterShell } from '@/layout/shell';
import ErrorBoundary from '@/src/components/ui/ErrorBoundary';
import DashboardStats from './DashboardStats';
import RecentApplicants from './RecentApplicants';
import TopCandidatesCard from './TopCandidatesCard';
import PostedJobs from './PostedJobs';
import HiringPipeline from './HiringPipeline';
import ActivityFeed from './ActivityFeed';
import { useRecruiterCompanyProfileQuery } from '@/features/recruiter/hooks';

export default function RecruiterDashboardPage() {
  const { data: company } = useRecruiterCompanyProfileQuery();
  const companyName = company?.companyName || 'TechNova Solutions';
  const firstName = company?.fullName?.split(' ')[0] || 'User';

  return (
    <ErrorBoundary>
    <RecruiterShell>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 space-y-6">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-heading leading-tight"
              style={{ letterSpacing: '-0.6px' }}
            >
              Welcome, {firstName} 👋
            </h1>
            <p className="text-base text-muted mt-1">
              {companyName} &middot; Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/recruiter/applicants"
              className="text-[13px] font-bold text-primary border border-primary/25 bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors"
            >
              View Applicants
            </Link>
          </div>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Top candidates + Recent applicants side by side on large screens */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <TopCandidatesCard />
          <RecentApplicants />
        </div>

        {/* Jobs */}
        <PostedJobs />

        {/* Pipeline + activity */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
          <HiringPipeline />
          <ActivityFeed />
        </div>

      </div>
    </RecruiterShell>
    </ErrorBoundary>
  );
}
