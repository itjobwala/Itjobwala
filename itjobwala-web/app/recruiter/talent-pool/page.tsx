import type { Metadata } from 'next';
import { ProtectedRecruiterRoute } from '@/features/auth';
import RecruiterTalentPoolPage from '@/features/recruiter/candidates/components/RecruiterTalentPoolPage';

export const metadata: Metadata = {
  title: 'Talent Pool – itJobwala Recruiter',
  description: 'Your saved candidates — organised into lists for easy retrieval and bulk messaging.',
};

export default function Page() {
  return (
    <ProtectedRecruiterRoute>
      <RecruiterTalentPoolPage />
    </ProtectedRecruiterRoute>
  );
}
