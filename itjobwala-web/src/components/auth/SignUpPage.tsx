'use client';

import { useState, type FormEvent, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Field from '@/src/components/ui/Field';
import SelectField from '@/src/components/ui/SelectField';
import PasswordField from '@/src/components/ui/PasswordField';
import { PRIMARY } from '@/src/lib/constants';
import { registerCandidate } from '@/src/lib/api';

const WORK_STATUS_OPTIONS = [
  { value: '',           label: 'Select your work status' },
  { value: 'fresher',    label: 'Fresher / Student' },
  { value: 'experienced',label: 'Experienced Professional' },
];

const PERKS = [
  { icon: '💰', text: 'Salary transparency on every listing' },
  { icon: '🚫', text: 'Zero recruiter spam' },
  { icon: '⚡', text: 'Apply directly to hiring teams' },
  { icon: '🎯', text: 'Roles matched to your skills' },
];

const AVATARS = [
  { bg: '#2563eb', initial: 'R' },
  { bg: '#f97316', initial: 'S' },
  { bg: '#22c55e', initial: 'Z' },
  { bg: '#8b5cf6', initial: 'P' },
];

type FormState = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  workStatus: string;
  terms: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const e: FormErrors = {};
  if (!form.name.trim()) e.name = 'Full name is required';
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = 'Enter a valid email address';
  if (!form.mobile.trim() || !/^[6-9]\d{9}$/.test(form.mobile))
    e.mobile = 'Enter a valid 10-digit mobile number';
  if (!form.password || form.password.length < 8)
    e.password = 'Password must be at least 8 characters';
  if (!form.workStatus) e.workStatus = 'Please select your work status';
  if (!form.terms) e.terms = 'You must accept the Terms & Conditions';
  return e;
}

const pageStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)',
  fontFamily: 'var(--font-plus-jakarta)',
};

