'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/src/features/auth/session';
import { authLog } from '@/src/features/auth/session/auth.logger';
import SessionLoadingScreen from './SessionLoadingScreen';

interface Props {
  children: React.ReactNode;
  /** Defaults to '/auth/login'. Override for recruiter or other auth flows. */
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo = '/auth/login' }: Props) {
  const { isHydrated, isAuthenticated, isCandidate } = useSession();
  const router   = useRouter();
  const pathname = usePathname();

  const ready = isHydrated;
  const allowed = ready && isAuthenticated && isCandidate;

  useEffect(() => {
    if (ready && !allowed) {
      authLog('[AUTH]', `Redirect → ${redirectTo} (not authenticated as candidate)`);
      router.replace(`${redirectTo}?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, allowed, router, pathname, redirectTo]);

  if (!ready || !allowed) return <SessionLoadingScreen />;

  return <>{children}</>;
}
