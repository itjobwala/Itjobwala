'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/src/features/auth/session';
import { authLog } from '@/src/features/auth/session/auth.logger';
import SessionLoadingScreen from './SessionLoadingScreen';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRecruiterRoute({ children }: Props) {
  const { isHydrated, isAuthenticated, isRecruiter } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const ready = isHydrated;
  const allowed = ready && isAuthenticated && isRecruiter;

  useEffect(() => {
    if (ready && !allowed) {
      authLog('[AUTH]', 'Redirect → /auth/login?role=recruiter (not authenticated as recruiter)');
      router.replace(`/auth/login?role=recruiter&next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, allowed, router, pathname]);

  if (!ready || !allowed) return <SessionLoadingScreen />;

  return <>{children}</>;
}
