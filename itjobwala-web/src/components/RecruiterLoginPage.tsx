'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Field from '@/src/components/Field';
import PasswordField from '@/src/components/PasswordField';
import { PRIMARY } from '@/src/lib/constants';
import { signinRecruiter, signupRecruiter, sendRecruiterSignupOTP, verifyRecruiterSignupOTP } from '@/src/lib/api';

type Tab = 'signin' | 'signup';
type SignupForm = { name: string; email: string; password: string; terms: boolean };
type SignupErrors = Partial<Record<keyof SignupForm, string>>;

const EyeOpen = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const Spinner = () => (
  <div style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const SIGNIN_STATS = [
  { v: '4,128', l: 'Active candidates' },
  { v: '342',   l: 'New profiles today' },
  { v: '12 min',l: 'Avg. response time' },
  { v: '92%',   l: 'Reply rate' },
];

const SIGNUP_PERKS = [
  { icon: '⚡', title: 'Post in 2 minutes',       sub: 'Simple job posting, no bloated forms' },
  { icon: '🎯', title: 'Reach matched candidates', sub: 'Only relevant profiles, no mass spam' },
  { icon: '💬', title: 'Direct messaging',         sub: 'Chat with candidates without a recruiter' },
  { icon: '📊', title: 'Smart analytics',          sub: 'Track views, clicks and application rates' },
  { icon: '🔒', title: 'Verified profiles only',   sub: 'All candidates are identity-verified' },
];

function LeftPanel({ tab }: { tab: Tab }) {
  return (
    <div
      className="hidden lg:flex flex-col justify-between relative overflow-hidden shrink-0 w-[440px]"
      style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #4338ca 100%)`, padding: '56px 48px' }}
    >
      <div className="absolute pointer-events-none" style={{ top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: -100, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div className="relative" style={{ zIndex: 1 }}>
        <div className="inline-flex items-center gap-2 rounded-full mb-9" style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
          <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: '#4ade80', boxShadow: '0 0 0 4px rgba(74,222,128,0.2)' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {tab === 'signin' ? 'Recruiter portal' : 'Free to post — no credit card needed'}
          </span>
        </div>

        {tab === 'signin' ? (
          <>
            <h2 className="font-extrabold text-white mb-4" style={{ fontSize: 38, lineHeight: 1.1, letterSpacing: -1.5 }}>
              Welcome back.<br />Let&apos;s get hiring.
            </h2>
            <p className="text-[15px] mb-11" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 340 }}>
              Sign in to manage active jobs, review applications, and message candidates directly.
            </p>

            <div className="rounded-2xl mb-7" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', padding: '18px 20px', backdropFilter: 'blur(8px)' }}>
              <div className="font-bold mb-3.5" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.4, textTransform: 'uppercase' }}>
                Today on itJobwala
              </div>
              <div className="grid grid-cols-2 gap-4">
                {SIGNIN_STATS.map(s => (
                  <div key={s.l}>
                    <div className="font-extrabold text-white" style={{ fontSize: 22, letterSpacing: -0.6, lineHeight: 1 }}>{s.v}</div>
                    <div className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="flex items-center justify-center rounded-full shrink-0 font-extrabold text-[15px]" style={{ width: 42, height: 42, background: '#fbbf24', color: '#78350f' }}>PR</div>
              <div>
                <p className="text-[13px] mb-2" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  &quot;Hired 3 backend engineers in under 2 weeks. Direct chat with candidates is a game-changer.&quot;
                </p>
                <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>Priya R. · TA Lead, Razorpay</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-extrabold text-white mb-4" style={{ fontSize: 36, lineHeight: 1.15, letterSpacing: -1.5 }}>
              Hire IT talent<br />the smart way.
            </h2>
            <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              Post jobs and connect directly with skilled IT professionals — no middlemen, no noise.
            </p>
            <div>
              {SIGNUP_PERKS.map(p => (
                <div key={p.title} className="flex gap-3.5 mb-5">
                  <div className="shrink-0 flex items-center justify-center rounded-[10px]" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', fontSize: 17 }}>{p.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-white mb-0.5">{p.title}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{p.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative flex items-center justify-between pt-6" style={{ zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {tab === 'signin' ? (
          <>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>Bank-grade encryption · SOC2</span>
            </div>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>500+ companies</span>
          </>
        ) : (
          <div className="flex gap-5">
            {[{ v: '4,000+', l: 'Active IT candidates' }, { v: '500+', l: 'Companies hiring' }, { v: '92%', l: 'Response rate' }].map(s => (
              <div key={s.l}>
                <div className="font-extrabold text-white" style={{ fontSize: 20, letterSpacing: -0.5 }}>{s.v}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecruiterLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'signup' ? 'signup' : 'signin');

  /* ── Sign-in state ── */
  const [signinLoading, setSigninLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: true });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginApiError, setLoginApiError] = useState('');

  /* ── Sign-up state ── */
  const [signupForm, setSignupFormState] = useState<SignupForm>({ name: '', email: '', password: '', terms: false });
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});
  const [signupApiError, setSignupApiError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  function switchTab(t: Tab) {
    setTab(t);
  }

  /* ── Sign-in helpers ── */
  function setLogin<K extends keyof typeof loginForm>(k: K, v: (typeof loginForm)[K]) {
    setLoginForm(f => ({ ...f, [k]: v }));
    setLoginErrors(e => ({ ...e, [k]: '' }));
    setLoginApiError('');
  }

  async function handleSignin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) errs.email = 'Enter a valid email address';
    if (!loginForm.password) errs.password = 'Enter your password';
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    setSigninLoading(true);
    setLoginApiError('');
    try {
      await signinRecruiter({ email: loginForm.email.trim(), password: loginForm.password });
      router.replace('/recruiter/dashboard');
    } catch (err) {
      setLoginApiError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSigninLoading(false);
    }
  }

  /* ── Sign-up helpers ── */
  function setSignup<K extends keyof SignupForm>(k: K, v: SignupForm[K]) {
    setSignupFormState(f => ({ ...f, [k]: v }));
    setSignupErrors(e => ({ ...e, [k]: '' }));
    setSignupApiError('');
  }

  async function handleSignupFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: SignupErrors = {};
    if (!signupForm.name.trim()) errs.name = 'Company name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) errs.email = 'Enter a valid work email';
    if (!signupForm.password || signupForm.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!signupForm.terms) errs.terms = 'You must accept the Terms & Conditions';
    if (Object.keys(errs).length) { setSignupErrors(errs); return; }

    setSignupLoading(true);
    setSignupApiError('');
    try {
      await sendRecruiterSignupOTP(signupForm.email.trim());
      setSignupStep('otp');
    } catch (err) {
      setSignupApiError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  }

  async function handleOTPVerification(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!otpCode.trim()) { setOtpError('Enter the OTP code'); return; }

    setOtpLoading(true);
    setOtpError('');
    try {
      const result = await verifyRecruiterSignupOTP(signupForm.email.trim(), otpCode.trim());
      if (!result.valid) throw new Error('Invalid OTP code. Please try again.');

      await signupRecruiter({
        company_name: signupForm.name.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
        terms_accepted: signupForm.terms,
        otp_code: otpCode.trim()
      });
      setSignupSuccess(true);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  }

  const signinLabel = signinLoading ? 'Signing in…' : 'Sign in →';

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-plus-jakarta)', background: '#f8faff' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-[200] border-b border-black/[0.06] shrink-0" style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center justify-between h-[68px]">
          <Link href="/" className="font-extrabold text-xl" style={{ letterSpacing: '-0.5px', textDecoration: 'none', color: '#0f172a' }}>
            <span>it</span><span style={{ color: PRIMARY }}>Jobwala</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline text-[13px] text-gray-500">
              {tab === 'signin' ? 'New to itJobwala?' : 'Already a recruiter?'}
            </span>
            <button
              type="button"
              onClick={() => switchTab(tab === 'signin' ? 'signup' : 'signin')}
              className="text-sm font-bold rounded-lg px-4 sm:px-[18px] py-2 transition-all duration-200"
              style={{ color: PRIMARY, border: `1.5px solid ${PRIMARY}`, background: 'transparent', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = PRIMARY; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PRIMARY; }}
            >
              {tab === 'signin' ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="flex flex-1">
        <LeftPanel tab={tab} />

        <div className="flex-1 flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[420px]">

            {/* Sign-up success */}
            {tab === 'signup' && signupSuccess ? (
              <div className="fade-up text-center rounded-3xl px-6 py-10" style={{ background: '#fff', boxShadow: `0 24px 64px ${PRIMARY}12` }}>
                <div className="flex items-center justify-center rounded-full mx-auto mb-6" style={{ width: 80, height: 80, background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                  <svg width="36" height="36" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 className="font-extrabold text-[#0f172a] mb-2 text-2xl">Welcome aboard!</h2>
                <p className="text-sm text-gray-500 mb-2" style={{ lineHeight: 1.7 }}>
                  Your recruiter account at <strong style={{ color: PRIMARY }}>itJobwala</strong> is ready.
                </p>
                <p className="text-[13px] text-gray-400 mb-8">Start posting jobs and reach thousands of IT professionals.</p>
                <Link href="/recruiter/post-job" className="block text-white rounded-xl font-bold text-[15px] text-center mb-3 py-3.5"
                  style={{ background: PRIMARY, textDecoration: 'none' }}>
                  Post your first job →
                </Link>
                <button type="button" onClick={() => switchTab('signin')}
                  className="block w-full text-[13px] font-semibold text-center bg-transparent border-none cursor-pointer py-1"
                  style={{ color: PRIMARY }}>
                  Go to sign in
                </button>
              </div>
            ) : (
              <>
                {/* ── SIGN IN ── */}
                {tab === 'signin' && (
                  <>
                    <div className="fade-up">
                      <h1 className="font-extrabold text-[#0f172a] mb-1.5 text-2xl sm:text-[28px]" style={{ letterSpacing: -0.8 }}>
                        Recruiter sign in
                      </h1>
                      <p className="text-sm text-gray-500 mb-6">Access your dashboard, jobs and candidates.</p>
                    </div>

                    <form onSubmit={handleSignin} noValidate className="fade-up d1">
                      <Field
                        label="Work email" id="li-email" type="email" placeholder="you@company.com"
                        value={loginForm.email} onChange={v => setLogin('email', v)} error={loginErrors.email}
                        icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                      />
                      <Field
                        label="Password" id="li-password" type={showPwd ? 'text' : 'password'} placeholder="Enter your password"
                        value={loginForm.password} onChange={v => setLogin('password', v)} error={loginErrors.password}
                        icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
                        hint={<a href="#" className="text-xs font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Forgot password?</a>}
                        suffix={
                          <button type="button" onClick={() => setShowPwd(s => !s)} className="flex border-none bg-transparent text-gray-400 cursor-pointer p-0">
                            {showPwd ? <EyeOpen /> : <EyeOff />}
                          </button>
                        }
                      />
                      <label className="flex items-center gap-2.5 cursor-pointer mb-[22px] select-none">
                        <div className="relative shrink-0">
                          <input type="checkbox" checked={loginForm.remember} onChange={e => setLogin('remember', e.target.checked)} className="sr-only" />
                          <div className="flex items-center justify-center rounded-[5px] border-2 transition-all duration-[180ms]"
                            style={{ width: 18, height: 18, borderColor: loginForm.remember ? PRIMARY : '#d1d5db', background: loginForm.remember ? PRIMARY : '#fff' }}>
                            {loginForm.remember && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                        </div>
                        <span className="text-[13px] text-gray-700">Keep me signed in for 30 days</span>
                      </label>

                      {loginApiError && (
                        <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">
                          {loginApiError}
                        </div>
                      )}

                      <button
                        type="submit" disabled={signinLoading}
                        className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200 mb-[18px]"
                        style={{
                          padding: 14,
                          cursor: signinLoading ? 'not-allowed' : 'pointer',
                          background: signinLoading ? '#93aef5' : PRIMARY,
                          boxShadow: signinLoading ? 'none' : `0 6px 20px ${PRIMARY}3a`,
                        }}
                        onMouseEnter={e => { if (!signinLoading) e.currentTarget.style.background = '#0d3fd4'; }}
                        onMouseLeave={e => { if (!signinLoading) e.currentTarget.style.background = PRIMARY; }}
                      >
                        {signinLoading ? <><Spinner /> {signinLabel}</> : signinLabel}
                      </button>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs font-semibold text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200"
                        style={{ border: '1.5px solid #e5e7eb', padding: 12 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = '#f8faff'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
                      >
                        <GoogleIcon />
                        Continue with Google
                      </button>

                      <p className="text-center text-[13px] text-gray-400 mt-7 pt-5" style={{ borderTop: '1px solid #f3f4f6' }}>
                        Looking for a job?{' '}
                        <Link href="/login" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>
                          Sign in as candidate
                        </Link>
                      </p>
                    </form>
                  </>
                )}

                {/* ── SIGN UP ── */}
                {tab === 'signup' && (
                  <>
                    <div className="fade-up">
                      <h1 className="font-extrabold text-[#0f172a] mb-1.5 text-2xl sm:text-[28px]" style={{ letterSpacing: -0.8 }}>
                        {signupStep === 'form' ? 'Create recruiter account' : 'Verify your email'}
                      </h1>
                      <p className="text-sm text-gray-500 mb-6">
                        {signupStep === 'form'
                          ? 'Post a free job and reach thousands of IT professionals.'
                          : `We've sent a verification code to ${signupForm.email}`
                        }
                      </p>
                    </div>

                    {signupStep === 'form' ? (
                    <form onSubmit={handleSignupFormSubmit} noValidate className="fade-up d1">
                      <Field
                        label="Company Name" id="su-name" placeholder="e.g. Razorpay"
                        value={signupForm.name} onChange={v => setSignup('name', v)} error={signupErrors.name}
                        icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                      />
                      <Field
                        label="Work Email" id="su-email" type="email" placeholder="you@company.com"
                        value={signupForm.email} onChange={v => setSignup('email', v)} error={signupErrors.email}
                        hint={<span className="text-[11px] text-gray-400 font-normal">Use your official company email</span>}
                        icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                      />
                      <PasswordField
                        label="Password" id="su-password" placeholder="Min. 8 characters"
                        value={signupForm.password} onChange={v => setSignup('password', v)} error={signupErrors.password}
                      />

                      <div className="mb-6">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <div className="relative shrink-0 mt-0.5">
                            <input type="checkbox" checked={signupForm.terms} onChange={e => setSignup('terms', e.target.checked)} className="sr-only" />
                            <div className="flex items-center justify-center rounded-[6px] border-2 transition-all duration-[180ms]"
                              style={{ width: 20, height: 20, borderColor: signupForm.terms ? PRIMARY : signupErrors.terms ? '#ef4444' : '#d1d5db', background: signupForm.terms ? PRIMARY : '#fff' }}>
                              {signupForm.terms && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                            </div>
                          </div>
                          <span className="text-[13px] text-gray-600 leading-[1.6]">
                            I agree to itJobwala&apos;s{' '}
                            <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Recruiter Policy</Link>
                          </span>
                        </label>
                        {signupErrors.terms && <p className="text-xs text-red-500 mt-1.5 font-medium">{signupErrors.terms}</p>}
                      </div>

                      {signupApiError && (
                        <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">
                          {signupApiError}
                        </div>
                      )}

                      <button
                        type="submit" disabled={signupLoading}
                        className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
                        style={{
                          padding: 15,
                          cursor: signupLoading ? 'not-allowed' : 'pointer',
                          background: signupLoading ? '#93aef5' : PRIMARY,
                          boxShadow: signupLoading ? 'none' : `0 4px 20px ${PRIMARY}44`,
                        }}
                        onMouseEnter={e => { if (!signupLoading) e.currentTarget.style.background = '#0d3fd4'; }}
                        onMouseLeave={e => { if (!signupLoading) e.currentTarget.style.background = PRIMARY; }}
                      >
                        {signupLoading
                          ? <><div className="w-[18px] h-[18px] border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" /> Sending OTP…</>
                          : 'Continue →'
                        }
                      </button>

                      <div className="flex items-center gap-3 mt-4 mb-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs font-semibold text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200 mb-4"
                        style={{ border: '1.5px solid #e5e7eb', padding: 12 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = '#f8faff'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
                      >
                        <GoogleIcon />
                        Continue with Google
                      </button>

                      <p className="text-center text-[13px] text-gray-400 mt-5">
                        Looking for a job?{' '}
                        <Link href="/signup" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Sign up as candidate</Link>
                      </p>
                    </form>
                    ) : (
                    <form onSubmit={handleOTPVerification} noValidate className="fade-up d1">
                      <Field
                        label="Verification Code"
                        id="otp-code"
                        placeholder="Enter 6-digit code from your email"
                        value={otpCode}
                        onChange={v => { setOtpCode(v); setOtpError(''); }}
                        error={otpError}
                        icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 9l6 4 6-4"/></svg>}
                      />

                      <button
                        type="submit" disabled={otpLoading}
                        className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200 mb-4"
                        style={{
                          padding: 15,
                          cursor: otpLoading ? 'not-allowed' : 'pointer',
                          background: otpLoading ? '#93aef5' : PRIMARY,
                          boxShadow: otpLoading ? 'none' : `0 4px 20px ${PRIMARY}44`,
                        }}
                        onMouseEnter={e => { if (!otpLoading) e.currentTarget.style.background = '#0d3fd4'; }}
                        onMouseLeave={e => { if (!otpLoading) e.currentTarget.style.background = PRIMARY; }}
                      >
                        {otpLoading
                          ? <><div className="w-[18px] h-[18px] border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</>
                          : 'Verify & Create Account →'
                        }
                      </button>

                      <button
                        type="button"
                        onClick={() => { setSignupStep('form'); setOtpCode(''); setOtpError(''); }}
                        className="w-full text-center text-[13px] font-semibold py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        ← Back to form
                      </button>
                    </form>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
