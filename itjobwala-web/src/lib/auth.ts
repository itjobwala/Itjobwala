import type { NavUser } from '@/src/components/navbar/UserDropdown';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem, safeDispatchEvent } from '@/src/lib/hydration-safe';

const AUTH_KEY     = 'itjobwala_auth';
const TOKEN_KEY    = 'token';
const TOKEN_COOKIE = 'token';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export interface JwtPayload {
  sub?:   string;
  email?: string;
  name?:  string;
  role?:  string;
  iat?:   number;
  exp?:   number;
  [key: string]: unknown;
}

export interface AuthSession extends NavUser {
  email:    string;
  /** Raw role string from JWT — e.g. "candidate" | "recruiter" */
  userRole: string;
}

// ── JWT helpers (payload decode only — no signature verification) ────────────

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const padded  = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json    = typeof atob !== 'undefined'
      ? atob(padded)
      : Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

// ── Cookie helpers (readable by proxy.ts for server-side route checks) ───────

export function setTokenCookie(token: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearTokenCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

const RECRUITER_TOKEN_COOKIE = 'recruiter_token';

export function setRecruiterTokenCookie(token: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${RECRUITER_TOKEN_COOKIE}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearRecruiterTokenCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${RECRUITER_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

// ── Session helpers ─────────────────────────────────────────────────────────

function nameFromEmail(email: string): string {
  const local = email.split('@')[0];
  return local
    .split(/[._-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function toDisplayRole(jwtRole: string): string {
  switch (jwtRole.toLowerCase()) {
    case 'candidate': return 'Candidate';
    case 'recruiter': return 'Recruiter';
    default:
      return jwtRole.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}

/**
 * Persists the auth session to localStorage.
 * Uses hydration-safe utilities to prevent SSR access to localStorage.
 * Automatically decodes the JWT token (if already stored) to extract `role`.
 */
export function setAuth(email: string): void {
  if (typeof window === 'undefined') return;

  // Read the token that was just stored by signinCandidate
  const rawToken = safeLocalStorageGetItem(TOKEN_KEY) ?? '';
  const payload  = rawToken ? decodeJwtPayload(rawToken) : null;
  const jwtRole  = (payload?.role as string | undefined) ?? 'candidate';

  // Prefer name from JWT if available
  const displayName = payload?.name
    ? String(payload.name)
    : nameFromEmail(email);

  const session: AuthSession = {
    email,
    name:                  displayName,
    initials:              initialsFromName(displayName),
    role:                  toDisplayRole(jwtRole),
    userRole:              jwtRole,
    avatarColorClass:      'from-primary to-blue-400',
    profilePhoto:          '',
    unreadNotifications:   3,
    unreadMessages:        2,
  };

  safeLocalStorageSetItem(AUTH_KEY, JSON.stringify(session));
  safeDispatchEvent('auth-changed');
}

/**
 * Retrieves the auth session from localStorage.
 * Returns null if window is not available (SSR) or session is not found.
 * Safe to call during SSR — will return null gracefully.
 */
export function getAuth(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!safeLocalStorageGetItem(TOKEN_KEY)) return null;
    const raw = safeLocalStorageGetItem(AUTH_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    // Backward compatibility — sessions persisted before userRole was added
    if (!session.userRole) session.userRole = 'candidate';
    return session;
  } catch {
    return null;
  }
}

/**
 * Updates the auth session with profile data (e.g., profile photo).
 */
export function updateAuthProfile(profileData: Partial<AuthSession>): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = safeLocalStorageGetItem(AUTH_KEY);
    if (!raw) return;
    const session = JSON.parse(raw) as AuthSession;
    const updated = { ...session, ...profileData };
    safeLocalStorageSetItem(AUTH_KEY, JSON.stringify(updated));
    safeDispatchEvent('auth-changed');
  } catch {
    // Silent fail
  }
}

/**
 * Clears all auth data from localStorage and dispatches auth-changed event.
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  safeLocalStorageRemoveItem(AUTH_KEY);
  safeLocalStorageRemoveItem(TOKEN_KEY);
  safeLocalStorageRemoveItem('recruiter_token');
  clearTokenCookie();
  clearRecruiterTokenCookie();
  safeDispatchEvent('auth-changed');
}
