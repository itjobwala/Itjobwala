'use client';

import dynamic from 'next/dynamic';

const ResumeEditorPage = dynamic(
  () => import('@/features/candidate/resume-builder/components/ResumeEditorPage').then(m => m.ResumeEditorPage),
  { ssr: false },
);

export default function EditorShell({ id }: { id: number }) {
  return <ResumeEditorPage id={id} />;
}
