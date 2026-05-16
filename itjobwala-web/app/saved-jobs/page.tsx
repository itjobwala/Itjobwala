import type { Metadata } from 'next';
import SavedJobsListPageClient from '@/src/components/saved-jobs/SavedJobsListPageClient';

export const metadata: Metadata = {
  title: 'Saved Jobs – itJobwala',
  description: 'Browse and manage your saved job listings.',
};

export default function SavedJobsPage() {
  return <SavedJobsListPageClient />;
}
