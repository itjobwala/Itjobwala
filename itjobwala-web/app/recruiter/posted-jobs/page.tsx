import type { Metadata } from 'next';
import ProtectedRecruiterRoute from '@/src/components/auth/ProtectedRecruiterRoute';
import RecruiterPostedJobsPage from '@/src/components/recruiter/RecruiterPostedJobsPage';

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
