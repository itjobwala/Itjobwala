import type { Metadata } from 'next';
import { ProfilePageClient } from '@/features/candidate/profile';

export const metadata: Metadata = {
  title: 'My Profile – itJobwala',
  description: 'Manage your professional profile, track job applications, and get discovered by recruiters.',
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
