'use client';

import { useAuthStore } from './auth.store';
import type { SessionUser } from './auth.types';

export interface UseSessionReturn {
  user: SessionUser | null;
  role: 'candidate' | 'recruiter' | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isCandidate: boolean;
  isRecruiter: boolean;
  logout: () => void;
  logoutCandidate: () => void;
  logoutRecruiter: () => void;
  setUser: (patch: Partial<SessionUser>) => void;
}

export function useSession(): UseSessionReturn {
  const store = useAuthStore();

  return {
    user:            store.user,
    role:            store.role,
    isAuthenticated: store.isAuthenticated,
    isHydrated:      store.isHydrated,
    isCandidate:     store.role === 'candidate',
    isRecruiter:     store.role === 'recruiter',
    logout:          store.logout,
    logoutCandidate: store.logoutCandidate,
    logoutRecruiter: store.logoutRecruiter,
    setUser:         store.setUser,
  };
}
