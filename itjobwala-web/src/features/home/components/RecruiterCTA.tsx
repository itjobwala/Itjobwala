'use client';

import Link from 'next/link';
import { useReveal } from '@/src/hooks/useReveal';
import { PRIMARY } from '@/src/lib/constants';

const FEATURES = [
  'Reach relevant candidates instantly',
  'Direct to qualified applicants',
  'Quality applications, no noise',
];

export default function RecruiterCTA() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      className="bg-[#f9fafb] py-16 px-5 sm:px-8 lg:px-10"
    >
      <div className="max-w-[1000px] mx-auto">
        <div
          className="reveal rounded-[28px] p-10 md:p-16 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center relative overflow-hidden"
          style={{ background: `linear-gradient(130deg, ${PRIMARY} 0%, #4f46e5 100%)` }}
        >
          {/* Decorative circles */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{ top: -60, right: 240, width: 220, height: 220, background: 'rgba(255,255,255,0.06)' }}
          />
          <div
            className="absolute pointer-events-none rounded-full"
            style={{ bottom: -80, right: 40, width: 200, height: 200, background: 'rgba(255,255,255,0.04)' }}
          />

          {/* Left content */}
          <div className="relative">
            <div className="inline-block bg-white/15 rounded-full py-[6px] px-4 text-sm font-semibold text-white mb-5">
              For companies
            </div>
            <h2
              className="text-h2 text-white mb-4"
              style={{ letterSpacing: '-1.5px' }}
            >
              Hiring tech talent?
            </h2>
            <p className="text-large-body text-white/75 max-w-[440px] mb-7">
              Post your job and connect with skilled IT professionals instantly.
              No spam, only quality candidates.
            </p>
            <div className="flex flex-col gap-2.5">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-base text-white/90 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right CTA */}
          <div className="flex flex-col gap-3.5 items-start lg:items-center relative">
            <Link
              href="/recruiter/post-job"
              className="bg-white rounded-full py-2.5 px-6 text-base font-bold transition-transform duration-200 hover:scale-[1.04] focus:outline-none focus:ring-4 focus:ring-white/40 focus:ring-offset-2 w-full lg:w-auto text-center"
              style={{ color: PRIMARY, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', textDecoration: 'none', display: 'block' }}
            >Post a job →</Link>
            <span className="text-caption text-white/55">
              Trusted by 800+ companies
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
