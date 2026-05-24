import type { Metadata } from 'next';
import { ProtectedRecruiterRoute } from '@/features/auth';
import { RecruiterPostedJobsPage } from '@/features/recruiter/jobs';

export const metadata: Metadata = {
  title: 'Posted Jobs – itJobwala Recruiter',
  description: 'View and manage all your posted job listings.',
};

export default function Page() {
  return (
    <ProtectedRecruiterRoute>
      <RecruiterPostedJobsPage />
    </ProtectedRecruiterRoute>
  );
}
