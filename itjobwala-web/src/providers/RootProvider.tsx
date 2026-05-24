'use client';

import { useEffect } from 'react';
import LoadingOverlay from '@/src/components/common/LoadingOverlay';
import { LoadingProvider } from '@/src/contexts/LoadingContext';
import SessionExpiredToast from '@/src/features/auth/components/SessionExpiredToast';
import { useAuthStore } from '@/src/features/auth/session';
import QueryProvider from './QueryProvider';

function SessionHydrator() {
  const hydrate = useAuthStore(s => s.hydrate);
  const syncFromStorage = useAuthStore(s => s.syncFromStorage);

  useEffect(() => {
    hydrate();

    function onStorageChange(e: StorageEvent) {
      if (e.key === 'token' || e.key === 'recruiter_token' || e.key === 'itjobwala_auth') {
        syncFromStorage();
      }
    }

    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, [hydrate, syncFromStorage]);

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
