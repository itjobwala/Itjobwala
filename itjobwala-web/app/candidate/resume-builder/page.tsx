import type { Metadata } from 'next';
import { ResumeListPage } from '@/features/candidate/resume-builder';

export const metadata: Metadata = {
  title: 'Resume Builder – itJobwala',
  description: 'Create ATS-friendly PDF resumes from your profile data.',
};

export default function ResumBuilderListPage() {
  return <ResumeListPage />;
}
