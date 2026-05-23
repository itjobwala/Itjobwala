import type { Metadata } from 'next';
import { Suspense } from 'react';
import CandidateDashboardPage from '@/src/components/dashboard/CandidateDashboardPage';

export const metadata: Metadata = {
  title: 'Dashboard – itJobwala',
  description: 'Your candidate dashboard – browse and apply to IT jobs.',
};

export default function Page() {
  return (
    <Suspense>
      <CandidateDashboardPage />
    </Suspense>
  );
}
