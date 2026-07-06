'use client';

import { useEffect } from 'react';
import LoadingOverlay from '@/src/components/common/LoadingOverlay';
import { LoadingProvider } from '@/src/contexts/LoadingContext';
import SessionExpiredToast from '@/src/features/auth/components/SessionExpiredToast';
import { useAuthStore } from '@/src/features/auth/session';
import { SESSION_ACTIVE_KEY } from '@/src/features/auth/session/auth.constants';
import { readToken } from '@/src/features/auth/session/session.utils';
import { queueRefreshRequest } from '@/src/features/auth/session/refresh';
import QueryProvider from './QueryProvider';

function SessionHydrator() {
  useEffect(() => {
    // Skip refresh if no prior session marker — avoids a guaranteed-to-fail
    // network call on the signup/login pages for first-time visitors.
    if (!readToken(SESSION_ACTIVE_KEY)) {
      useAuthStore.setState({ isHydrated: true });
      return;
    }
    // Attempt silent refresh from the httpOnly refresh cookie.
    // - Success: store is populated with new access token + role + user
    // - Failure (no refresh cookie / expired): store stays unauthenticated
    // isHydrated is set to true only AFTER this settles, so ProtectedRoute
    // never flashes a redirect while the refresh is in flight.
    queueRefreshRequest().finally(() => {
      useAuthStore.setState({ isHydrated: true });
    });
    // No storage-event listener: access tokens are no longer in localStorage.
  }, []);

  return null;
}

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionHydrator />
      <SessionExpiredToast />
      <LoadingProvider>
        <LoadingOverlay />
        {children}
      </LoadingProvider>
    </QueryProvider>
  );
}
