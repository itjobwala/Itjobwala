'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RecruiterDropdown from '@/src/components/navbar/RecruiterDropdown';

const PRIMARY = '#1557FF';
const NAV_LINKS = [
  { label: 'Find Jobs', href: '/jobs' },
  { label: 'Companies', href: '#' },
  { label: 'Resources', href: '#' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav
      suppressHydrationWarning
      className="fixed top-0 left-0 right-0 z-[200] border-b border-black/[0.06] transition-all duration-[350ms]"
      style={{
        background: scrolled || menuOpen ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div suppressHydrationWarning className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center h-[68px] gap-9">
        {/* Logo */}
        <Link
          href="/"
          className="font-extrabold text-xl shrink-0 text-[#0f172a] hover:opacity-80 transition-opacity"
          style={{ letterSpacing: '-0.5px' }}
        >
          <span>it</span>
          <span className="text-primary">Jobwala</span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium"
              style={{ color: '#374151', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex gap-2 items-center ml-auto">
          {/* Log in — desktop */}
          <Link
            href="/login"
            className="hidden sm:block text-sm font-semibold px-3.5 py-2 rounded-lg"
            style={{ color: '#374151', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
          >
            Log in
          </Link>

          {/* Get Hired Free */}
          <Link
            href="/signup"
            className="hidden sm:flex items-center gap-2 text-white text-sm font-bold rounded-lg py-[10px] px-5 transition-all duration-200"
            style={{ background: PRIMARY, color: '#fff', boxShadow: `0 4px 16px ${PRIMARY}44` }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'translateY(-1px)';
              el.style.boxShadow = `0 8px 24px ${PRIMARY}55`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = `0 4px 16px ${PRIMARY}44`;
            }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full bg-[#4ade80] shrink-0 pulse-dot"
              style={{ boxShadow: '0 0 6px #4ade80' }}
            />
            Get Hired Free
          </Link>

          {/* Divider — desktop */}
          <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

          {/* Recruiter dropdown — desktop */}
          <div className="hidden sm:block">
            <RecruiterDropdown />
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-5 py-4 flex flex-col">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm font-semibold border-b border-gray-50 last:border-0"
              style={{ color: '#374151', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold py-2.5 text-center border-[1.5px] rounded-lg"
              style={{ color: '#374151', textDecoration: 'none', borderColor: '#e5e7eb' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; e.currentTarget.style.borderColor = '#1557FF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-bold py-2.5 text-center rounded-lg"
              style={{ background: PRIMARY, color: '#fff', textDecoration: 'none' }}
            >
              Get Hired Free
            </Link>
            <Link
              href="/recruiter/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold py-2.5 text-center border-[1.5px] rounded-lg"
              style={{ color: '#374151', textDecoration: 'none', borderColor: '#e5e7eb' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; e.currentTarget.style.borderColor = '#1557FF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
            >
              For Recruiters
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
