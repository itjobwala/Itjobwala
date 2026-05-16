'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import Field from '@/src/components/Field';
import PasswordField from '@/src/components/PasswordField';
import SelectField from '@/src/components/SelectField';
import OTPInput from '@/src/components/OTPInput';
import { PRIMARY } from '@/src/lib/constants';
import { signupRecruiter } from '@/src/lib/api';

const STEPS = ['Account', 'Company', 'Hiring Needs', 'Verify'];

const INDUSTRIES = [
  { value: '', label: 'Select industry' },
  { value: 'it_software', label: 'IT / Software' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS / Product' },
  { value: 'banking', label: 'Banking / Finance' },
  { value: 'healthtech', label: 'Healthcare Tech' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const COMPANY_SIZES = [
  { value: '', label: 'Select company size' },
  { value: '1_10', label: '1–10 employees' },
  { value: '11_50', label: '11–50 employees' },
  { value: '51_200', label: '51–200 employees' },
  { value: '201_500', label: '201–500 employees' },
  { value: '501_1000', label: '501–1000 employees' },
  { value: '1000_plus', label: '1000+ employees' },
];

const HIRING_VOLUMES = [
  { value: '', label: 'Select hiring volume' },
  { value: '1_5', label: '1–5 hires/month' },
  { value: '6_10', label: '6–10 hires/month' },
  { value: '11_25', label: '11–25 hires/month' },
  { value: '25_plus', label: '25+ hires/month' },
];

const HIRING_URGENCIES = [
  { value: '', label: 'Select hiring urgency' },
  { value: 'immediate', label: 'Immediately (within 2 weeks)' },
  { value: 'month', label: 'Within a month' },
  { value: '1_3_months', label: 'In 1–3 months' },
  { value: 'planning', label: 'Planning ahead (3+ months)' },
];

const HIRING_ROLES = [
  'QA / Testing', 'Frontend Dev', 'Backend Dev', 'Full Stack',
  'DevOps / Cloud', 'Data / AI-ML', 'Mobile Dev', 'Product Manager',
  'UI/UX Designer', 'Scrum Master', 'Other',
];

const PERKS = [
  { icon: '⚡', title: 'Post in 2 minutes', sub: 'Simple job posting, no bloated forms' },
  { icon: '🎯', title: 'Reach matched candidates', sub: 'Only relevant profiles, no mass spam' },
  { icon: '💬', title: 'Direct messaging', sub: 'Chat with candidates without a recruiter' },
  { icon: '📊', title: 'Smart analytics', sub: 'Track views, clicks and application rates' },
  { icon: '🔒', title: 'Verified profiles only', sub: 'All candidates are identity-verified' },
];

type FormState = {
  name: string; email: string; phone: string; password: string;
  company: string; website: string; industry: string; size: string;
  city: string; designation: string;
  roles: string[]; volume: string; urgency: string;
  terms: boolean;
};
type Errors = Partial<Record<keyof FormState | 'otp', string>>;

const STEP_TITLES = [
  'Create recruiter account',
  'Tell us about your company',
  'Your hiring needs',
  'Verify your identity',
];
const STEP_SUBS = [
  'Step 1 of 4 — Basic account details',
  'Step 2 of 4 — Company information',
  'Step 3 of 4 — Who are you hiring?',
  'Step 4 of 4 — Verify your mobile number',
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? PRIMARY : active ? '#fff' : '#f3f4f6',
                  border: `2px solid ${done || active ? PRIMARY : '#e5e7eb'}`,
                  boxShadow: active ? `0 0 0 4px ${PRIMARY}18` : 'none',
                }}
              >
                {done
                  ? <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  : <span className="text-xs font-bold" style={{ color: active ? PRIMARY : '#9ca3af' }}>{i + 1}</span>
                }
              </div>
              <span className="text-[11px] whitespace-nowrap" style={{ fontWeight: active ? 700 : 500, color: active ? PRIMARY : done ? '#374151' : '#9ca3af' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 mb-5 transition-colors duration-300" style={{ background: i < current ? PRIMARY : '#e5e7eb' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChipSelect({ label, options, selected, onToggle, error, max }: {
  label: string; options: string[]; selected: string[];
  onToggle: (v: string) => void; error?: string; max?: number;
}) {
  return (
    <div className="mb-[18px]">
      <label className="block text-[13px] font-semibold text-gray-700 mb-2">
        {label} <span style={{ color: PRIMARY }}>*</span>
        {max && <span className="text-[11px] text-gray-400 font-normal ml-1.5">Select up to {max}</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => {
          const active = selected.includes(o);
          return (
            <button key={o} type="button" onClick={() => onToggle(o)}
              className="px-3.5 py-[7px] rounded-full text-[13px] font-semibold transition-all duration-[180ms]"
              style={{
                border: `1.5px solid ${active ? PRIMARY : '#e5e7eb'}`,
                background: active ? `${PRIMARY}12` : '#fff',
                color: active ? PRIMARY : '#6b7280',
              }}
            >
              {active && <span className="mr-1">✓</span>}{o}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

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
          {PERKS.map(p => (
            <div key={p.title} className="flex gap-3.5 mb-5">
              <div className="shrink-0 flex items-center justify-center rounded-[10px]" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', fontSize: 17 }}>{p.icon}</div>
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

export default function RecruiterPostJobPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', password: '',
    company: '', website: '', industry: '', size: '', city: '', designation: '',
    roles: [], volume: '', urgency: '',
    terms: false,
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(v => v > 0 ? v - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [timer]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setApiError('');
  }

  function toggleRole(r: string) {
    const cur = form.roles;
    if (cur.includes(r)) set('roles', cur.filter(x => x !== r));
    else if (cur.length < 5) set('roles', [...cur, r]);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Full name is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid work email';
      if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
      if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    }
    if (step === 1) {
      if (!form.company.trim()) e.company = 'Company name is required';
      if (!form.industry) e.industry = 'Select an industry';
      if (!form.size) e.size = 'Select company size';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.designation.trim()) e.designation = 'Your designation is required';
    }
    if (step === 2) {
      if (!form.roles.length) e.roles = 'Select at least one role you are hiring for';
      if (!form.volume) e.volume = 'Select expected hiring volume';
      if (!form.urgency) e.urgency = 'Select hiring urgency';
    }
    if (step === 3) {
      if (otp.replace(/\s/g, '').length < 6) e.otp = 'Enter the 6-digit OTP';
      if (!form.terms) e.terms = 'You must accept the Terms & Conditions';
    }
    return e;
  }

  async function handleNext(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (step === 2 && !otpSent) {
      setOtpSent(true);
      setTimer(30);
    }

    if (step < 3) {
      setStep(s => s + 1);
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      await signupRecruiter({
        company_name: form.company.trim(),
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

  const submitLabel = loading
    ? step === 3 ? 'Creating account…' : 'Loading…'
    : step === 3 ? (otpSent ? 'Verify & Create Account →' : 'Send OTP →') : 'Continue →';

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
        <Link href="/recruiter/login" className="block text-white rounded-xl font-bold text-[15px] text-center mb-3 py-3.5"
          style={{ background: PRIMARY, textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
          onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}>
          Go to dashboard →
        </Link>
        <Link href="/recruiter/signup" className="block text-[13px] font-semibold"
          style={{ color: PRIMARY, textDecoration: 'none' }}>
          Back to quick signup
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

      <div className="flex-1 flex">
        <LeftPanel />

        {/* Form panel */}
        <div className="flex-1 flex items-start justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[520px]">

            <div className="fade-up mb-2">
              <h1 className="font-extrabold text-[#0f172a] mb-1 text-2xl sm:text-[26px]" style={{ letterSpacing: -0.8 }}>
                {STEP_TITLES[step]}
              </h1>
              <p className="text-sm text-gray-500">{STEP_SUBS[step]}</p>
            </div>

            <div className="fade-up my-6">
              <StepBar current={step} />
            </div>

            <form onSubmit={handleNext} noValidate>

              {/* Step 0 — Account */}
              {step === 0 && (
                <div className="fade-up">
                  <Field label="Full Name" id="name" placeholder="e.g. Amit Sharma"
                    value={form.name} onChange={v => set('name', v)} error={errors.name}
                    icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  />
                  <Field label="Work Email" id="email" type="email" placeholder="you@company.com"
                    value={form.email} onChange={v => set('email', v)} error={errors.email}
                    hint={<span className="text-[11px] text-gray-400 font-normal">Use your official company email</span>}
                    icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                  />
                  <Field label="Mobile Number" id="phone" type="tel" placeholder="10-digit mobile"
                    value={form.phone} onChange={v => set('phone', v.replace(/\D/g, '').slice(0, 10))} error={errors.phone}
                    icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.71a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" /></svg>}
                    suffix={<span className="text-xs text-gray-400 font-medium">+91</span>}
                  />
                  <PasswordField label="Password" id="password" placeholder="Min. 8 characters"
                    value={form.password} onChange={v => set('password', v)} error={errors.password}
                  />
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-semibold text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <button type="button"
                    className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200 mb-2"
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
              )}

              {/* Step 1 — Company */}
              {step === 1 && (
                <div className="fade-up">
                  <Field label="Company Name" id="company" placeholder="e.g. Razorpay"
                    value={form.company} onChange={v => set('company', v)} error={errors.company}
                    icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                  />
                  <Field label="Company Website" id="website" placeholder="https://yourcompany.com"
                    value={form.website} onChange={v => set('website', v)} error={errors.website}
                    icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Industry" id="industry" value={form.industry} onChange={v => set('industry', v)} options={INDUSTRIES} error={errors.industry} />
                    <SelectField label="Company Size" id="size" value={form.size} onChange={v => set('size', v)} options={COMPANY_SIZES} error={errors.size} />
                  </div>
                  <Field label="City / Location" id="city" placeholder="e.g. Bengaluru"
                    value={form.city} onChange={v => set('city', v)} error={errors.city}
                    icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>}
                  />
                  <Field label="Your Designation" id="designation" placeholder="e.g. HR Manager, Talent Acquisition Lead"
                    value={form.designation} onChange={v => set('designation', v)} error={errors.designation}
                    icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>}
                  />
                </div>
              )}

              {/* Step 2 — Hiring Needs */}
              {step === 2 && (
                <div className="fade-up">
                  <ChipSelect label="Roles you're hiring for" options={HIRING_ROLES}
                    selected={form.roles} onToggle={toggleRole} error={errors.roles} max={5}
                  />
                  <SelectField label="Expected hiring volume" id="volume" value={form.volume} onChange={v => set('volume', v)} options={HIRING_VOLUMES} error={errors.volume} />
                  <SelectField label="Hiring urgency" id="urgency" value={form.urgency} onChange={v => set('urgency', v)} options={HIRING_URGENCIES} error={errors.urgency} />
                  <div className="flex gap-3 rounded-[10px] p-4 mt-1" style={{ background: '#eef3ff' }}>
                    <svg width="18" height="18" fill="none" stroke={PRIMARY} strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <p className="text-[13px] text-gray-700 leading-[1.6]">We'll use this to recommend the right candidates and match your job posts to qualified applicants faster.</p>
                  </div>
                </div>
              )}

              {/* Step 3 — Verify */}
              {step === 3 && (
                <div className="fade-up">
                  {!otpSent ? (
                    <div className="text-center py-5">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#eef3ff', border: '1.5px solid #c7d7fe' }}>
                        <svg width="28" height="28" fill="none" stroke={PRIMARY} strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.71a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" /></svg>
                      </div>
                      <p className="text-[15px] text-gray-600 mb-1">We'll send an OTP to</p>
                      <p className="text-lg font-bold text-[#0f172a] mb-6">+91 {form.phone}</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-5">
                        <div className="text-[13px] text-gray-500 mb-1">OTP sent to <strong className="text-gray-900">+91 {form.phone}</strong></div>
                        <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }}
                          className="bg-transparent border-none text-xs font-semibold cursor-pointer" style={{ color: PRIMARY }}>
                          Change number
                        </button>
                      </div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-3.5 text-center">Enter 6-digit OTP</label>
                      <OTPInput value={otp} onChange={setOtp} />
                      {errors.otp && <p className="text-xs text-red-500 text-center font-medium mt-1 mb-3">{errors.otp}</p>}
                      <div className="text-center mb-5">
                        {timer > 0
                          ? <span className="text-[13px] text-gray-400">Resend OTP in <strong className="text-gray-700">{timer}s</strong></span>
                          : <button type="button" onClick={() => { setOtp(''); setTimer(30); }}
                            className="bg-transparent border-none text-[13px] font-bold cursor-pointer" style={{ color: PRIMARY }}>
                            Resend OTP
                          </button>
                        }
                      </div>
                    </>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer mb-1.5">
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
              )}

              {apiError && (
                <div className="mt-4 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">
                  {apiError}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className="flex-1 bg-white font-semibold text-[14px] rounded-xl transition-all duration-200"
                    style={{ color: '#374151', border: '1.5px solid #e5e7eb', padding: 13 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
                  >
                    ← Back
                  </button>
                )}
                <button type="submit" disabled={loading}
                  className="flex-[2] flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
                  style={{
                    padding: 14,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? '#93aef5' : PRIMARY,
                    boxShadow: loading ? 'none' : `0 4px 18px ${PRIMARY}44`,
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0d3fd4'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = PRIMARY; }}
                >
                  {loading
                    ? <><div className="w-4 h-4 border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" /> {submitLabel}</>
                    : submitLabel
                  }
                </button>
              </div>

              <p className="text-center text-[13px] text-gray-400 mt-5">
                Looking for a job?{' '}
                <Link href="/signup" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Sign up as candidate</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
