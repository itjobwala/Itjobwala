'use client';

import React from 'react';
import StatCard from './StatCard';

const STAT_CONFIGS = [
  {
    key: 'active_jobs' as const,
    changeKey: 'active_jobs_change' as const,
    label: 'Active Jobs',
    iconBg: 'bg-blue-50', iconColor: 'text-primary',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    key: 'total_applicants' as const,
    changeKey: 'applicants_change' as const,
    label: 'Total Applicants',
    iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'interviews_scheduled' as const,
    changeKey: 'interviews_change' as const,
    label: 'Interviews Scheduled',
    iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    key: 'offers_made' as const,
    changeKey: 'offers_change' as const,
    label: 'Offers Made',
    iconBg: 'bg-green-50', iconColor: 'text-green-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

export default function DashboardStats() {
  const mockStats = {
    active_jobs: 12,
    active_jobs_change: 2,
    total_applicants: 48,
    applicants_change: 5,
    interviews_scheduled: 8,
    interviews_change: -1,
    offers_made: 3,
    offers_change: 1,
  };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {STAT_CONFIGS.map(cfg => {
        const value  = mockStats[cfg.key] ?? 0;
        const change = mockStats[cfg.changeKey] ?? 0;
        return (
          <StatCard
            key={cfg.label}
            label={cfg.label}
            value={value}
            trend={`${Math.abs(change)} ${change === 1 ? 'this week' : 'this week'}`}
            trendUp={change >= 0}
            icon={cfg.icon}
            iconBg={cfg.iconBg}
            iconColor={cfg.iconColor}
          />
        );
      })}
    </div>
  );
}
