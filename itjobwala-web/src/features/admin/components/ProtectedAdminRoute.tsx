'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/session/auth.store';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: Props) {
  const isHydrated = useAuthStore(s => s.isHydrated);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isAdmin = useAuthStore(s => s.isAdmin);

  const router   = useRouter();
  const pathname = usePathname();

  const ready   = isHydrated;
  const allowed = ready && isAuthenticated && isAdmin();

  useEffect(() => {
    if (!ready || allowed) return;
    router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, allowed, router, pathname]);

  if (!ready || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
