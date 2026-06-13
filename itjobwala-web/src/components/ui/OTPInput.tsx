'use client';

import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { PRIMARY } from '@/src/lib/constants';

type OTPInputProps = {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  disabled?: boolean;
};

export default function OTPInput({ value, onChange, onComplete, disabled = false }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  function commit(next: string) {
    const trimmed = next.trimEnd();
    onChange(trimmed);
    if (trimmed.length === 6 && onComplete) onComplete(trimmed);
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      const next = value.slice(0, i) + ' ' + value.slice(i + 1);
      commit(next);
      if (i > 0) inputRefs.current[i - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const next = value.slice(0, i) + e.key + value.slice(i + 1);
      commit(next);
      if (i < 5) inputRefs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const padded = pasted.padEnd(6, ' ');
    commit(padded);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  return (
    <div className="flex gap-2 sm:gap-2.5 justify-center mb-[18px]" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          value={d.trim()}
          readOnly
          disabled={disabled}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-3xl font-bold text-heading rounded-xl outline-none bg-surface transition-all duration-[180ms] cursor-text disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            border: `2px solid ${d.trim() ? PRIMARY : 'var(--color-surface-mid)'}`,
            boxShadow: d.trim() ? `0 0 0 3px ${PRIMARY}18` : 'none',
          }}
        />
      ))}
    </div>
  );
}
