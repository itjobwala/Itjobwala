import type { Metadata } from 'next';
import EditorShell from './_EditorShell';

export const metadata: Metadata = {
  title: 'Edit Resume - itJobwala',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResumeEditorRoutePage({ params }: Props) {
  const { id } = await params;
  return <EditorShell id={Number(id)} />;
}
