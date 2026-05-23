'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';

interface Props {
  children: React.ReactNode;
  /** Defaults to '/auth/login'. Override for recruiter or other auth flows. */
  redirectTo?: string;
}

function AuthSpinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
        <p className="text-[13px] font-medium text-gray-400">Verifying session…</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, redirectTo = '/auth/login' }: Props) {
  const { session, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(pathname)}`);
    }
  }, [session, loading, router, pathname, redirectTo]);

  // Show spinner while loading auth state or while redirect is pending
  if (loading || !session) return <AuthSpinner />;

  return <>{children}</>;
}
