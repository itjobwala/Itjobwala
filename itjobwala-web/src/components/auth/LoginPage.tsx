'use client';

import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Field from '@/src/components/ui/Field';
import { PRIMARY } from '@/src/lib/constants';
import { signinCandidate, signinRecruiter } from '@/src/lib/api';

type Role = 'candidate' | 'recruiter';

const EyeOpen = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const EmailIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
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
      className="sticky top-0 z-[200] border-b border-black/[0.06] shrink-0"
      style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)' }}
    >
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center h-[68px] gap-9">
        <Link href="/" className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="itJobwala" width={30} height={30} />
          <span className="font-extrabold text-xl text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
            it<span style={{ color: PRIMARY }}>Jobwala</span>
          </span>
        </Link>
        <div className="hidden sm:flex gap-7 flex-1">
          <Link href="/candidate/jobs" className="text-sm font-medium" style={{ textDecoration: 'none', color: '#374151' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
          >
            Find Jobs
          </Link>
          <Link href="#" className="text-sm font-medium" style={{ textDecoration: 'none', color: '#374151' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
          >
            Companies
          </Link>
          <Link href="#" className="text-sm font-medium" style={{ textDecoration: 'none', color: '#374151' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
          >
            Resources
          </Link>
          <Link href="/recruiter/post-job" className="text-sm font-medium" style={{ textDecoration: 'none', color: '#374151' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1557FF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
          >
            Post a Job
          </Link>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center ml-auto sm:ml-0">
          <span className="hidden sm:inline text-[13px] text-gray-500">New here?</span>
          <Link
            href="/auth/signup"
            className="text-sm font-bold rounded-lg px-4 sm:px-[18px] py-2 transition-all duration-200"
            style={{ color: PRIMARY, border: `1.5px solid ${PRIMARY}`, textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = PRIMARY; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PRIMARY; }}
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
        style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #4338ca 100%)`, padding: '56px 48px' }}
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
      style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #4338ca 100%)`, padding: '56px 48px' }}
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

function GoogleBtn() {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200 mb-5"
      style={{ border: '1.5px solid #e5e7eb', padding: 13 }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = '#f8faff'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-semibold text-gray-400">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function RoleToggle({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div className="flex p-1 bg-gray-100 rounded-xl mb-7">
      <button
        type="button"
        onClick={() => onChange('candidate')}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
        style={role === 'candidate'
          ? { background: '#fff', color: PRIMARY, boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }
          : { background: 'transparent', color: '#6b7280' }
        }
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Candidate
      </button>
      <button
        type="button"
        onClick={() => onChange('recruiter')}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
        style={role === 'recruiter'
          ? { background: '#fff', color: PRIMARY, boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }
          : { background: 'transparent', color: '#6b7280' }
        }
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
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
  const [screen, setScreen] = useState<'login' | 'forgot' | 'forgot-sent'>('login');

  /* Candidate form state */
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  /* Recruiter form state */
  const [recEmail, setRecEmail] = useState('');
  const [recPass, setRecPass] = useState('');
  const [showRecPass, setShowRecPass] = useState(false);
  const [recErrors, setRecErrors] = useState<Record<string, string>>({});
  const [recApiError, setRecApiError] = useState('');
  const [recLoading, setRecLoading] = useState(false);

  /* Forgot password state */
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!pass || pass.length < 6) errs.pass = 'Enter your password (min 6 characters)';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      await signinCandidate({ email: email.trim(), password: pass });
      const next = searchParams.get('next');
      const safeDest = next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/auth/login')
        ? next
        : '/candidate/dashboard';
      window.location.href = safeDest;
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecruiterLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!recEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recEmail)) errs.email = 'Enter a valid email address';
    if (!recPass || recPass.length < 6) errs.pass = 'Enter your password';
    if (Object.keys(errs).length) { setRecErrors(errs); return; }
    setRecLoading(true);
    setRecApiError('');
    try {
      await signinRecruiter({ email: recEmail.trim(), password: recPass });
      const next = searchParams.get('next');
      const safeDest = next && next.startsWith('/recruiter') && !next.startsWith('//')
        ? next
        : '/recruiter/dashboard';
      window.location.href = safeDest;
    } catch (err) {
      setRecApiError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setRecLoading(false);
    }
  }

  function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) { setForgotError('Enter a valid email address'); return; }
    setForgotLoading(true);
    setTimeout(() => { setForgotLoading(false); setScreen('forgot-sent'); }, 1200);
  }

  if (screen === 'forgot') return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-plus-jakarta)', background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)' }}>
      <NavBar />
      <div className="flex-1 flex">
        <LeftPanel role="candidate" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[420px]">
            <button
              onClick={() => setScreen('login')}
              className="flex items-center gap-1.5 bg-transparent border-none text-[13px] font-semibold text-gray-500 cursor-pointer mb-8 p-0 hover:text-gray-700 transition-colors"
            >
              <BackIcon /> Back to login
            </button>
            <div className="fade-up mb-8">
              <div className="flex items-center justify-center rounded-2xl mb-5" style={{ width: 56, height: 56, background: '#eef3ff', border: '1.5px solid #c7d7fe' }}>
                <LockIcon />
              </div>
              <h1 className="font-extrabold text-[#0f172a] mb-2" style={{ fontSize: 28, letterSpacing: -0.8 }}>Forgot password?</h1>
              <p className="text-sm text-gray-500" style={{ lineHeight: 1.6 }}>No worries! Enter your email and we&apos;ll send you a reset link.</p>
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
                  className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] cursor-pointer transition-all duration-200"
                  style={{ padding: 14, background: forgotLoading ? '#93aef5' : PRIMARY, boxShadow: forgotLoading ? 'none' : `0 4px 20px ${PRIMARY}44` }}
                >
                  {forgotLoading ? <><Spinner /> Sending…</> : 'Send reset link'}
                </button>
              </div>
            </form>
            <p className="text-center text-[13px] text-gray-400 mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Register free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === 'forgot-sent') return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-6" style={{ fontFamily: 'var(--font-plus-jakarta)', background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)' }}>
      <div className="fade-up text-center rounded-3xl w-full px-6 py-10 sm:px-12 sm:py-14" style={{ background: '#fff', maxWidth: 420, boxShadow: `0 24px 64px ${PRIMARY}14` }}>
        <div className="flex items-center justify-center rounded-full mx-auto mb-6" style={{ width: 72, height: 72, background: '#eef3ff', border: '2px solid #c7d7fe' }}>
          <svg width="32" height="32" fill="none" stroke={PRIMARY} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h2 className="font-extrabold text-[#0f172a] mb-2.5" style={{ fontSize: 26 }}>Check your inbox</h2>
        <p className="text-[15px] text-gray-500 mb-2" style={{ lineHeight: 1.6 }}>
          We&apos;ve sent a reset link to <strong className="text-gray-900">{forgotEmail}</strong>
        </p>
        <p className="text-[13px] text-gray-400 mb-8">Didn&apos;t receive it? Check your spam folder.</p>
        <button
          onClick={() => setScreen('login')}
          className="w-full text-white border-none rounded-xl font-bold text-[15px] cursor-pointer"
          style={{ padding: 13, background: PRIMARY, boxShadow: `0 4px 20px ${PRIMARY}44` }}
        >
          Back to login
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
              <div className="fade-up mb-5 flex items-start gap-3 rounded-xl px-4 py-3.5 bg-green-50 border border-green-200">
                <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-800">Account created! Sign in to continue.</p>
                  <p className="text-[12px] text-green-600 mt-0.5">Welcome to itJobwala — your IT career starts here.</p>
                </div>
              </div>
            )}

            <div className="fade-up mb-7">
              <h1 className="font-extrabold text-[#0f172a] mb-1.5 text-2xl sm:text-[28px]" style={{ letterSpacing: -0.8 }}>
                Sign in to itJobwala
              </h1>
              <p className="text-sm text-gray-500">Pick up where you left off.</p>
            </div>

            {/* Role toggle */}
            <RoleToggle role={role} onChange={setRole} />

            {/* ── Candidate login form ── */}
            {role === 'candidate' && (
              <form onSubmit={handleEmailLogin} noValidate>
                <div className="fade-up d2">
                  <Field label="Email Address" id="email" type="email" placeholder="you@example.com"
                    value={email} onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '' })); }} error={errors.email}
                    icon={<EmailIcon />}
                  />
                </div>

                <div className="fade-up d3 mb-2">
                  <label htmlFor="password" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Password <span style={{ color: PRIMARY }}>*</span>
                  </label>
                  <div
                    className="flex items-center bg-white rounded-xl overflow-hidden transition-all duration-[180ms]"
                    style={{
                      border: `1.5px solid ${errors.pass ? '#ef4444' : `${PRIMARY}44`}`,
                      boxShadow: errors.pass ? '0 0 0 3px rgba(239,68,68,0.09)' : 'none',
                    }}
                  >
                    <div className="px-3.5 text-gray-400 shrink-0"><LockIcon /></div>
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={pass}
                      onChange={(e) => { setPass(e.target.value); setErrors((p) => ({ ...p, pass: '' })); }}
                      className="flex-1 border-none outline-none text-[15px] text-gray-900 bg-transparent py-3.5 pl-0 pr-3.5"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="px-3.5 text-gray-400 cursor-pointer flex border-none bg-transparent hover:text-gray-600">
                      {showPass ? <EyeOpen /> : <EyeOff />}
                    </button>
                  </div>
                  {errors.pass && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.pass}</p>}
                </div>

                <div className="fade-up d3 text-right mb-5">
                  <button type="button" onClick={() => setScreen('forgot')} className="bg-transparent border-none text-[13px] font-semibold cursor-pointer p-0" style={{ color: PRIMARY }}>
                    Forgot password?
                  </button>
                </div>

                {apiError && (
                  <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">
                    {apiError}
                  </div>
                )}

                <div className="fade-up d4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
                    style={{
                      padding: 15,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      background: loading ? '#93aef5' : PRIMARY,
                      boxShadow: loading ? 'none' : `0 4px 20px ${PRIMARY}44`,
                    }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#0d3fd4'; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = PRIMARY; }}
                  >
                    {loading ? <><Spinner /> Logging in…</> : 'Log in →'}
                  </button>
                </div>

                <div className="fade-up d5 mt-6">
                  <Divider />
                  <GoogleBtn />
                </div>

                <p className="text-center text-[13px] text-gray-400 mt-5">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Register free</Link>
                </p>
              </form>
            )}

            {/* ── Recruiter login form ── */}
            {role === 'recruiter' && (
              <form onSubmit={handleRecruiterLogin} noValidate>
                <div className="fade-up d2">
                  <Field label="Work Email" id="rec-email" type="email" placeholder="you@company.com"
                    value={recEmail} onChange={(v) => { setRecEmail(v); setRecErrors((p) => ({ ...p, email: '' })); }} error={recErrors.email}
                    icon={<EmailIcon />}
                  />
                </div>

                <div className="fade-up d3 mb-5">
                  <label htmlFor="rec-password" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Password <span style={{ color: PRIMARY }}>*</span>
                  </label>
                  <div
                    className="flex items-center bg-white rounded-xl overflow-hidden transition-all duration-[180ms]"
                    style={{
                      border: `1.5px solid ${recErrors.pass ? '#ef4444' : `${PRIMARY}44`}`,
                      boxShadow: recErrors.pass ? '0 0 0 3px rgba(239,68,68,0.09)' : 'none',
                    }}
                  >
                    <div className="px-3.5 text-gray-400 shrink-0"><LockIcon /></div>
                    <input
                      id="rec-password"
                      type={showRecPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={recPass}
                      onChange={(e) => { setRecPass(e.target.value); setRecErrors((p) => ({ ...p, pass: '' })); }}
                      className="flex-1 border-none outline-none text-[15px] text-gray-900 bg-transparent py-3.5 pl-0 pr-3.5"
                    />
                    <button type="button" onClick={() => setShowRecPass(!showRecPass)} className="px-3.5 text-gray-400 cursor-pointer flex border-none bg-transparent hover:text-gray-600">
                      {showRecPass ? <EyeOpen /> : <EyeOff />}
                    </button>
                  </div>
                  {recErrors.pass && <p className="text-xs text-red-500 mt-1.5 font-medium">{recErrors.pass}</p>}
                </div>

                {recApiError && (
                  <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">
                    {recApiError}
                  </div>
                )}

                <div className="fade-up d4">
                  <button
                    type="submit"
                    disabled={recLoading}
                    className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
                    style={{
                      padding: 15,
                      cursor: recLoading ? 'not-allowed' : 'pointer',
                      background: recLoading ? '#93aef5' : PRIMARY,
                      boxShadow: recLoading ? 'none' : `0 4px 20px ${PRIMARY}44`,
                    }}
                    onMouseEnter={(e) => { if (!recLoading) e.currentTarget.style.background = '#0d3fd4'; }}
                    onMouseLeave={(e) => { if (!recLoading) e.currentTarget.style.background = PRIMARY; }}
                  >
                    {recLoading ? <><Spinner /> Logging in…</> : 'Log in as Recruiter →'}
                  </button>
                </div>

                <div className="fade-up d5 mt-6">
                  <Divider />
                  <GoogleBtn />
                </div>

                <p className="text-center text-[13px] text-gray-400 mt-5">
                  Don&apos;t have a recruiter account?{' '}
                  <Link href="/auth/signup" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>
                    Sign up free
                  </Link>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
