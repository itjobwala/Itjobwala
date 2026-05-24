import type { Metadata } from 'next';
import { ActivityPageClient } from '@/features/recruiter/dashboard';
import { ProtectedRecruiterRoute } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Activity Feed – itJobwala',
  description: 'View your complete recruiting activity history.',
};

export default function ActivityPage() {
  return (
    <ProtectedRecruiterRoute>
      <ActivityPageClient />
    </ProtectedRecruiterRoute>
  );
}
