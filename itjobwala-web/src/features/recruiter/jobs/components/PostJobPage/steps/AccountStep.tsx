'use client';

import type { FormEvent } from 'react';
import Link from 'next/link';
import Field from '@/src/components/ui/Field';
import PasswordField from '@/src/components/ui/PasswordField';
import { PRIMARY } from '@/src/lib/constants';
import type { AccountForm, AccountErrors } from '../../../schemas/postJob.schema';

interface Props {
  account: AccountForm;
  errors: AccountErrors;
  setField: <K extends keyof AccountForm>(k: K, v: AccountForm[K]) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function AccountStep({ account, errors, setField, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <Field
        label="Full Name" id="fullName" placeholder="e.g. Amit Sharma"
        value={account.fullName} onChange={v => setField('fullName', v)} error={errors.fullName}
        icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
      />
      <Field
        label="Company Name" id="companyName" placeholder="e.g. Razorpay"
        value={account.companyName} onChange={v => setField('companyName', v)} error={errors.companyName}
        icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
      />
      <Field
        label="Work Email" id="email" type="email" placeholder="you@company.com"
        value={account.email} onChange={v => setField('email', v)} error={errors.email}
        hint={<span className="text-[11px] text-gray-400 font-normal">Use your official company email</span>}
        icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
      />
      <PasswordField
        label="Password" id="password" placeholder="Min. 8 characters"
        value={account.password} onChange={v => setField('password', v)} error={errors.password}
      />

      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative shrink-0 mt-0.5">
            <input type="checkbox" checked={account.terms} onChange={e => setField('terms', e.target.checked)} className="sr-only" />
            <div className="flex items-center justify-center rounded-[6px] border-2 transition-all duration-[180ms]"
              style={{ width: 20, height: 20, borderColor: account.terms ? PRIMARY : errors.terms ? '#ef4444' : '#d1d5db', background: account.terms ? PRIMARY : '#fff' }}>
              {account.terms && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
          </div>
          <span className="text-[13px] text-gray-600 leading-[1.6]">
            I agree to itJobwala&apos;s{' '}
            <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Recruiter Policy</Link>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.terms}</p>}
      </div>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
        style={{ padding: 15, background: PRIMARY, boxShadow: `0 4px 20px ${PRIMARY}44`, cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
        onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}>
        Continue to post your job →
      </button>

      <div className="flex items-center gap-3 mt-5 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-semibold text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <button type="button"
        className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200"
        style={{ border: '1.5px solid #e5e7eb', padding: 13 }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = '#f8faff'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}>
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-[13px] text-gray-400 mt-5">
        Looking for a job?{' '}
        <Link href="/auth/signup" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Sign up as candidate</Link>
      </p>
    </form>
  );
}
