'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PRIMARY } from '@/src/lib/constants';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import { useState, useEffect } from 'react';

export default function RecruiterDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { role, isAuthenticated, isHydrated, logoutRecruiter } = useAuthStore();
  const isRecruiterLoggedIn = isHydrated && isAuthenticated && role === 'recruiter';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logoutRecruiter();
    setOpen(false);
    router.push('/');
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 bg-white text-gray-700 border-[1.5px] border-gray-200 rounded-lg py-[9px] px-4 text-[13px] font-bold cursor-pointer transition-all duration-200 hover:border-[#1557FF] hover:text-[#1557FF]"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
        For Recruiters
        <svg
          width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+12px)] right-0 bg-white rounded-[18px] border border-[#f0f0f0] p-2 min-w-[260px] z-[300] fade-up"
          style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.14)' }}
        >
          {/* Caret */}
          <div className="absolute -top-[6px] right-5 w-3 h-3 bg-white border border-[#f0f0f0] border-b-transparent border-r-transparent rotate-45" />

          {/* Header */}
          <div className="px-3.5 pt-2.5 pb-2 border-b border-gray-50 mb-1.5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[1.2px]">
              Recruiter Portal
            </div>
          </div>

          {isRecruiterLoggedIn ? (
            <>
              {/* Dashboard */}
              <Link
                href="/recruiter/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] transition-colors hover:bg-[#f5f7ff]"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#eef3ff] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" fill="none" stroke={PRIMARY} strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111827]">Dashboard</div>
                  <div className="text-xs text-gray-400">Manage jobs and applicants</div>
                </div>
              </Link>

              {/* Post Jobs */}
              <Link
                href="/recruiter/post-job"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] transition-colors hover:bg-[#f0fdf4]"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#f0fdf4] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111827]">Post a Job</div>
                  <div className="text-xs text-gray-400">Reach 12,000+ IT professionals</div>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[10px] transition-colors hover:bg-red-50 text-left"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-red-50 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-red-600">Log Out</div>
                  <div className="text-xs text-gray-400">Sign out of recruiter portal</div>
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Recruiter Sign Up */}
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] transition-colors hover:bg-[#f5f7ff]"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#eef3ff] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" fill="none" stroke={PRIMARY} strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111827]">Recruiter Sign Up</div>
                  <div className="text-xs text-gray-400">Create your free recruiter account</div>
                </div>
              </Link>

              {/* Recruiter Login */}
              <Link
                href="/auth/login?role=recruiter"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] transition-colors hover:bg-[#f5f7ff]"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#eef3ff] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" fill="none" stroke={PRIMARY} strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111827]">Recruiter Login</div>
                  <div className="text-xs text-gray-400">Access your hiring dashboard</div>
                </div>
              </Link>

              {/* Post Jobs Free */}
              <Link
                href="/recruiter/post-job"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] transition-colors hover:bg-[#f0fdf4]"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#f0fdf4] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111827]">Post Jobs Free</div>
                  <div className="text-xs text-gray-400">Reach 12,000+ IT professionals</div>
                </div>
              </Link>

              {/* Marketing nudge */}
              <div
                className="mx-1.5 mb-1 mt-1.5 rounded-[10px] py-2.5 px-3"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY}10, #4f46e510)`,
                  border: `1px solid ${PRIMARY}20`,
                }}
              >
                <div className="text-[12px] font-semibold" style={{ color: PRIMARY }}>
                  ⚡ 4,000+ active IT candidates
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Post a job in under 2 minutes</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
