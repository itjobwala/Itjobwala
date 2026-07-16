'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Field from '@/src/components/ui/Field';
import { PRIMARY } from '@/src/lib/constants';
import { adminLogin } from '../services/admin.api';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import type { SessionUser } from '@/src/features/auth/session/auth.types';
import { getInitials } from '@/src/lib/utils/format';

const ADMIN_BG = '#0f172a';
const ADMIN_ACCENT = '#6366f1';

const ShieldIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const Spinner = () => (
  <div style={{
    width: 18, height: 18,
    border: '2.5px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  }} />
);

export default function AdminLoginPage() {
  const loginAdmin = useAuthStore(s => s.loginAdmin);

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(email.trim(), password);
      const user: SessionUser = {
        email:               res.data.email,
        name:                res.data.full_name,
        initials:            getInitials(res.data.full_name),
        role:                'Admin',
        userRole:            'admin',
        avatarColorClass:    'from-slate-700 to-slate-500',
        profilePhoto:        '',
        unreadNotifications: 0,
        unreadMessages:      0,
      };
      loginAdmin(res.token, user);
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: `linear-gradient(135deg, ${ADMIN_BG} 0%, #1e293b 60%, #0f172a 100%)` }}
    >
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <Image src="/logo.png" alt="itJobwala" width={32} height={32} />
          <span className="font-extrabold text-xl text-white" style={{ letterSpacing: '-0.5px' }}>
            it<span style={{ color: ADMIN_ACCENT }}>Jobwala</span>
            <span className="ml-2 text-[11px] font-semibold tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5 }}>Admin</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: ADMIN_ACCENT + '22', color: ADMIN_ACCENT }}>
              <ShieldIcon />
            </div>
            <div>
              <h1 className="text-h6 text-white leading-tight">Admin Panel</h1>
              <p className="text-slate-400 text-xs mt-0.5">Restricted access — authorised personnel only</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@example.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = ADMIN_ACCENT; }}
                onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
            </div>
            <div className="mb-6">
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = ADMIN_ACCENT; }}
                onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-white border-none cursor-pointer transition-all"
              style={{
                padding: '13px 0',
                background: loading ? ADMIN_ACCENT + '80' : ADMIN_ACCENT,
                boxShadow: loading ? 'none' : `0 4px 20px ${ADMIN_ACCENT}55`,
              }}
            >
              {loading ? <><Spinner /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Not an admin?{' '}
          <Link href="/auth/login" className="text-slate-500 hover:text-slate-400 transition-colors">
            Go to candidate / recruiter login
          </Link>
        </p>
      </div>
    </div>
  );
}
