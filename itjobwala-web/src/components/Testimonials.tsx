'use client';

import { useReveal } from '@/src/hooks/useReveal';
import { TESTIMONIALS } from '@/src/lib/data';
import { PRIMARY } from '@/src/lib/constants';

const Stars = () => (
  <div className="flex gap-[3px]">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

export default function Testimonials() {
  const ref = useReveal();

  return (
    <section ref={ref} className="bg-white py-[88px] px-5 sm:px-8 lg:px-10">
      <div className="max-w-[1440px] mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="reveal text-[12px] font-bold uppercase mb-3"
            style={{ color: PRIMARY, letterSpacing: 2 }}
          >
            From the community
          </div>
          <h2
            className="reveal stagger-1 text-[36px] md:text-[42px] font-extrabold text-[#0f172a] leading-[1.1] mb-3.5"
            style={{ letterSpacing: '-1.5px' }}
          >
            Hired through itJobwala
          </h2>
          <p className="reveal stagger-2 text-[16px] text-gray-500 max-w-[540px] mx-auto leading-[1.6]">
            Real candidates. Real placements. No paid endorsements.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={`reveal stagger-${i + 1} bg-[#fafafa] border-[1.5px] border-gray-100 rounded-[20px] p-8 flex flex-col gap-6 transition-all duration-[250ms] cursor-default`}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = PRIMARY;
                el.style.background = '#fff';
                el.style.boxShadow = `0 12px 32px ${PRIMARY}14`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = '#f0f0f0';
                el.style.background = '#fafafa';
                el.style.boxShadow = 'none';
              }}
            >
              <Stars />

              <p className="text-[15px] leading-[1.7] text-[#0f172a] font-medium flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] text-white shrink-0"
                  style={{ background: t.avatarBg }}
                >
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0f172a]">{t.name}</div>
                  <div className="text-xs text-gray-500 font-medium">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
