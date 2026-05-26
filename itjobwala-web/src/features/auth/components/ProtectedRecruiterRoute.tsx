'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/src/features/auth/session';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import { authLog } from '@/src/features/auth/session/auth.logger';
import SessionLoadingScreen from './SessionLoadingScreen';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRecruiterRoute({ children }: Props) {
  const { isHydrated, isAuthenticated, isRecruiter } = useSession();
  const isLoggingOut = useAuthStore(s => s.isLoggingOut);
  const router = useRouter();
  const pathname = usePathname();

  const ready   = isHydrated;
  const allowed = ready && isAuthenticated && isRecruiter;

  useEffect(() => {
    if (!ready || allowed) return;

    if (isLoggingOut) {
      // Explicit logout — go home, no stale role/next params
      router.replace('/');
    } else {
      // Session expired or direct URL access — go to recruiter login
      authLog('[AUTH]', 'Redirect → /auth/login?role=recruiter (not authenticated as recruiter)');
      router.replace(`/auth/login?role=recruiter&next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, allowed, isLoggingOut, router, pathname]);

  if (!ready || !allowed) return <SessionLoadingScreen />;

  return <>{children}</>;
}
