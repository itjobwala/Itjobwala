import type { Metadata } from 'next';
import { ProtectedRecruiterRoute } from '@/features/auth';
import { RecruiterInterviewsPage } from '@/features/recruiter/interviews';

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
