'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FOOTER_COLS } from '@/src/lib/data';
import { PRIMARY } from '@/src/lib/constants';

const SOCIALS = ['in', 'tw', 'gh', 'ig'];

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-[#f8faff] text-[#0f172a] pt-[72px] pb-9 border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr] gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div
              className="font-extrabold text-xl mb-4"
              style={{ letterSpacing: '-0.5px' }}
            >
              <span className="text-[#0f172a]">it</span>
              <span style={{ color: PRIMARY }}>Jobwala</span>
            </div>
            <p className="text-sm text-[#475569] leading-[1.8] mb-7">
              Find IT jobs without the noise.<br />Apply directly. No middlemen.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map((s) => (
                <div
                  key={s}
                  className="w-9 h-9 rounded-lg bg-[#f3f4f6] border border-gray-200 flex items-center justify-center text-[12px] font-bold text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <div
                className="font-bold text-[12px] text-[#475569] mb-4 uppercase"
                style={{ letterSpacing: 1.5 }}
              >
                {col.title}
              </div>
              <div className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <Link
                    key={l}
                    href="#"
                    className="text-sm"
                    style={{ color: '#6b7280', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <div
              className="font-bold text-[12px] text-[#475569] mb-4 uppercase"
              style={{ letterSpacing: 1.5 }}
            >
              Top jobs, weekly
            </div>
            <p className="text-sm text-[#475569] mb-4 leading-[1.7]">
              5 hand-picked IT roles every Monday. No spam, unsubscribe in one click.
            </p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-[#f9fafb] border border-gray-200 rounded-[10px] py-3 px-3.5 text-sm text-[#111827] outline-none mb-2.5 focus:border-[#1557FF] transition-colors"
            />
            <button
              className="w-full text-white border-none rounded-[10px] py-3 text-sm font-bold cursor-pointer hover:brightness-110 transition-[filter]"
              style={{ background: PRIMARY }}
            >
              Get Monday picks
            </button>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-7 border-t border-gray-200">
          <span className="text-[13px] text-[#334155]">© 2024 itJobwala. All rights reserved.</span>
          <span className="text-[13px] text-[#334155]">Built for IT professionals in India</span>
        </div>

      </div>
    </footer>
  );
}
