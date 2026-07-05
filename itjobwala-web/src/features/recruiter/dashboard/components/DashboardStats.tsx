'use client';

import React from 'react';
import StatCard from './StatCard';
import QueryErrorState from '@/src/components/ui/QueryErrorState';
import { useRecruiterStatsQuery, useDashboardStatsQuery } from '@/features/recruiter/hooks';

const STAT_CONFIGS = [
  {
    key: 'activeJobs' as const,
    label: 'Active Jobs',
    iconBg: 'bg-blue-50', iconColor: 'text-primary',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    key: 'totalApplicants' as const,
    label: 'Total Applicants',
    iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'interviewsScheduled' as const,
    label: 'Interviews Scheduled',
    iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="4" width="20" height="20" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    key: 'hired' as const,
    label: 'Hired',
    iconBg: 'bg-green-50', iconColor: 'text-green-600',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

export default function DashboardStats() {
  const { data, isLoading, isError, refetch } = useRecruiterStatsQuery();
  const { data: dashStats } = useDashboardStatsQuery();

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load your stats. Please retry."
        onRetry={() => refetch()}
      />
    );
  }

  const pvChange = dashStats?.profile_views_change ?? 0;
  const pvTrend  = pvChange !== 0 ? String(Math.abs(pvChange)) : '';

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
      {STAT_CONFIGS.map(cfg => {
        const value = isLoading ? '—' : (data?.[cfg.key] ?? 0);
        return (
          <StatCard
            key={cfg.label}
            label={cfg.label}
            value={value}
            trend=""
            trendUp={true}
            icon={cfg.icon}
            iconBg={cfg.iconBg}
            iconColor={cfg.iconColor}
          />
        );
      })}
      <StatCard
        label="Candidates Viewed"
        value={isLoading ? '—' : (dashStats?.profile_views ?? 0)}
        trend={pvTrend}
        trendUp={pvChange >= 0}
        iconBg="bg-teal-50"
        iconColor="text-teal-600"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
      />
    </div>
  );
}
