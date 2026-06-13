import type { Metadata } from 'next';
import { ProtectedRecruiterRoute } from '@/features/auth';
import { RecruiterCandidateSearchPage } from '@/features/recruiter/candidates';

export const metadata: Metadata = {
  title: 'Find Candidates – itJobwala Recruiter',
  description: 'Search the candidate pool with rich filters. Privacy-safe — only candidates who opted in appear.',
};

export default function Page() {
  return (
    <ProtectedRecruiterRoute>
      <RecruiterCandidateSearchPage />
    </ProtectedRecruiterRoute>
  );
}
