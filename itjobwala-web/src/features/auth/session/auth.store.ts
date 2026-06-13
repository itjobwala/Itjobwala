import { create } from 'zustand';
import { clearQueryCache } from '@/src/lib/queryClient';
import {
  CANDIDATE_TOKEN_KEY,
  RECRUITER_TOKEN_KEY,
  ADMIN_TOKEN_KEY,
  TOKEN_COOKIE,
  RECRUITER_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
} from './auth.constants';
import { authLog } from './auth.logger';
import type { AuthStore, SessionUser } from './auth.types';
import { clearRefreshState } from './refresh';
import {
  decodeJwt,
  buildRecruiterUser,
  buildAdminUser,
  writeSession,
  removeSession,
  writeToken,
  removeToken,
  setCookie,
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
  loginCandidate: (token: string, user: SessionUser) => {
    writeToken(CANDIDATE_TOKEN_KEY, token);
    setCookie(TOKEN_COOKIE, token);
    writeSession(user);
    set({ accessToken: token, user, role: 'candidate', isAuthenticated: true });
    authLog('[AUTH]', `Candidate login successful — ${user.email}`);
    dispatchAuthChanged();
  },

  loginRecruiter: (token: string) => {
    const payload = decodeJwt(token);
    const user = payload ? buildRecruiterUser(payload) : null;
    writeToken(RECRUITER_TOKEN_KEY, token);
    setCookie(RECRUITER_TOKEN_COOKIE, token);
    set({ accessToken: token, user, role: 'recruiter', isAuthenticated: true, isLoggingOut: false });
    authLog('[AUTH]', `Recruiter login successful — ${user?.email ?? 'unknown'}`);
    dispatchAuthChanged();
  },

  loginAdmin: (token: string, user: SessionUser) => {
    writeToken(ADMIN_TOKEN_KEY, token);
    setCookie(ADMIN_TOKEN_COOKIE, token);
    set({ accessToken: token, user, role: 'admin', isAuthenticated: true, isLoggingOut: false });
    authLog('[AUTH]', `Admin login successful — ${user.email}`);
    dispatchAuthChanged();
  },

  // ── Logout actions ───────────────────────────────────────────────────────
  logout: () => {
    authLog('[AUTH]', 'Logout (all roles)');
    removeToken(CANDIDATE_TOKEN_KEY);
    removeToken(RECRUITER_TOKEN_KEY);
    removeToken(ADMIN_TOKEN_KEY);
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
    removeToken(CANDIDATE_TOKEN_KEY);
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
    set({ isLoggingOut: true });
    removeToken(RECRUITER_TOKEN_KEY);
    clearCookie(RECRUITER_TOKEN_COOKIE);
    clearQueryCache();
    clearRefreshState();
    set({ user: null, role: null, accessToken: null, isAuthenticated: false });
    dispatchAuthChanged();
  },

  logoutAdmin: () => {
    if (get().role !== 'admin') return;
    authLog('[AUTH]', 'Admin logout');
    removeToken(ADMIN_TOKEN_KEY);
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
