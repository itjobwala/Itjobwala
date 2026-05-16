'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRecruiterAuth } from '@/src/hooks/useRecruiterAuth';

interface Props {
  children: React.ReactNode;
}

function AuthSpinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
        <p className="text-[13px] font-medium text-gray-400">Verifying recruiter session…</p>
      </div>
    </div>
  );
}

export default function ProtectedRecruiterRoute({ children }: Props) {
  const { isAuthenticated, loading } = useRecruiterAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/recruiter/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, loading, router, pathname]);

  if (loading || !isAuthenticated) return <AuthSpinner />;

  return <>{children}</>;
}
