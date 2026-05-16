'use client';

import QueryProvider from './QueryProvider';
import { LoadingProvider } from '@/src/contexts/LoadingContext';
import LoadingOverlay from '@/src/components/LoadingOverlay';

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LoadingProvider>
        <LoadingOverlay />
        {children}
      </LoadingProvider>
    </QueryProvider>
  );
}
