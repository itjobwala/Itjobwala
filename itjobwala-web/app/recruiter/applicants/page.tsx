import type { Metadata } from 'next';
import ProtectedRecruiterRoute from '@/src/components/auth/ProtectedRecruiterRoute';
import RecruiterApplicantsPage from '@/src/components/recruiter/RecruiterApplicantsPage';

export const metadata: Metadata = {
  title: 'Applicants – itJobwala Recruiter',
  description: 'Review and manage applications for your job postings.',
};

export default function Page() {
  return (
    <ProtectedRecruiterRoute>
      <RecruiterApplicantsPage />
    </ProtectedRecruiterRoute>
  );
}
