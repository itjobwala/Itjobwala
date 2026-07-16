'use client';

import { useState, type ReactNode } from 'react';

type FieldProps = {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  hint?: ReactNode;
};

export default function Field({
  label, id, type = 'text', placeholder, value, onChange, error, icon, prefix, suffix, hint,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-body">
          {label} <span className="text-primary">*</span>
        </label>
        {hint}
      </div>
      <div
        className={[
          'flex items-center h-11 lg:h-12 bg-surface rounded-sm overflow-hidden transition-all duration-[180ms]',
          error
            ? 'border border-danger shadow-[0_0_0_3px_rgba(239,68,68,0.09)]'
            : focused
            ? 'border border-primary shadow-[0_0_0_3px_rgba(21,87,255,0.09)]'
            : 'border border-token-mid',
        ].join(' ')}
      >
        {icon && (
          <div className={`px-3.5 shrink-0 transition-colors duration-200 ${focused ? 'text-primary' : 'text-subtle'}`}>
            {icon}
          </div>
        )}
        {prefix && (
          <div className="shrink-0 text-base font-semibold text-muted pr-1 border-r border-token-mid mr-2 pl-0">
            {prefix}
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
          className={`flex-1 h-full border-none outline-none text-lg text-heading bg-transparent placeholder:text-muted ${icon ? 'pr-3.5 pl-0' : 'px-3.5 lg:px-4'}`}
        />
        {suffix && <div className="px-3.5 shrink-0">{suffix}</div>}
      </div>
      {error && <p className="text-xs text-danger mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
