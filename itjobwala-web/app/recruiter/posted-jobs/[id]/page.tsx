import type { Metadata } from 'next';
import { ProtectedRecruiterRoute } from '@/features/auth';
import { RecruiterShell } from '@/layout/shell';
import { RecruiterJobDetailPage } from '@/features/recruiter/jobs';

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
