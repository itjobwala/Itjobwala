import type { Metadata } from 'next';
import { ProtectedRecruiterRoute } from '@/features/auth';
import { RecruiterShell } from '@/layout/shell';
import { RecruiterApplicantDetailPage } from '@/features/recruiter/applicants';

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
