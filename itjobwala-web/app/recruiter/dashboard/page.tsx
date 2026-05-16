import type { Metadata } from 'next';
import RecruiterDashboardPage from '@/src/components/recruiter/RecruiterDashboardPage';
import ProtectedRecruiterRoute from '@/src/components/auth/ProtectedRecruiterRoute';

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
