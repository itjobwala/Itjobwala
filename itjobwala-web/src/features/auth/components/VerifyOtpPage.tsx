'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import OTPInput from '@/src/components/ui/OTPInput';
import { verifyAndLogin, resendOtp, ResendCooldownError } from '@/features/auth/services/otp.api';

type Role = 'candidate' | 'recruiter';

const VALID_ROLES: Role[] = ['candidate', 'recruiter'];
const RESEND_COOLDOWN_SECS = 30;

const Spinner = () => (
  <div className="w-[18px] h-[18px] border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" />
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
          <span className="font-extrabold text-xl text-heading" style={{ letterSpacing: '-0.5px' }}>
            it<span className="text-primary">Jobwala</span>
          </span>
        </Link>
      </div>
    </nav>
  );
}

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email') ?? '';
  const roleParam = searchParams.get('role') ?? '';
  const role = VALID_ROLES.includes(roleParam as Role) ? (roleParam as Role) : null;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECS);

  // Redirect if params are missing or invalid
  useEffect(() => {
    if (!email || !role) {
      router.replace('/auth/login');
    }
  }, [email, role, router]);

  // Countdown tick
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleSubmit = useCallback(async (otpValue: string) => {
    if (!email || !role || otpValue.replace(/\s/g, '').length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await verifyAndLogin({ email, role, otp: otpValue });
      window.location.href = role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
      setLoading(false);
    }
  }, [email, role]);

  async function handleResend() {
    if (!email || !role) return;
    setResendLoading(true);
    setResendSuccess(false);
    setError('');
    try {
      await resendOtp({ email, role });
      setCountdown(RESEND_COOLDOWN_SECS);
      setResendSuccess(true);
      setOtp('');
    } catch (err) {
      if (err instanceof ResendCooldownError) {
        setCountdown(err.retryAfterSeconds);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to resend. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  }

  // Don't render while redirect is in-flight
  if (!email || !role) return null;

  const otpComplete = otp.replace(/\s/g, '').length === 6;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: 'var(--font-plus-jakarta)', background: 'linear-gradient(135deg, #f0f5ff 0%, #eef3ff 50%, #f5f0ff 100%)' }}
    >
      <NavBar />

      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-[440px]">

          {/* Card */}
          <div
            className="bg-white rounded-2xl px-7 py-9 sm:px-9 sm:py-11"
            style={{ boxShadow: '0 24px 64px rgba(21,87,255,0.07)' }}
          >
            {/* Icon */}
            <div
              className="flex items-center justify-center rounded-2xl mx-auto mb-5"
              style={{ width: 60, height: 60, background: '#eef3ff', border: '1.5px solid rgba(21,87,255,0.25)' }}
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-primary">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>

            {/* Heading */}
            <h1
              className="font-extrabold text-heading text-center mb-2"
              style={{ fontSize: 26, letterSpacing: -0.8 }}
            >
              Verify your email
            </h1>
            <p className="text-base text-muted text-center mb-7" style={{ lineHeight: 1.6 }}>
              Enter the 6-digit code sent to{' '}
              <strong className="font-semibold text-heading break-all">{email}</strong>
            </p>

            {/* OTP input */}
            <OTPInput
              value={otp}
              onChange={v => { setOtp(v); setError(''); setResendSuccess(false); }}
              onComplete={handleSubmit}
              disabled={loading}
            />

            {/* Error banner */}
            {error && (
              <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium text-danger bg-danger-bg border border-danger">
                {error}
              </div>
            )}

            {/* Resend success banner */}
            {resendSuccess && (
              <div className="mb-4 flex items-start gap-3 rounded-xl px-4 py-3.5 bg-success-bg border border-success">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0 mt-0.5 text-success">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-sm font-semibold text-green-800">New code sent — check your inbox.</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={() => handleSubmit(otp)}
              disabled={loading || !otpComplete}
              className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-md transition-all duration-200"
              style={{
                padding: 15,
                cursor:     loading || !otpComplete ? 'not-allowed' : 'pointer',
                background: loading || !otpComplete ? '#93aef5' : 'var(--color-primary)',
                boxShadow:  loading || !otpComplete ? 'none' : '0 4px 20px rgba(21,87,255,0.27)',
              }}
              onMouseEnter={e => { if (!loading && otpComplete) e.currentTarget.style.background = '#0d3fd4'; }}
              onMouseLeave={e => { if (!loading && otpComplete) e.currentTarget.style.background = 'var(--color-primary)'; }}
            >
              {loading ? <><Spinner /> Verifying…</> : 'Verify email →'}
            </button>

            {/* Resend control */}
            <div className="text-center mt-5">
              {countdown > 0 ? (
                <p className="text-sm text-subtle">
                  Resend in{' '}
                  <strong className="text-body-secondary tabular-nums">{countdown}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-sm font-semibold bg-transparent border-none cursor-pointer transition-opacity"
                  style={{ color: resendLoading ? '#93aef5' : 'var(--color-primary)', opacity: resendLoading ? 0.6 : 1 }}
                >
                  {resendLoading ? 'Sending…' : 'Resend code'}
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-subtle mt-5">
            Wrong email?{' '}
            <Link href="/auth/login" className="font-bold text-primary no-underline">
              Back to login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
