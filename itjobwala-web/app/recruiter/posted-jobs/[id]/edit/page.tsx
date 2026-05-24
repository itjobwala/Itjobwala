import type { Metadata } from 'next';
import { ProtectedRecruiterRoute } from '@/features/auth';
import { RecruiterShell } from '@/layout/shell';
import { RecruiterEditJobPage } from '@/features/recruiter/jobs';

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
