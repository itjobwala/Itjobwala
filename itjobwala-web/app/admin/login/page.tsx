import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminLoginPage } from '@/src/features/admin';

export const metadata: Metadata = {
  title: 'Admin Login – itJobwala',
};

export default function Page() {
  return (
    <Suspense>
      <AdminLoginPage />
    </Suspense>
  );
}