export default function SignUpPage() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', mobile: '', password: '', workStatus: '', terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
    setApiError('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      const { token } = await registerCandidate({
        full_name:      form.name.trim(),
        email:          form.email.trim(),
        mobile:         `+91${form.mobile}`,
        password:       form.password,
        work_status:    form.workStatus as 'fresher' | 'experienced',
        terms_accepted: form.terms,
      });
      // If the API returns a token, go directly to the dashboard
      // Otherwise redirect to login so the user can sign in
      window.location.href = token ? '/dashboard' : '/login?registered=1';
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={pageStyle}>
        <div className="fade-up bg-white rounded-3xl px-8 sm:px-12 py-14 max-w-[420px] w-full text-center shadow-[0_24px_64px_rgba(21,87,255,0.1)]">
          <div className="w-[72px] h-[72px] rounded-full bg-[#f0fdf4] border-2 border-[#bbf7d0] flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-[26px] font-extrabold text-[#0f172a] mb-2.5">You&apos;re in! 🎉</h2>
          <p className="text-[15px] text-gray-500 leading-[1.6] mb-7">
            Welcome to <strong style={{ color: PRIMARY }}>itJobwala</strong>. Your account is ready.<br />
            Start exploring thousands of IT jobs.
          </p>
          <Link
            href="/"
            className="block text-white rounded-xl py-3.5 text-[15px] font-bold text-center"
            style={{ background: PRIMARY, textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}
          >
            Browse Jobs →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={pageStyle}>

      {/* Nav */}
      <nav
        className="border-b border-black/[0.06] sticky top-0 z-[200] shrink-0"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)' }}
      >
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ textDecoration: 'none' }}>
            <Image src="/logo.png" alt="itJobwala" width={30} height={30} />
            <span className="font-extrabold text-xl text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
              it<span style={{ color: PRIMARY }}>Jobwala</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline text-[13px] text-gray-500">Already have an account?</span>
            <Link href="/login"
              className="text-sm font-bold rounded-lg px-4 sm:px-[18px] py-2 transition-all duration-200"
              style={{ color: PRIMARY, border: `1.5px solid ${PRIMARY}`, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = PRIMARY; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PRIMARY; }}
            >
              Log in
            </Link>
          </div>
        </div>
      </nav>

      {/* Two-column body */}
      <div className="flex-1 flex">

        {/* Left panel (desktop only) */}
        <div
          className="hidden lg:flex flex-col justify-between relative overflow-hidden shrink-0 w-[440px]"
          style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #4338ca 100%)`, padding: '52px 44px' }}
        >
          <div className="absolute -top-[60px] -right-[60px] w-60 h-60 rounded-full bg-white/[0.06] pointer-events-none" />
          <div className="absolute -bottom-[80px] -left-[40px] w-[280px] h-[280px] rounded-full bg-white/[0.04] pointer-events-none" />

          <div className="relative" style={{ zIndex: 1 }}>
            <div className="inline-flex items-center gap-2 rounded-full mb-8" style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: '#4ade80' }} />
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>4,000+ IT jobs available</span>
            </div>

            <h2 className="font-extrabold text-white mb-4" style={{ fontSize: 36, lineHeight: 1.15, letterSpacing: -1.5 }}>
              Your next IT<br />role is waiting.
            </h2>
            <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              Join thousands of IT professionals who find their dream job without the noise.
            </p>

            <div>
              {PERKS.map((p, i) => (
                <div key={i} className="flex gap-3.5 mb-5">
                  <div className="shrink-0 flex items-center justify-center rounded-[10px]"
                    style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', fontSize: 17 }}>
                    {p.icon}
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">{p.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-4 pt-6" style={{ zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex">
              {AVATARS.map((a, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-extrabold text-white shrink-0"
                  style={{ background: a.bg, marginLeft: i === 0 ? 0 : -8 }}
                >
                  {a.initial}
                </div>
              ))}
            </div>
            <div>
              <div className="font-bold text-white" style={{ fontSize: 13 }}>12,000+ professionals</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>already signed up this month</div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[440px]">

            <div className="fade-up mb-9">
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] mb-2" style={{ letterSpacing: '-0.8px' }}>
                Create your account
              </h1>
              <p className="text-[15px] text-gray-500 leading-[1.6]">
                Find IT jobs that actually match your skills.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              <div className="fade-up delay-2">
                <Field
                  label="Full Name" id="name" placeholder="e.g. Rahul Sharma"
                  value={form.name} onChange={v => set('name', v)} error={errors.name}
                  icon={
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  }
                />
              </div>

              <div className="fade-up delay-3">
                <Field
                  label="Email Address" id="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={v => set('email', v)} error={errors.email}
                  icon={
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  }
                />
              </div>

              <div className="fade-up delay-3">
                <Field
                  label="Mobile Number" id="mobile" type="tel" placeholder="10-digit mobile number"
                  value={form.mobile}
                  onChange={v => set('mobile', v.replace(/\D/g, '').slice(0, 10))}
                  error={errors.mobile}
                  icon={
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.71a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
                    </svg>
                  }
                  suffix={<span className="text-xs text-gray-400 font-medium">+91</span>}
                />
              </div>

              <div className="fade-up delay-4">
                <PasswordField
                  label="Password" id="password" placeholder="Min. 8 characters"
                  value={form.password} onChange={v => set('password', v)} error={errors.password}
                />
              </div>

              <div className="fade-up delay-5">
                <SelectField
                  label="Work Status" id="workStatus"
                  value={form.workStatus} onChange={v => set('workStatus', v)}
                  options={WORK_STATUS_OPTIONS} error={errors.workStatus}
                />
              </div>

              {/* Terms & Conditions */}
              <div className="fade-up delay-6 mb-7">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={form.terms}
                      onChange={e => set('terms', e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all duration-[180ms]"
                      style={{
                        borderColor: form.terms ? PRIMARY : errors.terms ? '#ef4444' : '#d1d5db',
                        background: form.terms ? PRIMARY : '#fff',
                      }}
                    >
                      {form.terms && (
                        <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 leading-[1.6]">
                    I agree to itJobwala&apos;s{' '}
                    <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Privacy Policy</Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.terms}</p>
                )}
              </div>

              {apiError && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">
                  {apiError}
                </div>
              )}

              {/* Submit button */}
              <div className="fade-up delay-7">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full border-none rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-2.5 transition-all duration-200"
                  style={{
                    padding: 15,
                    background: loading ? '#93aef5' : PRIMARY,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : `0 4px 20px ${PRIMARY}44`,
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0d3fd4'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = PRIMARY; }}
                >
                  {loading ? (
                    <>
                      <div className="w-[18px] h-[18px] border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    'Create Account →'
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="fade-up delay-7 flex items-center gap-3 mt-5 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-semibold text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google sign-up */}
              <div className="fade-up delay-7 mb-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200"
                  style={{ border: '1.5px solid #e5e7eb', padding: 13 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = '#f8faff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <p className="fade-up delay-7 text-center text-[13px] text-gray-400 mt-1">
                Already have an account?{' '}
                <Link href="/login" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Log in</Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
