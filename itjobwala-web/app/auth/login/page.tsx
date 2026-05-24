import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginPage } from '@/features/auth';

export const metadata: Metadata = { title: 'Log In – itJobwala' };

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
