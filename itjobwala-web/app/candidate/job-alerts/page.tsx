import type { Metadata } from 'next';
import JobAlertsPageClient from '@/src/features/candidate/job-alerts/components/JobAlertsPageClient';

export const metadata: Metadata = {
  title: 'Job Alerts — itJobwala',
  description: 'Set up job alerts to get notified when new IT jobs matching your criteria are posted.',
};

export default function JobAlertsPage() {
  return <JobAlertsPageClient />;
}
