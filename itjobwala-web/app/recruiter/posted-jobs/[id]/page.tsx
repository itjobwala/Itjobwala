import type { Metadata } from 'next';
import ProtectedRecruiterRoute from '@/src/components/auth/ProtectedRecruiterRoute';
import RecruiterShell from '@/src/components/recruiter/RecruiterShell';
import RecruiterJobDetailPage from '@/src/components/recruiter/RecruiterJobDetailPage';

export const metadata: Metadata = {
  title: 'Job Details – itJobwala Recruiter',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <ProtectedRecruiterRoute>
      <RecruiterShell>
        <RecruiterJobDetailPage jobId={id} />
      </RecruiterShell>
    </ProtectedRecruiterRoute>
  );
}
