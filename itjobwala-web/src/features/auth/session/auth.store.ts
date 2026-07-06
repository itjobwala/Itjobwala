import { create } from 'zustand';
import { clearQueryCache } from '@/src/lib/queryClient';
import {
  CANDIDATE_TOKEN_KEY,
  RECRUITER_TOKEN_KEY,
  ADMIN_TOKEN_KEY,
  TOKEN_COOKIE,
  RECRUITER_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
  SESSION_ACTIVE_KEY,
} from './auth.constants';
import { authLog } from './auth.logger';
import type { AuthStore, SessionUser } from './auth.types';
import { clearRefreshState, revokeRefreshToken } from './refresh';
import {
  decodeJwt,
  buildRecruiterUser,
  buildAdminUser,
  writeSession,
  removeSession,
  writeToken,
  removeToken,
  clearCookie,
  resolveSessionFromStorage,
  dispatchAuthChanged,
} from './session.utils';

export const useAuthStore = create<AuthStore>((set, get) => ({
  // ── Initial state ────────────────────────────────────────────────────────
  user: null,
  role: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoggingOut: false,

  // ── Derived helpers ──────────────────────────────────────────────────────
  isCandidate: () => get().role === 'candidate',
  isRecruiter: () => get().role === 'recruiter',
  isAdmin: () => get().role === 'admin',

  // ── Hydration (call once on app mount) ──────────────────────────────────
  hydrate: () => {
    authLog('[SESSION]', 'Hydration start');
    const state = resolveSessionFromStorage();
    set({ ...state, isHydrated: true });
    authLog('[SESSION]', state.isAuthenticated ? `Hydration success — role: ${state.role}` : 'Hydration complete — no session');
  },

  // ── Multi-tab sync (call on `storage` event) ─────────────────────────────
  syncFromStorage: () => {
    const state = resolveSessionFromStorage();
    authLog('[SESSION]', `Multi-tab sync — role: ${state.role ?? 'none'}`);
    set(state);
    dispatchAuthChanged();
  },

  // ── Login actions ────────────────────────────────────────────────────────
  // Access token is kept in Zustand (memory) only — not in localStorage or
  // a JS-readable cookie. This prevents XSS from stealing the token.
  loginCandidate: (token: string, user: SessionUser) => {
    writeSession(user);  // non-sensitive profile data only
    writeToken(SESSION_ACTIVE_KEY, '1');
    set({ accessToken: token, user, role: 'candidate', isAuthenticated: true });
    authLog('[AUTH]', `Candidate login successful — ${user.email}`);
    dispatchAuthChanged();
  },

  loginRecruiter: (token: string) => {
    const payload = decodeJwt(token);
    const user = payload ? buildRecruiterUser(payload) : null;
    writeToken(SESSION_ACTIVE_KEY, '1');
    set({ accessToken: token, user, role: 'recruiter', isAuthenticated: true, isLoggingOut: false });
    authLog('[AUTH]', `Recruiter login successful — ${user?.email ?? 'unknown'}`);
    dispatchAuthChanged();
  },

  loginAdmin: (token: string, user: SessionUser) => {
    writeToken(SESSION_ACTIVE_KEY, '1');
    set({ accessToken: token, user, role: 'admin', isAuthenticated: true, isLoggingOut: false });
    authLog('[AUTH]', `Admin login successful — ${user.email}`);
    dispatchAuthChanged();
  },

  // ── Logout actions ───────────────────────────────────────────────────────
  logout: () => {
    authLog('[AUTH]', 'Logout (all roles)');
    revokeRefreshToken();  // clears httpOnly refresh cookie so silent-refresh can't re-auth
    removeToken(CANDIDATE_TOKEN_KEY);
    removeToken(RECRUITER_TOKEN_KEY);
    removeToken(ADMIN_TOKEN_KEY);
    removeToken(SESSION_ACTIVE_KEY);
    removeSession();
    clearCookie(TOKEN_COOKIE);
    clearCookie(RECRUITER_TOKEN_COOKIE);
    clearCookie(ADMIN_TOKEN_COOKIE);
    clearQueryCache();
    clearRefreshState();
    set({ user: null, role: null, accessToken: null, isAuthenticated: false });
    dispatchAuthChanged();
  },

  logoutCandidate: () => {
    if (get().role !== 'candidate') return;
    authLog('[AUTH]', 'Candidate logout');
    revokeRefreshToken();  // clears httpOnly refresh cookie so silent-refresh can't re-auth
    removeToken(CANDIDATE_TOKEN_KEY);
    removeToken(SESSION_ACTIVE_KEY);
    removeSession();
    clearCookie(TOKEN_COOKIE);
    clearQueryCache();
    clearRefreshState();
    set({ user: null, role: null, accessToken: null, isAuthenticated: false });
    dispatchAuthChanged();
  },

  logoutRecruiter: () => {
    if (get().role !== 'recruiter') return;
    authLog('[AUTH]', 'Recruiter logout');
    revokeRefreshToken();  // clears httpOnly refresh cookie so silent-refresh can't re-auth
    set({ isLoggingOut: true });
    removeToken(RECRUITER_TOKEN_KEY);
    removeToken(SESSION_ACTIVE_KEY);
    clearCookie(RECRUITER_TOKEN_COOKIE);
    clearQueryCache();
    clearRefreshState();
    set({ user: null, role: null, accessToken: null, isAuthenticated: false });
    dispatchAuthChanged();
  },

  logoutAdmin: () => {
    if (get().role !== 'admin') return;
    authLog('[AUTH]', 'Admin logout');
    revokeRefreshToken();  // clears httpOnly refresh cookie so silent-refresh can't re-auth
    removeToken(ADMIN_TOKEN_KEY);
    removeToken(SESSION_ACTIVE_KEY);
    clearCookie(ADMIN_TOKEN_COOKIE);
    clearQueryCache();
    clearRefreshState();
    set({ user: null, role: null, accessToken: null, isAuthenticated: false });
    dispatchAuthChanged();
  },

  // ── Profile patch ────────────────────────────────────────────────────────
  setUser: (patch: Partial<SessionUser>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...patch };
    set({ user: updated });
    if (get().role === 'candidate') writeSession(updated);
  },
}));
