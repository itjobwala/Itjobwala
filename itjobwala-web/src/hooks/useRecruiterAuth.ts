'use client';

import { useState, useEffect, useCallback } from 'react';
import { safeLocalStorageGetItem, safeLocalStorageRemoveItem, safeDispatchEvent } from '@/src/lib/hydration-safe';

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

  const refresh = useCallback(() => {
    const token = safeLocalStorageGetItem(RECRUITER_TOKEN_KEY);
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = () => {
    safeLocalStorageRemoveItem(RECRUITER_TOKEN_KEY);
    safeLocalStorageRemoveItem('itjobwala_auth');
    safeDispatchEvent('auth-changed');
    window.location.href = '/recruiter/login';
  };

  return {
    isAuthenticated,
    loading,
    logout,
    refresh,
  };
}
