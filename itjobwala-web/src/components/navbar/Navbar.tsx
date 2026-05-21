'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RecruiterDropdown from '@/src/components/navbar/RecruiterDropdown';

const PRIMARY = '#1557FF';
const NAV_LINKS = [
  { label: 'Find Jobs', href: '/jobs' },
  { label: 'Companies', href: '#' },
  { label: 'Resources', href: '#' },
];

function AuthDropdown({
  label,
  candidateHref,
  recruiterHref,
  variant,
}: {
  label: string;
  candidateHref: string;
  recruiterHref: string;
  variant: 'ghost' | 'solid';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors"
        style={
          variant === 'solid'
            ? { background: PRIMARY, color: '#fff', boxShadow: `0 4px 16px ${PRIMARY}44` }
            : { color: '#374151' }
        }
        onMouseEnter={e => { if (variant === 'ghost') e.currentTarget.style.color = PRIMARY; }}
        onMouseLeave={e => { if (variant === 'ghost') e.currentTarget.style.color = '#374151'; }}
      >
        {label}
        <svg className="inline ml-1 -mr-0.5" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-[300]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1.5">
            {label} as
          </p>

          {/* Candidate — default / highlighted */}
          <Link
            href={candidateHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 transition-colors"
            style={{ background: '#eff6ff' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#bfdbfe' }}>
              <svg width="15" height="15" fill="none" stroke={PRIMARY} strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-bold" style={{ color: PRIMARY }}>Candidate</div>
              <div className="text-[11px] text-gray-400">Find &amp; apply to jobs</div>
            </div>
            <div className="ml-auto">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: PRIMARY, color: '#fff' }}>Default</span>
            </div>
          </Link>

          {/* Recruiter */}
          <Link
            href={recruiterHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <svg width="15" height="15" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#0f172a]">Recruiter</div>
              <div className="text-[11px] text-gray-400">Post jobs &amp; hire talent</div>
            </div>
          </Link>

          <div className="h-px bg-gray-100" />
          <div className="px-4 py-2.5 text-[11px] text-gray-400 text-center">
            Not sure? <Link href="/jobs" onClick={() => setOpen(false)} className="font-semibold" style={{ color: PRIMARY }}>Browse jobs →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

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
        <Link href="/" className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="itJobwala" width={32} height={32} />
          <span className="font-extrabold text-xl text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
            it<span className="text-primary">Jobwala</span>
          </span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium"
              style={{ color: '#374151', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = PRIMARY; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex gap-2 items-center ml-auto">
          <AuthDropdown
            label="Log in"
            candidateHref="/login"
            recruiterHref="/recruiter/login"
            variant="ghost"
          />

          <AuthDropdown
            label="Sign up"
            candidateHref="/signup"
            recruiterHref="/recruiter/signup"
            variant="solid"
          />

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
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2.5">
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold py-2.5 text-center border-[1.5px] rounded-lg"
              style={{ color: '#374151', borderColor: '#e5e7eb', textDecoration: 'none' }}>
              Log in — Candidate
            </Link>
            <Link href="/recruiter/login" onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold py-2.5 text-center border-[1.5px] rounded-lg"
              style={{ color: '#374151', borderColor: '#e5e7eb', textDecoration: 'none' }}>
              Log in — Recruiter
            </Link>
            <Link href="/signup" onClick={() => setMenuOpen(false)}
              className="text-sm font-bold py-2.5 text-center rounded-lg"
              style={{ background: PRIMARY, color: '#fff', textDecoration: 'none' }}>
              Sign up free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
