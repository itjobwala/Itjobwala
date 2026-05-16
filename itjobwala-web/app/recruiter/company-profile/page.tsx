import type { Metadata } from 'next';
import ProtectedRecruiterRoute from '@/src/components/auth/ProtectedRecruiterRoute';
import RecruiterCompanyProfilePage from '@/src/components/recruiter/RecruiterCompanyProfilePage';

export const metadata: Metadata = {
  title: 'Company Profile – itJobwala Recruiter',
  description: 'View and edit your company profile.',
};

export default function Page() {
  return (
    <ProtectedRecruiterRoute>
      <RecruiterCompanyProfilePage />
    </ProtectedRecruiterRoute>
  );
}
