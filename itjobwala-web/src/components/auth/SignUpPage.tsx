'use client';

import { useState, type FormEvent, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Field from '@/src/components/ui/Field';
import SelectField from '@/src/components/ui/SelectField';
import PasswordField from '@/src/components/ui/PasswordField';
import { PRIMARY } from '@/src/lib/constants';
import { registerCandidate, signupRecruiter, signinRecruiter } from '@/src/lib/api';

type Role = 'candidate' | 'recruiter';

const WORK_STATUS_OPTIONS = [
  { value: '',            label: 'Select your work status' },
  { value: 'fresher',     label: 'Fresher / Student' },
  { value: 'experienced', label: 'Experienced Professional' },
];

const CANDIDATE_PERKS = [
  { icon: '💰', text: 'Salary transparency on every listing' },
  { icon: '🚫', text: 'Zero recruiter spam' },
  { icon: '⚡', text: 'Apply directly to hiring teams' },
  { icon: '🎯', text: 'Roles matched to your skills' },
];

const RECRUITER_PERKS = [
  { icon: '⚡', title: 'Post in 2 minutes',        sub: 'Simple job posting, no bloated forms' },
  { icon: '🎯', title: 'Reach matched candidates',  sub: 'Only relevant profiles, no mass spam' },
  { icon: '💬', title: 'Direct messaging',          sub: 'Chat with candidates without a middleman' },
  { icon: '📊', title: 'Smart analytics',           sub: 'Track views, clicks and application rates' },
];

const AVATARS = [
  { bg: '#2563eb', initial: 'R' },
  { bg: '#0ea5e9', initial: 'S' },
  { bg: '#22c55e', initial: 'Z' },
  { bg: '#8b5cf6', initial: 'P' },
];

type CandidateForm = { name: string; email: string; mobile: string; password: string; workStatus: string; terms: boolean };
type CandidateErrors = Partial<Record<keyof CandidateForm, string>>;
type RecruiterForm = { fullName: string; companyName: string; email: string; password: string; terms: boolean };
type RecruiterErrors = Partial<Record<keyof RecruiterForm, string>>;

function validateCandidate(form: CandidateForm): CandidateErrors {
  const e: CandidateErrors = {};
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

function GoogleBtn({ onHover }: { onHover?: string }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200"
      style={{ border: '1.5px solid #e5e7eb', padding: 13 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = onHover ?? PRIMARY; e.currentTarget.style.background = '#f8faff'; }}
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

function CandidateLeftPanel() {
  return (
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
          {CANDIDATE_PERKS.map((p, i) => (
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
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-extrabold text-white shrink-0"
              style={{ background: a.bg, marginLeft: i === 0 ? 0 : -8 }}>
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
  );
}

function RecruiterLeftPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between relative overflow-hidden shrink-0 w-[440px]"
      style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #4338ca 100%)`, padding: '52px 44px' }}
    >
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
          {RECRUITER_PERKS.map((p) => (
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

export default function SignUpPage() {
  const [role, setRole] = useState<Role>('candidate');

  /* Candidate form state */
  const [cForm, setCForm] = useState<CandidateForm>({ name: '', email: '', mobile: '', password: '', workStatus: '', terms: false });
  const [cErrors, setCErrors] = useState<CandidateErrors>({});
  const [cApiError, setCApiError] = useState('');
  const [cLoading, setCLoading] = useState(false);

  /* Recruiter form state */
  const [rForm, setRForm] = useState<RecruiterForm>({ fullName: '', companyName: '', email: '', password: '', terms: false });
  const [rErrors, setRErrors] = useState<RecruiterErrors>({});
  const [rApiError, setRApiError] = useState('');
  const [rLoading, setRLoading] = useState(false);
  const [rSuccess, setRSuccess] = useState(false);

  function setC<K extends keyof CandidateForm>(key: K, val: CandidateForm[K]) {
    setCForm(f => ({ ...f, [key]: val }));
    setCErrors(e => ({ ...e, [key]: '' }));
    setCApiError('');
  }

  function setR<K extends keyof RecruiterForm>(key: K, val: RecruiterForm[K]) {
    setRForm(f => ({ ...f, [key]: val }));
    setRErrors(e => ({ ...e, [key]: '' }));
    setRApiError('');
  }

  async function handleCandidateSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateCandidate(cForm);
    if (Object.keys(errs).length) { setCErrors(errs); return; }
    setCLoading(true);
    setCApiError('');
    try {
      const { token } = await registerCandidate({
        full_name:      cForm.name.trim(),
        email:          cForm.email.trim(),
        mobile:         `+91${cForm.mobile}`,
        password:       cForm.password,
        work_status:    cForm.workStatus as 'fresher' | 'experienced',
        terms_accepted: cForm.terms,
      });
      window.location.href = token ? '/candidate/dashboard' : '/auth/login?registered=1';
    } catch (err) {
      setCApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setCLoading(false);
    }
  }

  async function handleRecruiterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: RecruiterErrors = {};
    if (!rForm.fullName.trim()) errs.fullName = 'Full name is required';
    if (!rForm.companyName.trim()) errs.companyName = 'Company name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rForm.email)) errs.email = 'Enter a valid work email';
    if (!rForm.password || rForm.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!rForm.terms) errs.terms = 'You must accept the Terms & Conditions';
    if (Object.keys(errs).length) { setRErrors(errs); return; }
    setRLoading(true);
    setRApiError('');
    try {
      await signupRecruiter({
        full_name:    rForm.fullName.trim(),
        company_name: rForm.companyName.trim(),
        email:        rForm.email.trim(),
        password:     rForm.password,
        terms_accepted: rForm.terms,
      });
      try {
        await signinRecruiter({ email: rForm.email.trim(), password: rForm.password });
        window.location.href = '/recruiter/dashboard';
      } catch {
        setRSuccess(true);
      }
    } catch (err) {
      setRApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setRLoading(false);
    }
  }

  if (rSuccess) return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-6" style={{ fontFamily: 'var(--font-plus-jakarta)', background: '#f8faff' }}>
      <div className="fade-up text-center rounded-3xl w-full px-6 py-10 sm:px-12 sm:py-14" style={{ background: '#fff', maxWidth: 440, boxShadow: `0 24px 64px ${PRIMARY}14` }}>
        <div className="flex items-center justify-center rounded-full mx-auto mb-6" style={{ width: 80, height: 80, background: '#eef3ff', border: '2px solid #c7d7fe' }}>
          <svg width="36" height="36" fill="none" stroke={PRIMARY} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="font-extrabold text-[#0f172a] mb-2 text-2xl">Welcome aboard!</h2>
        <p className="text-sm text-gray-500 mb-8" style={{ lineHeight: 1.7 }}>
          Your recruiter account at <strong style={{ color: PRIMARY }}>itJobwala</strong> is ready. Start posting jobs and reach thousands of IT professionals.
        </p>
        <Link href="/auth/login?role=recruiter" className="block text-white rounded-xl font-bold text-[15px] text-center py-3.5"
          style={{ background: PRIMARY, textDecoration: 'none' }}>
          Go to dashboard →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={pageStyle}>

      {/* Nav */}
      <nav className="border-b border-black/[0.06] sticky top-0 z-[200] shrink-0"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ textDecoration: 'none' }}>
            <Image src="/logo.png" alt="itJobwala" width={30} height={30} />
            <span className="font-extrabold text-xl text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
              it<span style={{ color: PRIMARY }}>Jobwala</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline text-[13px] text-gray-500">Already have an account?</span>
            <Link href="/auth/login"
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

        {/* Left panel — swaps based on role */}
        {role === 'candidate' ? <CandidateLeftPanel /> : <RecruiterLeftPanel />}

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[440px]">

            <div className="fade-up mb-7">
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] mb-2" style={{ letterSpacing: '-0.8px' }}>
                Create your account
              </h1>
              <p className="text-[15px] text-gray-500 leading-[1.6]">
                {role === 'candidate'
                  ? 'Find IT jobs that actually match your skills.'
                  : 'Post jobs and reach thousands of IT professionals.'}
              </p>
            </div>

            {/* Role toggle */}
            <RoleToggle role={role} onChange={setRole} />

            {/* ── Candidate signup form ── */}
            {role === 'candidate' && (
              <form onSubmit={handleCandidateSubmit} noValidate>
                <div className="fade-up delay-2">
                  <Field label="Full Name" id="name" placeholder="e.g. Rahul Sharma"
                    value={cForm.name} onChange={v => setC('name', v)} error={cErrors.name}
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  />
                </div>
                <div className="fade-up delay-3">
                  <Field label="Email Address" id="email" type="email" placeholder="you@example.com"
                    value={cForm.email} onChange={v => setC('email', v)} error={cErrors.email}
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                  />
                </div>
                <div className="fade-up delay-3">
                  <Field label="Mobile Number" id="mobile" type="tel" placeholder="10-digit mobile number"
                    value={cForm.mobile} onChange={v => setC('mobile', v.replace(/\D/g, '').slice(0, 10))} error={cErrors.mobile}
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.71a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" /></svg>}
                    prefix={<span>+91</span>}
                  />
                </div>
                <div className="fade-up delay-4">
                  <PasswordField label="Password" id="password" placeholder="Min. 8 characters"
                    value={cForm.password} onChange={v => setC('password', v)} error={cErrors.password}
                  />
                </div>
                <div className="fade-up delay-5">
                  <SelectField label="Work Status" id="workStatus"
                    value={cForm.workStatus} onChange={v => setC('workStatus', v)}
                    options={WORK_STATUS_OPTIONS} error={cErrors.workStatus}
                  />
                </div>
                <div className="fade-up delay-6 mb-7">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative shrink-0 mt-0.5">
                      <input type="checkbox" checked={cForm.terms} onChange={e => setC('terms', e.target.checked)} className="sr-only" />
                      <div className="w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all duration-[180ms]"
                        style={{ borderColor: cForm.terms ? PRIMARY : cErrors.terms ? '#ef4444' : '#d1d5db', background: cForm.terms ? PRIMARY : '#fff' }}>
                        {cForm.terms && <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 leading-[1.6]">
                      I agree to itJobwala&apos;s{' '}
                      <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Privacy Policy</Link>
                    </span>
                  </label>
                  {cErrors.terms && <p className="text-xs text-red-500 mt-1.5 font-medium">{cErrors.terms}</p>}
                </div>
                {cApiError && (
                  <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">{cApiError}</div>
                )}
                <div className="fade-up delay-7">
                  <button type="submit" disabled={cLoading}
                    className="w-full border-none rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-2.5 transition-all duration-200"
                    style={{ padding: 15, background: cLoading ? '#93aef5' : PRIMARY, cursor: cLoading ? 'not-allowed' : 'pointer', boxShadow: cLoading ? 'none' : `0 4px 20px ${PRIMARY}44` }}
                    onMouseEnter={e => { if (!cLoading) e.currentTarget.style.background = '#0d3fd4'; }}
                    onMouseLeave={e => { if (!cLoading) e.currentTarget.style.background = PRIMARY; }}
                  >
                    {cLoading
                      ? <><div className="w-[18px] h-[18px] border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" /> Creating account…</>
                      : 'Create Account →'
                    }
                  </button>
                </div>
                <div className="fade-up delay-7 flex items-center gap-3 mt-5 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-semibold text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="fade-up delay-7 mb-4">
                  <GoogleBtn />
                </div>
                <p className="fade-up delay-7 text-center text-[13px] text-gray-400 mt-1">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Log in</Link>
                </p>
              </form>
            )}

            {/* ── Recruiter signup form ── */}
            {role === 'recruiter' && (
              <form onSubmit={handleRecruiterSubmit} noValidate>
                <div className="fade-up d2">
                  <Field label="Full Name" id="r-fullname" placeholder="e.g. Amit Sharma"
                    value={rForm.fullName} onChange={v => setR('fullName', v)} error={rErrors.fullName}
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  />
                </div>
                <div className="fade-up d3">
                  <Field label="Company Name" id="r-companyname" placeholder="e.g. Razorpay"
                    value={rForm.companyName} onChange={v => setR('companyName', v)} error={rErrors.companyName}
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                  />
                </div>
                <div className="fade-up d4">
                  <Field label="Work Email" id="r-email" type="email" placeholder="you@company.com"
                    value={rForm.email} onChange={v => setR('email', v)} error={rErrors.email}
                    hint={<span className="text-[11px] text-gray-400 font-normal">Use your official company email</span>}
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                  />
                </div>
                <div className="fade-up d5">
                  <PasswordField label="Password" id="r-password" placeholder="Min. 8 characters"
                    value={rForm.password} onChange={v => setR('password', v)} error={rErrors.password}
                  />
                </div>
                <div className="fade-up d6 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative shrink-0 mt-0.5">
                      <input type="checkbox" checked={rForm.terms} onChange={e => setR('terms', e.target.checked)} className="sr-only" />
                      <div className="flex items-center justify-center rounded-[6px] border-2 transition-all duration-[180ms]"
                        style={{ width: 20, height: 20, borderColor: rForm.terms ? PRIMARY : rErrors.terms ? '#ef4444' : '#d1d5db', background: rForm.terms ? PRIMARY : '#fff' }}>
                        {rForm.terms && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                    </div>
                    <span className="text-[13px] text-gray-600 leading-[1.6]">
                      I agree to itJobwala&apos;s{' '}
                      <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Recruiter Policy</Link>
                    </span>
                  </label>
                  {rErrors.terms && <p className="text-xs text-red-500 mt-1.5 font-medium">{rErrors.terms}</p>}
                </div>
                {rApiError && (
                  <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">{rApiError}</div>
                )}
                <div className="fade-up d7">
                  <button type="submit" disabled={rLoading}
                    className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
                    style={{
                      padding: 15,
                      cursor: rLoading ? 'not-allowed' : 'pointer',
                      background: rLoading ? '#93aef5' : PRIMARY,
                      boxShadow: rLoading ? 'none' : `0 4px 20px ${PRIMARY}44`,
                    }}
                    onMouseEnter={e => { if (!rLoading) e.currentTarget.style.background = '#0d3fd4'; }}
                    onMouseLeave={e => { if (!rLoading) e.currentTarget.style.background = PRIMARY; }}
                  >
                    {rLoading
                      ? <><div className="w-[18px] h-[18px] border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" /> Creating account…</>
                      : 'Create Recruiter Account →'
                    }
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-5 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-semibold text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="mb-4">
                  <GoogleBtn />
                </div>
                <p className="text-center text-[13px] text-gray-400 mt-1">
                  Already a recruiter?{' '}
                  <Link href="/auth/login" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Log in</Link>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
