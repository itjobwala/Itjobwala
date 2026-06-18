'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import type { NavUser } from './UserDropdown';

const NAV_LINKS = [
  { label: 'Dashboard',       href: '/candidate/dashboard'  },
  { label: 'Find Jobs',       href: '/candidate/jobs'       },
  { label: 'Messages',        href: '/candidate/chat'       },
  { label: 'Saved Jobs',      href: '/candidate/saved-jobs' },
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
      className={`sm:hidden border-t border-token bg-surface overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="px-5 pt-4 pb-5 flex flex-col gap-1">
        {/* User profile card */}
        <div className="flex items-center gap-3 bg-surface-alt rounded-2xl p-3.5 mb-3 border border-token">
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
            <p className="text-base font-bold text-heading truncate">{user.name}</p>
            <p className="text-caption text-subtle truncate">{user.designation || 'Update profile'}</p>
          </div>
          {user.unreadNotifications > 0 && (
            <span className="text-micro font-bold bg-red-500 text-white rounded-full px-2 py-0.5 shrink-0">
              {user.unreadNotifications}
            </span>
          )}
        </div>

        {/* Nav links */}
        {NAV_LINKS.map(link => {
          const active = pathname === link.href;
          const badge = link.href === '/candidate/chat' && (user.unreadMessages ?? 0) > 0
            ? (user.unreadMessages > 99 ? '99+' : String(user.unreadMessages))
            : null;
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className={`flex items-center justify-between py-3 px-3 text-sm font-semibold rounded-xl transition-colors border-b border-token last:border-0 ${
                active
                  ? 'text-primary bg-primary/5'
                  : 'text-body hover:text-primary hover:bg-surface-alt'
              }`}
            >
              {link.label}
              {badge && (
                <span className="text-[10px] font-extrabold bg-danger text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Profile / settings links */}
        <div className="border-t border-token mt-2 pt-3 flex flex-col gap-1">
          {PROFILE_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-body hover:text-primary hover:bg-surface-alt rounded-xl transition-colors"
            >
              <span className="text-subtle">{link.icon}</span>
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
