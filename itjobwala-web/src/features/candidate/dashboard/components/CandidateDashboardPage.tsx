'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { getInitials } from '@/src/lib/utils/format';
import { SmartNavbar } from '@/layout/navbar';
import { ProtectedRoute } from '@/features/auth';
import { useCandidateProfileQuery, useProfileCompletionQuery } from '@/features/candidate/profile';
import { fetchCandidateDashboard } from '../services/dashboard.api';
import type { RecentApplication } from '../services/dashboard.api';
import { useResumeInsightsQuery } from '@/features/resume';
import { useHomeStatsQuery } from '@/features/jobs/browse';
import ProfileCompletionCard from '@/features/candidate/profile/components/ProfileCompletionCard';
import StatusBadge from '@/src/components/ui/StatusBadge';

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
          <span className="text-2xl font-extrabold text-white select-none tracking-wide">{getInitials(name)}</span>
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




// ── Skeleton ──────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-56 bg-surface-mid rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-5">
          <div className="h-72 bg-surface rounded-2xl border border-token" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface rounded-2xl border border-token" />)}
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-40 bg-surface rounded-2xl border border-token" />
          <div className="h-56 bg-surface rounded-2xl border border-token" />
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

// ── ATS Mini Card ─────────────────────────────────────────────────────────────
function ATSMiniCard() {
  const { data: insights } = useResumeInsightsQuery();

  const score  = insights?.qa_match_score ?? null;

  const scoreColor =
    score === null ? '#6366f1'
    : score >= 76  ? '#10b981'
    : score >= 61  ? '#3b82f6'
    : score >= 41  ? '#f59e0b'
    : '#ef4444';

  return (
    <Link
      href="/candidate/resume"
      className="group flex items-center gap-4 bg-surface rounded-2xl border border-token-mid shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Mini radial ring */}
      <div className="relative w-[72px] h-[72px] flex-shrink-0">
        <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
          <circle cx="36" cy="36" r="28" fill="none" stroke="var(--color-surface-hover)" strokeWidth="6" />
          {score !== null && (
            <circle
              cx="36" cy="36" r="28"
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black leading-none" style={{ color: scoreColor }}>
            {score !== null ? `${score}%` : '?'}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-heading">QA Profile Score</p>
        <p className="text-caption text-subtle mt-0.5">How recruiters see your profile</p>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" className="w-4 h-4 group-hover:translate-x-1 group-hover:stroke-primary transition-all duration-200">
        <path d="M5 12h14m-7-7 7 7-7 7"/>
      </svg>
    </Link>
  );
}

// ── Dashboard content (rendered only after ProtectedRoute confirms auth) ──────
function DashboardContent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['candidate-dashboard'],
    queryFn:  fetchCandidateDashboard,
  });

  const { data: profile }     = useCandidateProfileQuery();
  const { data: completion }  = useProfileCompletionQuery();
  const { data: homeStats, isLoading: statsLoading } = useHomeStatsQuery();

  const candidateRole = profile?.title ?? data?.user.title ?? null;
  const expYears      = profile?.experience_years;
  const workStatus    = profile?.work_status;
  const profileCompletion = completion?.percentage ?? data?.user.profileCompletion ?? 0;

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 60% 0%, #e0e7ff 0%, #f1f5f9 40%, #f8fafc 100%)' }}>
        <SmartNavbar />
        <div className="pt-16 lg:pt-[72px]">
          <div className="container-responsive mx-auto px-5 sm:px-8 py-8 space-y-5">

            {isLoading && <DashboardSkeleton />}

            {isError && (
              <div className="bg-danger-bg border border-danger rounded-2xl p-6 text-center text-danger text-base font-medium">
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

                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">

                    {/* Avatar + info */}
                    <div className="flex items-center gap-5 sm:gap-7">
                      <ProfileAvatar
                        photo={data.user.profilePhoto}
                        name={data.user.fullName}
                        completion={profileCompletion}
                        openToWork={data.user.openToWork}
                      />
                      <div>
                        <h3 className="text-h3 text-white tracking-tight">
                          {data.user.fullName ? `Hi, ${data.user.fullName}` : 'Your Career Dashboard'}
                        </h3>
                        {/* Work status · Experience · Location */}
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                          {workStatus && (
                            <span className="text-white/55 text-caption capitalize">{workStatus}</span>
                          )}
                          {expYears != null && (
                            <>
                              {workStatus && <span className="text-white/20 text-caption">·</span>}
                              <span className="text-white/55 text-caption">
                                {expYears ? `${expYears} yr${expYears !== 1 ? 's' : ''} exp` : '' }
                              </span>
                            </>
                          )}
                          {data.user.location && (
                            <>
                              {(workStatus || expYears != null) && <span className="text-white/20 text-caption">·</span>}
                              <span className="flex items-center gap-1 text-white/55 text-caption">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                </svg>
                                {data.user.location}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Candidate role */}
                        {candidateRole && (
                          <div className="mt-3">
                            <span
                              className="px-3 py-2 rounded-full text-[14px] font-semibold"
                              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}
                            >
                              {candidateRole}
                            </span>
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
                        { label: 'Offers & Hires', value: data.stats.offers,          color: 'text-emerald-300' },
                      ].map(s => (
                        <div key={s.label} className="backdrop-blur-sm rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
                          <p className="text-white/40 text-micro font-medium mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ═══════════════════ MAIN GRID ═══════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

                  {/* ── Left column ── */}
                  <div className="space-y-5">

                    {/* Empty-state CTA */}
                    {data.stats.totalApplications === 0 && (
                      <div className="bg-primary/[0.04] border border-primary/20 rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-heading">Start your QA job search</p>
                          {statsLoading ? (
                            <span className="inline-block h-3 w-36 rounded bg-gray-200 animate-pulse mt-0.5" />
                          ) : (
                            <p className="text-caption text-muted mt-0.5">
                              {homeStats?.total_jobs != null ? `${homeStats.total_jobs.toLocaleString()} QA roles live right now` : '0 QA roles live right now'}
                            </p>
                          )}
                        </div>
                        <Link href="/candidate/jobs" className="text-sm font-bold text-primary hover:underline whitespace-nowrap">
                          Browse jobs →
                        </Link>
                      </div>
                    )}

                    {/* Recent Applications */}
                    <div className="bg-surface rounded-2xl border border-token-mid shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-5 border-b border-token">
                        <div>
                          <h2 className="text-h6 text-heading">Recent Applications</h2>
                          <p className="text-caption text-subtle mt-0.5">{data.stats.totalApplications} total · sorted by latest</p>
                        </div>
                        <Link href="/candidate/applications" className="group inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
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
                          <p className="text-base font-bold text-heading">No applications yet</p>
                          <p className="text-sm text-subtle text-center max-w-xs leading-relaxed">
                            Start applying to roles that match your skills and experience.
                          </p>
                          <Link href="/candidate/jobs" className="mt-1 inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
                            Browse Jobs
                          </Link>
                        </div>
                      ) : (
                        <ul>
                          {data.recentApplications.map((app: RecentApplication, idx) => (
                            <li
                              key={app.id}
                              className={`relative overflow-hidden group ${idx < data.recentApplications.length - 1 ? 'border-b border-token' : ''}`}
                            >
                              {!['rejected', 'hired', 'withdrawn'].includes(app.status) && (
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-success pointer-events-none" />
                              )}
                              <Link
                                href={`/candidate/applications/${app.id}`}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafbff] transition-colors duration-150"
                              >
                                {/* Company logo */}
                                <div className="w-[42px] h-[42px] rounded-xl bg-surface-alt border border-token flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {app.companyLogo ? (
                                    <Image src={app.companyLogo} alt={app.company} width={42} height={42} className="w-full h-full object-contain p-1" />
                                  ) : (
                                    <span className="text-base font-extrabold text-gray-300">{app.company.charAt(0)}</span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-base font-semibold text-heading truncate group-hover:text-primary transition-colors">{app.jobTitle}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-caption text-muted font-medium">{app.company}</span>
                                    {app.location && (
                                      <>
                                        <span className="text-subtle">·</span>
                                        <span className="text-caption text-subtle">{app.location}</span>
                                      </>
                                    )}
                                    {app.workMode && (
                                      <>
                                        <span className="text-subtle">·</span>
                                        <span className="text-micro text-subtle capitalize">{app.workMode.replace('_', ' ')}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <StatusBadge status={app.status} showDot={true} />
                                  <span className="text-caption text-subtle mt-0.5">
                                    {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                  </div>

                  {/* ── Right column ── */}
                  <div className="space-y-5">

                    {/* Profile Strength */}
                    <ProfileCompletionCard />

                    {/* ATS Score Mini-Card */}
                    <ATSMiniCard />


                    {/* Saved Jobs summary */}
                    {data.stats.savedJobs > 0 && (
                      <Link
                        href="/candidate/saved-jobs"
                        className="group flex items-center gap-4 bg-surface rounded-2xl border border-token-mid shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-5 h-5">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-heading">{data.stats.savedJobs} Saved Jobs</p>
                          <p className="text-caption text-subtle mt-0.5">Ready when you are</p>
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
  );
}

// ── Shell — queries only mount after ProtectedRoute confirms auth ─────────────
export default function CandidateDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
