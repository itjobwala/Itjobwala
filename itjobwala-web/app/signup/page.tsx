import type { Metadata } from 'next';
import SignUpPage from '@/src/components/SignUpPage';

export const metadata: Metadata = {
  title: 'Sign Up – itJobwala',
  description: 'Create your itJobwala account and find IT jobs that match your skills.',
};

export default function Page() {
  return <SignUpPage />;
}
