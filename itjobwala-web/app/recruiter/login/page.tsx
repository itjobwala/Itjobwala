import { Suspense } from 'react';
import RecruiterLoginPage from '@/src/components/recruiter/RecruiterLoginPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Recruiter Login – itJobwala' };

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <RecruiterLoginPage />
    </Suspense>
  );
}
