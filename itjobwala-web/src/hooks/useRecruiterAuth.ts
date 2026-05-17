'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { safeLocalStorageGetItem } from '@/src/lib/hydration-safe';
import { clearRecruiterAuth, decodeJwtPayload } from '@/src/lib/auth';

const RECRUITER_TOKEN_KEY = 'recruiter_token';

export interface UseRecruiterAuthReturn {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refresh: () => void;
}

export function useRecruiterAuth(): UseRecruiterAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(() => {
    const token = safeLocalStorageGetItem(RECRUITER_TOKEN_KEY);
    const payload = token ? decodeJwtPayload(token) : null;
    const isExpired = payload?.exp ? Date.now() / 1000 >= payload.exp : false;
    const isRecruiter = String(payload?.role ?? '').toLowerCase() === 'recruiter';

    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    if (!payload || isExpired || !isRecruiter) {
      clearRecruiterAuth();
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);

    window.addEventListener('auth-changed', refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('auth-changed', refresh);
    };
  }, [refresh]);

  const logout = () => {
    clearRecruiterAuth();
    setIsAuthenticated(false);
    router.push('/recruiter/login');
  };

  return {
    isAuthenticated,
    loading,
    logout,
    refresh,
  };
}
