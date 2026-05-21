'use client';

import { useRef, type KeyboardEvent } from 'react';
import { PRIMARY } from '@/src/lib/constants';

type OTPInputProps = {
  value: string;
  onChange: (v: string) => void;
};

export default function OTPInput({ value, onChange }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      const next = value.slice(0, i) + ' ' + value.slice(i + 1);
      onChange(next.trimEnd());
      if (i > 0) inputRefs.current[i - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = value.slice(0, i) + e.key + value.slice(i + 1);
      onChange(next.trimEnd());
      if (i < 5) inputRefs.current[i + 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 sm:gap-2.5 justify-center mb-[18px]">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          value={d.trim()}
          readOnly
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-[22px] font-bold text-[#111827] rounded-xl outline-none bg-white transition-all duration-[180ms] cursor-text"
          style={{
            border: `2px solid ${d.trim() ? PRIMARY : '#e5e7eb'}`,
            boxShadow: d.trim() ? `0 0 0 3px ${PRIMARY}18` : 'none',
          }}
        />
      ))}
    </div>
  );
}
