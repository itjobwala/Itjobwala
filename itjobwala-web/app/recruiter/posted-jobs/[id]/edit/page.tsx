import type { Metadata } from 'next';
import ProtectedRecruiterRoute from '@/src/components/auth/ProtectedRecruiterRoute';
import RecruiterShell from '@/src/components/recruiter/RecruiterShell';
import RecruiterEditJobPage from '@/src/components/recruiter/RecruiterEditJobPage';

export const metadata: Metadata = {
  title: 'Edit Job – itJobwala Recruiter',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <ProtectedRecruiterRoute>
      <RecruiterShell>
        <RecruiterEditJobPage jobId={id} />
      </RecruiterShell>
    </ProtectedRecruiterRoute>
  );
}
