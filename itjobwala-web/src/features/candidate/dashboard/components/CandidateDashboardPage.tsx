'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { SmartNavbar } from '@/layout/navbar';
import { ProtectedRoute } from '@/features/auth';
import { fetchCandidateDashboard } from '../services/dashboard.api';
import type { RecentApplication } from '../services/dashboard.api';

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  applied:     'bg-blue-50 text-blue-700',
  shortlisted: 'bg-purple-50 text-purple-700',
  interview:   'bg-yellow-50 text-yellow-700',
  offer:       'bg-green-50 text-green-700',
  selected:    'bg-green-50 text-green-700',
  hired:       'bg-green-50 text-green-700',
  rejected:    'bg-red-50 text-red-600',
  withdrawn:   'bg-gray-50 text-gray-500',
};

function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] ?? 'bg-gray-50 text-gray-500'}`}>
      {label}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0f172a]">{value}</p>
        <p className="text-[13px] text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-28 bg-gray-100 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CandidateDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['candidate-dashboard'],
    queryFn:  fetchCandidateDashboard,
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f9fafb]">
        <SmartNavbar />
        <div className="pt-[68px]">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8 space-y-6">

            {isLoading && <DashboardSkeleton />}

            {isError && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-600 text-sm">
                Failed to load dashboard. Please refresh.
              </div>
            )}

            {data && (
              <>
                {/* ── Profile header ── */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {data.user.profilePhoto ? (
                      <Image src={data.user.profilePhoto} alt="Profile" width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {data.user.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-[#0f172a]">{data.user.fullName}</h1>
                      {data.user.openToWork && (
                        <span className="text-[11px] font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">Open to work</span>
                      )}
                    </div>
                    {data.user.title && <p className="text-[14px] text-gray-500 mt-0.5">{data.user.title}</p>}
                    {data.user.location && <p className="text-[13px] text-gray-400 mt-0.5">{data.user.location}</p>}

                    {/* Profile completion bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] text-gray-500">Profile completion</span>
                        <span className="text-[12px] font-semibold text-primary">{data.user.profileCompletion}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${data.user.profileCompletion}%` }} />
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/candidate/profile/edit"
                    className="flex-shrink-0 text-[13px] font-semibold text-primary border border-primary/30 rounded-xl px-4 py-2 hover:bg-primary/5 transition-colors"
                  >
                    Edit Profile
                  </Link>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard
                    label="Total Applied"
                    value={data.stats.totalApplications}
                    color="bg-blue-50"
                    icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
                  />
                  <StatCard
                    label="Shortlisted"
                    value={data.stats.shortlisted}
                    color="bg-purple-50"
                    icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>}
                  />
                  <StatCard
                    label="Interviews"
                    value={data.stats.interviews}
                    color="bg-yellow-50"
                    icon={<svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
                  />
                  <StatCard
                    label="Offers"
                    value={data.stats.offers}
                    color="bg-green-50"
                    icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v13m0-13V6a4 4 0 00-4-4H5.45a1 1 0 00-.962 1.272L6 8h6zm0 0h6l1.512-4.728A1 1 0 0022.55 2H18a4 4 0 00-4 4v2z"/></svg>}
                  />
                  <StatCard
                    label="Rejected"
                    value={data.stats.rejected}
                    color="bg-red-50"
                    icon={<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>}
                  />
                  <StatCard
                    label="Saved Jobs"
                    value={data.stats.savedJobs}
                    color="bg-orange-50"
                    icon={<svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>}
                  />
                </div>

                {/* ── Quick actions ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { href: '/candidate/jobs',         label: 'Browse Jobs',       icon: '🔍' },
                    { href: '/candidate/applications',  label: 'My Applications',   icon: '📋' },
                    { href: '/candidate/saved-jobs',    label: 'Saved Jobs',        icon: '🔖' },
                    { href: '/candidate/profile',       label: 'View Profile',      icon: '👤' },
                  ].map(a => (
                    <Link
                      key={a.href}
                      href={a.href}
                      className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/30 hover:shadow-sm transition-all text-center"
                    >
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-[13px] font-semibold text-[#0f172a]">{a.label}</span>
                    </Link>
                  ))}
                </div>

                {/* ── Recent applications ── */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-[15px] font-bold text-[#0f172a]">Recent Applications</h2>
                    <Link href="/candidate/applications" className="text-[13px] font-semibold text-primary hover:underline">
                      View all →
                    </Link>
                  </div>

                  {data.recentApplications.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-400 text-[14px]">No applications yet.</p>
                      <Link href="/candidate/jobs" className="mt-3 inline-block text-[13px] font-semibold text-primary hover:underline">
                        Browse jobs →
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {data.recentApplications.map((app: RecentApplication) => (
                        <li key={app.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {app.companyLogo ? (
                              <Image src={app.companyLogo} alt={app.company} width={40} height={40} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[15px] font-bold text-gray-400">{app.company.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-[#0f172a] truncate">{app.jobTitle}</p>
                            <p className="text-[12px] text-gray-400 truncate">{app.company}{app.location ? ` · ${app.location}` : ''}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <StatusBadge status={app.status} />
                            <span className="text-[11px] text-gray-400">
                              {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
