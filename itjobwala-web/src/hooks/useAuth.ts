'use client';

import type { AuthSession } from '@/src/lib/auth';
import { useAuthStore } from '@/src/features/auth/session/auth.store';

export interface UseAuthReturn {
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refresh: () => void;
}

export function useAuth(): UseAuthReturn {
  const { user, role, isAuthenticated, isHydrated, logout: storeLogout } = useAuthStore();

  const session: AuthSession | null =
    isAuthenticated && role === 'candidate' && user ? (user as AuthSession) : null;

  function logout() {
    storeLogout();
    window.location.href = '/';
  }

  return {
    session,
    loading: !isHydrated,
    isAuthenticated: !!session,
    logout,
    refresh: () => {},
  };
}
