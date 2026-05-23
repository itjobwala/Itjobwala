import type { Metadata } from 'next';
import ApplicationsListPageClient from '@/src/components/applications/ApplicationsListPageClient';

export const metadata: Metadata = {
  title: 'My Applications – itJobwala',
  description: 'Track and manage your job applications across all statuses.',
};

export default function ApplicationsPage() {
  return <ApplicationsListPageClient />;
}
