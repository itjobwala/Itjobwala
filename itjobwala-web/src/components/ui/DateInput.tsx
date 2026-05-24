'use client';

import { useRef } from 'react';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function DateInput({ label, value, onChange, disabled = false }: DateInputProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="YYYY-MM-DD"
          disabled={disabled}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-[13px] font-medium outline-none transition-colors placeholder:text-gray-400 ${
            disabled
              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 text-[#0f172a] focus:border-primary/50'
          }`}
        />
        {!disabled && (
          <button
            type="button"
            onClick={() => hiddenRef.current?.showPicker?.()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </button>
        )}
        <input
          ref={hiddenRef}
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          tabIndex={-1}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />
      </div>
    </label>
  );
}
