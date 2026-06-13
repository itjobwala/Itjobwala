'use client';

import { usePathname } from 'next/navigation';
import { AdminShell, ProtectedAdminRoute } from '@/src/features/admin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin  = pathname === '/admin/login';

  if (isLogin) return <>{children}</>;

  return (
    <ProtectedAdminRoute>
      <AdminShell>{children}</AdminShell>
    </ProtectedAdminRoute>
  );
}
