import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VerifyOtpPage } from '@/features/auth';

export const metadata: Metadata = { title: 'Verify Email – itJobwala' };

export default function Page() {
  return (
    <Suspense>
      <VerifyOtpPage />
    </Suspense>
  );
}
