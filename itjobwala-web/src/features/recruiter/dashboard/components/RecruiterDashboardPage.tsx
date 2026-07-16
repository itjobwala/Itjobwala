'use client';

import Link from 'next/link';
import { RecruiterShell } from '@/layout/shell';
import ErrorBoundary from '@/src/components/ui/ErrorBoundary';
import { buttonVariants } from '@/src/components/ui/Button';
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
      <div className="container-responsive mx-auto px-5 sm:px-8 py-8 space-y-6">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h3
              className="text-h3 text-heading leading-tight"
              style={{ letterSpacing: '-0.6px' }}
            >
              Welcome, {firstName} 👋
            </h3>
            <p className="text-body-text text-muted mt-1">
              {companyName} &middot; Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/recruiter/applicants"
              className={buttonVariants({ variant: 'primary', size: 'sm', className: 'px-4' })}
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
