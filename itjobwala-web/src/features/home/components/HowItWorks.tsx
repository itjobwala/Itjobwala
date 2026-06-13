'use client';

import { useReveal } from '@/src/hooks/useReveal';
import { HOW_STEPS } from '@/src/lib/data';
import { PRIMARY } from '@/src/lib/constants';

export default function HowItWorks() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      className="bg-white py-20 px-5 sm:px-8 lg:px-10"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="reveal text-caption font-bold uppercase mb-3"
            style={{ color: PRIMARY, letterSpacing: 2 }}
          >
            Simple by design
          </div>
          <h2
            className="reveal stagger-1 text-[36px] md:text-[42px] font-extrabold text-[#0f172a]"
            style={{ letterSpacing: '-1.5px' }}
          >
            How it works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-2 relative">
          {/* Dashed connector — only visible on md+ */}
          <div
            className="hidden md:block absolute h-px border-t-2 border-dashed border-token z-0"
            style={{ top: 36, left: 'calc(16.6% + 36px)', right: 'calc(16.6% + 36px)' }}
          />

          {HOW_STEPS.map((s, i) => (
            <div
              key={i}
              className={`reveal stagger-${i + 1} text-center px-6 md:px-12 relative z-10`}
            >
              <div
                className="w-[72px] h-[72px] rounded-full mx-auto mb-7 flex items-center justify-center transition-transform duration-300"
                style={{
                  background: 'rgba(21, 87, 255, 0.08)',
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                <span
                  className="text-xl font-extrabold"
                  style={{ color: PRIMARY }}
                >
                  {s.n}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">{s.title}</h3>
              <p className="text-md text-muted leading-[1.7]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
