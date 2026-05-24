import type { Metadata } from 'next';
import { ProtectedRecruiterRoute } from '@/features/auth';
import { RecruiterApplicantsPage } from '@/features/recruiter/applicants';

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
