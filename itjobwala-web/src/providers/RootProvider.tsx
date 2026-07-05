'use client';

import { useEffect } from 'react';
import LoadingOverlay from '@/src/components/common/LoadingOverlay';
import { LoadingProvider } from '@/src/contexts/LoadingContext';
import SessionExpiredToast from '@/src/features/auth/components/SessionExpiredToast';
import { useAuthStore } from '@/src/features/auth/session';
import { queueRefreshRequest } from '@/src/features/auth/session/refresh';
import QueryProvider from './QueryProvider';

function SessionHydrator() {
  useEffect(() => {
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
