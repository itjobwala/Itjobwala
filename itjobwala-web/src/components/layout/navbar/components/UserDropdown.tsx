'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/session/auth.store';

export interface NavUser {
  name: string;
  initials: string;
  role: string;
  designation?: string;
  avatarColorClass: string;
  profilePhoto?: string;
  unreadNotifications: number;
  unreadMessages: number;
}

interface Props {
  user: NavUser;
}

const MENU_ITEMS = [
  {
    group: 'account',
    items: [
      {
        href: '/candidate/dashboard',
        label: 'Dashboard',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        href: '/candidate/profile',
        label: 'View Profile',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
          </svg>
        ),
      },
      {
        href: '/candidate/saved-jobs',
        label: 'Saved Jobs',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        href: '/candidate/applications',
        label: 'My Applications',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        ),
      },
    ],
  },
];

export default function UserDropdown({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-colors ${
          open ? 'bg-primary/10' : 'hover:bg-surface-hover'
        }`}
      >
        {user.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt={user.name}
            className="w-8 h-8 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${user.avatarColorClass} flex items-center justify-center text-white font-extrabold text-xs shrink-0`}>
            {user.initials}
          </div>
        )}
        <div className="hidden lg:block text-left min-w-0">
          <p className="text-sm font-bold text-heading leading-none truncate max-w-[100px]">{user.name}</p>
          <p className="text-micro text-subtle mt-0.5 truncate max-w-[100px]">{user.designation || 'Update profile'}</p>
        </div>
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2.5"
          className={`hidden lg:block shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className={`absolute right-0 top-[calc(100%+8px)] w-[240px] bg-surface rounded-2xl border border-token shadow-xl shadow-black/[0.08] transition-all duration-200 z-[300] ${
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        {/* User header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-token">
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${user.avatarColorClass} flex items-center justify-center text-white font-extrabold text-sm shrink-0`}>
              {user.initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-base font-bold text-heading truncate">{user.name}</p>
            <p className="text-caption text-subtle truncate">{user.designation || 'Update profile'}</p>
          </div>
        </div>

        {/* Menu groups */}
        {MENU_ITEMS.map((group, gi) => (
          <div key={group.group}>
            {gi > 0 && <div className="h-px bg-surface-hover mx-3" />}
            <div className="py-1.5">
              {group.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href.split('#')[0] + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-body-secondary hover:bg-surface-alt hover:text-heading'
                    }`}
                  >
                    <span className={active ? 'text-primary' : 'text-subtle'}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="border-t border-token py-1.5">
          <button
            onClick={() => { useAuthStore.getState().logout(); window.location.href = '/'; }}
            className="w-full flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            style={{ width: 'calc(100% - 16px)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
