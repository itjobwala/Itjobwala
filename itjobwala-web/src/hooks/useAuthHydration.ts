'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAuth } from '@/src/lib/auth';
import type { AuthSession } from '@/src/lib/auth';

interface UseAuthHydrationOptions {
  /**
   * Delay in ms to wait before considering hydration complete.
   * Useful for waiting for Zustand persist or other async hydration.
   * Default: 0 (immediate)
   */
  hydrationDelay?: number;

  /**
   * Custom function to check if external stores are hydrated.
   * Return true when all stores are ready.
   * Example: () => useAuthStore.persist.hasHydrated()
   */
  isExternalHydrated?: () => boolean;
}

interface UseAuthHydrationResult {
  /** True when hydration is complete and auth state is loaded */
  isHydrated: boolean;

  /** Current auth session or null if not authenticated */
  session: AuthSession | null;

  /** True when actively loading auth state */
  isLoading: boolean;
}

/**
 * useAuthHydration - Production-grade auth hydration detection
 *
 * Handles:
 * - SSR/CSR mismatch prevention
 * - Zustand persist hydration awareness
 * - localStorage async access
 * - Auth change events
 *
 * Ensures:
 * - No auth flicker
 * - Proper loading states
 * - Correct auth state after hydration
 *
 * Usage:
 * ```tsx
 * const { isHydrated, session, isLoading } = useAuthHydration({
 *   hydrationDelay: 0,  // Wait for Zustand if needed
 *   isExternalHydrated: () => useYourStore.persist.hasHydrated?.()
 * });
 *
 * if (!isHydrated) {
 *   return <NavbarSkeleton />;
 * }
 * ```
 */
export function useAuthHydration(
  options: UseAuthHydrationOptions = {}
): UseAuthHydrationResult {
  const { hydrationDelay = 0, isExternalHydrated } = options;

  const [isHydrated, setIsHydrated] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoized function to load auth state
  const loadAuthState = useCallback(() => {
    try {
      const authSession = getAuth();
      setSession(authSession);
    } catch (error) {
      console.error('[Auth] Failed to load auth state:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if external stores need to complete hydration first
    const shouldWaitForExternal = isExternalHydrated && !isExternalHydrated();

    if (shouldWaitForExternal) {
      // Poll until external hydration is complete
      const interval = setInterval(() => {
        if (isExternalHydrated?.()) {
          clearInterval(interval);
          // Now that external store is hydrated, continue
          if (hydrationDelay > 0) {
            setTimeout(() => {
              loadAuthState();
              setIsHydrated(true);
            }, hydrationDelay);
          } else {
            loadAuthState();
            setIsHydrated(true);
          }
        }
      }, 10);

      return () => clearInterval(interval);
    }

    // No external hydration needed, proceed immediately or after delay
    if (hydrationDelay > 0) {
      const timer = setTimeout(() => {
        loadAuthState();
        setIsHydrated(true);
      }, hydrationDelay);

      return () => clearTimeout(timer);
    }

    // Load immediately
    loadAuthState();
    setIsHydrated(true);

    // Listen for auth changes after hydration
    const handleAuthChange = () => {
      try {
        const updatedSession = getAuth();
        setSession(updatedSession);
      } catch (error) {
        console.error('[Auth] Failed to update auth on change:', error);
      }
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, [hydrationDelay, isExternalHydrated, loadAuthState]);

  return {
    isHydrated,
    session,
    isLoading,
  };
}
