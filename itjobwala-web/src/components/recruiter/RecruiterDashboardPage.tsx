'use client';

import { useState } from 'react';
import Link from 'next/link';
import RecruiterNavbar from './RecruiterNavbar';
import RecruiterSidebar from './RecruiterSidebar';
import DashboardStats from './DashboardStats';
import RecentApplicants from './RecentApplicants';
import PostedJobs from './PostedJobs';
import HiringPipeline from './HiringPipeline';
import ActivityFeed from './ActivityFeed';
import QuickActions from './QuickActions';
import SubscriptionCard from './SubscriptionCard';

export default function RecruiterDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faff]" style={{ fontFamily: 'var(--font-sora)' }}>
      <RecruiterNavbar />

      <div className="pt-[68px] flex">
        <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 lg:ml-[240px] min-w-0 overflow-x-hidden">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

            {/* ── Welcome Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1
                  className="text-[22px] sm:text-[26px] font-extrabold text-[#0f172a] leading-tight"
                  style={{ letterSpacing: '-0.6px' }}
                >
                  Welcome back, Priya 👋
                </h1>
                <p className="text-[14px] text-gray-500 mt-1">
                  TechNova Solutions &middot; Here&apos;s what&apos;s happening today.
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

            {/* Footer note */}
            <div className="text-center py-4">
              <p className="text-[12px] text-gray-400">
                itJobwala Recruiter Dashboard &middot; Pro Plan
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
