'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserDropdown, { type NavUser } from './UserDropdown';
import MobileMenu from './MobileMenu';
import { updateAuthProfile } from '@/src/lib/auth';
import { useCandidateProfileQuery } from '@/src/hooks/useProfile';

const NAV_LINKS = [
  { label: 'Find Jobs',   href: '/jobs'    },
  { label: 'Companies',   href: '#'        },
  { label: 'Resources',   href: '#'        },
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

    if (Object.keys(updates).length > 0) {
      updateAuthProfile(updates);
      setDisplayUser(prev => prev ? { ...prev, ...updates } : prev);
    }
  }, [profile]);

  return (
    <nav
      suppressHydrationWarning
      className={`fixed top-0 left-0 right-0 z-[200] border-b border-black/[0.06] transition-all duration-[350ms] backdrop-blur-[14px] ${
        scrolled || menuOpen ? 'bg-white/[0.97]' : 'bg-white/[0.85]'
      }`}>
      <div suppressHydrationWarning className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center h-[68px] gap-6 lg:gap-9">

        {/* ── Logo ── */}
        <Link
          href="/dashboard"
          className="font-extrabold text-xl shrink-0 text-[#0f172a] hover:opacity-80 transition-opacity"
          style={{ letterSpacing: '-0.5px' }}
        >
          <span>it</span>
          <span className="text-primary">Jobwala</span>
        </Link>

        {/* ── Nav links — desktop ── */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          {NAV_LINKS.map(link => {
            const active = link.href !== '#' && pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group ${
                  active ? 'text-primary font-semibold' : 'text-[#374151] hover:text-primary'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-1.5 ml-auto">

          {/* User dropdown — desktop */}
          {displayUser && (
            <div className="hidden sm:block">
              <UserDropdown user={displayUser} />
            </div>
          )}

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-[5px] transition-colors hover:bg-gray-100"
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
      {displayUser && <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={displayUser} />}
    </nav>
  );
}
