'use client';

import type { AuthSession } from '@/src/lib/auth';
import { useAuthStore } from '@/src/features/auth/session/auth.store';

interface UseAuthHydrationOptions {
  /** Kept for API compatibility — no longer has any effect */
  hydrationDelay?: number;
  /** Kept for API compatibility — no longer has any effect */
  isExternalHydrated?: () => boolean;
}

interface UseAuthHydrationResult {
  isHydrated: boolean;
  session: AuthSession | null;
  isLoading: boolean;
}

export function useAuthHydration(
  _options: UseAuthHydrationOptions = {},
): UseAuthHydrationResult {
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  const session: AuthSession | null =
    isAuthenticated && user ? (user as AuthSession) : null;

  return {
    isHydrated,
    session,
    isLoading: !isHydrated,
  };
}
