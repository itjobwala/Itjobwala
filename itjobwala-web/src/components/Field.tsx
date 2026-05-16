'use client';

import { useState, type ReactNode } from 'react';
import { PRIMARY } from '@/src/lib/constants';

type FieldProps = {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  hint?: ReactNode;
};

export default function Field({
  label, id, type = 'text', placeholder, value, onChange, error, icon, suffix, hint,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-1.5">
        <label htmlFor={id} className="text-[13px] font-semibold text-gray-700">
          {label} <span style={{ color: PRIMARY }}>*</span>
        </label>
        {hint}
      </div>
      <div
        className={[
          'flex items-center bg-white rounded-xl overflow-hidden transition-all duration-[180ms]',
          error
            ? 'border-[1.5px] border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.09)]'
            : focused
            ? 'border-[1.5px] border-[#1557FF] shadow-[0_0_0_3px_rgba(21,87,255,0.09)]'
            : 'border-[1.5px] border-gray-200',
        ].join(' ')}
      >
        {icon && (
          <div className={`px-3.5 shrink-0 transition-colors duration-200 ${focused ? 'text-[#1557FF]' : 'text-gray-400'}`}>
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 border-none outline-none text-[15px] text-gray-900 bg-transparent ${icon ? 'py-3.5 pr-3.5 pl-0' : 'py-3.5 px-4'}`}
        />
        {suffix && <div className="px-3.5 shrink-0">{suffix}</div>}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
