'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { SmartNavbar } from '@/layout/navbar';
import { ProtectedRoute } from '@/features/auth';
import { useCandidateProfileQuery } from '@/features/candidate/profile';
import { fetchCandidateDashboard } from '../services/dashboard.api';
import type { RecentApplication } from '../services/dashboard.api';

// ── Profile avatar with circular SVG progress ring ───────────────────────────
function ProfileAvatar({ photo, name, completion, openToWork }: { photo: string | null; name: string; completion: number; openToWork: boolean }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (completion / 100) * circ;
  return (
    <div className="relative w-[120px] h-[120px] flex-shrink-0">
      <svg width="120" height="120" className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <circle
          cx="60" cy="60" r={r}
          stroke="url(#pg)" strokeWidth="6" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      {/* Avatar sits inside the ring */}
      <div className="absolute inset-[10px] rounded-full overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
        {photo ? (
          <Image src={photo} alt={name} width={100} height={100} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-extrabold text-white select-none">{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      {/* Completion / Open to Work badge */}
      {openToWork ? (
        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Open to Work
        </div>
      ) : (
        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-white text-[10px] font-bold text-primary px-2.5 py-0.5 rounded-full shadow-md border border-primary/10 whitespace-nowrap">
          {completion}% done
        </div>
      )}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  applied:     { label: 'Applied',     cls: 'bg-blue-50   text-blue-600   border-blue-100' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-violet-50 text-violet-600 border-violet-100' },
  interview:   { label: 'Interview',   cls: 'bg-amber-50  text-amber-600  border-amber-100' },
  offer:       { label: 'Offer',       cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  selected:    { label: 'Selected',    cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  hired:       { label: 'Hired',       cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  rejected:    { label: 'Rejected',    cls: 'bg-red-50    text-red-500    border-red-100' },
  withdrawn:   { label: 'Withdrawn',   cls: 'bg-gray-50   text-gray-400   border-gray-100' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.withdrawn;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}

// ── Quick actions config ───────────────────────────────────────────────────────
const ACTIONS = [
  {
    href: '/candidate/jobs',
    label: 'Browse Jobs',
    desc: 'Find your next role',
    gradient: 'from-blue-500 to-blue-600',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  },
  {
    href: '/candidate/applications',
    label: 'Applications',
    desc: 'Track your progress',
    gradient: 'from-violet-500 to-violet-600',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  },
  {
    href: '/candidate/saved-jobs',
    label: 'Saved Jobs',
    desc: 'Review your wishlist',
    gradient: 'from-orange-400 to-orange-500',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    href: '/candidate/profile',
    label: 'Edit Profile',
    desc: 'Boost your visibility',
    gradient: 'from-emerald-500 to-teal-500',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-56 bg-[#e2e8f0] rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-5">
          <div className="h-72 bg-white rounded-2xl border border-gray-100" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100" />)}
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-40 bg-white rounded-2xl border border-gray-100" />
          <div className="h-56 bg-white rounded-2xl border border-gray-100" />
        </div>
      </div>
    </div>
  );
}

// ── Arrow icon ────────────────────────────────────────────────────────────────
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150">
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CandidateDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['candidate-dashboard'],
    queryFn:  fetchCandidateDashboard,
  });

  const { data: profile } = useCandidateProfileQuery();

  const firstName    = data?.user.fullName.split(' ')[0] ?? '';
  const topSkills    = profile?.skills?.slice(0, 4) ?? [];
  const expYears     = profile?.experience_years;
  const workStatus   = profile?.work_status;

  return (
    <ProtectedRoute>
      {/* Soft layered page background */}
      <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 60% 0%, #e0e7ff 0%, #f1f5f9 40%, #f8fafc 100%)' }}>
        <SmartNavbar />
        <div className="pt-[68px]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-8 py-8 space-y-5">

            {isLoading && <DashboardSkeleton />}

            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 text-[14px] font-medium">
                Failed to load dashboard. Please refresh.
              </div>
            )}

            {data && (
              <>
                {/* ═══════════════════ HERO ═══════════════════ */}
                <div className="relative overflow-hidden rounded-3xl p-7 sm:p-10"
                  style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1d3461 50%, #0f172a 100%)' }}>

                  {/* Decorative orbs */}
                  <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 w-56 h-56 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
                  <div className="pointer-events-none absolute top-1/2 right-1/3 w-40 h-40 rounded-full opacity-10 blur-2xl" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">

                    {/* Avatar + info */}
                    <div className="flex items-center gap-5 sm:gap-7">
                      <ProfileAvatar
                        photo={data.user.profilePhoto}
                        name={data.user.fullName}
                        completion={data.user.profileCompletion}
                        openToWork={data.user.openToWork}
                      />
                      <div>
                        <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight">
                          Welcome back, {firstName} 👋
                        </h1>
                        {data.user.title && (
                          <p className="text-blue-200/70 text-[14px] mt-1.5 font-medium">{data.user.title}</p>
                        )}
                        {/* Location · Experience · Work status */}
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                          {data.user.location && (
                            <span className="flex items-center gap-1 text-white/35 text-[12px]">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                              </svg>
                              {data.user.location}
                            </span>
                          )}
                          {expYears != null && (
                            <>
                              <span className="text-white/20 text-[12px]">·</span>
                              <span className="text-white/35 text-[12px]">
                                {expYears === 0 ? 'Fresher' : `${expYears} yr${expYears !== 1 ? 's' : ''} exp`}
                              </span>
                            </>
                          )}
                          {workStatus && expYears == null && (
                            <>
                              <span className="text-white/20 text-[12px]">·</span>
                              <span className="text-white/35 text-[12px] capitalize">{workStatus}</span>
                            </>
                          )}
                        </div>

                        {/* Top skills */}
                        {topSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {topSkills.map(skill => (
                              <span
                                key={skill}
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                {skill}
                              </span>
                            ))}
                            {(profile?.skills?.length ?? 0) > 4 && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                +{(profile?.skills?.length ?? 0) - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hero stats */}
                    <div className="sm:ml-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full sm:w-auto">
                      {[
                        { label: 'Applied',     value: data.stats.totalApplications, color: 'text-blue-300' },
                        { label: 'Shortlisted', value: data.stats.shortlisted,       color: 'text-violet-300' },
                        { label: 'Interviews',  value: data.stats.interviews,         color: 'text-amber-300' },
                        { label: 'Offers',      value: data.stats.offers,             color: 'text-emerald-300' },
                      ].map(s => (
                        <div key={s.label} className="backdrop-blur-sm rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <p className={`text-[22px] font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-white/40 text-[11px] font-medium mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ═══════════════════ MAIN GRID ═══════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

                  {/* ── Left column ── */}
                  <div className="space-y-5">

                    {/* Recent Applications */}
                    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                        <div>
                          <h2 className="text-[15px] font-bold text-[#0f172a]">Recent Applications</h2>
                          <p className="text-[12px] text-gray-400 mt-0.5">{data.stats.totalApplications} total · sorted by latest</p>
                        </div>
                        <Link href="/candidate/applications" className="group inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors">
                          View all <Arrow />
                        </Link>
                      </div>

                      {data.recentApplications.length === 0 ? (
                        <div className="flex flex-col items-center py-16 px-6 gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" className="w-7 h-7">
                              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                            </svg>
                          </div>
                          <p className="text-[15px] font-bold text-[#0f172a]">No applications yet</p>
                          <p className="text-[13px] text-gray-400 text-center max-w-xs leading-relaxed">
                            Start applying to roles that match your skills and experience.
                          </p>
                          <Link href="/candidate/jobs" className="mt-1 inline-flex items-center gap-2 bg-primary text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
                            Browse Jobs
                          </Link>
                        </div>
                      ) : (
                        <ul>
                          {data.recentApplications.map((app: RecentApplication, idx) => (
                            <li
                              key={app.id}
                              className={`group flex items-center gap-4 px-6 py-4 hover:bg-[#fafbff] transition-colors duration-150 ${idx < data.recentApplications.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                              {/* Company logo */}
                              <div className="w-[42px] h-[42px] rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {app.companyLogo ? (
                                  <Image src={app.companyLogo} alt={app.company} width={42} height={42} className="w-full h-full object-contain p-1" />
                                ) : (
                                  <span className="text-[15px] font-extrabold text-gray-300">{app.company.charAt(0)}</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-semibold text-[#0f172a] truncate group-hover:text-primary transition-colors">{app.jobTitle}</p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="text-[12px] text-gray-500 font-medium">{app.company}</span>
                                  {app.location && (
                                    <>
                                      <span className="text-gray-200">·</span>
                                      <span className="text-[12px] text-gray-400">{app.location}</span>
                                    </>
                                  )}
                                  {app.workMode && (
                                    <>
                                      <span className="text-gray-200">·</span>
                                      <span className="text-[11px] text-gray-400 capitalize">{app.workMode.replace('_', ' ')}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <StatusPill status={app.status} />
                                <span className="text-[11px] text-gray-400">
                                  {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                  </div>

                  {/* ── Right column ── */}
                  <div className="space-y-5">

                    {/* Profile completion CTA */}
                    {data.user.profileCompletion < 100 && (
                      <div className="relative overflow-hidden rounded-2xl p-6 border border-indigo-100"
                        style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)' }}>
                        <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600/10 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" className="w-4 h-4">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                              </svg>
                            </div>
                            <h3 className="text-[13px] font-bold text-indigo-900">Boost your visibility</h3>
                          </div>
                          <p className="text-[12px] text-indigo-600/70 leading-relaxed mb-4">
                            Recruiters are {data.user.profileCompletion < 50 ? '4x' : '2x'} more likely to reach out to complete profiles.
                          </p>
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-semibold text-indigo-800">{data.user.profileCompletion}% complete</span>
                              <span className="text-[11px] text-indigo-400">{100 - data.user.profileCompletion}% left</span>
                            </div>
                            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${data.user.profileCompletion}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                              />
                            </div>
                          </div>
                          <Link
                            href="/candidate/profile"
                            className="group inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors"
                          >
                            Complete Profile <Arrow />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-50">
                        <h2 className="text-[14px] font-bold text-[#0f172a]">Quick Actions</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Jump to what matters</p>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-2">
                        {ACTIONS.map(a => (
                          <Link
                            key={a.href}
                            href={a.href}
                            className="group flex flex-col gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-all duration-150 border border-transparent hover:border-gray-100/80"
                          >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200`}>
                              {a.icon}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-[#0f172a] group-hover:text-primary transition-colors leading-tight">{a.label}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{a.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Saved Jobs summary */}
                    {data.stats.savedJobs > 0 && (
                      <Link
                        href="/candidate/saved-jobs"
                        className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-5 h-5">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-[#0f172a]">{data.stats.savedJobs} Saved Jobs</p>
                          <p className="text-[12px] text-gray-400 mt-0.5">Ready when you are</p>
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" className="w-4 h-4 group-hover:translate-x-1 group-hover:stroke-primary transition-all duration-200">
                          <path d="M5 12h14m-7-7 7 7-7 7"/>
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
