import type { JwtPayload } from '@/src/lib/auth';
import { getInitials } from '@/src/lib/utils/format';
import type { SessionUser, AuthState } from './auth.types';
import {
  CANDIDATE_TOKEN_KEY,
  RECRUITER_TOKEN_KEY,
  AUTH_SESSION_KEY,
  TOKEN_COOKIE,
  RECRUITER_TOKEN_COOKIE,
  COOKIE_MAX_AGE,
  AUTH_CHANGED_EVENT,
} from './auth.constants';
import { authLog } from './auth.logger';

// ── JWT ──────────────────────────────────────────────────────────────────────

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob !== 'undefined'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Treat token as expired 60 seconds early to avoid edge-case 401s. */
const EXPIRY_BUFFER_SECONDS = 60;

export function isTokenExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false;
  return Date.now() / 1000 + EXPIRY_BUFFER_SECONDS >= payload.exp;
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0];
  return local
    .split(/[._-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function buildCandidateUser(payload: JwtPayload, storedSession?: SessionUser | null): SessionUser {
  if (storedSession?.userRole === 'candidate') return storedSession;
  const email = String(payload.email ?? '');
  const name = payload.name ? String(payload.name) : nameFromEmail(email);
  return {
    email,
    name,
    initials: getInitials(name),
    role: 'Candidate',
    userRole: 'candidate',
    avatarColorClass: 'from-primary to-blue-400',
    profilePhoto: '',
    unreadNotifications: 0,
    unreadMessages: 0,
  };
}

export function buildRecruiterUser(payload: JwtPayload): SessionUser {
  const email = String(payload.email ?? '');
  const name = payload.name ? String(payload.name) : nameFromEmail(email);
  return {
    email,
    name,
    initials: getInitials(name),
    role: 'Recruiter',
    userRole: 'recruiter',
    avatarColorClass: 'from-purple-500 to-indigo-400',
    profilePhoto: '',
    unreadNotifications: 0,
    unreadMessages: 0,
  };
}

// ── Storage ───────────────────────────────────────────────────────────────────

function ls(): Storage | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage; } catch { return null; }
}

export function readToken(key: string): string | null {
  return ls()?.getItem(key) ?? null;
}

export function writeToken(key: string, value: string): void {
  ls()?.setItem(key, value);
}

export function removeToken(key: string): void {
  ls()?.removeItem(key);
}

export function readSession(): SessionUser | null {
  try {
    const raw = ls()?.getItem(AUTH_SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser): void {
  try {
    ls()?.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
  } catch {
    // quota exceeded / private browsing
  }
}

export function removeSession(): void {
  ls()?.removeItem(AUTH_SESSION_KEY);
}

// ── Cookies ───────────────────────────────────────────────────────────────────

export function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ── Resolve session state from localStorage ───────────────────────────────────

type PartialAuthState = Omit<AuthState, 'isHydrated'>;

export function resolveSessionFromStorage(): PartialAuthState {
  const empty: PartialAuthState = {
    user: null, role: null, accessToken: null, isAuthenticated: false,
  };

  if (typeof window === 'undefined') return empty;

  // Try candidate token first
  const candidateToken = readToken(CANDIDATE_TOKEN_KEY);
  if (candidateToken) {
    const payload = decodeJwt(candidateToken);
    if (payload && !isTokenExpired(payload) && String(payload.role ?? '').toLowerCase() === 'candidate') {
      const stored = readSession();
      const user = buildCandidateUser(payload, stored);
      return { accessToken: candidateToken, user, role: 'candidate', isAuthenticated: true };
    }
    authLog('[SESSION]', 'Candidate token expired during hydration — purging');
    removeToken(CANDIDATE_TOKEN_KEY);
    removeSession();
    clearCookie(TOKEN_COOKIE);
  }

  // Try recruiter token
  const recruiterToken = readToken(RECRUITER_TOKEN_KEY);
  if (recruiterToken) {
    const payload = decodeJwt(recruiterToken);
    if (payload && !isTokenExpired(payload) && String(payload.role ?? '').toLowerCase() === 'recruiter') {
      const user = buildRecruiterUser(payload);
      return { accessToken: recruiterToken, user, role: 'recruiter', isAuthenticated: true };
    }
    authLog('[SESSION]', 'Recruiter token expired during hydration — purging');
    removeToken(RECRUITER_TOKEN_KEY);
    clearCookie(RECRUITER_TOKEN_COOKIE);
  }

  return empty;
}

// ── Events ────────────────────────────────────────────────────────────────────

export function dispatchAuthChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
