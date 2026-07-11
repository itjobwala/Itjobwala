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
        hint={<span className="text-micro text-[#474d6a] font-normal">Use your official company email</span>}
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
              style={{ width: 20, height: 20, borderColor: account.terms ? PRIMARY : errors.terms ? 'var(--color-danger)' : '#d1d5db', background: account.terms ? PRIMARY : 'var(--color-surface)' }}>
              {account.terms && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
          </div>
          <span className="text-sm text-body-secondary leading-[1.6]">
            I agree to itJobwala&apos;s{' '}
            <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Recruiter Policy</Link>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-danger mt-1.5 font-medium">{errors.terms}</p>}
      </div>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-full font-bold text-sm transition-all duration-200"
        style={{ padding: 15, background: PRIMARY, boxShadow: `0 4px 20px ${PRIMARY}44`, cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
        onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}>
        Continue to post your job →
      </button>

      <p className="text-center text-sm text-[#474d6a] mt-5">
        Looking for a job?{' '}
        <Link href="/auth/signup" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Sign up as candidate</Link>
      </p>
    </form>
  );
}
