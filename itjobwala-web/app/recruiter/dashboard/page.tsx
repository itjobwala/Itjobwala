import type { Metadata } from 'next';
import { RecruiterDashboardPage } from '@/features/recruiter/dashboard';
import { ProtectedRecruiterRoute } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Recruiter Dashboard – itJobwala',
  description: 'Manage your job postings, review applicants, and track your hiring pipeline.',
};

export default function Page() {
  return (
    <ProtectedRecruiterRoute>
      <RecruiterDashboardPage />
    </ProtectedRecruiterRoute>
  );
}
