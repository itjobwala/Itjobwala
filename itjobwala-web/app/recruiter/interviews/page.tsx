import type { Metadata } from 'next';
import ProtectedRecruiterRoute from '@/src/components/auth/ProtectedRecruiterRoute';
import RecruiterInterviewsPage from '@/src/components/recruiter/RecruiterInterviewsPage';

export const metadata: Metadata = {
  title: 'Interviews – itJobwala Recruiter',
  description: 'Manage and schedule candidate interviews.',
};

export default function Page() {
  return (
    <ProtectedRecruiterRoute>
      <RecruiterInterviewsPage />
    </ProtectedRecruiterRoute>
  );
}
