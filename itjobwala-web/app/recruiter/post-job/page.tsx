import RecruiterPostJobPage from '@/src/components/recruiter/RecruiterPostJobPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Post a Free Job – itJobwala' };

export default function Page() {
  return <RecruiterPostJobPage />;
}
