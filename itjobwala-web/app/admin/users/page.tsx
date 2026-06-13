import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminUsersPage } from '@/src/features/admin';

export const metadata: Metadata = {
  title: 'Users – itJobwala Admin',
};

export default function Page() {
  return (
    <Suspense>
      <AdminUsersPage />
    </Suspense>
  );
}
