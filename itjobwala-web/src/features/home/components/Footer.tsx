'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_COLS } from '@/src/lib/data';
import { PRIMARY } from '@/src/lib/constants';

const SOCIALS = [
  {
    key: 'linkedin',
    href: 'https://linkedin.com/company/itjobwala',
    label: 'LinkedIn',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    key: 'twitter',
    href: 'https://twitter.com/itjobwala',
    label: 'Twitter / X',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    key: 'instagram',
    href: 'https://instagram.com/itjobwala',
    label: 'Instagram',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    key: 'github',
    href: 'https://github.com/itjobwala',
    label: 'GitHub',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-[#f8faff] text-[#0f172a] pt-16 pb-9 border-t border-token">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr] gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1 mb-4 hover:opacity-80 transition-opacity w-fit cursor-pointer bg-transparent border-none p-0"
            >
              <Image src="/logo.png" alt="itJobwala" width={28} height={28} />
              <span className="font-extrabold text-xl text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
                it<span style={{ color: PRIMARY }}>Jobwala</span>
              </span>
            </button>
            <p className="text-sm text-[#474d6a] leading-[1.8] mb-7">
              Find IT jobs without the noise.<br />Apply directly. No middlemen.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-surface-hover border border-token flex items-center justify-center text-[#474d6a] hover:bg-primary hover:text-white hover:border-primary transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <div
                className="font-bold text-caption text-[#474d6a] mb-4 uppercase"
                style={{ letterSpacing: 1.5 }}
              >
                {col.title}
              </div>
              <div className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-sm"
                    style={{ color: '#474d6a', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#474d6a'; }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <div
              className="font-bold text-caption text-[#474d6a] mb-4 uppercase"
              style={{ letterSpacing: 1.5 }}
            >
              Top jobs, weekly
            </div>
            <p className="text-sm text-[#474d6a] mb-4 leading-[1.7]">
              5 hand-picked IT roles every Monday. No spam, unsubscribe in one click.
            </p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              disabled
              className="w-full bg-surface-alt border border-token rounded-[10px] py-3 px-3.5 text-sm text-heading outline-none mb-2.5 opacity-50 cursor-not-allowed"
            />
            <button
              disabled
              className="w-full text-white border-none rounded-full py-3 text-sm font-bold cursor-not-allowed opacity-50"
              style={{ background: PRIMARY }}
            >
              Coming soon
            </button>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-7 border-t border-token">
          <span className="text-sm text-[#334155]">© 2026 itJobwala. All rights reserved.</span>
          <span className="text-sm text-[#334155]">Built for IT professionals in India</span>
        </div>

      </div>
    </footer>
  );
}
