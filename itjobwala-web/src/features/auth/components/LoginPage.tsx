'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Field from '@/src/components/ui/Field';
import PasswordField from '@/src/components/ui/PasswordField';
import OTPInput from '@/src/components/ui/OTPInput';
import { sendSigninOtp, verifySigninOtpAndLogin } from '@/features/auth/services/signinOtp.api';
import { ResendCooldownError } from '@/features/auth/services/otp.api';
import { requestPasswordReset, submitPasswordReset, ResetCooldownError } from '@/features/auth/services/forgotPassword.api';
import { ApiError } from '@/src/lib/api/client';

import { signinCandidate } from '@/features/auth/services/candidate.api';
import { signinRecruiter } from '@/features/auth/services/recruiter.api';

type Role = 'candidate' | 'recruiter';

const EmailIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const LockIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const Spinner = () => (
  <div style={{
    width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  }} />
);

function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-black/[0.06] shrink-0"
      style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)' }}
    >
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center h-[68px] gap-9">
        <Link href="/" className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="itJobwala" width={30} height={30} />
          <span className="font-extrabold text-xl text-heading" style={{ letterSpacing: '-0.5px' }}>
            it<span className="text-primary">Jobwala</span>
          </span>
        </Link>
        <div className="hidden sm:flex gap-7 flex-1">
          <Link href="/candidate/jobs" className="text-sm font-medium text-body no-underline"
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-body)'; }}
          >
            Find Jobs
          </Link>
