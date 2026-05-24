'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import type { NavUser } from './UserDropdown';

const NAV_LINKS = [
  { label: 'Find Jobs',      href: '/candidate/jobs' },
  { label: 'Companies',      href: '#' },
  { label: 'Resources',      href: '#' },
  { label: 'Saved Jobs',     href: '/candidate/saved-jobs' },
  { label: 'My Applications', href: '/candidate/applications' },
];

const PROFILE_LINKS = [
  {
    href: '/candidate/profile',
    label: 'View Profile',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Account Settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: NavUser;
}

export default function MobileMenu({ isOpen, onClose, user }: Props) {
  const pathname = usePathname();

  return (
    <div
      className={`sm:hidden border-t border-gray-100 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="px-5 pt-4 pb-5 flex flex-col gap-1">
        {/* User profile card */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5 mb-3 border border-gray-100">
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-11 h-11 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${user.avatarColorClass} flex items-center justify-center text-white font-extrabold text-base shrink-0`}>
              {user.initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[#0f172a] truncate">{user.name}</p>
            <p className="text-[12px] text-gray-400 truncate">{user.designation || 'Update profile'}</p>
          </div>
          {user.unreadNotifications > 0 && (
            <span className="text-[11px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5 shrink-0">
              {user.unreadNotifications}
            </span>
          )}
        </div>

        {/* Nav links */}
        {NAV_LINKS.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className={`py-3 px-3 text-sm font-semibold rounded-xl transition-colors border-b border-gray-50 last:border-0 ${
                active
                  ? 'text-primary bg-primary/5'
                  : 'text-[#374151] hover:text-primary hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        {/* Profile / settings links */}
        <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-1">
          {PROFILE_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-[#374151] hover:text-primary hover:bg-gray-50 rounded-xl transition-colors"
            >
              <span className="text-gray-400">{link.icon}</span>
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => { onClose(); useAuthStore.getState().logout(); window.location.href = '/'; }}
            className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
