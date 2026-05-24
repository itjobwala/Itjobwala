import type { AuthSession } from '@/src/lib/auth';

/** In-memory session user — identical shape to AuthSession for zero-friction compat */
export type SessionUser = AuthSession;

export interface AuthState {
  user: SessionUser | null;
  role: 'candidate' | 'recruiter' | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

export interface AuthActions {
  loginCandidate: (token: string, user: SessionUser) => void;
  loginRecruiter: (token: string) => void;
  logout: () => void;
  logoutCandidate: () => void;
  logoutRecruiter: () => void;
  hydrate: () => void;
  syncFromStorage: () => void;
  setUser: (patch: Partial<SessionUser>) => void;
  isCandidate: () => boolean;
  isRecruiter: () => boolean;
}

export type AuthStore = AuthState & AuthActions;
