'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import UserDropdown, { type NavUser } from './UserDropdown';
import MobileMenu from './MobileMenu';
import NotificationDropdown from './NotificationDropdown';
import { updateAuthProfile } from '@/src/lib/auth';
import { useCandidateProfileQuery } from '@/features/candidate/profile';
import { useNotificationCountQuery } from '@/src/hooks/useNotifications';
import { useConversationsQuery } from '@/src/features/chat/hooks';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/candidate/dashboard' },
  { label: 'Find Jobs', href: '/candidate/jobs'      },
  { label: 'Messages',  href: '/candidate/chat'      },
];

interface Props {
  user?: NavUser;
}

export default function AuthNavbar({ user }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayUser, setDisplayUser] = useState(user);
  const pathname = usePathname();

  const { data: profile } = useCandidateProfileQuery();
  const { data: countData } = useNotificationCountQuery();
  const unreadCount = countData?.unread_notifications ?? 0;
  const { data: convData } = useConversationsQuery();
  const unreadMessages = (convData?.conversations ?? []).reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!profile) return;

    const updates: Record<string, any> = {};

    if (profile.profile_photo_url) {
      updates.profilePhoto = profile.profile_photo_url;
    }
    if (profile.title) {
      updates.designation = profile.title;
    }
    
    const fullName = profile.name || [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    if (fullName) {
      updates.name = fullName;
      updates.initials = fullName
        .split(' ')
        .filter(Boolean)
        .map(w => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }

    if (Object.keys(updates).length > 0) {
      updateAuthProfile(updates);
      setDisplayUser(prev => prev ? { ...prev, ...updates } : prev);
    }
  }, [profile]);

  return (
    <nav
      suppressHydrationWarning
      className={`fixed top-0 left-0 right-0 z-[200] border-b border-black/[0.06] transition-all duration-[350ms] backdrop-blur-[14px] ${
        scrolled || menuOpen ? 'bg-surface/[0.97]' : 'bg-surface/[0.85]'
      }`}>
      <div suppressHydrationWarning className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center h-[68px] gap-6 lg:gap-9">

        {/* ── Logo — scroll to top on homepage, navigate to jobs elsewhere ── */}
        {pathname === '/' ? (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity bg-transparent border-none p-0 cursor-pointer"
          >
            <Image src="/logo.png" alt="itJobwala" width={30} height={30} />
            <span className="font-extrabold text-xl text-heading" style={{ letterSpacing: '-0.5px' }}>
              it<span className="text-primary">Jobwala</span>
            </span>
          </button>
        ) : (
          <Link href="/candidate/dashboard" className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="itJobwala" width={30} height={30} />
            <span className="font-extrabold text-xl text-heading" style={{ letterSpacing: '-0.5px' }}>
              it<span className="text-primary">Jobwala</span>
            </span>
          </Link>
        )}

        {/* ── Nav links — desktop ── */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          {NAV_LINKS.map(link => {
            const active = link.href !== '#' && pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group flex items-center gap-1.5 ${
                  active ? 'text-primary font-semibold' : 'text-body hover:text-primary'
                }`}
              >
                {link.label}
                {link.href === '/candidate/chat' && unreadMessages > 0 && (
                  <span className="text-[10px] font-extrabold bg-danger text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
                {active && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-1.5 ml-auto">

          {/* Notification bell — all screen sizes */}
          <NotificationDropdown count={unreadCount} />

          {/* User dropdown — desktop */}
          {displayUser && (
            <div className="hidden sm:block">
              <UserDropdown user={displayUser} />
            </div>
          )}

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-[5px] transition-colors hover:bg-surface-hover"
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-[2px] bg-gray-700 rounded-full transition-all duration-200 origin-center"
              style={{ transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }}
            />
            <span
              className="block w-5 h-[2px] bg-gray-700 rounded-full transition-all duration-200"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-[2px] bg-gray-700 rounded-full transition-all duration-200 origin-center"
              style={{ transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {displayUser && <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={{ ...displayUser, unreadNotifications: unreadCount, unreadMessages }} />}
    </nav>
  );
}
