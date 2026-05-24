import type { Metadata } from 'next';
import { ProfileEditPageClient } from '@/features/candidate/profile';

export const metadata: Metadata = {
  title: 'Edit Profile - itJobwala',
  description: 'Edit your professional profile, skills, experience, education, and certifications.',
};

export default function EditProfilePage() {
  return <ProfileEditPageClient />;
}
