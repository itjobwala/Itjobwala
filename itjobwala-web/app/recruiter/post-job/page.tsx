import RecruiterPostJobPage from '@/src/components/RecruiterPostJobPage';
import ProtectedRecruiterRoute from '@/src/components/auth/ProtectedRecruiterRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Post a Free Job – itJobwala' };

export default function Page() {
  return (
    <ProtectedRecruiterRoute>
      <RecruiterPostJobPage />
    </ProtectedRecruiterRoute>
  );
}
