'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAuth } from '@/src/lib/auth';

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
        href: '/profile',
        label: 'View Profile',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
          </svg>
        ),
      },
      {
        href: '/saved-jobs',
        label: 'Saved Jobs',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        href: '/applications',
        label: 'My Applications',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        ),
      },
    ],
  },
  {
    group: 'settings',
    items: [
      {
        href: '/settings',
        label: 'Account Settings',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
          open ? 'bg-primary/10' : 'hover:bg-gray-100'
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
          <p className="text-[13px] font-bold text-[#0f172a] leading-none truncate max-w-[100px]">{user.name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[100px]">{user.designation || user.role}</p>
        </div>
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"
          className={`hidden lg:block shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className={`absolute right-0 top-[calc(100%+8px)] w-[240px] bg-white rounded-2xl border border-gray-100 shadow-xl shadow-black/[0.08] transition-all duration-200 z-[300] ${
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        {/* User header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
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
            <p className="text-[14px] font-bold text-[#0f172a] truncate">{user.name}</p>
            <p className="text-[12px] text-gray-400 truncate">{user.designation || user.role}</p>
          </div>
        </div>

        {/* Menu groups */}
        {MENU_ITEMS.map((group, gi) => (
          <div key={group.group}>
            {gi > 0 && <div className="h-px bg-gray-100 mx-3" />}
            <div className="py-1.5">
              {group.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href.split('#')[0] + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#0f172a]'
                    }`}
                  >
                    <span className={active ? 'text-primary' : 'text-gray-400'}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="border-t border-gray-100 py-1.5">
          <button
            onClick={() => { clearAuth(); window.location.href = '/'; }}
            className="w-full flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
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
