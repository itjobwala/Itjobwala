import type { Metadata } from 'next';
import ProtectedRecruiterRoute from '@/src/components/auth/ProtectedRecruiterRoute';
import RecruiterShell from '@/src/components/recruiter/RecruiterShell';
import RecruiterApplicantDetailPage from '@/src/components/recruiter/RecruiterApplicantDetailPage';

export const metadata: Metadata = {
  title: 'Applicant Details – itJobwala Recruiter',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <ProtectedRecruiterRoute>
      <RecruiterShell>
        <RecruiterApplicantDetailPage applicantId={id} />
      </RecruiterShell>
    </ProtectedRecruiterRoute>
  );
}
