'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import { publicClient } from '@/src/lib/api/client';

const ADMIN_BG     = '#0f172a';
const ADMIN_SURFACE = '#1e293b';
const ADMIN_ACCENT  = '#6366f1';

const nav = [
  {
    label: 'Dashboard',
    href:  '/admin/dashboard',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Users',
    href:  '/admin/users',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Jobs',
    href:  '/admin/jobs',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    label: 'Job Queue',
    href:  '/admin/jobs/queue',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: 'Reports',
    href:  '/admin/reports',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname();
  const logoutAdmin = useAuthStore(s => s.logoutAdmin);
  const user        = useAuthStore(s => s.user);
  const [sideOpen, setSideOpen] = useState(false);

  async function handleLogout() {
    try { await publicClient.post('/auth/logout'); } catch { /* best-effort */ }
    logoutAdmin();
    window.location.href = '/admin/login';
  }

  const sidebar = (
    <aside
      className="flex flex-col h-full"
      style={{ background: ADMIN_BG, borderRight: `1px solid rgba(255,255,255,0.07)`, width: 220 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Image src="/logo.png" alt="itJobwala" width={26} height={26} />
        <span className="font-extrabold text-base text-white">
          it<span style={{ color: ADMIN_ACCENT }}>Jobwala</span>
        </span>
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: ADMIN_ACCENT + '22', color: ADMIN_ACCENT }}>
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Operations
        </p>
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSideOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all"
              style={active
                ? { background: ADMIN_ACCENT + '22', color: ADMIN_ACCENT }
                : { color: 'rgba(255,255,255,0.55)' }
              }
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
            <p className="text-slate-500 text-xs truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left border-none cursor-pointer"
          style={{ background: 'transparent', color: 'rgba(239,68,68,0.8)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex" style={{ background: ADMIN_SURFACE }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col shrink-0 h-screen sticky top-0">{sidebar}</div>

      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex flex-col h-full" style={{ width: 220 }}>{sidebar}</div>
          <div className="flex-1 bg-black/60" onClick={() => setSideOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: ADMIN_BG, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => setSideOpen(true)}
            className="border-none bg-transparent text-white cursor-pointer p-1"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="font-bold text-white text-sm">
            it<span style={{ color: ADMIN_ACCENT }}>Jobwala</span> Admin
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
