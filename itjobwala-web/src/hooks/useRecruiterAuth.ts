'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/session/auth.store';

export interface UseRecruiterAuthReturn {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refresh: () => void;
}

export function useRecruiterAuth(): UseRecruiterAuthReturn {
  const { role, isAuthenticated, isHydrated, logoutRecruiter } = useAuthStore();
  const router = useRouter();

  function logout() {
    logoutRecruiter();
    router.push('/');
  }

  return {
    isAuthenticated: isAuthenticated && role === 'recruiter',
    loading: !isHydrated,
    logout,
    refresh: () => {},
  };
}
