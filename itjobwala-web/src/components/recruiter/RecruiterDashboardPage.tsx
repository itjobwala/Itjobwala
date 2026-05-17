'use client';

import Link from 'next/link';
import RecruiterShell from './RecruiterShell';
import DashboardStats from './DashboardStats';
import RecentApplicants from './RecentApplicants';
import PostedJobs from './PostedJobs';
import HiringPipeline from './HiringPipeline';
import ActivityFeed from './ActivityFeed';
import QuickActions from './QuickActions';
import SubscriptionCard from './SubscriptionCard';
import { useRecruiterCompanyProfileQuery } from '@/src/hooks/useRecruiter';

export default function RecruiterDashboardPage() {
  const { data: company } = useRecruiterCompanyProfileQuery();
  const companyName = company?.companyName || 'TechNova Solutions';
  const firstName = company?.fullName?.split(' ')[0] || 'User';

  return (
    <RecruiterShell>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1
              className="text-[22px] sm:text-[26px] font-extrabold text-[#0f172a] leading-tight"
              style={{ letterSpacing: '-0.6px' }}
            >
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-[14px] text-gray-500 mt-1">
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

        {/* Recent applicants */}
        <RecentApplicants />

        {/* Jobs + sidebar cards */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <PostedJobs />
          <div className="space-y-5">
            <QuickActions />
            <SubscriptionCard />
          </div>
        </div>

        {/* Pipeline + activity */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          <HiringPipeline />
          <ActivityFeed />
        </div>

      </div>
    </RecruiterShell>
  );
}
