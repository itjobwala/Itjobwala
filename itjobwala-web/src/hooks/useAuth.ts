'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuth, clearAuth, type AuthSession } from '@/src/lib/auth';

export interface UseAuthReturn {
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refresh: () => void;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading]  = useState(true);

  const refresh = useCallback(() => {
    setSession(getAuth());
    setLoading(false);
  }, []);

  // Resolve on mount — runs only in browser
  useEffect(() => {
    refresh();
  }, [refresh]);

  function logout() {
    clearAuth();
    window.location.href = '/';
  }

  return {
    session,
    loading,
    isAuthenticated: !!session,
    logout,
    refresh,
  };
}
