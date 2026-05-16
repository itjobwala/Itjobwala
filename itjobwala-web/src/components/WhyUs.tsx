'use client';

import { useReveal } from '@/src/hooks/useReveal';
import { WHY } from '@/src/lib/data';

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
                <div className="text-[28px] mb-3.5">{item.icon}</div>
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
