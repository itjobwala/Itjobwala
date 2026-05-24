import type { Metadata } from 'next';
import { ApplicationsListPageClient } from '@/features/candidate/applications';

export const metadata: Metadata = {
  title: 'My Applications – itJobwala',
  description: 'Track and manage your job applications across all statuses.',
};

export default function ApplicationsPage() {
  return <ApplicationsListPageClient />;
}
