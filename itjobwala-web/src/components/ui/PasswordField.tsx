'use client';

import { useState } from 'react';
import { PRIMARY } from '@/src/lib/constants';

type PasswordFieldProps = {
  label: string;
  id: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showStrength?: boolean;
};

const EyeOpen = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'];

function getStrength(password: string): number {
  if (password.length === 0) return 0;
  if (password.length < 6) return 1;
  if (password.length < 10) return 2;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 4;
  return 3;
}

export default function PasswordField({ label, id, placeholder, value, onChange, error, showStrength = true }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const strength = getStrength(value);

  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-semibold text-body mb-1.5">
        {label} <span style={{ color: PRIMARY }}>*</span>
      </label>
      <div
        className={[
          'flex items-center bg-surface rounded-xl overflow-hidden transition-all duration-[180ms]',
          error
            ? 'border-[1.5px] border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.09)]'
            : focused
            ? 'border-[1.5px] border-[#1557FF] shadow-[0_0_0_3px_rgba(21,87,255,0.09)]'
            : 'border-[1.5px] border-token-mid',
        ].join(' ')}
      >
        <div className={`px-3.5 shrink-0 transition-colors duration-200 ${focused ? 'text-[#1557FF]' : 'text-subtle'}`}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 border-none outline-none text-md text-heading bg-transparent py-3.5"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="flex items-center px-3.5 text-subtle cursor-pointer bg-transparent border-none"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOpen /> : <EyeClosed />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className="flex-1 h-[3px] rounded-full transition-colors duration-300"
                style={{ background: n <= strength ? STRENGTH_COLORS[strength] : 'var(--color-surface-mid)' }}
              />
            ))}
          </div>
          <span className="text-micro font-semibold" style={{ color: STRENGTH_COLORS[strength] }}>
            {STRENGTH_LABELS[strength]} password
          </span>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
