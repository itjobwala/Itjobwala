import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ApplicationDetailPageClient } from '@/features/candidate/applications';

export const metadata: Metadata = {
  title: 'Application Details – itJobwala',
  description: 'View the full timeline and status history of your job application.',
};

export default function ApplicationDetailPage() {
  return (
    <Suspense>
      <ApplicationDetailPageClient />
    </Suspense>
  );
}
