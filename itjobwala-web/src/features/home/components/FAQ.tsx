'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReveal } from '@/src/hooks/useReveal';
import { FAQS } from '@/src/lib/data';
import { PRIMARY } from '@/src/lib/constants';

export default function FAQ() {
  const ref = useReveal();
  const [openIndex, setOpenIndex] = useState<number>(0);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? -1 : i);
  }

  return (
    <section ref={ref} className="bg-[#f9fafb] py-[88px] px-5 lg:px-10">
      <div className="max-w-[880px] mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="reveal text-[12px] font-bold uppercase mb-3"
            style={{ color: PRIMARY, letterSpacing: 1.5 }}
          >
            Got questions?
          </div>
          <h2
            className="reveal stagger-1 text-[36px] md:text-[42px] font-extrabold text-[#0f172a] leading-[1.1]"
            style={{ letterSpacing: '-1.5px' }}
          >
            Answers, upfront
          </h2>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-2.5">
          {FAQS.map((f, i) => (
            <div
              key={i}
              className={`reveal stagger-${i + 1} bg-white rounded-[14px] overflow-hidden transition-all duration-200`}
              style={{ border: `1.5px solid ${openIndex === i ? PRIMARY : '#e5e7eb'}` }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full bg-transparent border-none py-5 px-6 flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <span className="text-[15px] font-bold text-[#0f172a]">{f.q}</span>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-[250ms]"
                  style={{
                    background: openIndex === i ? PRIMARY : '#f3f4f6',
                    transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke={openIndex === i ? '#fff' : '#6b7280'} strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </button>

              {openIndex === i && (
                <div className="px-6 pb-[22px] text-sm text-[#474d6a] leading-[1.7]">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer nudge */}
        <div className="reveal text-center mt-10 py-6 px-6 bg-surface rounded-[14px] border border-token">
          <span className="text-sm text-[#474d6a]">Still have questions? </span>
          <a href="mailto:support@itjobwala.com" className="text-sm font-bold" style={{ color: PRIMARY }}>
            Contact our team →
          </a>
        </div>

      </div>
    </section>
  );
}
