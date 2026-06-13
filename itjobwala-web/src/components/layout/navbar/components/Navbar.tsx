'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Find Jobs', href: '/candidate/jobs' },
  { label: 'Companies', href: '#' },
  { label: 'Resources', href: '#' },
  { label: 'Post a Free Job', href: '/recruiter/post-job' },
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
          className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity"
        >
          <Image src="/logo.png" alt="itJobwala" width={32} height={32} />
          <span className="font-extrabold text-xl text-heading" style={{ letterSpacing: '-0.5px' }}>
            it<span className="text-primary">Jobwala</span>
          </span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-body focus:outline-none focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md px-2 py-1 transition-colors"
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-body)'; }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex gap-4 items-center ml-auto">
          {/* Log in — desktop */}
          <Link
            href="/auth/login"
            className="hidden sm:block text-sm font-semibold text-body px-3.5 py-2 rounded-lg transition-colors focus:outline-none focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-body)'; }}
          >Log in</Link>

          {/* Sign up — desktop */}
          <Link
            href="/auth/signup"
            className="hidden sm:block bg-primary text-white text-sm font-semibold px-3.5 py-2 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 shadow-[0_4px_16px_rgba(21,87,255,0.27)]"
            onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; }}
          >Sign up</Link>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-token bg-surface px-5 py-4 flex flex-col">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm font-semibold text-body border-b border-token last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2.5">
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-body py-2.5 text-center border-[1.5px] border-token-mid rounded-lg"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMenuOpen(false)}
              className="bg-primary text-white text-sm font-bold py-2.5 text-center rounded-lg"
            >
              Sign up free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
