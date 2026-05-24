import { Suspense } from 'react';
import { JobsPageClient } from '@/features/jobs/browse';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse IT Jobs – itJobwala',
  description: 'Discover curated IT jobs at top startups and MNCs. Filter by role, location, work mode, and experience.',
};

export default function JobsPage() {
  return (
    <Suspense>
      <JobsPageClient />
    </Suspense>
  );
}
