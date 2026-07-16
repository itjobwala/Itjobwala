'use client';

import { useState } from 'react';
import { PRIMARY } from '@/src/lib/constants';

type Option = { value: string; label: string };

type SelectFieldProps = {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
};

export default function SelectField({ label, id, value, onChange, options, error }: SelectFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-semibold text-body mb-1.5">
        {label} <span style={{ color: PRIMARY }}>*</span>
      </label>
      <div
        className={[
          'relative h-11 lg:h-12 rounded-sm bg-surface transition-all duration-[180ms]',
          error
            ? 'border border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.09)]'
            : focused
            ? 'border border-[#1557FF] shadow-[0_0_0_3px_rgba(21,87,255,0.09)]'
            : 'border border-token-mid',
        ].join(' ')}
      >
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full h-full appearance-none border-none outline-none text-lg bg-transparent cursor-pointer pl-3.5 lg:pl-4 pr-11 ${value ? 'text-heading' : 'text-muted'}`}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} disabled={o.value === ''} className="text-heading">
              {o.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-subtle">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
