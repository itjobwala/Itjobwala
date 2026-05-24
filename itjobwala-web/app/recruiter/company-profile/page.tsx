import type { Metadata } from 'next';
import { ProtectedRecruiterRoute } from '@/features/auth';
import { RecruiterCompanyProfilePage } from '@/features/recruiter/company';

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
