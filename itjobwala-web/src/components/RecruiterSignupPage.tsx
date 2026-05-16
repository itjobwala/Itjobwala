'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Field from '@/src/components/Field';
import PasswordField from '@/src/components/PasswordField';
import { PRIMARY } from '@/src/lib/constants';
import { signupRecruiter } from '@/src/lib/api';

const PERKS = [
  { icon: '⚡', title: 'Post in 2 minutes',       sub: 'Simple job posting, no bloated forms' },
  { icon: '🎯', title: 'Reach matched candidates', sub: 'Only relevant profiles, no mass spam' },
  { icon: '💬', title: 'Direct messaging',         sub: 'Chat with candidates without a recruiter' },
  { icon: '📊', title: 'Smart analytics',          sub: 'Track views, clicks and application rates' },
  { icon: '🔒', title: 'Verified profiles only',   sub: 'All candidates are identity-verified' },
];

type FormState = { name: string; email: string; password: string; terms: boolean };
type Errors = Partial<Record<keyof FormState, string>>;

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden shrink-0 w-[440px]"
      style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #4338ca 100%)`, padding: '52px 44px' }}>
      <div className="absolute pointer-events-none" style={{ top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: -80, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div className="relative" style={{ zIndex: 1 }}>
        <div className="inline-flex items-center gap-2 rounded-full mb-8" style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
          <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: '#4ade80' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Free to post — no credit card needed</span>
        </div>

        <h2 className="font-extrabold text-white mb-4" style={{ fontSize: 36, lineHeight: 1.15, letterSpacing: -1.5 }}>
          Hire IT talent<br />the smart way.
        </h2>
        <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
          Post jobs and connect directly with skilled IT professionals — no middlemen, no noise.
        </p>

        <div>
          {PERKS.map((p) => (
            <div key={p.title} className="flex gap-3.5 mb-5">
              <div className="shrink-0 flex items-center justify-center rounded-[10px]"
                style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', fontSize: 17 }}>
                {p.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">{p.title}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex gap-5 pt-6" style={{ zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {[{ v: '4,000+', l: 'Active IT candidates' }, { v: '500+', l: 'Companies hiring' }, { v: '92%', l: 'Response rate' }].map(s => (
          <div key={s.l}>
            <div className="font-extrabold text-white" style={{ fontSize: 20, letterSpacing: -0.5 }}>{s.v}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RecruiterSignupPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', terms: false });
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setApiError('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: Errors = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid work email';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.terms) errs.terms = 'You must accept the Terms & Conditions';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      await signupRecruiter({
        company_name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        terms_accepted: form.terms,
      });
      setSuccess(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-6" style={{ fontFamily: 'var(--font-plus-jakarta)', background: '#f8faff' }}>
      <div className="fade-up text-center rounded-3xl w-full px-6 py-10 sm:px-12 sm:py-14" style={{ background: '#fff', maxWidth: 440, boxShadow: `0 24px 64px ${PRIMARY}12` }}>
        <div className="flex items-center justify-center rounded-full mx-auto mb-6" style={{ width: 80, height: 80, background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
          <svg width="36" height="36" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="font-extrabold text-[#0f172a] mb-2 text-2xl">Welcome aboard!</h2>
        <p className="text-sm text-gray-500 mb-2" style={{ lineHeight: 1.7 }}>
          Your recruiter account at <strong style={{ color: PRIMARY }}>itJobwala</strong> is ready.
        </p>
        <p className="text-[13px] text-gray-400 mb-8">Start posting jobs and reach thousands of IT professionals.</p>
        <Link href="/" className="block text-white rounded-xl font-bold text-[15px] text-center mb-3 py-3.5"
          style={{ background: PRIMARY, textDecoration: 'none' }}>
          Post your first job →
        </Link>
        <Link href="/recruiter/login" className="block text-[13px] font-semibold"
          style={{ color: PRIMARY, textDecoration: 'none' }}>
          Go to dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-plus-jakarta)', background: '#f8faff' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-[200] border-b border-black/[0.06] shrink-0" style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center justify-between h-[68px]">
          <Link href="/" className="font-extrabold text-xl" style={{ letterSpacing: '-0.5px', textDecoration: 'none', color: '#0f172a' }}>
            <span>it</span><span style={{ color: PRIMARY }}>Jobwala</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline text-[13px] text-gray-500">Already a recruiter?</span>
            <Link href="/recruiter/login"
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

      {/* Body */}
      <div className="flex flex-1">
        <LeftPanel />

        {/* Form */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[440px]">

            <div className="fade-up mb-7">
              <h1 className="font-extrabold text-[#0f172a] mb-1.5 text-2xl sm:text-[28px]" style={{ letterSpacing: -0.8 }}>
                Post a free job
              </h1>
              <p className="text-sm text-gray-500">Create your recruiter account in seconds.</p>
            </div>

            {/* Guided flow nudge */}
            <div className="fade-up mb-5 rounded-[14px] px-4 py-3.5 flex items-center justify-between gap-4" style={{ background: '#f0f4ff', border: `1px solid ${PRIMARY}22` }}>
              <div>
                <div className="text-[13px] font-semibold text-[#0f172a]">Want a guided setup?</div>
                <div className="text-[12px] text-gray-500 mt-0.5">Add company profile, hiring needs &amp; more</div>
              </div>
              <Link
                href="/recruiter/post-job"
                className="shrink-0 rounded-lg px-4 py-2 text-[13px] font-bold whitespace-nowrap"
                style={{ background: PRIMARY, color: '#fff', textDecoration: 'none' }}
              >
                Post a Free Job →
              </Link>
            </div>

            {/* Google SSO */}
            <div className="fade-up d1 mb-5">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200"
                style={{ border: '1.5px solid #e5e7eb', padding: 13 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = '#f8faff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="fade-up d2 flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-semibold text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="fade-up d2">
                <Field
                  label="Full Name" id="name" placeholder="e.g. Amit Sharma"
                  value={form.name} onChange={v => set('name', v)} error={errors.name}
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                />
              </div>
              <div className="fade-up d3">
                <Field
                  label="Work Email" id="email" type="email" placeholder="you@company.com"
                  value={form.email} onChange={v => set('email', v)} error={errors.email}
                  hint={<span className="text-[11px] text-gray-400 font-normal">Use your official company email</span>}
                  icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                />
              </div>
              <div className="fade-up d4">
                <PasswordField
                  label="Password" id="password" placeholder="Min. 8 characters"
                  value={form.password} onChange={v => set('password', v)} error={errors.password}
                />
              </div>

              {/* T&C */}
              <div className="fade-up d5 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative shrink-0 mt-0.5">
                    <input type="checkbox" checked={form.terms} onChange={e => set('terms', e.target.checked)} className="sr-only" />
                    <div className="flex items-center justify-center rounded-[6px] border-2 transition-all duration-[180ms]"
                      style={{ width: 20, height: 20, borderColor: form.terms ? PRIMARY : errors.terms ? '#ef4444' : '#d1d5db', background: form.terms ? PRIMARY : '#fff' }}>
                      {form.terms && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                  </div>
                  <span className="text-[13px] text-gray-600 leading-[1.6]">
                    I agree to itJobwala's{' '}
                    <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Recruiter Policy</Link>
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.terms}</p>}
              </div>

              {apiError && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">
                  {apiError}
                </div>
              )}

              {/* Submit */}
              <div className="fade-up d6">
                <button
                  type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
                  style={{
                    padding: 15,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? '#93aef5' : PRIMARY,
                    boxShadow: loading ? 'none' : `0 4px 20px ${PRIMARY}44`,
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0d3fd4'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = PRIMARY; }}
                >
                  {loading
                    ? <><div className="w-[18px] h-[18px] border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" /> Creating account…</>
                    : 'Post a Free Job →'
                  }
                </button>
              </div>
            </form>

            <p className="text-center text-[13px] text-gray-400 mt-5">
              Looking for a job?{' '}
              <Link href="/signup" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Sign up as candidate</Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