<Link href="/recruiter/post-job" className="text-sm font-medium text-body no-underline"
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-body)'; }}
          >
            Post a Job
          </Link>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center ml-auto sm:ml-0">
          <span className="hidden sm:inline text-sm text-muted">New here?</span>
          <Link
            href="/auth/signup"
            className="text-sm font-bold rounded-lg px-4 sm:px-[18px] py-2 transition-all duration-200 no-underline"
            style={{ color: 'var(--color-primary)', border: '1.5px solid var(--color-primary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          >
            <span className="sm:hidden">Sign up</span>
            <span className="hidden sm:inline">Sign up free</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function LeftPanel({ role }: { role: Role }) {
  if (role === 'recruiter') {
    return (
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden w-[440px] shrink-0"
        style={{ background: 'linear-gradient(160deg, var(--color-primary) 0%, #4338ca 100%)', padding: '56px 48px' }}
      >
        <div className="absolute" style={{ top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div className="absolute" style={{ bottom: -100, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div className="relative" style={{ zIndex: 1 }}>
          <div className="inline-flex items-center gap-2 rounded-full mb-9" style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
            <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: '#4ade80', boxShadow: '0 0 0 4px rgba(74,222,128,0.2)' }} />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Recruiter portal</span>
          </div>
          <h2 className="font-extrabold text-white mb-4" style={{ fontSize: 40, lineHeight: 1.1, letterSpacing: -1.6 }}>
            Welcome back.<br />Let&apos;s get hiring.
          </h2>
          <p className="text-sm mb-9" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 360 }}>
            Sign in to manage active jobs, review applications, and message candidates directly.
          </p>
          <div className="mb-8">
            {[
              { icon: '⚡', title: 'Post in 2 minutes', sub: 'Simple job posting, no bloated forms' },
              { icon: '🎯', title: 'Reach matched candidates', sub: 'Only relevant profiles, no mass spam' },
              { icon: '💬', title: 'Direct messaging', sub: 'Chat with candidates without a middleman' },
            ].map((p) => (
              <div key={p.title} className="flex gap-3.5 mb-4">
                <div className="shrink-0 flex items-center justify-center rounded-[10px]" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', fontSize: 17 }}>
                  {p.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-white mb-0.5">{p.title}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{p.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex gap-6 pt-6" style={{ zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          {[{ v: '500+', l: 'Companies hiring' }, { v: '4,000+', l: 'IT candidates' }, { v: '92%', l: 'Reply rate' }].map((s) => (
            <div key={s.l}>
              <div className="font-extrabold text-white" style={{ fontSize: 22, letterSpacing: -0.6, lineHeight: 1 }}>{s.v}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="hidden lg:flex flex-col justify-between relative overflow-hidden w-[440px] shrink-0"
      style={{ background: 'linear-gradient(160deg, var(--color-primary) 0%, #4338ca 100%)', padding: '56px 48px' }}
    >
      <div className="absolute" style={{ top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
      <div className="absolute" style={{ bottom: -100, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="inline-flex items-center gap-2 rounded-full mb-9" style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
          <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: '#4ade80', boxShadow: '0 0 0 4px rgba(74,222,128,0.2)' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>4,000+ active IT jobs</span>
        </div>
        <h2 className="font-extrabold text-white mb-4" style={{ fontSize: 40, lineHeight: 1.1, letterSpacing: -1.6 }}>
          Welcome back.<br />Your next role awaits.
        </h2>
        <p className="text-sm mb-9" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 360 }}>
          Sign in to track applications, get matched roles, and chat directly with recruiters — no middlemen.
        </p>
        <div className="mb-8">
          {[
            { icon: '📥', title: 'Track every application', sub: 'See views, shortlists and recruiter replies' },
            { icon: '🎯', title: 'Roles matched to your skills', sub: 'Stop scrolling — relevant jobs surface first' },
            { icon: '💬', title: 'Direct chat with recruiters', sub: 'Skip the queue, message hiring managers' },
          ].map((p) => (
            <div key={p.title} className="flex gap-3.5 mb-4">
              <div className="shrink-0 flex items-center justify-center rounded-[10px]" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', fontSize: 17 }}>
                {p.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">{p.title}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex gap-6 pt-6" style={{ zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {[{ v: '4,000+', l: 'IT jobs live' }, { v: '500+', l: 'Companies hiring' }, { v: '92%', l: 'Reply rate' }].map((s) => (
          <div key={s.l}>
            <div className="font-extrabold text-white" style={{ fontSize: 22, letterSpacing: -0.6, lineHeight: 1 }}>{s.v}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleToggle({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div className="flex p-1 bg-surface-mid rounded-xl mb-7">
      <button
        type="button"
        onClick={() => onChange('candidate')}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
        style={role === 'candidate'
          ? { background: '#fff', color: 'var(--color-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }
          : { background: 'transparent', color: 'var(--color-muted)' }
        }
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Candidate
      </button>
      <button
        type="button"
        onClick={() => onChange('recruiter')}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
        style={role === 'recruiter'
          ? { background: '#fff', color: 'var(--color-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }
          : { background: 'transparent', color: 'var(--color-muted)' }
        }
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
        Recruiter
      </button>
    </div>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>(() =>
    searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate'
  );
  const [screen, setScreen] = useState<'email' | 'send-otp' | 'otp' | 'forgot' | 'forgot-sent' | 'reset' | 'reset-success'>('email');


  /* OTP signin state */
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [otp, setOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  /* Password signin state */
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  /* Forgot / reset password state */
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetApiError, setResetApiError] = useState('');

  /* Countdown timer */
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    countdownRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => { if (countdownRef.current) clearTimeout(countdownRef.current); };
  }, [countdown]);

  function startCountdown(seconds: number) {
    setCountdown(seconds);
  }

  async function handleSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError('');
    setApiError('');
    setSendLoading(true);
    try {
      await sendSigninOtp({ email: trimmed, role });
      setOtp('');
      startCountdown(30);
      setScreen('otp');
    } catch (err) {
      if (err instanceof ResendCooldownError) {
        setApiError(`Please wait ${err.retryAfterSeconds} seconds before requesting a new code.`);
      } else if (err instanceof ApiError && err.status === 403) {
        window.location.href = `/auth/verify-otp?email=${encodeURIComponent(trimmed)}&role=${role}`;
      } else {
        setApiError(err instanceof Error ? err.message : 'Failed to send code. Please try again.');
      }
    } finally {
      setSendLoading(false);
    }
  }

  async function handlePasswordSignin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email address');
      return;
    }
    if (!password) {
      setPasswordError('Enter your password');
      return;
    }
    setEmailError('');
    setPasswordError('');
    setApiError('');
    setPasswordLoading(true);
    try {
      if (role === 'recruiter') {
        await signinRecruiter({ email: trimmed, password });
      } else {
        await signinCandidate({ email: trimmed, password });
      }
      const next = searchParams.get('next');
      const safeDest = role === 'recruiter'
        ? (next && next.startsWith('/recruiter') && !next.startsWith('//') ? next : '/recruiter/dashboard')
        : (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/auth/login') ? next : '/candidate/dashboard');
      window.location.href = safeDest;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        window.location.href = `/auth/verify-otp?email=${encodeURIComponent(trimmed)}&role=${role}`;
      } else {
        setApiError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleVerify(otpValue?: string) {
    const code = otpValue ?? otp;
    if (code.replace(/\s/g, '').length < 6) return;
    setApiError('');
    setVerifyLoading(true);
    try {
      await verifySigninOtpAndLogin({ email: email.trim(), role, otp: code });
      const next = searchParams.get('next');
      const safeDest = role === 'recruiter'
        ? (next && next.startsWith('/recruiter') && !next.startsWith('//') ? next : '/recruiter/dashboard')
        : (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/auth/login') ? next : '/candidate/dashboard');
      window.location.href = safeDest;
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0 || resendLoading) return;
    setResendSuccess(false);
    setApiError('');
    setResendLoading(true);
    try {
      await sendSigninOtp({ email: email.trim(), role });
      setOtp('');
      startCountdown(30);
      setResendSuccess(true);
    } catch (err) {
      if (err instanceof ResendCooldownError) {
        startCountdown(err.retryAfterSeconds);
      } else {
        setApiError(err instanceof Error ? err.message : 'Failed to resend code.');
      }
    } finally {
      setResendLoading(false);
    }
  }

  async function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = forgotEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setForgotError('Enter a valid email address');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      await requestPasswordReset({ email: trimmed, role });
      setScreen('forgot-sent');
      setResetOtp('');
      setNewPassword('');
      setResetApiError('');
    } catch (err) {
      if (err instanceof ResetCooldownError) {
        setForgotError(`Please wait ${err.retryAfterSeconds} seconds before requesting another code.`);
      } else {
        setForgotError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (resetOtp.length < 6) {
      setResetApiError('Enter the 6-digit code from your email.');
      return;
    }
    setNewPasswordError('');
    setResetApiError('');
    setResetLoading(true);
    try {
      await submitPasswordReset({ email: forgotEmail.trim(), role, otp: resetOtp, new_password: newPassword });
      setScreen('reset-success');
    } catch (err) {
      setResetApiError(err instanceof Error ? err.message : 'Reset failed. Please try again.');
    } finally {
      setResetLoading(false);
    }
  }

  if (screen === 'forgot') return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-plus-jakarta)', background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)' }}>
      <NavBar />
      <div className="flex-1 flex">
        <LeftPanel role="candidate" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[420px]">
            <button
              onClick={() => setScreen('email')}
              className="flex items-center gap-1.5 bg-transparent border-none text-sm font-semibold text-muted cursor-pointer mb-8 p-0 hover:text-body transition-colors"
            >
              <BackIcon /> Back to login
            </button>
            <div className="fade-up mb-8">
              <div className="flex items-center justify-center rounded-2xl mb-5" style={{ width: 56, height: 56, background: '#eef3ff', border: '1.5px solid #c7d7fe' }}>
                <LockIcon />
              </div>
              <h1 className="font-extrabold text-heading mb-2" style={{ fontSize: 28, letterSpacing: -0.8 }}>Forgot password?</h1>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>No worries! Enter your email and we&apos;ll send you a reset link.</p>
            </div>
            <form onSubmit={handleForgot} noValidate>
              <div className="fade-up d1">
                <Field label="Email Address" id="forgot-email" type="email" placeholder="you@example.com"
                  value={forgotEmail} onChange={(v) => { setForgotEmail(v); setForgotError(''); }} error={forgotError}
                  icon={<EmailIcon />}
                />
              </div>
              <div className="fade-up d2">
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-sm cursor-pointer transition-all duration-200"
                  style={{ padding: 14, background: forgotLoading ? '#93aef5' : 'var(--color-primary)', boxShadow: forgotLoading ? 'none' : '0 4px 20px rgba(21,87,255,0.27)' }}
                >
                  {forgotLoading ? <><Spinner /> Sending…</> : 'Send reset link'}
                </button>
              </div>
            </form>
            <p className="text-center text-sm text-subtle mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-bold text-primary no-underline">Register free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === 'forgot-sent') return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-6" style={{ fontFamily: 'var(--font-plus-jakarta)', background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)' }}>
      <div className="fade-up text-center rounded-3xl w-full px-6 py-10 sm:px-12 sm:py-14" style={{ background: '#fff', maxWidth: 420, boxShadow: '0 24px 64px rgba(21,87,255,0.08)' }}>
        <div className="flex items-center justify-center rounded-full mx-auto mb-6" style={{ width: 72, height: 72, background: '#eef3ff', border: '2px solid #c7d7fe' }}>
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-primary">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h2 className="font-extrabold text-heading mb-2.5" style={{ fontSize: 26 }}>Check your inbox</h2>
        <p className="text-sm text-muted mb-2" style={{ lineHeight: 1.6 }}>
          If an account with <strong className="text-heading">{forgotEmail}</strong> exists, we&apos;ve sent a password reset code.
        </p>
        <p className="text-sm text-subtle mb-8">Didn&apos;t receive it? Check your spam folder or verify the email you used to sign up.</p>
        <button
          onClick={() => setScreen('reset')}
          className="w-full text-white border-none rounded-xl font-bold text-sm cursor-pointer mb-3"
          style={{ padding: 13, background: 'var(--color-primary)', boxShadow: '0 4px 20px rgba(21,87,255,0.27)' }}
        >
          Enter reset code
        </button>
        <button
          onClick={() => setScreen('email')}
          className="w-full border-none bg-transparent font-semibold text-base cursor-pointer"
          style={{ padding: 10, color: 'var(--color-muted)' }}
        >
          Back to login
        </button>
      </div>
    </div>
  );

  if (screen === 'reset') return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-plus-jakarta)', background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)' }}>
      <NavBar />
      <div className="flex-1 flex">
        <LeftPanel role="candidate" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[420px]">
            <button
              onClick={() => setScreen('forgot')}
              className="flex items-center gap-1.5 bg-transparent border-none text-sm font-semibold text-muted cursor-pointer mb-8 p-0 hover:text-body transition-colors"
            >
              <BackIcon /> Back
            </button>
            <div className="fade-up mb-8">
              <h1 className="font-extrabold text-heading mb-2" style={{ fontSize: 28, letterSpacing: -0.8 }}>Set new password</h1>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                Enter the 6-digit code sent to <strong>{forgotEmail}</strong> and choose a new password.
              </p>
            </div>
            {resetApiError && (
              <div className="mb-4 rounded-xl px-4 py-3 bg-danger-bg border border-danger">
                <p className="text-sm font-medium text-danger">{resetApiError}</p>
              </div>
            )}
            <form onSubmit={handleReset} noValidate>
              <div className="fade-up d1 mb-5">
                <label className="block text-sm font-semibold text-body mb-2">Reset code</label>
                <OTPInput
                  value={resetOtp}
                  onChange={(v) => { setResetOtp(v); setResetApiError(''); }}
                  disabled={resetLoading}
                />
              </div>
              <div className="fade-up d2 mb-5">
                <PasswordField
                  label="New password"
                  id="new-password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(v) => { setNewPassword(v); setNewPasswordError(''); }}
                  error={newPasswordError}
                  showStrength={true}
                />
              </div>
              <div className="fade-up d3">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-sm cursor-pointer transition-all duration-200"
                  style={{ padding: 14, background: resetLoading ? '#93aef5' : 'var(--color-primary)', boxShadow: resetLoading ? 'none' : '0 4px 20px rgba(21,87,255,0.27)' }}
                >
                  {resetLoading ? <><Spinner /> Resetting…</> : 'Reset password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === 'reset-success') return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-6" style={{ fontFamily: 'var(--font-plus-jakarta)', background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)' }}>
      <div className="fade-up text-center rounded-3xl w-full px-6 py-10 sm:px-12 sm:py-14" style={{ background: '#fff', maxWidth: 420, boxShadow: '0 24px 64px rgba(21,87,255,0.08)' }}>
        <div className="flex items-center justify-center rounded-full mx-auto mb-6" style={{ width: 72, height: 72, background: '#dcfce7', border: '2px solid #86efac' }}>
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-success">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-extrabold text-heading mb-2.5" style={{ fontSize: 26 }}>Password reset!</h2>
        <p className="text-sm text-muted mb-8" style={{ lineHeight: 1.6 }}>
          Your password has been updated. All existing sessions have been signed out. Sign in with your new password.
        </p>
        <button
          onClick={() => { setScreen('email'); setForgotEmail(''); setResetOtp(''); setNewPassword(''); }}
          className="w-full text-white border-none rounded-xl font-bold text-sm cursor-pointer"
          style={{ padding: 13, background: 'var(--color-primary)', boxShadow: '0 4px 20px rgba(21,87,255,0.27)' }}
        >
          Sign in
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-plus-jakarta)', background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)' }}>
      <NavBar />

      <div className="flex-1 flex">
        <LeftPanel role={role} />

        <div className="flex-1 flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[440px]">

            {searchParams.get('registered') === '1' && (
              <div className="fade-up mb-5 flex items-start gap-3 rounded-xl px-4 py-3.5 bg-success-bg border border-success">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0 mt-0.5 text-success">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-800">Account created! Sign in to continue.</p>
                  <p className="text-caption text-success mt-0.5">Welcome to itJobwala — your IT career starts here.</p>
                </div>
              </div>
            )}

            {/* ── Password sign-in (default) ── */}
            {screen === 'email' && (
              <>
                <div className="fade-up mb-7">
                  <h1 className="font-extrabold text-heading mb-2 text-2xl sm:text-[30px]" style={{ letterSpacing: -1 }}>
                    Sign in to itJobwala
                  </h1>
                  <p className="text-base text-muted" style={{ lineHeight: 1.6 }}>
                    Enter your email and password to continue.
                  </p>
                </div>

                <RoleToggle role={role} onChange={(r) => { setRole(r); setApiError(''); }} />

                <form onSubmit={handlePasswordSignin} noValidate>
                  <div className="fade-up d2">
                    <Field
                      label={role === 'recruiter' ? 'Work Email' : 'Email Address'}
                      id="email"
                      type="email"
                      placeholder={role === 'recruiter' ? 'you@company.com' : 'you@example.com'}
                      value={email}
                      onChange={(v) => { setEmail(v); setEmailError(''); setApiError(''); }}
                      error={emailError}
                      icon={<EmailIcon />}
                    />
                  </div>

                  <div className="fade-up d3">
                    <PasswordField
                      label="Password"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(v) => { setPassword(v); setPasswordError(''); setApiError(''); }}
                      error={passwordError}
                      showStrength={false}
                    />
                  </div>

                  <div className="flex justify-end mb-5 -mt-1">
                    <button
                      type="button"
                      onClick={() => { setForgotEmail(email); setScreen('forgot'); }}
                      className="bg-transparent border-none text-caption font-semibold cursor-pointer p-0 transition-colors duration-200"
                      style={{ color: '#94a3b8' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {apiError && (
                    <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-danger bg-danger-bg border border-danger">
                      {apiError}
                    </div>
                  )}

                  <div className="fade-up d4">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-sm transition-all duration-200"
                      style={{
                        padding: 14,
                        cursor: passwordLoading ? 'not-allowed' : 'pointer',
                        background: passwordLoading ? '#93aef5' : 'linear-gradient(135deg, var(--color-primary) 0%, #4338ca 100%)',
                        boxShadow: passwordLoading ? 'none' : '0 4px 20px rgba(21,87,255,0.27)',
                      }}
                      onMouseEnter={(e) => { if (!passwordLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(21,87,255,0.31)'; } }}
                      onMouseLeave={(e) => { if (!passwordLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(21,87,255,0.27)'; } }}
                    >
                      {passwordLoading ? <><Spinner /> Signing in…</> : (
                        <>
                          Sign in
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* ── OR divider ── */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-border-mid))' }} />
                  <span className="text-micro font-bold uppercase tracking-widest text-gray-300">or</span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, var(--color-border-mid))' }} />
                </div>

                {/* ── Switch to OTP ── */}
                <div className="fade-up d5">
                  <button
                    type="button"
                    onClick={() => { setApiError(''); setScreen('send-otp'); }}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                    style={{
                      padding: 14,
                      cursor: 'pointer',
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1.5px solid var(--color-border-mid)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#eef3ff'; e.currentTarget.style.borderColor = 'rgba(21,87,255,0.25)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--color-border-mid)'; e.currentTarget.style.color = '#475569'; }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Sign in with OTP instead
                  </button>
                </div>

                <p className="text-center text-sm text-subtle mt-7">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="font-bold text-primary no-underline"
                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    Register free →
                  </Link>
                </p>
              </>
            )}

            {/* ── OTP email-only screen ── */}
            {screen === 'send-otp' && (
              <>
                <div className="fade-up mb-7">
                  <h1 className="font-extrabold text-heading mb-2 text-2xl sm:text-[30px]" style={{ letterSpacing: -1 }}>
                    Sign in with OTP
                  </h1>
                  <p className="text-base text-muted" style={{ lineHeight: 1.6 }}>
                    We&apos;ll send a 6-digit verification code to your email.
                  </p>
                </div>

                <RoleToggle role={role} onChange={(r) => { setRole(r); setApiError(''); }} />

                <form onSubmit={handleSendCode} noValidate>
                  <div className="fade-up d2">
                    <Field
                      label={role === 'recruiter' ? 'Work Email' : 'Email Address'}
                      id="email-otp"
                      type="email"
                      placeholder={role === 'recruiter' ? 'you@company.com' : 'you@example.com'}
                      value={email}
                      onChange={(v) => { setEmail(v); setEmailError(''); setApiError(''); }}
                      error={emailError}
                      icon={<EmailIcon />}
                    />
                  </div>

                  {apiError && (
                    <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-danger bg-danger-bg border border-danger">
                      {apiError}
                    </div>
                  )}

                  <div className="fade-up d3">
                    <button
                      type="submit"
                      disabled={sendLoading}
                      className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-sm transition-all duration-200"
                      style={{
                        padding: 14,
                        cursor: sendLoading ? 'not-allowed' : 'pointer',
                        background: sendLoading ? '#93aef5' : 'linear-gradient(135deg, var(--color-primary) 0%, #4338ca 100%)',
                        boxShadow: sendLoading ? 'none' : '0 4px 20px rgba(21,87,255,0.27)',
                      }}
                      onMouseEnter={(e) => { if (!sendLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(21,87,255,0.31)'; } }}
                      onMouseLeave={(e) => { if (!sendLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(21,87,255,0.27)'; } }}
                    >
                      {sendLoading ? <><Spinner /> Sending code…</> : (
                        <>
                          Send verification code
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* ── OR divider ── */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-border-mid))' }} />
                  <span className="text-micro font-bold uppercase tracking-widest text-gray-300">or</span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, var(--color-border-mid))' }} />
                </div>

                {/* ── Switch to Password ── */}
                <div className="fade-up d4">
                  <button
                    type="button"
                    onClick={() => { setApiError(''); setScreen('email'); }}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                    style={{
                      padding: 14,
                      cursor: 'pointer',
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1.5px solid var(--color-border-mid)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#eef3ff'; e.currentTarget.style.borderColor = 'rgba(21,87,255,0.25)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--color-border-mid)'; e.currentTarget.style.color = '#475569'; }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Sign in with password instead
                  </button>
                </div>

                <p className="text-center text-sm text-subtle mt-7">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="font-bold text-primary no-underline"
                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    Register free →
                  </Link>
                </p>
              </>
            )}

            {/* ── Step 2: OTP entry ── */}
            {screen === 'otp' && (
              <>
                <button
                  onClick={() => { setScreen('email'); setOtp(''); setApiError(''); }}
                  className="flex items-center gap-1.5 bg-transparent border-none text-sm font-semibold text-muted cursor-pointer mb-8 p-0 hover:text-body transition-colors"
                >
                  <BackIcon /> Change email
                </button>

                <div className="fade-up mb-7">
                  <div className="flex items-center justify-center rounded-2xl mb-5" style={{ width: 56, height: 56, background: '#eef3ff', border: '1.5px solid #c7d7fe' }}>
                    <EmailIcon />
                  </div>
                  <h1 className="font-extrabold text-heading mb-2" style={{ fontSize: 28, letterSpacing: -0.8 }}>
                    Check your email
                  </h1>
                  <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                    We sent a 6-digit code to <strong className="text-body">{email.trim()}</strong>.<br />
                    Enter it below to sign in.
                  </p>
                </div>

                {resendSuccess && (
                  <div className="mb-4 flex items-center gap-2.5 rounded-xl px-4 py-3 bg-success-bg border border-success">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0 text-success">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <p className="text-sm font-semibold text-green-800">New code sent!</p>
                  </div>
                )}

                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  onComplete={(v) => handleVerify(v)}
                  disabled={verifyLoading}
                />

                {apiError && (
                  <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-danger bg-danger-bg border border-danger">
                    {apiError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={verifyLoading || otp.replace(/\s/g, '').length < 6}
                  className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-sm transition-all duration-200 mb-5"
                  style={{
                    padding: 15,
                    cursor: (verifyLoading || otp.replace(/\s/g, '').length < 6) ? 'not-allowed' : 'pointer',
                    background: (verifyLoading || otp.replace(/\s/g, '').length < 6) ? '#93aef5' : 'var(--color-primary)',
                    boxShadow: (verifyLoading || otp.replace(/\s/g, '').length < 6) ? 'none' : '0 4px 20px rgba(21,87,255,0.27)',
                  }}
                  onMouseEnter={(e) => { if (!verifyLoading && otp.replace(/\s/g, '').length >= 6) e.currentTarget.style.background = '#0d3fd4'; }}
                  onMouseLeave={(e) => { if (!verifyLoading && otp.replace(/\s/g, '').length >= 6) e.currentTarget.style.background = 'var(--color-primary)'; }}
                >
                  {verifyLoading ? <><Spinner /> Verifying…</> : 'Verify & Sign in →'}
                </button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-subtle">
                      Resend code in <span className="font-semibold text-body-secondary">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="bg-transparent border-none text-sm font-semibold cursor-pointer p-0"
                      style={{ color: resendLoading ? '#93aef5' : 'var(--color-primary)' }}
                    >
                      {resendLoading ? 'Sending…' : "Didn't receive it? Resend"}
                    </button>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
