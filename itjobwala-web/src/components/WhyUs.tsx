'use client';

import type React from 'react';
import { useReveal } from '@/src/hooks/useReveal';
import { WHY } from '@/src/lib/data';

const WHY_ICONS: Record<string, React.ReactNode> = {
  salary: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="2.5"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  ),
  spam: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  direct: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13"/>
      <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  ),
  curated: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
};

export default function WhyUs() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      className="bg-[#0f172a] py-[88px] px-5 sm:px-8 lg:px-10"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div className="reveal-left">
            <div className="text-[12px] font-bold text-[#93c5fd] uppercase mb-3" style={{ letterSpacing: 2 }}>
              Our difference
            </div>
            <h2
              className="text-[36px] md:text-[42px] font-extrabold text-white leading-[1.1] mb-5"
              style={{ letterSpacing: '-1.5px' }}
            >
              Why people choose this platform
            </h2>
            <p className="text-[15px] text-slate-500 leading-[1.7]">
              Built for IT professionals who are tired of recruiter chaos and irrelevant listings.
            </p>
          </div>

          {/* Right 2×2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY.map((item, i) => (
              <div
                key={i}
                className={`reveal stagger-${i + 1} rounded-[18px] py-7 px-6 transition-colors duration-300 hover:bg-white/[0.07]`}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-[#93c5fd]" style={{ background: 'rgba(147,197,253,0.10)' }}>
                  {WHY_ICONS[item.icon]}
                </div>
                <h4 className="font-bold text-[16px] text-slate-100 mb-2">{item.title}</h4>
                <p className="text-[14px] text-slate-500 leading-[1.7]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
